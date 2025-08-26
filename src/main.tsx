import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import RootErrorBoundary from "./shared/RootErrorBoundary";

// Dev-only: lightweight error overlay (so a thrown error doesn't yield a blank page)
if (import.meta.env.DEV) {
  import("./shared/consoleOverlay").catch(() => {});
}

// Ensure we have a mount node
let rootEl = document.getElementById("root");
if (!rootEl) {
  rootEl = document.createElement("div");
  rootEl.id = "root";
  document.body.appendChild(rootEl);
}

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </React.StrictMode>
);
