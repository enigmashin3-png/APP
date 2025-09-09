import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Sentry } from "./sentry.client";
import "./index.css";
import ThemeProvider from "./components/ThemeProvider";
import { BrowserRouter } from "react-router-dom";

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
