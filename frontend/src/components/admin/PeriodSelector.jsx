const PERIODS = [
  { value: 'day', label: 'Aujourd\'hui' },
  { value: 'week', label: 'Semaine' },
  { value: 'month', label: 'Mois' },
  { value: 'year', label: 'Année' },
];

export function PeriodSelector({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {PERIODS.map((period) => {
        const isActive = value === period.value;
        return (
          <button
            key={period.value}
            type="button"
            onClick={() => onChange(period.value)}
            className={[
              'rounded-full px-4 py-2 text-sm font-semibold transition active:scale-[0.98]',
              isActive
                ? 'bg-accent text-white'
                : 'border border-[#E0DBD5] bg-white text-text-dark hover:border-accent hover:text-accent',
            ].join(' ')}
          >
            {period.label}
          </button>
        );
      })}
    </div>
  );
}
