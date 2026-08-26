"use client";

import { forwardRef, useId } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faXmark } from "@fortawesome/free-solid-svg-icons";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

const cardVariants = {
  paper: "border-[var(--border)] bg-[var(--card)] shadow-[var(--prepzii-shadow-soft)] dark:bg-[var(--surface)]",
  exam: "prepzii-paper-surface border-[var(--border)] shadow-[var(--prepzii-shadow-soft)] dark:bg-[var(--surface)]",
  primary: "border-brand/45 bg-[var(--card)] shadow-[var(--prepzii-shadow-soft)] dark:bg-[var(--surface)]",
  secondary: "border-[var(--border)] bg-[var(--card)] shadow-sm dark:bg-[var(--surface)] dark:shadow-none",
  interactive: "border-[var(--border)] bg-[var(--card)] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/55 dark:bg-[var(--surface)] dark:hover:border-brand/45",
  stat: "border-[var(--border)] bg-[var(--surface-secondary)] shadow-sm dark:bg-[#151513] dark:shadow-none",
  content: "border-[var(--border)] bg-[var(--card)] dark:bg-[var(--surface)]",
  flat: "border-transparent bg-transparent",
};

const cardPadding = {
  none: "",
  sm: "p-3 sm:p-4",
  md: "p-4 sm:p-5",
  lg: "p-5 sm:p-6",
};

export const Card = forwardRef(function Card(
  { as: Component = "div", variant = "secondary", padding = "md", className = "", children, ...props },
  ref
) {
  return (
    <Component
      ref={ref}
      className={cx(
        "relative min-w-0 overflow-hidden rounded-[var(--prepzii-card-radius)] border text-slate-950 dark:text-white",
        cardVariants[variant] || cardVariants.secondary,
        cardPadding[padding] || cardPadding.md,
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
});

const buttonVariants = {
  primary: "border border-[#9A7407] bg-brand text-black shadow-[0_3px_0_rgba(30,41,59,0.26)] hover:bg-brand-hover active:translate-y-0.5 active:shadow-none dark:border-brand dark:hover:bg-brand-hover",
  secondary: "border border-[var(--border)] bg-[var(--card)] text-slate-900 hover:border-brand/55 hover:bg-[var(--surface-hover)] dark:bg-[var(--surface)] dark:text-white",
  subtle: "border border-transparent bg-[var(--surface-secondary)] text-slate-700 hover:bg-[var(--surface-hover)] dark:text-slate-200",
  ghost: "text-slate-600 hover:bg-[var(--surface-hover)] hover:text-slate-950 dark:text-slate-300 dark:hover:text-white",
  ink: "bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-200",
  danger: "bg-red-500 text-white hover:bg-red-600",
};

const buttonSizes = {
  sm: "h-9 px-3 text-xs",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

export const Button = forwardRef(function Button(
  { as: Component = "button", variant = "primary", size = "md", icon, trailingIcon, className = "", children, type = "button", ...props },
  ref
) {
  const typeProp = Component === "button" ? { type } : {};

  return (
    <Component
      ref={ref}
      className={cx(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-[var(--prepzii-control-radius)] font-black transition-colors disabled:pointer-events-none disabled:opacity-55",
        buttonVariants[variant] || buttonVariants.primary,
        buttonSizes[size] || buttonSizes.md,
        className
      )}
      {...typeProp}
      {...props}
    >
      {icon && <span className="flex h-4 w-4 items-center justify-center">{icon}</span>}
      <span className="min-w-0 truncate">{children}</span>
      {trailingIcon && <span className="flex h-4 w-4 items-center justify-center">{trailingIcon}</span>}
    </Component>
  );
});

const badgeVariants = {
  brand: "border-brand/35 bg-brand/12 text-amber-800 dark:text-brand",
  neutral: "border-[var(--border)] bg-[var(--surface-secondary)] text-slate-600 dark:text-slate-300",
  success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  info: "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  paper: "border-[var(--border)] bg-[var(--card)] text-slate-700 dark:bg-[var(--surface)] dark:text-slate-300",
  annotation: "border-amber-400/35 bg-amber-300/15 text-amber-800 dark:text-amber-300",
  locked: "border-[var(--border)] bg-[var(--surface-secondary)] text-slate-500 dark:text-slate-400",
};

export function Badge({ variant = "brand", icon, className = "", children }) {
  return (
    <span
      className={cx(
        "inline-flex max-w-full items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.12em]",
        badgeVariants[variant] || badgeVariants.brand,
        className
      )}
    >
      {icon && <span className="flex h-3.5 w-3.5 items-center justify-center">{icon}</span>}
      <span className="truncate">{children}</span>
    </span>
  );
}

export const IconButton = forwardRef(function IconButton(
  { label, icon, variant = "secondary", size = "md", className = "", ...props },
  ref
) {
  const sizes = {
    sm: "h-9 w-9",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={cx(
        "inline-flex shrink-0 items-center justify-center rounded-[var(--prepzii-control-radius)] font-black transition-colors disabled:pointer-events-none disabled:opacity-55",
        buttonVariants[variant] || buttonVariants.secondary,
        sizes[size] || sizes.md,
        className
      )}
      {...props}
    >
      {icon}
    </button>
  );
});

export function Tabs({ tabs, activeTab, onChange, className = "" }) {
  return (
    <div className={cx("inline-flex max-w-full rounded-[var(--prepzii-control-radius)] border border-[var(--border)] bg-[var(--card)] p-1 shadow-sm dark:bg-[var(--surface)] dark:shadow-none", className)}>
      <div className="flex min-w-0 gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange?.(tab.id)}
              className={cx(
                "inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg px-3 text-sm font-black transition-colors",
                active
                  ? "bg-slate-950 text-white dark:bg-brand dark:text-black"
                  : "text-slate-500 hover:bg-[var(--surface-hover)] hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              )}
            >
              {tab.icon && <span className="flex h-4 w-4 items-center justify-center">{tab.icon}</span>}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Tooltip({ content, placement = "top", children }) {
  const id = useId().replaceAll(":", "-");

  return (
    <>
      <span id={id} className="inline-flex">
        {children}
      </span>
      <wa-tooltip for={id} placement={placement}>
        {content}
      </wa-tooltip>
    </>
  );
}

export function Dialog({ open = false, label, children, footer, onClose, className = "" }) {
  return (
    <wa-dialog
      open={open || undefined}
      label={label}
      light-dismiss="true"
      with-footer={footer ? "true" : undefined}
      class={cx("prepzii-wa-dialog", className)}
      onWaAfterHide={onClose}
    >
      {children}
      {footer && <div slot="footer">{footer}</div>}
    </wa-dialog>
  );
}

export function Dropdown({ trigger, items = [], placement = "bottom-start", onSelect, className = "" }) {
  return (
    <wa-dropdown placement={placement} class={cx("prepzii-wa-dropdown", className)} onWaSelect={onSelect}>
      <span slot="trigger" className="inline-flex">
        {trigger || (
          <Button variant="secondary" trailingIcon={<FontAwesomeIcon icon={faChevronDown} />}>
            Menu
          </Button>
        )}
      </span>
      {items.map((item) => (
        <wa-dropdown-item key={item.value || item.label} value={item.value}>
          {item.icon && <span slot="prefix">{item.icon}</span>}
          {item.label}
        </wa-dropdown-item>
      ))}
    </wa-dropdown>
  );
}

export function WebAwesomeTabs({ tabs, activeTab, className = "" }) {
  return (
    <wa-tab-group active={activeTab} class={cx("prepzii-wa-tabs", className)}>
      {tabs.map((tab) => (
        <wa-tab key={tab.id} slot="nav" panel={tab.id} active={activeTab === tab.id || undefined}>
          {tab.label}
        </wa-tab>
      ))}
      {tabs.map((tab) => (
        <wa-tab-panel key={tab.id} name={tab.id} active={activeTab === tab.id || undefined}>
          {tab.children}
        </wa-tab-panel>
      ))}
    </wa-tab-group>
  );
}

export function Switch({ checked, children, onChange, className = "", ...props }) {
  return (
    <wa-switch
      checked={checked || undefined}
      class={cx("prepzii-wa-switch", className)}
      onChange={onChange}
      {...props}
    >
      {children}
    </wa-switch>
  );
}

export function StatCard({ icon, label, value, helper, trend, accent = "brand", className = "" }) {
  const accentClass = accent === "emerald" ? "text-emerald-600 dark:text-emerald-300" : accent === "sky" ? "text-sky-600 dark:text-sky-300" : "text-brand";

  return (
    <Card variant="stat" padding="md" className={className}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">{label}</p>
          <p className="mt-2 truncate text-2xl font-black tracking-tight text-slate-950 dark:text-white">{value}</p>
        </div>
        {icon && (
          <div className={cx("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-current/20 bg-current/10", accentClass)}>
            {icon}
          </div>
        )}
      </div>
      {(helper || trend) && (
        <div className="mt-3 flex items-center justify-between gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
          {helper && <span className="truncate">{helper}</span>}
          {trend && <span className={accentClass}>{trend}</span>}
        </div>
      )}
    </Card>
  );
}

export function NotebookPage({ children, margin = true, className = "" }) {
  return (
    <div
      className={cx(
        "prepzii-paper-surface relative min-w-0 rounded-[var(--prepzii-card-radius)] border border-[var(--border)] px-4 py-5 shadow-[var(--prepzii-shadow-soft)] dark:bg-[var(--surface)] sm:px-6 sm:py-6",
        margin && "before:absolute before:inset-y-0 before:left-11 before:w-px before:bg-[var(--prepzii-margin-line)]",
        className
      )}
    >
      <div className={cx("relative", margin && "pl-8")}>{children}</div>
    </div>
  );
}

export function MeasurementRule({ label, ticks = 12, className = "" }) {
  return (
    <div className={cx("flex min-w-0 items-end gap-1 text-slate-400 dark:text-slate-500", className)} aria-hidden={label ? undefined : "true"}>
      {label && <span className="mr-2 shrink-0 text-[10px] font-black uppercase tracking-[0.18em]">{label}</span>}
      <div className="flex h-5 min-w-0 flex-1 items-end justify-between border-b border-[var(--prepzii-rule)]">
        {Array.from({ length: ticks }).map((_, index) => (
          <span
            key={index}
            className={cx("w-px bg-[var(--prepzii-rule)]", index % 4 === 0 ? "h-4" : index % 2 === 0 ? "h-3" : "h-2")}
          />
        ))}
      </div>
    </div>
  );
}

export function Annotation({ children, align = "left", className = "" }) {
  return (
    <p
      className={cx(
        "prepzii-hand-note text-xs font-bold leading-relaxed",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className
      )}
    >
      {children}
    </p>
  );
}

export function ExamMetaStrip({ items = [], className = "" }) {
  return (
    <div className={cx("prepzii-exam-rule grid gap-0 divide-y divide-[var(--prepzii-rule)] text-xs font-bold text-slate-600 dark:text-slate-300 sm:grid-cols-3 sm:divide-x sm:divide-y-0", className)}>
      {items.map((item) => (
        <div key={item.label} className="min-w-0 px-3 py-2">
          <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{item.label}</span>
          <span className="mt-0.5 block truncate text-slate-800 dark:text-slate-100">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

export function AnswerBubble({ label, state = "empty", className = "" }) {
  const stateClass = {
    empty: "border-[var(--border)] bg-transparent text-slate-500",
    selected: "border-slate-950 bg-slate-950 text-white dark:border-brand dark:bg-brand dark:text-black",
    correct: "border-emerald-600 bg-emerald-600 text-white",
    wrong: "border-red-600 bg-red-600 text-white",
  }[state] || "border-[var(--border)] bg-transparent text-slate-500";

  return (
    <span className={cx("inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-black", stateClass, className)}>
      {label}
    </span>
  );
}

export function AnswerSheetRow({ number, options = ["A", "B", "C", "D"], selected, className = "" }) {
  return (
    <div className={cx("flex min-w-0 items-center gap-3 border-b border-[var(--prepzii-rule)] py-2", className)}>
      <span className="w-8 shrink-0 text-xs font-black text-slate-400">Q{number}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <AnswerBubble key={option} label={option} state={selected === option ? "selected" : "empty"} />
        ))}
      </div>
    </div>
  );
}

export function DataTable({ columns = [], rows = [], emptyText = "No rows yet", className = "" }) {
  return (
    <div className={cx("overflow-hidden rounded-[var(--prepzii-card-radius)] border border-[var(--border)] bg-[var(--card)] dark:bg-[var(--surface)]", className)}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-left text-sm">
          <thead className="bg-[var(--surface-secondary)] text-[11px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="border-b border-[var(--border)] px-4 py-3">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--prepzii-rule)]">
            {rows.length > 0 ? (
              rows.map((row, rowIndex) => (
                <tr key={row.id || rowIndex} className="hover:bg-[var(--surface-hover)]/70">
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-8 text-center text-sm font-semibold text-slate-500" colSpan={columns.length || 1}>
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function SubjectCard({ icon, title, description, meta, selected = false, className = "", ...props }) {
  return (
    <Card
      as="button"
      type="button"
      variant="interactive"
      padding="md"
      className={cx("text-left", selected && "border-brand bg-brand/10", className)}
      {...props}
    >
      <div className="flex items-start gap-3">
        {icon && <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">{icon}</div>}
        <div className="min-w-0">
          <h3 className="text-base font-black text-slate-950 dark:text-white">{title}</h3>
          {description && <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>}
          {meta && <p className="mt-3 text-xs font-black uppercase tracking-[0.16em] text-slate-400">{meta}</p>}
        </div>
      </div>
    </Card>
  );
}

export function FormulaIndexCard({ title, formula, note, subject, visual, className = "" }) {
  return (
    <Card variant="paper" padding="lg" className={cx("bg-[linear-gradient(var(--prepzii-paper-line)_1px,transparent_1px)] [background-size:100%_28px]", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {subject && <Badge variant="paper">{subject}</Badge>}
          <h3 className="mt-3 text-base font-black leading-snug text-slate-950 dark:text-white">{title}</h3>
        </div>
        {visual && <div className="h-16 w-16 shrink-0 text-brand">{visual}</div>}
      </div>
      <p className="mt-4 overflow-wrap-anywhere font-mono text-lg font-black text-slate-900 dark:text-slate-100">{formula}</p>
      {note && <Annotation className="mt-4">{note}</Annotation>}
    </Card>
  );
}

export function ChapterCard({ title, subtitle, progress, icon, action, className = "" }) {
  return (
    <Card variant="interactive" padding="md" className={className}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          {icon && <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-white/8 dark:text-slate-200">{icon}</div>}
          <div className="min-w-0">
            <h3 className="truncate text-sm font-black text-slate-950 dark:text-white">{title}</h3>
            {subtitle && <p className="mt-1 line-clamp-2 text-xs font-semibold text-slate-500 dark:text-slate-400">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      {typeof progress === "number" && (
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/8">
          <div className="h-full rounded-full bg-brand" style={{ width: `${Math.max(0, Math.min(progress, 100))}%` }} />
        </div>
      )}
    </Card>
  );
}

export function QuestionCard({ eyebrow, question, meta, status, children, className = "" }) {
  return (
    <Card variant="content" padding="lg" className={className}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {eyebrow && <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">{eyebrow}</p>}
          <h3 className="mt-1 text-base font-black leading-snug text-slate-950 dark:text-white">{question}</h3>
          {meta && <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">{meta}</p>}
        </div>
        {status && <Badge variant="neutral">{status}</Badge>}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </Card>
  );
}

export function QuestionRow({ number, title, meta, difficulty, action, className = "" }) {
  return (
    <div className={cx("flex min-w-0 items-start gap-3 border-b border-[var(--prepzii-rule)] py-4", className)}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-secondary)] text-xs font-black text-slate-500">
        {number}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {difficulty && <Badge variant={difficulty === "Easy" ? "success" : difficulty === "Hard" ? "locked" : "annotation"}>{difficulty}</Badge>}
          {meta && <span className="truncate text-xs font-bold text-slate-500 dark:text-slate-400">{meta}</span>}
        </div>
        <h3 className="mt-1 line-clamp-2 text-sm font-black leading-snug text-slate-950 dark:text-white">{title}</h3>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function FeatureCard({ icon, title, description, badge, className = "" }) {
  return (
    <Card variant="secondary" padding="lg" className={className}>
      <div className="flex items-start justify-between gap-4">
        {icon && <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand">{icon}</div>}
        {badge && <Badge variant="brand">{badge}</Badge>}
      </div>
      <h3 className="mt-4 text-lg font-black text-slate-950 dark:text-white">{title}</h3>
      {description && <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>}
    </Card>
  );
}

export function EmptyState({ icon, title, description, action, className = "" }) {
  return (
    <Card variant="secondary" padding="lg" className={cx("flex flex-col items-center justify-center py-10 text-center", className)}>
      {icon && <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">{icon}</div>}
      <h3 className="text-lg font-black text-slate-950 dark:text-white">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm font-semibold leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </Card>
  );
}

export function SectionHeader({ badge, title, description, action, className = "" }) {
  return (
    <div className={cx("flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        {badge && <Badge variant="brand">{badge}</Badge>}
        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white">{title}</h2>
        {description && <p className="mt-1 max-w-2xl text-sm font-semibold leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function MotifHeader({ motif, title, description, visual, annotation, action, className = "" }) {
  return (
    <div className={cx("grid min-w-0 gap-4 border-b border-[var(--prepzii-rule)] pb-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end", className)}>
      <div className="min-w-0">
        {motif && <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">{motif}</p>}
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>}
        {annotation && <Annotation className="mt-3">{annotation}</Annotation>}
      </div>
      {(visual || action) && (
        <div className="flex items-end gap-3">
          {visual && <div className="hidden h-20 w-20 text-brand sm:block">{visual}</div>}
          {action}
        </div>
      )}
    </div>
  );
}

export function DialogCloseButton({ label = "Close", ...props }) {
  return <IconButton label={label} icon={<FontAwesomeIcon icon={faXmark} />} variant="ghost" {...props} />;
}
