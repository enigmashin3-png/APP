import { appWindow } from "@tauri-apps/api/window";

export default function Titlebar() {
  return (
    <div
      data-tauri-drag-region
      className="fixed top-0 inset-x-0 z-50 h-8 flex items-center justify-between px-2
                 bg-white/80 dark:bg-neutral-900/80 backdrop-blur border-b
                 border-neutral-200 dark:border-neutral-800"
    >
      <div data-tauri-drag-region className="text-xs opacity-70">Lift Legends</div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => appWindow.minimize()}
          className="h-6 w-8 rounded hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60"
          title="Minimize"
        >—</button>
        <button
          onClick={async () => {
            const isMax = await appWindow.isMaximized();
            isMax ? appWindow.unmaximize() : appWindow.maximize();
          }}
          className="h-6 w-8 rounded hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60"
          title="Maximize"
        >▢</button>
        <button
          onClick={() => appWindow.close()}
          className="h-6 w-8 rounded hover:bg-red-500/20"
          title="Close"
        >×</button>
      </div>
    </div>
  );
}
