import { ArrowLeft } from "lucide-react";
import { LogoMark } from "@/components/Logo";
import { nav } from "@/content/site";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-20">
      <div className="w-full max-w-lg text-center">
        <LogoMark size={44} className="mx-auto" />

        <p className="mt-10 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          Error 404
        </p>

        <h1 className="mt-4 text-[2.25rem] font-medium leading-[1.1] tracking-[-0.035em] sm:text-[3rem]">
          This page doesn't exist.
        </h1>

        <p className="mt-5 text-[16px] leading-relaxed text-muted-foreground">
          The link may be out of date, or the address slightly off. Everything lives on the
          home page.
        </p>

        <a href="/" className="btn-dark mt-9 inline-flex">
          <ArrowLeft size={16} />
          Back to the home page
        </a>

        <nav className="mt-12 border-t border-border pt-8" aria-label="Site sections">
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={`/${item.href}`}
                  className="text-[14px] text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </main>
  );
}
