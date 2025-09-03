import { LOGO_DATA_URI } from "@/assets/logo";

export function Header() {
  return (
    <header className="flex items-center h-12 px-3 border-b gap-2">
      <img alt="Lift Legends" src={LOGO_DATA_URI} className="h-6 w-6" />
      <strong className="tracking-tight">Lift Legends</strong>
    </header>
  );
}

