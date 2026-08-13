export default function AuthLoading() {
  return (
    <div className="min-h-screen bg-[#080C14] text-white flex items-center justify-center p-8">
      <div className="w-full max-w-md rounded-2xl border border-indigo-500/20 bg-[rgba(15,19,32,0.85)] p-6">
        <div className="h-4 w-24 animate-pulse rounded bg-indigo-400/30" />
        <div className="mt-5 h-10 w-64 max-w-full animate-pulse rounded-xl bg-slate-700/50" />
        <div className="mt-8 space-y-3">
          <div className="h-11 animate-pulse rounded-xl bg-slate-800/80" />
          <div className="h-11 animate-pulse rounded-xl bg-slate-800/80" />
          <div className="h-11 animate-pulse rounded-xl bg-indigo-500/30" />
        </div>
      </div>
    </div>
  );
}
