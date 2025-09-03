import React from "react";
import { Brand } from "./Brand";

export default function TopBar() {
  return (
    <header className="w-full sticky top-0 z-40 bg-card/80 border-b border-border backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Brand />
        <div className="flex items-center gap-2">{/* actions */}</div>
      </div>
    </header>
  );
}
