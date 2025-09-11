import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings as SettingsIcon, FileText, PlusCircle, TimerReset, RotateCcw, Link2 as LinkIcon, Info, XCircle, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import ExercisePicker from "../components/ExercisePicker";
import CountdownTimer from "../components/CountdownTimer";
import Modal from "../components/Modal";
import ExerciseInfoModal from "../components/ExerciseInfoModal";
import { useDbExercises } from "../hooks/useDbExercises";
import { useWorkoutStore } from "../store/workout";

export default function WorkoutSession() {
  const navigate = useNavigate();
  const { data: dbExercises } = useDbExercises();
  const ensureActive = useWorkoutStore((s) => s.ensureActive);
  const active = useWorkoutStore((s) => s.activeWorkout);
  const history = useWorkoutStore((s) => s.history);
  const settings = useWorkoutStore((s) => s.settings);
  const addExercise = useWorkoutStore((s) => s.addExercise);
  const addExerciseAndGetId = useWorkoutStore((s) => s.addExerciseAndGetId);
  const removeExercise = useWorkoutStore((s) => s.removeExercise);
  const replaceExercise = useWorkoutStore((s) => s.replaceExercise);
  const setExercise = useWorkoutStore((s) => s.setExercise);
  const addSet = useWorkoutStore((s) => s.addSet);
  const addWarmupSets = useWorkoutStore((s) => s.addWarmupSets);
  const updateSet = useWorkoutStore((s) => s.updateSet);
  const completeSet = useWorkoutStore((s) => s.completeSet);
  const finishWorkout = useWorkoutStore((s) => s.finishWorkout);
  const deleteSet = useWorkoutStore((s) => s.deleteSet);
  const moveExercise = useWorkoutStore((s) => s.moveExercise);

  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<null | { type: "replace" | "superset"; exId: string }>(null);

  const [running, setRunning] = useState(true); // elapsed timer
  const [elapsed, setElapsed] = useState(0);

  const [menuExId, setMenuExId] = useState<string | null>(null);
  const [restExId, setRestExId] = useState<string | null>(null);
  const [infoExName, setInfoExName] = useState<string | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);

  useEffect(() => {
    ensureActive();
    if (!running) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  const format = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const timeOfDayTitle = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Morning Workout";
    if (h < 18) return "Afternoon Workout";
    return "Evening Workout";
  }, []);

  const cancel = () => {
    setRunning(false);
    navigate("/workout");
  };

  const finish = () => {
    setRunning(false);
    finishWorkout();
    navigate("/workout");
  };

  const exList = active?.exercises || [];
  const isEmpty = exList.length === 0;

  //

  return (
    <div className="container" style={{ paddingTop: 16 }}>
      {/* Top bar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "var(--bg, transparent)",
          padding: "8px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ width: 48 }} />
        <div style={{ fontVariantNumeric: "tabular-nums" }}>{format(elapsed)}</div>
        <button onClick={finish} style={{ color: "#3b82f6", fontWeight: 600, letterSpacing: 0.3 }}>
          FINISH
        </button>
      </div>

      {/* Header */}
      <div style={{ marginTop: 8, marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>{timeOfDayTitle}</h2>
        <div style={{ opacity: 0.7, marginTop: 6 }}>{format(elapsed)}</div>
      </div>

      {/* Exercise list */}
      {!isEmpty &&
        exList.map((ex, idx) => (
          <div key={idx} style={{ marginTop: 32, borderTop: "1px solid #eee", paddingTop: 16 }}>
            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}
            >
              <h3 style={{ marginBottom: 0, color: "#2563eb" }}>{ex.name}</h3>
              <button
                onClick={() => setMenuExId(ex.id)}
                title="Exercise settings"
                style={{
                  height: 36,
                  width: 36,
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "transparent",
                }}
              >
                <SettingsIcon size={18} />
              </button>
            </div>
            {ex.supersetId && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 8px", borderRadius: 10, background: "rgba(37,99,235,0.1)", color: "#2563eb", fontSize: 12, marginBottom: 8 }}>
                <LinkIcon size={14} /> Superset
              </div>
            )}
            {ex.note && (
              <div style={{ opacity: 0.75, fontSize: 13, marginTop: 4, marginBottom: 6 }}>{ex.note}</div>
            )}

            {/* Header row */}
            {ex.sets.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 80px 100px 60px", gap: 8, margin: "10px 0", fontSize: 12, opacity: 0.8 }}>
                <div>SET</div>
                <div>PREVIOUS</div>
                <div>(+KG)</div>
                <div>REPS</div>
                <div></div>
              </div>
            )}

            {ex.sets.map((s, sIdx) => {
              // find previous workout sets for this exercise
              const prevWorkout = history.find((w) => w.exercises.some((e) => e.name.toLowerCase() === ex.name.toLowerCase()));
              let prevReps: number | undefined;
              if (prevWorkout) {
                const prevEx = prevWorkout.exercises.find((e) => e.name.toLowerCase() === ex.name.toLowerCase());
                prevReps = prevEx?.sets?.[sIdx]?.reps;
              }
              return (
              <div
                key={sIdx}
                style={{ display: "grid", gridTemplateColumns: "40px 1fr 80px 100px 60px", alignItems: "center", gap: 8, marginBottom: 8, padding: "6px 6px", borderRadius: 8, background: s.warmup ? "rgba(59,130,246,0.08)" : "transparent" }}
              >
                <span>{sIdx + 1}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {s.warmup && <span style={{ fontSize: 12, opacity: 0.75 }}>W/U</span>}
                  <span style={{ opacity: 0.75 }}>
                    {(() => {
                      const prevWorkout = history[0];
                      if (!prevWorkout) return '-';
                      const prevEx = prevWorkout.exercises.find((e) => e.name.toLowerCase() === ex.name.toLowerCase());
                      const p = prevEx?.sets?.[sIdx];
                      const wv = typeof p?.weight === 'number' ? `${p!.weight} ${settings.unit}` : null;
                      const rv = typeof p?.reps === 'number' ? `${p!.reps}` : null;
                      if (wv && rv) return `${wv} × ${rv}`;
                      if (rv) return `${rv} reps`;
                      return '-';
                    })()}
                  </span>
                </div>
                <input
                  type="number"
                  value={typeof s.weight === 'number' ? s.weight : ''}
                  placeholder="kg"
                  onChange={(e) => updateSet(ex.id, s.id, { weight: e.target.value === '' ? undefined : Number(e.target.value) })}
                  style={{ width: 60 }}
                />
                <input
                  type="number"
                  value={typeof s.reps === 'number' ? s.reps : ''}
                  placeholder="reps"
                  onChange={(e) => updateSet(ex.id, s.id, { reps: e.target.value === '' ? undefined : Number(e.target.value) })}
                  style={{ width: 60 }}
                />
                {s.done ? (
                  <span style={{ color: s.warmup ? "#16a34a" : "green" }}>✓</span>
                ) : (
                  <button onClick={() => completeSet(ex.id, s.id, {})}>Done</button>
                )}
                <button title="Delete set" onClick={() => deleteSet(ex.id, s.id)} style={{ marginLeft: 6, opacity: 0.8 }}>
                  <Trash2 size={16} />
                </button>
              </div>
              );
            })}

            {(() => {
              const latestEnd = Math.max(0, ...ex.sets.map((s) => s.restEndAt ?? 0));
              const remain = latestEnd - Date.now();
              if (remain > 0) {
                return (
                  <div style={{ marginBottom: 8 }}>
                    Rest: <CountdownTimer key={latestEnd} seconds={Math.ceil(remain / 1000)} running={true} onComplete={() => {}} />
                  </div>
                );
              }
              return null;
            })()}

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
              <button onClick={() => addSet(ex.id)}>Add Set ({format((ex.restSec ?? settings.defaultRestSec) | 0)})</button>
              <label>
                Rest (sec):
                <input
                  type="number"
                  value={ex.restSec ?? settings.defaultRestSec}
                  onChange={(e) => setExercise(ex.id, { restSec: parseInt(e.target.value, 10) || 0 })}
                  style={{ width: 60, marginLeft: 4 }}
                />
              </label>
            </div>
          </div>
        ))}

      {!isEmpty && (
        <div style={{ marginTop: 32, display: "grid", gap: 16 }}>
          <button onClick={() => setShowPicker(true)} style={{ alignSelf: "center", color: "#2563eb", letterSpacing: 1 }}>
            Add Exercise
          </button>
          <button onClick={cancel} style={{ alignSelf: "center", color: "#ef4444", letterSpacing: 1 }}>
            Cancel Workout
          </button>
        </div>
      )}

      {isEmpty && (
        <div style={{ display: "grid", gap: 18, marginTop: 24 }}>
          <button
            onClick={() => setShowPicker(true)}
            style={{ alignSelf: "center", color: "#3b82f6", letterSpacing: 2, fontWeight: 700, background: "transparent" }}
          >
            ADD EXERCISE
          </button>
          <button
            onClick={cancel}
            style={{ alignSelf: "center", color: "#ef4444", letterSpacing: 2, fontWeight: 700, background: "transparent" }}
          >
            CANCEL WORKOUT
          </button>
        </div>
      )}

      {showPicker && (
        <ExercisePicker
          onAdd={(items) => {
            if (!items.length) { setShowPicker(false); return; }
            if (pickerMode) {
              const { type, exId } = pickerMode;
              const first = items[0];
              if (type === "replace") {
                replaceExercise(exId, first.name);
              } else if (type === "superset") {
                const group = Math.random().toString(36).slice(2, 8);
                setExercise(exId, { supersetId: group });
                const newId = addExerciseAndGetId(first.name);
                setExercise(newId, { supersetId: group });
              }
              setPickerMode(null);
            } else {
              items.forEach((it) => addExercise(it.name));
            }
            setShowPicker(false);
          }}
          onClose={() => setShowPicker(false)}
        />
      )}

      {/* Update rest timers */}
      {restExId && (
        <Modal open={true} onClose={() => setRestExId(null)} title="Update rest timers">
          <div className="space-y-3">
            <label className="grid gap-1">
              <span className="text-sm opacity-80">Rest seconds</span>
              <input
                type="number"
                min={0}
                value={exList.find((e)=>e.id===restExId)?.restSec ?? settings.defaultRestSec}
                onChange={(e) => setExercise(restExId!, { restSec: parseInt(e.target.value, 10) || 0 })}
                className="rounded-xl border px-3 py-2"
                style={{ width: 120 }}
              />
            </label>
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setRestExId(null)} className="h-9 px-3 rounded-lg border">
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Context menu */}
      {menuExId && (
        <div onClick={() => setMenuExId(null)} className="fixed inset-0 z-50" style={{ background: "rgba(0,0,0,0.2)" }}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="rounded-2xl"
            style={{
              position: "absolute",
              right: 12,
              top: 120,
              background: "#111827",
              color: "#e5e7eb",
              width: 300,
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 12px 32px rgba(0,0,0,0.35)",
              padding: 8,
            }}
          >
            {[
              { key: "note", label: "Add note", icon: FileText },
              { key: "warmup", label: "Add warm-up sets", icon: PlusCircle },
              { key: "rest", label: "Update rest timers", icon: TimerReset },
            ].map((it, i) => {
              const Icon = it.icon as any;
              return (
                <button key={it.key} className="w-full text-left" style={{ padding: "12px 10px", display: "flex", alignItems: "center", gap: 10 }} onClick={() => {
                  if (it.key === 'note') {
                    const cur = exList.find(e=>e.id===menuExId);
                    const v = prompt('Note for this exercise:', cur?.note || '');
                    if (v != null) setExercise(menuExId!, { note: v.trim() || undefined });
                    setMenuExId(null);
                  } else if (it.key === 'warmup') {
                    addWarmupSets(menuExId!, 2);
                    setMenuExId(null);
                  } else if (it.key === 'rest') {
                    setRestExId(menuExId!);
                    setMenuExId(null);
                  }
                }}>
                  <Icon size={18} />
                  <span>{it.label}</span>
                </button>
              );
            })}
            <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "4px 6px" }} />
            {[
              { key: "replace", label: "Replace exercise", icon: RotateCcw },
              { key: "superset", label: "Create superset", icon: LinkIcon },
              { key: "move_up", label: "Move up", icon: ArrowUp },
              { key: "move_down", label: "Move down", icon: ArrowDown },
            ].map((it) => {
              const Icon = it.icon as any;
              return (
                <button key={it.key} className="w-full text-left" style={{ padding: "12px 10px", display: "flex", alignItems: "center", gap: 10 }} onClick={() => {
                  if (it.key === 'replace') {
                    setPickerMode({ type: 'replace', exId: menuExId! });
                    setShowPicker(true);
                    setMenuExId(null);
                  } else if (it.key === 'superset') {
                    setPickerMode({ type: 'superset', exId: menuExId! });
                    setShowPicker(true);
                    setMenuExId(null);
                  } else if (it.key === 'move_up') {
                    moveExercise(menuExId!, 'up');
                    setMenuExId(null);
                  } else if (it.key === 'move_down') {
                    moveExercise(menuExId!, 'down');
                    setMenuExId(null);
                  }
                }}>
                  <Icon size={18} />
                  <span>{it.label}</span>
                </button>
              );
            })}
            <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "4px 6px" }} />
            {[
              { key: "info", label: "Info", icon: Info },
            ].map((it) => {
              const Icon = it.icon as any;
              return (
                <button key={it.key} className="w-full text-left" style={{ padding: "12px 10px", display: "flex", alignItems: "center", gap: 10 }} onClick={() => {
                  const nm = exList.find(e=>e.id===menuExId)?.name;
                  if (nm) { setInfoExName(nm); setInfoOpen(true); }
                  setMenuExId(null);
                }}>
                  <Icon size={18} />
                  <span>{it.label}</span>
                </button>
              );
            })}
            <button className="w-full text-left" style={{ padding: "12px 10px", display: "flex", alignItems: "center", gap: 10, color: "#ef4444" }} onClick={() => { removeExercise(menuExId!); setMenuExId(null); }}>
              <XCircle size={18} />
              <span>Remove exercise</span>
            </button>
          </div>
        </div>
      )}

      {/* Info modal */}
      {infoOpen && infoExName != null && (
        <ExerciseInfoModal
          open={true}
          onClose={() => setInfoOpen(false)}
          exercise={dbExercises?.find((e) => e.name === infoExName) || null}
        />
      )}
    </div>
  );
}



