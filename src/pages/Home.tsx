import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <div className="rounded-2xl p-6 shadow-xl border border-white/10 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Lift Legends</h1>
        <p className="mt-2 opacity-80">Tailwind + Vite + React are working.</p>
        <Link
          to="/logger"
          className="inline-block mt-4 rounded-2xl px-4 py-2 border border-white/10"
        >
          Go to Logger
        </Link>
      </div>
    </main>
  );
}
