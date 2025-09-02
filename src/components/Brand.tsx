import logoUrl from "../assets/lift-legends-logo.svg?url";

export function Brand() {
  return (
    <div className="flex items-center gap-3">
      <img src={logoUrl} alt="Lift Legends" className="h-8 w-8" />
      <span
        className="hidden sm:inline font-semibold tracking-wide"
        style={{ letterSpacing: ".06em" }}
      >
        Lift Legends
      </span>
    </div>
  );
}
