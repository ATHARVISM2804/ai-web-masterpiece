import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { nav } from "@/content/site";
import Logo from "./Logo";
import BookingModal from "./BookingModal";
import { lockScroll, scrollToTarget, scrollToTop } from "@/lib/smooth-scroll";

export default function SiteNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [callOpen, setCallOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    lockScroll(menuOpen);
    return () => {
      document.body.style.overflow = "";
      lockScroll(false);
    };
  }, [menuOpen]);

  const go = (href: string) => {
    setMenuOpen(false);
    scrollToTarget(href);
  };

  return (
    <>
      <header className="fixed inset-x-0 top-4 z-50 px-4 sm:top-6">
        <div className="mx-auto flex h-[68px] w-full max-w-[900px] items-center justify-between rounded-[63px] border-2 border-white/[0.44] bg-white/[0.46] pl-6 pr-3 backdrop-blur-[11px]">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setMenuOpen(false);
              scrollToTop();
            }}
          >
            <Logo />
          </a>

          <div className="flex items-center gap-2">
            <nav className="hidden items-center gap-7 pr-3 md:flex">
              {nav.map((item) => (
                <button
                  key={item.href}
                  onClick={() => go(item.href)}
                  className="text-[15px] text-foreground/80 transition-colors hover:text-foreground"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <button
              onClick={() => setCallOpen(true)}
              className="btn-dark hidden px-6 py-3 text-[15px] sm:inline-flex"
            >
              Book a Call
            </button>

            <button
              className="p-2.5 md:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-40 bg-background transition-opacity duration-300 md:hidden ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="shell flex h-full flex-col justify-center gap-2">
          {nav.map((item) => (
            <button
              key={item.href}
              onClick={() => go(item.href)}
              className="border-b border-border py-5 text-left text-3xl font-medium tracking-[-0.03em]"
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => {
              setMenuOpen(false);
              setCallOpen(true);
            }}
            className="btn-dark mt-8 w-full"
          >
            Book a Call
          </button>
        </div>
      </div>

      <BookingModal isOpen={callOpen} onClose={() => setCallOpen(false)} />
    </>
  );
}
