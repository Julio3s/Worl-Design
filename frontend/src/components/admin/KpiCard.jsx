export function KpiCard({ title, value, highlight = false, pending = false }) {
  return (
    <article
      className={[
        'rounded-[8px] border bg-white p-4 shadow-[0_8px_24px_rgba(26,26,46,0.06)]',
        pending ? 'border-[#FEF3C7] bg-[#FEF3C7]' : 'border-[#E0DBD5]',
      ].join(' ')}
    >
      <p className="text-sm font-medium text-text-muted">{title}</p>
      <p
        className={[
          'mt-2 text-2xl font-bold',
          pending ? 'text-[#92400E]' : highlight ? 'text-gold' : 'text-text-dark',
        ].join(' ')}
      >
        {value}
      </p>
    </article>
  );
}
