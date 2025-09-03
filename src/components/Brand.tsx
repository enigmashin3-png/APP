import React, { useEffect, useState } from "react";
import { LOGO_DATA_URI, resolveLogoUrl } from "../branding/logo";

export function Brand({ withText = true }: { withText?: boolean }) {
  const [logoSrc, setLogoSrc] = useState<string>(LOGO_DATA_URI);
  useEffect(() => {
    resolveLogoUrl().then(setLogoSrc).catch(() => setLogoSrc(LOGO_DATA_URI));
  }, []);
  return (
    <div className="flex items-center gap-3">
      <img
        src={logoSrc}
        alt="Lift Legends"
        className="h-8 w-8 select-none"
        draggable={false}
      />
      {withText && (
        <span className="hidden sm:inline font-semibold tracking-wide" style={{ letterSpacing: ".06em" }}>
          Lift Legends
        </span>
      )}
    </div>
  );
}
