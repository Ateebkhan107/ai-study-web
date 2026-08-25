import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  FileText,
  LineChart,
  Target,
  Timer,
} from "lucide-react";

import Logo from "@/components/Logo";
import { buildBreadcrumbJsonLd } from "@/lib/seoLandingPages";

const featureIcons = [BookOpen, ClipboardList, Timer, LineChart];

function shouldDisablePrefetch(href) {
  return String(href || "").startsWith("/go/");
}

function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

function PageHeader() {
  return (
    <header className="border-b border-border-subtle/70 bg-[var(--background)]/95">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-6">
        <Link href="/" aria-label="PrepZii home">
          <Logo forceDark size={34} />
        </Link>
        <nav aria-label="Public exam pages" className="hidden items-center gap-5 text-sm font-semibold text-secondary sm:flex">
          <Link href="/jee" className="transition-colors hover:text-brand-hover">
            JEE
          </Link>
          <Link href="/neet" className="transition-colors hover:text-brand-hover">
            NEET
          </Link>
          <Link href="/pricing" className="transition-colors hover:text-brand-hover">
            Pricing
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-sm font-medium text-muted">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <li key={item.path} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden="true" className="text-disabled">/</span>}
            {index === items.length - 1 ? (
              <span className="text-secondary">{item.name}</span>
            ) : (
              <Link href={item.path} className="hover:text-brand-hover">
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function Hero({ page }) {
  return (
    <section className="relative overflow-hidden border-b border-border-subtle/70 bg-[var(--background)]">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute left-[-15%] top-[-20%] h-[32rem] w-[32rem] rounded-full bg-brand/10 blur-[120px]" />
        <div className="absolute bottom-[-25%] right-[-10%] h-[28rem] w-[28rem] rounded-full bg-emerald-500/8 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:py-24">
        <Breadcrumbs items={page.breadcrumb} />
        <div className="max-w-4xl">
          <p className="mb-4 inline-flex rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-brand-hover">
            {page.eyebrow}
          </p>
          <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {page.h1}
          </h1>
          <p className="mt-6 max-w-3xl text-base font-medium leading-8 text-secondary sm:text-lg">
            {page.intro}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={page.primaryCta.href}
              prefetch={shouldDisablePrefetch(page.primaryCta.href) ? false : undefined}
              className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 text-sm font-black text-black transition-colors hover:bg-brand-hover"
            >
              {page.primaryCta.label}
            </Link>
            <Link
              href={page.secondaryCta.href}
              prefetch={shouldDisablePrefetch(page.secondaryCta.href) ? false : undefined}
              className="inline-flex items-center justify-center rounded-full border border-border-subtle bg-[var(--surface)] px-6 py-3 text-sm font-bold text-foreground transition-colors hover:border-brand/50"
            >
              {page.secondaryCta.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function LinkCards({ cards }) {
  if (!cards?.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-6">
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            prefetch={shouldDisablePrefetch(card.href) ? false : undefined}
            className="rounded-2xl border border-border-subtle bg-[var(--surface)] p-6 transition-colors hover:border-brand/50"
          >
            <h2 className="text-xl font-black text-foreground">{card.title}</h2>
            <p className="mt-3 text-sm leading-6 text-secondary">{card.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function SectionBlock({ section, index }) {
  const Icon = featureIcons[index % featureIcons.length];

  return (
    <section className="rounded-3xl border border-border-subtle bg-[var(--surface)] p-6 sm:p-8">
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl border border-brand/20 bg-brand/10 text-brand-hover">
        <Icon className="h-5 w-5" />
      </div>
      <h2 className="text-2xl font-black tracking-tight text-foreground">{section.title}</h2>
      <p className="mt-4 leading-7 text-secondary">{section.body}</p>
      <ul className="mt-6 space-y-3">
        {section.items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-6 text-secondary">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-hover" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function PyqPreview({ page }) {
  if (!page.pyq) return null;

  return (
    <section className="rounded-3xl border border-border-subtle bg-[var(--surface)] p-6 sm:p-8">
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl border border-brand/20 bg-brand/10 text-brand-hover">
        <FileText className="h-5 w-5" />
      </div>
      <h2 className="text-2xl font-black tracking-tight text-foreground">Practice previews</h2>
      <p className="mt-4 leading-7 text-secondary">
        Public pages do not expose private attempts, but the practice flow is organized around these safe, exam-focused paths.
      </p>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border-subtle bg-[var(--background)] p-5">
          <h3 className="text-sm font-black uppercase tracking-[0.16em] text-muted">Subjects</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {page.pyq.subjects.map((subject) => (
              <span key={subject} className="rounded-full border border-brand/20 bg-brand/10 px-3 py-1 text-sm font-bold text-brand-hover">
                {subject}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border-subtle bg-[var(--background)] p-5">
          <h3 className="text-sm font-black uppercase tracking-[0.16em] text-muted">Sample workflows</h3>
          <ul className="mt-4 space-y-2">
            {page.pyq.samplePaths.map((path) => (
              <li key={path} className="flex gap-2 text-sm leading-6 text-secondary">
                <Target className="mt-1 h-4 w-4 shrink-0 text-brand-hover" />
                <span>{path}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function FaqSection({ faqs }) {
  return (
    <section className="rounded-3xl border border-border-subtle bg-[var(--surface)] p-6 sm:p-8">
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl border border-brand/20 bg-brand/10 text-brand-hover">
        <BarChart3 className="h-5 w-5" />
      </div>
      <h2 className="text-2xl font-black tracking-tight text-foreground">Frequently asked questions</h2>
      <div className="mt-6 divide-y divide-border-subtle">
        {faqs.map((faq) => (
          <div key={faq.question} className="py-5 first:pt-0 last:pb-0">
            <h3 className="font-black text-foreground">{faq.question}</h3>
            <p className="mt-2 leading-7 text-secondary">{faq.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ClosingCta({ page }) {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-6">
      <div className="rounded-3xl border border-brand/25 bg-brand/10 p-8 text-center sm:p-10">
        <h2 className="text-3xl font-black tracking-tight text-foreground">
          Build a clearer {page.exam} practice plan with PrepZii
        </h2>
        <p className="mx-auto mt-4 max-w-2xl leading-7 text-secondary">
          Start with public exam resources, then move into the workspace when you are ready to practice, review and track progress.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={page.primaryCta.href}
            prefetch={shouldDisablePrefetch(page.primaryCta.href) ? false : undefined}
            className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 text-sm font-black text-black transition-colors hover:bg-brand-hover"
          >
            {page.primaryCta.label}
          </Link>
          {page.parentPath && (
            <Link
              href={page.parentPath}
              className="inline-flex items-center justify-center rounded-full border border-border-subtle bg-[var(--surface)] px-6 py-3 text-sm font-bold text-foreground transition-colors hover:border-brand/50"
            >
              Back to {page.exam} preparation
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

export default function SeoLandingPage({ page }) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-foreground">
      <JsonLd data={buildBreadcrumbJsonLd(page)} />
      <PageHeader />
      <main>
        <Hero page={page} />
        <LinkCards cards={page.linkCards} />
        <div className="mx-auto grid max-w-7xl gap-5 px-5 py-12 sm:px-6 lg:grid-cols-2">
          {page.sections.map((section, index) => (
            <SectionBlock key={section.title} section={section} index={index} />
          ))}
          <PyqPreview page={page} />
          <FaqSection faqs={page.faqs} />
        </div>
        <ClosingCta page={page} />
      </main>
    </div>
  );
}
