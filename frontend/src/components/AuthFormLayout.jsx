import { Logo } from './Logo';

export function AuthFormLayout({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex justify-center">
            <Logo to="/" size="xl" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold text-primary">{title}</h1>
          {subtitle ? <p className="mt-2 text-sm text-text-muted">{subtitle}</p> : null}
        </div>

        <div className="rounded-[8px] border border-[#E0DBD5] bg-white p-5 sm:p-6">{children}</div>

        {footer ? <div className="mt-5 text-center text-sm text-text-muted">{footer}</div> : null}
      </div>
    </div>
  );
}
