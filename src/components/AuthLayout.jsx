export default function AuthLayout({
  title,
  subtitle,
  children,
}) {
  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* LEFT SIDE */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-16 border-r border-zinc-800">
        <div>
          <h1 className="text-5xl font-black tracking-tight">
            PREPZII
          </h1>

          <p className="mt-6 text-zinc-400 text-lg max-w-md">
            AI-powered JEE & NEET preparation platform.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <h3 className="font-bold text-xl">
              📚 Previous Year Questions
            </h3>
          </div>

          <div>
            <h3 className="font-bold text-xl">
              📝 Mock Tests
            </h3>
          </div>

          <div>
            <h3 className="font-bold text-xl">
              🤖 AI Study Assistant
            </h3>
          </div>

          <div>
            <h3 className="font-bold text-xl">
              📊 Smart Analytics
            </h3>
          </div>
        </div>

        <p className="text-zinc-500 text-sm">
          Crack JEE & NEET smarter with Prepzii.
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h2 className="text-4xl font-black mb-2">
            {title}
          </h2>

          <p className="text-zinc-400 mb-8">
            {subtitle}
          </p>

          {children}
        </div>
      </div>
    </div>
  );
}