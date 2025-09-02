import { useSettingsStore, type ThemeName } from "../../stores/settings";

export function AppearanceSection() {
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);

  return (
    <section className="p-4 rounded-2xl bg-card border border-border">
      <h2 className="text-xl font-semibold mb-3">Appearance</h2>
      <label className="block text-sm mb-1">Theme</label>
      <select
        className="w-full bg-background border border-border rounded-md p-2"
        value={theme}
        onChange={(e) => setTheme(e.target.value as ThemeName)}
      >
        <option value="legend">Legend Gold (default)</option>
        <option value="classic">Classic (original colors)</option>
      </select>
      <p className="text-sm text-muted-foreground mt-2">
        Changes apply instantly and are saved on this device.
      </p>
    </section>
  );
}
