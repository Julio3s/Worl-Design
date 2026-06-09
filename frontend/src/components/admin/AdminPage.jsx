export function AdminPage({ title, description, children }) {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-primary sm:text-3xl">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-3xl text-sm leading-7 text-text-muted sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
