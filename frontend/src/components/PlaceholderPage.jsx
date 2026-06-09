export default function PlaceholderPage({ eyebrow, title, description, children }) {
  return (
    <main className="min-h-screen bg-cream px-4 py-10 text-text-dark">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        {eyebrow ? (
          <p className="text-sm font-medium uppercase tracking-normal text-text-muted">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display text-3xl font-bold text-primary">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-base leading-7 text-text-muted">
            {description}
          </p>
        ) : null}
        {children}
      </section>
    </main>
  );
}
