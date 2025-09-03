import React from "react";
import logoPng from "../assets/lift-legends-logo";

export function Brand({ withText = true }: { withText?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <img src={logoPng} alt="Lift Legends" className="h-8 w-8 select-none" draggable={false} />
      {withText && (
        <span
          className="hidden sm:inline font-semibold tracking-wide"
          style={{ letterSpacing: ".06em" }}
        >
          Lift Legends
        </span>
      )}
    </div>
  );
}
