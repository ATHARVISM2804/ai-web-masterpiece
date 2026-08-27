import { useEffect } from "react";
import { X } from "lucide-react";
import { profile } from "@/content/site";
import { lockScroll } from "@/lib/smooth-scroll";

interface CalendlyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: {
        url: string;
        parentElement: HTMLElement;
        prefill?: object;
        utm?: object;
      }) => void;
    };
  }
}

export default function CalendlyModal({ isOpen, onClose }: CalendlyModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
      lockScroll(true);
      
      // Initialize Calendly widget
      const timer = setTimeout(() => {
        const container = document.getElementById("calendly-inline-container");
        if (container && window.Calendly) {
          container.innerHTML = ""; // Clear any existing widget
          window.Calendly.initInlineWidget({
            url: profile.calendly,
            parentElement: container,
          });
        }
      }, 100);

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = "unset";
        lockScroll(false);
      };
    } else {
      document.body.style.overflow = "unset";
      lockScroll(false);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
      return () => window.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl h-[85vh] mx-4 bg-background rounded-[var(--radius)] border border-border overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <p className="label">30 minutes · no pitch</p>
            <h3 className="mt-1 text-lg font-semibold tracking-[-0.02em]">Book a scope call</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 transition-colors hover:bg-muted"
            aria-label="Close modal"
          >
            <X size={20} className="text-foreground" />
          </button>
        </div>

        {/* Calendly Widget Container */}
        <div
          id="calendly-inline-container"
          className="w-full h-[calc(100%-77px)]"
          style={{ minWidth: "320px" }}
        />
      </div>
    </div>
  );
}
