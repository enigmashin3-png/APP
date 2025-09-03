import { useTheme } from "../store/theme";

export default function SettingsAppearance() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="p-4 space-y-3">
      <h1 className="text-xl font-semibold">Appearance</h1>
      <label className="flex items-center gap-2">
        <span>Theme</span>
        <select
          className="select select-bordered"
          value={theme}
          onChange={(e) => setTheme(e.target.value as any)}
        >
          <option value="brand">Brand (new)</option>
          <option value="legacy">Legacy</option>
        </select>
      </label>
    </div>
  );
}

