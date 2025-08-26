import React from "react";
import { MoreHorizontal, Plus, CalendarDays, Search } from "lucide-react";
import logo from "../assets/lift-legends-logo.svg";

type Template = { id: string; title: string; exercises: string[]; date: string };
const templates: Template[] = [
  { id: "t1", title: "PHAT Back and s...", exercises: ["Seated Overhead Press (Barbell)", "Seated Overhead ..."], date: "Dec 9, 2023" },
  { id: "t2", title: "PHAT legs hypertrophy", exercises: ["Squat (Barbell)", "Bulgarian Split Squat, Cross Body..."], date: "Sep 2, 2023" },
  { id: "t3", title: "PHAT chest and triceps", exercises: ["Bench Press (Barbell)", "Incline Bench Press (Barb..."], date: "Feb 18, 2025" },
  { id: "t4", title: "PHAT Lower body", exercises: ["Squat (Barbell)", "Hack Squat (Barbell), Lunge (D..."], date: "Jun 29, 2022" },
];

export default function WorkoutHome() {
  return (
    <div className="app">
      <header className="app-header">
        <img src={logo} alt="Lift Legends" style={{width:32,height:32,opacity:.9}} />
        <div className="h1">Workout</div>
        <div className="subtle">Quick start</div>
        <div className="container" style={{padding: "10px 0 0"}}>
          <button className="quick">START AN EMPTY WORKOUT</button>
        </div>
      </header>

      <main className="container">
        <div className="row">
          <h2>Templates</h2>
          <div style={{display:"flex",gap:10}}>
            <button className="icon-btn" title="Add"><Plus size={18}/></button>
            <button className="icon-btn" title="Import"><CalendarDays size={18}/></button>
            <button className="icon-btn" title="More"><MoreHorizontal size={18}/></button>
          </div>
        </div>

        <div className="grid">
          {templates.map(t => (
            <article key={t.id} className="card">
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                <h3>{t.title}</h3>
                <button className="icon-btn" aria-label="More"><MoreHorizontal size={18}/></button>
              </div>
              <p>{t.exercises.join(", ")}</p>
              <div className="meta">
                <span className="badge">Saved</span>
                <span style={{marginLeft:"auto"}}>{t.date}</span>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
