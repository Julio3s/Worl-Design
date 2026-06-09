export function SectionHeading({ eyebrow, title, description, align = 'left' }) {
  const alignClass = align === 'center' ? 'items-center text-center' : 'items-start text-left';

  return (
    <div className={`flex flex-col gap-2 ${alignClass}`}>
      {eyebrow ? (
        <p className="text-sm font-semibold uppercase tracking-normal text-gold">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-display text-2xl font-bold text-primary sm:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="max-w-2xl text-sm leading-7 text-text-muted sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}
