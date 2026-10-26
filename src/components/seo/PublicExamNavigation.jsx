import Link from "next/link";

const resources = [
  ["JEE Main", "/jee"],
  ["NEET", "/neet"],
  ["JEE PYQs", "/jee/pyq"],
  ["NEET PYQs", "/neet/pyq"],
  ["JEE mock tests", "/jee/mock-tests"],
  ["NEET mock tests", "/neet/mock-tests"],
  ["Pricing", "/pricing"],
];

export default function PublicExamNavigation({ mobileOnly = false }) {
  return (
    <>
      {!mobileOnly && (
        <nav aria-label="Public exam resources" className="hidden flex-wrap items-center justify-end gap-4 text-sm font-semibold text-secondary lg:flex">
          {resources.map(([label, href]) => (
            <Link key={href} href={href} className="hover:underline">{label}</Link>
          ))}
        </nav>
      )}
      <details className="relative text-sm font-semibold text-slate-900 lg:hidden">
        <summary className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-3 focus-visible:outline-2 focus-visible:outline-offset-2">
          Exam resources
        </summary>
        <nav aria-label="Mobile exam resources" className="absolute right-0 top-full z-50 mt-2 grid w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
          {resources.map(([label, href]) => (
            <Link key={href} href={href} className="rounded-md px-3 py-3 hover:bg-amber-50 focus-visible:bg-amber-50">{label}</Link>
          ))}
        </nav>
      </details>
    </>
  );
}
