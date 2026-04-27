import Link from "next/link";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl tracking-tight">
            Zereport
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
            <Link href="/diagnostic" className="font-medium text-indigo-600 hover:text-indigo-700">Free Diagnostic</Link>
            <Link href="/sign-in" className="text-gray-600 hover:text-gray-900">Sign in</Link>
            <Link href="/sign-up" className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
              Get started free
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t bg-gray-50 py-8 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Zereport · Client reporting automation ·{" "}
        <Link href="/privacy" className="hover:underline">Privacy</Link>{" "}·{" "}
        <Link href="/terms" className="hover:underline">Terms</Link>
      </footer>
    </div>
  );
}
