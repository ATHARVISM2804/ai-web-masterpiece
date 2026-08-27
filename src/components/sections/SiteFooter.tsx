import { useState } from "react";
import { footer, profile } from "@/content/site";
import Logo, { LogoMark } from "../Logo";
import CalendlyModal from "../CalendlyModal";

export default function SiteFooter() {
  const [callOpen, setCallOpen] = useState(false);

  return (
    <footer className="px-4 pb-6 sm:px-6">
      <div className="mx-auto max-w-[1320px] overflow-hidden rounded-5xl bg-white ring-4 ring-white">
        <div className="grid gap-12 p-8 sm:p-12 lg:grid-cols-[1fr_auto] lg:gap-24">
          <div className="max-w-sm">
            <Logo size={32} />

            <p className="mt-5 leading-relaxed text-muted-foreground">{footer.tagline}</p>

            <button onClick={() => setCallOpen(true)} className="btn-dark mt-7">
              Book a Call
            </button>
          </div>

          <div className="grid grid-cols-2 gap-12 sm:gap-20">
            {footer.columns.map((column) => (
              <nav key={column.heading} aria-label={column.heading}>
                <p className="font-semibold tracking-tight">{column.heading}</p>
                <ul className="mt-5 space-y-3.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="border-t border-border px-8 py-6">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
            <p>© Copyright {new Date().getFullYear()} {profile.company}. All Rights Reserved.</p>

            <ul className="flex flex-wrap justify-center gap-5">
              {profile.socials.filter((social) => social.href).map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-foreground"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* What the mark means — last line on the page */}
      <div className="flex flex-col items-center gap-3 px-6 pb-2 pt-10 text-center sm:flex-row sm:justify-center sm:gap-3.5 sm:pt-12">
        <LogoMark size={18} className="shrink-0 text-foreground" />
        <p className="max-w-lg text-[13.5px] font-medium leading-relaxed text-foreground">
          {footer.meaning}
        </p>
      </div>

      <CalendlyModal isOpen={callOpen} onClose={() => setCallOpen(false)} />
    </footer>
  );
}
