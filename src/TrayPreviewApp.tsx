import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import type { UnlistenFn } from "@tauri-apps/api/event";
import type { DesktopPreviewSnapshot } from "./lib/desktop";
import {
  listenToDesktopPreviewSnapshot,
  readDesktopPreviewSnapshot,
  syncDesktopPreviewWindow,
} from "./lib/desktop-preview";

const PREVIEW_HEIGHT_MULTIPLIER = 1.25;

function TrayPreviewApp() {
  const previewRef = useRef<HTMLElement | null>(null);
  const [snapshot, setSnapshot] = useState<DesktopPreviewSnapshot | null>(null);

  useEffect(() => {
    document.body.classList.add("tray-preview-mode");

    return () => {
      document.body.classList.remove("tray-preview-mode");
    };
  }, []);

  useEffect(() => {
    let active = true;
    let unlisten: UnlistenFn | undefined;

    void readDesktopPreviewSnapshot()
      .then((nextSnapshot) => {
        if (!active) {
          return;
        }

        setSnapshot(nextSnapshot);
      })
      .catch(() => undefined);

    void listenToDesktopPreviewSnapshot((nextSnapshot) => {
      if (!active) {
        return;
      }

      setSnapshot(nextSnapshot);
    }).then((dispose) => {
      unlisten = dispose;
    });

    return () => {
      active = false;
      unlisten?.();
    };
  }, []);

  useLayoutEffect(() => {
    if (!previewRef.current) {
      return;
    }

    const previewElement = previewRef.current;
    let frame = 0;

    const syncPreviewWindow = () => {
      const rect = previewElement.getBoundingClientRect();
      const height = Math.ceil(rect.height) * PREVIEW_HEIGHT_MULTIPLIER;

      void syncDesktopPreviewWindow(height);
    };

    const scheduleSync = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(syncPreviewWindow);
    };

    const resizeObserver = new ResizeObserver(() => {
      scheduleSync();
    });

    resizeObserver.observe(previewElement);
    scheduleSync();

    if ("fonts" in document) {
      void document.fonts.ready.then(() => {
        scheduleSync();
      });
    }

    return () => {
      resizeObserver.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [snapshot]);

  const previewStyle = {
    background: snapshot?.theme.background ?? "transparent",
    color: snapshot?.theme.text ?? "transparent",
    "--tray-preview-muted-text": snapshot?.theme.mutedText ?? "transparent",
    "--tray-preview-font-family": snapshot?.theme.fontFamily ?? "sans-serif",
    "--tray-preview-font-scale": String(snapshot?.theme.uiScale ?? 1),
  } as CSSProperties;

  return (
    <main ref={previewRef} className="tray-preview-screen" style={previewStyle}>
      <p className="tray-preview-message">{snapshot?.message ?? ""}</p>
      <div className="tray-preview-footer">
        <span
          className={`tray-preview-status-orb tray-preview-status-orb-${snapshot?.status ?? "idle"}`}
          aria-hidden="true"
        />
        <span className="tray-preview-footer-line">{snapshot?.footerLine ?? ""}</span>
      </div>
    </main>
  );
}

export default TrayPreviewApp;
