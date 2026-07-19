import { BrandMark } from "@/components/ui/brand-mark";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex flex-1 flex-col items-center px-4 pb-16 pt-10 sm:pt-16">
      <BrandMark href="/sign-in" />
      <div className="mt-8 w-full max-w-sm">{children}</div>
    </main>
  );
}
