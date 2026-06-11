from __future__ import annotations

from datetime import timedelta
from functools import lru_cache
from pathlib import Path
from typing import Any

from django.conf import settings
from django.core.cache import cache
from django.utils import timezone
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange,
    Dimension,
    Metric,
    OrderBy,
    RunRealtimeReportRequest,
    RunReportRequest,
)
from google.oauth2 import service_account


GA4_READ_SCOPE = 'https://www.googleapis.com/auth/analytics.readonly'
GA4_CACHE_PREFIX = 'ga4-dashboard'


class GA4ConfigurationError(RuntimeError):
    """Raised when GA4 is not configured correctly."""


class GA4ReportError(RuntimeError):
    """Raised when the Data API request fails."""


def _parse_int(value: Any) -> int:
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return 0


def _parse_date_range(period: str) -> tuple[str, str]:
    today = timezone.localdate()
    if period == 'day':
        start = today
    elif period == 'week':
        start = today - timedelta(days=6)
    elif period == 'month':
        start = today - timedelta(days=29)
    else:
        start = today - timedelta(days=364)
    return start.isoformat(), today.isoformat()


def _property_resource() -> str:
    property_id = str(getattr(settings, 'GA4_PROPERTY_ID', '')).strip()
    if not property_id:
        raise GA4ConfigurationError('GA4_PROPERTY_ID is missing.')
    return f'properties/{property_id}'


def _service_account_path() -> Path:
    raw_path = str(getattr(settings, 'GA4_SERVICE_ACCOUNT_FILE', '')).strip()
    if not raw_path:
        raise GA4ConfigurationError('GA4_SERVICE_ACCOUNT_FILE is missing.')
    return Path(raw_path).expanduser()


@lru_cache(maxsize=1)
def _get_client() -> BetaAnalyticsDataClient:
    credentials_path = _service_account_path()
    if not credentials_path.exists():
        raise GA4ConfigurationError(
            f'GA4 service account file not found: {credentials_path}'
        )

    credentials = service_account.Credentials.from_service_account_file(
        str(credentials_path),
        scopes=[GA4_READ_SCOPE],
    )
    return BetaAnalyticsDataClient(credentials=credentials)


def _row_metric_value(row, index: int = 0) -> int:
    if not getattr(row, 'metric_values', None):
        return 0
    if index >= len(row.metric_values):
        return 0
    return _parse_int(row.metric_values[index].value)


def _row_dimension_value(row, index: int = 0) -> str:
    if not getattr(row, 'dimension_values', None):
        return ''
    if index >= len(row.dimension_values):
        return ''
    return str(row.dimension_values[index].value or '')


def _run_overview_report(client: BetaAnalyticsDataClient, property_resource: str, start_date: str, end_date: str) -> dict[str, int]:
    request = RunReportRequest(
        property=property_resource,
        date_ranges=[DateRange(start_date=start_date, end_date=end_date)],
        metrics=[
            Metric(name='totalUsers'),
            Metric(name='sessions'),
            Metric(name='screenPageViews'),
            Metric(name='engagedSessions'),
        ],
    )
    response = client.run_report(request=request)

    if not response.rows:
        return {
            'total_users': 0,
            'sessions': 0,
            'page_views': 0,
            'engaged_sessions': 0,
        }

    row = response.rows[0]
    return {
        'total_users': _row_metric_value(row, 0),
        'sessions': _row_metric_value(row, 1),
        'page_views': _row_metric_value(row, 2),
        'engaged_sessions': _row_metric_value(row, 3),
    }


def _run_realtime_report(client: BetaAnalyticsDataClient, property_resource: str) -> dict[str, int]:
    request = RunRealtimeReportRequest(
        property=property_resource,
        metrics=[Metric(name='activeUsers')],
    )
    response = client.run_realtime_report(request=request)

    if not response.rows:
        return {'active_users': 0}

    return {'active_users': _row_metric_value(response.rows[0], 0)}


def _run_channel_report(
    client: BetaAnalyticsDataClient,
    property_resource: str,
    start_date: str,
    end_date: str,
) -> list[dict[str, Any]]:
    request = RunReportRequest(
        property=property_resource,
        date_ranges=[DateRange(start_date=start_date, end_date=end_date)],
        dimensions=[Dimension(name='sessionPrimaryChannelGroup')],
        metrics=[Metric(name='sessions')],
        order_bys=[
            OrderBy(
                metric=OrderBy.MetricOrderBy(metric_name='sessions'),
                desc=True,
            )
        ],
        limit=5,
    )
    response = client.run_report(request=request)

    channels = []
    for row in response.rows or []:
        channels.append(
            {
                'name': _row_dimension_value(row, 0) or 'Unknown',
                'sessions': _row_metric_value(row, 0),
            }
        )
    return channels


def _run_page_report(
    client: BetaAnalyticsDataClient,
    property_resource: str,
    start_date: str,
    end_date: str,
) -> list[dict[str, Any]]:
    request = RunReportRequest(
        property=property_resource,
        date_ranges=[DateRange(start_date=start_date, end_date=end_date)],
        dimensions=[Dimension(name='pagePathPlusQueryString')],
        metrics=[Metric(name='screenPageViews')],
        order_bys=[
            OrderBy(
                metric=OrderBy.MetricOrderBy(metric_name='screenPageViews'),
                desc=True,
            )
        ],
        limit=5,
    )
    response = client.run_report(request=request)

    pages = []
    for row in response.rows or []:
        pages.append(
            {
                'path': _row_dimension_value(row, 0) or '/',
                'page_views': _row_metric_value(row, 0),
            }
        )
    return pages


def get_ga4_dashboard_stats(period: str) -> dict[str, Any]:
    period = (period or 'week').lower()
    cache_key = f'{GA4_CACHE_PREFIX}:{period}'
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    property_resource = _property_resource()
    start_date, end_date = _parse_date_range(period)
    client = _get_client()

    try:
        overview = _run_overview_report(client, property_resource, start_date, end_date)
        realtime = _run_realtime_report(client, property_resource)
        top_channels = _run_channel_report(client, property_resource, start_date, end_date)
        top_pages = _run_page_report(client, property_resource, start_date, end_date)
    except GA4ConfigurationError:
        raise
    except Exception as exc:  # pragma: no cover - network/API failures are environment-specific
        raise GA4ReportError(str(exc)) from exc

    payload = {
        'configured': True,
        'property_id': str(getattr(settings, 'GA4_PROPERTY_ID', '')).strip(),
        'period': period,
        'date_range': {'start_date': start_date, 'end_date': end_date},
        'metrics': {
            **overview,
            **realtime,
        },
        'top_channels': top_channels,
        'top_pages': top_pages,
        'fetched_at': timezone.now().isoformat(),
    }

    cache.set(cache_key, payload, timeout=getattr(settings, 'GA4_CACHE_TTL_SECONDS', 300))
    return payload
