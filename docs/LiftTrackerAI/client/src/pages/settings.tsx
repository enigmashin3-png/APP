"use client";
import { LocalActions } from "@/hooks/useLocalData";
import ThemeSelector from "@/components/theme/ThemeSelector";
import { useState } from "react";

export default function SettingsPage() {
  const [busy, setBusy] = useState(false);

  async function doExport() {
    const blob = new Blob([JSON.stringify(await LocalActions.exportAll(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `liftlegends-backup-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  }
  async function doImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setBusy(true);
    try {
      const text = await file.text();
      await LocalActions.importAll(JSON.parse(text), /*merge*/ true);
      alert("Import complete");
    } catch (e:any) {
      alert("Import failed: " + e.message);
    } finally { setBusy(false); }
  }

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Settings</h1>
      <section className="rounded-2xl bg-card p-5 shadow space-y-4">
        <ThemeSelector />
      </section>

      <section className="rounded-2xl bg-card p-5 shadow space-y-3">
        <div className="font-semibold">Data</div>
        <div className="flex gap-3">
          <button onClick={doExport} className="bg-primary text-white rounded-2xl px-4 py-2">Export backup</button>
          <label className="bg-secondary text-white rounded-2xl px-4 py-2 cursor-pointer">
            Import backup
            <input type="file" accept="application/json" className="hidden" onChange={doImport} disabled={busy} />
          </label>
        </div>
        <p className="text-sm text-muted">All data is stored locally in your browser (IndexedDB). Export regularly to keep a backup.</p>
      </section>
    </main>
  );
}
