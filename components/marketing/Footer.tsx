import Link from "next/link";

const links = [
  { label: "Sign in", href: "/sign-in" },
  { label: "Sign up", href: "/sign-up" },
  { label: "How it works", href: "#how-it-works" },
];

export function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 px-4 sm:px-6 py-12">
      <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
        <div>
          <p className="font-heading text-lg font-semibold text-white mb-1">Storefronts</p>
          <p className="text-zinc-500 text-sm">Beautiful online stores for small businesses.</p>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mx-auto max-w-7xl mt-10 pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <p className="text-zinc-600 text-xs">
          &copy; {new Date().getFullYear()} Storefronts. All rights reserved.
        </p>
        <p className="text-zinc-600 text-xs">Made in Nigeria</p>
      </div>
    </footer>
  );
}
