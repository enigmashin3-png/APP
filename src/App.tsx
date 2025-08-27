import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Home from "./pages/Home";
import Logger from "./pages/Logger";

function Nav() {
  const base = "px-3 py-2 rounded-xl border border-transparent hover:border-white/10";
  const active = "bg-white/5";
  return (
    <header className="sticky top-0 z-10 backdrop-blur bg-black/30 border-b border-white/10">
      <nav className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-2">
        <NavLink to="/" className={({isActive}) => `${base} ${isActive ? active : ""}`}>Home</NavLink>
        <NavLink to="/logger" className={({isActive}) => `${base} ${isActive ? active : ""}`}>Logger</NavLink>
      </nav>
    </header>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/logger" element={<Logger />} />
      </Routes>
    </BrowserRouter>
  );
}
