import { useEffect } from "react";
import { X } from "lucide-react";
import { profile } from "@/content/site";
import { lockScroll } from "@/lib/smooth-scroll";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Scope-call booking, embedded from cal.com.
 *
 * The iframe only mounts while the modal is open, so nothing is requested
 * from cal.com until someone actually asks to book.
 */
export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = "hidden";
    lockScroll(true);

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
      lockScroll(false);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative mx-4 h-[85vh] w-full max-w-4xl overflow-hidden rounded-[var(--radius)] border border-border bg-background shadow-2xl duration-200 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              30 minutes · no pitch
            </p>
            <h3 className="mt-1 text-lg font-semibold tracking-[-0.02em]">Book a scope call</h3>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 transition-colors hover:bg-muted"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <iframe
          src={profile.booking}
          title="Book a scope call"
          className="h-[calc(100%-77px)] w-full border-0"
          allow="camera; microphone; fullscreen; clipboard-write"
        />
      </div>
    </div>
  );
}
