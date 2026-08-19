type SiteShellProps = Readonly<{
  eyebrow: string;
  title: string;
  description: string;
}>;

export function SiteShell({ eyebrow, title, description }: SiteShellProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16 text-foreground">
      <section className="w-full max-w-2xl rounded-3xl border border-border bg-surface px-8 py-16 text-center shadow-sm sm:px-16">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted">
          {eyebrow}
        </p>
        <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
          {title}
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-pretty text-base leading-7 text-muted sm:text-lg">
          {description}
        </p>
      </section>
    </main>
  );
}
