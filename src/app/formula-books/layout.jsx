import { Suspense } from "react";
import ZiLauncher from "@/components/zi/ZiLauncher";
import { ZiEntityContextProvider } from "@/lib/zi/ZiEntityContext";
import { getUserAccessContext } from "@/lib/accessControl";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function FormulaBooksLayout({ children }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const accessContext = await getUserAccessContext({ userId });

  return (
    <ZiEntityContextProvider>
      {children}
      <Suspense fallback={null}>
        <ZiLauncher plan={accessContext?.plan} />
      </Suspense>
    </ZiEntityContextProvider>
  );
}
