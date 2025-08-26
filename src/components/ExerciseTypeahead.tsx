import React, { useEffect, useRef, useState } from "react";
import { useDebounce } from "../hooks/useDebounce";

type Exercise = { id?: number|string; name: string; muscle?: string; equipment?: string };

type Props = {
  value: string;
  onChange: (val: string) => void;         // called as user types
  onSelect?: (item: Exercise) => void;     // called when user picks a suggestion
  placeholder?: string;
  limit?: number;
  autoFocus?: boolean;
};

export default function ExerciseTypeahead({ value, onChange, onSelect, placeholder="Start typing an exercise…", limit=10, autoFocus=false }: Props) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Exercise[]>([]);
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const debounced = useDebounce(value, 150);

  useEffect(() => {
    if (!debounced?.trim()) {
      setItems([]);
      setOpen(false);
      return;
    }
    const controller = new AbortController();
    const q = encodeURIComponent(debounced.trim());
    fetch(`/api/exercises?q=${q}&limit=${limit}`, { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((data: Exercise[]) => { setItems(data); setOpen(true); setHighlight(0); })
      .catch((e) => { console.error("typeahead fetch failed:", e); });
    return () => controller.abort();
  }, [debounced, limit]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlight(h => Math.min(h+1, items.length-1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlight(h => Math.max(h-1, 0)); }
    else if (e.key === "Enter") {
      e.preventDefault();
      const pick = items[highlight];
      if (pick) {
        onChange(pick.name);
        onSelect?.(pick);
        setOpen(false);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const onBlur = () => setTimeout(() => setOpen(false), 120);

  return (
    <div style={{ position: "relative" }}>
      <input
        ref={inputRef}
        value={value}
        onChange={e => { onChange(e.target.value); if (!open) setOpen(true); }}
        onKeyDown={onKeyDown}
        onFocus={() => value.trim() && items.length && setOpen(true)}
        onBlur={onBlur}
        placeholder={placeholder}
        autoFocus={autoFocus}
        style={{
          width: "100%", padding: "10px 12px", borderRadius: 10,
          border: "1px solid #ccc", outline: "none", fontSize: 16
        }}
      />
      {open && items.length > 0 && (
        <div
          role="listbox"
          style={{
            position: "absolute", zIndex: 20, top: "100%", left: 0, right: 0,
            background: "#fff", border: "1px solid #ddd", borderRadius: 10,
            marginTop: 6, maxHeight: 300, overflow: "auto", boxShadow: "0 8px 24px rgba(0,0,0,0.12)"
          }}
        >
          {items.map((it, idx) => (
            <div
              key={`${it.id ?? it.name}-${idx}`}
              role="option"
              aria-selected={idx===highlight}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onChange(it.name); onSelect?.(it); setOpen(false); }}
              onMouseEnter={() => setHighlight(idx)}
              style={{
                padding: "10px 12px",
                background: idx===highlight ? "rgba(0,0,0,0.06)" : "transparent",
                cursor: "pointer",
                display: "flex", justifyContent: "space-between", gap: 8
              }}
            >
              <span>{it.name}</span>
              <span style={{ opacity: 0.7, fontSize: 12 }}>
                {[it.muscle, it.equipment].filter(Boolean).join(" · ")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
