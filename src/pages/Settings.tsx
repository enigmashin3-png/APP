import { useRef, useState } from "react";
import { useWorkoutStore } from "../store/workout";

export default function Settings() {
  const settings = useWorkoutStore((s) => s.settings);
  const setSetting = useWorkoutStore((s) => s.setSetting);
  const exportAll = useWorkoutStore((s) => s.exportAll);
  const importAll = useWorkoutStore((s) => s.importAll);
  const clearAll = useWorkoutStore((s) => s.clearAll);

  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string>("");

  const doExport = () => {
    const blob = new Blob([exportAll()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "liftlegends-backup.json";
    a.click();
    URL.revokeObjectURL(url);
    setMsg("Backup downloaded.");
  };

  const onImportFile = async (file: File) => {
    const text = await file.text();
    const ok = importAll(text);
    setMsg(ok ? "Backup restored." : "Invalid backup file.");
  };

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-6">
      <div className="text-lg font-semibold">Settings</div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1">
          <div className="text-sm">Units</div>
          <select
            value={settings.unit}
            onChange={(e) => setSetting("unit", e.target.value as any)}
            className="h-10 rounded-lg border px-3 border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
          >
            <option value="kg">Kilograms (kg)</option>
            <option value="lb">Pounds (lb)</option>
          </select>
        </label>

        <label className="space-y-1">
          <div className="text-sm">Theme</div>
          <select
            value={settings.theme}
            onChange={(e) => setSetting("theme", e.target.value as any)}
            className="h-10 rounded-lg border px-3 border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>

        <label className="space-y-1">
          <div className="text-sm">Default rest (seconds)</div>
          <input
            type="number"
            min={15}
            step={15}
            value={settings.defaultRestSec}
            onChange={(e) => setSetting("defaultRestSec", Math.max(15, Number(e.target.value || 0)))}
            className="h-10 rounded-lg border px-3 border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
          />
        </label>

        <label className="space-y-1">
          <div className="text-sm">Default bar weight ({settings.unit})</div>
          <input
            type="number"
            min={settings.unit === "kg" ? 10 : 20}
            step={settings.unit === "kg" ? 0.5 : 1}
            value={settings.unit === "kg" ? settings.barWeightKg : Math.round(settings.barWeightKg * 2.20462)}
            onChange={(e) => {
              const v = Number(e.target.value || 0);
              const kg = settings.unit === "kg" ? v : v * 0.45359237;
              useWorkoutStore.getState().setSetting("barWeightKg", Math.max(5, +kg.toFixed(2)));
            }}
            className="h-10 rounded-lg border px-3 border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
          />
        </label>
      </div>

      <div className="space-y-3">
        <div className="text-lg font-semibold">Backup</div>
        <div className="flex flex-wrap gap-2">
          <button onClick={doExport} className="h-10 px-4 rounded-lg border border-neutral-300 dark:border-neutral-700">Export JSON</button>
          <button onClick={() => fileRef.current?.click()} className="h-10 px-4 rounded-lg border border-neutral-300 dark:border-neutral-700">Import JSON</button>
          <button
            onClick={() => { if (confirm("This will clear all local data. Continue?")) clearAll(); }}
            className="h-10 px-4 rounded-lg border border-red-300 text-red-600 dark:border-red-800"
          >
            Clear All
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onImportFile(f); e.currentTarget.value = ""; }}
          />
        </div>
        {msg && <div className="text-sm opacity-80">{msg}</div>}
      </div>

      <div className="text-xs opacity-70">
        Data is stored locally on this device. Export to keep your own backups.
      </div>
    </div>
  );
}
