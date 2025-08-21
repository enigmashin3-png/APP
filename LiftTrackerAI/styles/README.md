# Design Tokens — Lift Legends (Themes via CSS Variables + Tailwind)

All shared UI uses Tailwind classes backed by CSS variables. Themes are applied by toggling `data-theme` on `<html>`.

## Color Tokens (Tailwind → CSS vars)
- Core:
  - `bg-bg` → `var(--color-bg)`
  - `text-fg` → `var(--color-fg)`
  - `bg-card` → `var(--color-card)`
  - `text-muted` / `border-muted` → `var(--color-muted)`
- Brand:
  - `bg-primary` / `text-primary` / `border-primary` → `var(--color-primary)`
  - `bg-secondary` / `text-secondary` → `var(--color-secondary)`
  - `bg-accent` / `text-accent` → `var(--color-accent)`
- Feedback:
  - `success`, `warning`, `danger` map to `--color-success`, `--color-warning`, `--color-danger`

## Buttons
- Primary: `bg-primary text-white rounded-2xl px-4 py-2 hover:opacity-90 active:opacity-80 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-primary/40`
- Secondary (outline): `border border-primary text-primary hover:bg-primary/10`
- Ghost: `text-primary hover:bg-card`

## Inputs
- Base: `bg-card text-fg placeholder:text-muted border border-card rounded-xl px-3 py-2`
- Focus: `focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none`
- Disabled: `disabled:bg-card disabled:opacity-60`

## Cards
- Base: `bg-card text-fg rounded-2xl shadow-sm p-4`
- Subtle shadow: `shadow-[0_2px_8px_rgba(0,0,0,0.08)]`

## Navigation
- Container: `bg-card/90 backdrop-blur border-t border-card`
- Item: `text-muted`
- Active: `text-primary` and/or `border-b-2 border-primary`

## Badges / Chips
- Success: `bg-success/10 text-success border border-success/30`
- Warning: `bg-warning/10 text-warning border border-warning/30`
- Danger: `bg-danger/10 text-danger border border-danger/30`

## No‑Flash Theme Script (optional)
Inline in `app/layout.tsx` before `<body>`:
```tsx
<script
  dangerouslySetInnerHTML={{
    __html: `
(function(){
  try {
    var k='liftlegends.theme';
    var t = localStorage.getItem(k) || 'default';
    if (t && t !== 'default') document.documentElement.setAttribute('data-theme', t);
  } catch(e){}
})();`
  }}
/>
```

## Do / Don’t

✅ Use token classes only.

✅ Keep all palettes in styles/themes.css.

❌ No hardcoded hex/brand colors in components.

❌ No per-theme conditionals in component logic.
