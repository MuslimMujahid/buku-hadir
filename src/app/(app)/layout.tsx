import { requireUser } from "@/lib/session";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { BrandMark } from "@/components/ui/brand-mark";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireUser();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b border-line bg-raised">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between gap-3 px-4 sm:px-6">
          <BrandMark href="/" />
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="hidden min-w-0 text-right sm:block">
              <p className="truncate text-sm font-medium text-ink">{user.name}</p>
              <p className="truncate font-mono text-xs text-ink-soft">{user.email}</p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        {children}
      </main>
    </div>
  );
}
