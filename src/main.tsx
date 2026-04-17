import React from "react";
import ReactDOM from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import TrayPreviewApp from "./TrayPreviewApp";
import { isTauriDesktop, isTrayPreviewWindow } from "./lib/desktop";
import { prepareDesktopRuntime } from "./lib/desktop-runtime";
import "./fonts.css";
import "./styles.css";

if (!isTauriDesktop()) {
  registerSW({ immediate: true });
}

void prepareDesktopRuntime().finally(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      {isTrayPreviewWindow() ? <TrayPreviewApp /> : <App />}
    </React.StrictMode>
  );
});
