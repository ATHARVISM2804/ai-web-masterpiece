import { useEffect, useRef, useState, type DetailedHTMLProps, type HTMLAttributes } from "react";

/**
 * The villa on your table: Google's model-viewer with a desk-sized cut of the
 * villa (`public/life/villa-ar.glb`, the plot only, 1:50). On a phone the
 * button opens AR (WebXR or Scene Viewer on Android, Quick Look on iPhone);
 * elsewhere it's a model to turn round. model-viewer is a self-contained
 * bundle with its own three.js, loaded only when this opens.
 */

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & Record<string, unknown>;
    }
  }
}

const SRC = "/life/vendor/model-viewer-4.0.0.min.js";

function loadViewer() {
  if (customElements.get("model-viewer")) return Promise.resolve();
  return new Promise<void>((done, fail) => {
    const s = document.createElement("script");
    s.type = "module";
    s.src = SRC;
    s.onload = () => done();
    s.onerror = () => fail(new Error("model-viewer didn't load"));
    document.head.appendChild(s);
  });
}

export default function ArVilla({ onClose }: { onClose: () => void }) {
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");
  const [canAr, setCanAr] = useState(false);
  const mv = useRef<HTMLElement & { canActivateAR?: boolean; activateAR?: () => void }>(null);

  useEffect(() => {
    let live = true;
    loadViewer().then(
      () => live && setState("ready"),
      () => live && setState("failed"),
    );
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    addEventListener("keydown", onKey);
    return () => {
      live = false;
      removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  useEffect(() => {
    const el = mv.current;
    if (state !== "ready" || !el) return;
    const check = () => setCanAr(!!el.canActivateAR);
    el.addEventListener("load", check);
    return () => el.removeEventListener("load", check);
  }, [state]);

  return (
    <div className="arv" role="dialog" aria-label="The villa in AR">
      <div className="arv__card glass">
        <div className="arv__head">
          <div>
            <p className="talk__who">The villa, in AR</p>
            <h3>Put it on your table</h3>
          </div>
          <button type="button" className="arv__close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="arv__stage">
          {state === "ready" && (
            <model-viewer
              ref={mv}
              src="/life/villa-ar.glb"
              alt="Atharv's villa in Bali, a 3D model"
              ar=""
              ar-modes="webxr scene-viewer quick-look"
              ar-scale="auto"
              camera-controls=""
              auto-rotate=""
              shadow-intensity="1"
              exposure="1.05"
              camera-orbit="35deg 62deg auto"
              style={{ width: "100%", height: "100%" }}
            >
              <span slot="ar-button" />
            </model-viewer>
          )}
          {state === "loading" && <p className="arv__msg">Loading the villa…</p>}
          {state === "failed" && <p className="arv__msg">The 3D viewer didn't load. Check your connection and try again.</p>}
        </div>
        {canAr ? (
          <button type="button" className="life__cta arv__go" onClick={() => mv.current?.activateAR?.()}>
            Place it on your table <span aria-hidden="true">→</span>
          </button>
        ) : (
          <p className="arv__hint">Drag to turn it. Open this page on your phone to stand the villa on your table: <b>atharvgolait.dev/?ar</b></p>
        )}
      </div>
    </div>
  );
}
