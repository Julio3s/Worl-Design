export function EmptyState({ title, description, action, icon: Icon }) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center rounded-[8px] border border-dashed border-[#E0DBD5] bg-white px-6 py-10 text-center">
      {Icon ? (
        <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-[#F8F5F0] text-accent">
          <Icon className="h-8 w-8" aria-hidden="true" />
        </div>
      ) : null}
      <h3 className="font-display text-2xl font-bold text-primary">{title}</h3>
      {description ? (
        <p className="mt-3 max-w-md text-sm leading-7 text-text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
