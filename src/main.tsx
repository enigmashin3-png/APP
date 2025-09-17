import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Sentry } from "./sentry.client";
import "./index.css";
import ThemeProvider from "./components/ThemeProvider";
import { BrowserRouter } from "react-router-dom";
import { warmLoadDbExercisesIdle } from "./data/exercisesDb";

// Android: handle hardware back button and deep link routing when running under Capacitor
// This is safe in web/desktop; it no-ops if the plugin/env isn't present.
;(async () => {
  try {
    const [
      { Capacitor },
      { App },
      { StatusBar, Style },
      { Keyboard, KeyboardResize },
    ] = await Promise.all([
      import("@capacitor/core"),
      import("@capacitor/app"),
      import("@capacitor/status-bar"),
      import("@capacitor/keyboard"),
    ]);
    if (!Capacitor.isNativePlatform()) return;

    // Status bar and keyboard behavior (Android)
    try {
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: "#0C0F14" });
      await StatusBar.setOverlaysWebView({ overlay: false });
    } catch {}
    try {
      await Keyboard.setResizeMode({ mode: KeyboardResize.Native });
    } catch {}

    // Back button: go back if possible, otherwise exit app
    App.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack || window.history.length > 1) {
        window.history.back();
      } else {
        App.exitApp();
      }
    });

    // Deep link routing for custom scheme (e.g., com.lift.legends://path)
    App.addListener("appUrlOpen", (data) => {
      try {
        const url = new URL(data.url);
        const path = url.pathname + url.search + url.hash;
        if (path) {
          window.history.pushState({}, "", path);
        }
      } catch {
        // ignore malformed URLs
      }
    });
  } catch {
    // Plugin not installed or not available; ignore in web/desktop
  }
})();

const Fallback = () => (
  <div style={{ padding: 24 }}>
    <h1>Something went wrong</h1>
    <p>Please refresh the page. Our team has been notified.</p>
  </div>
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        {Sentry?.ErrorBoundary ? (
          <Sentry.ErrorBoundary fallback={<Fallback />}>
            <App />
          </Sentry.ErrorBoundary>
        ) : (
          <App />
        )}
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

// Warm-load the exercises DB in the background so typeahead is ready quickly
warmLoadDbExercisesIdle();
