# QA Checklist — Multi‑Theme System (Lift Legends)

## Functional
- [ ] Theme switcher shows 5 options: default, darkpro, sunset, minimal, arcade.
- [ ] Switching theme updates `<html data-theme="...">` immediately (no refresh).
- [ ] Selection persists via localStorage key `liftlegends.theme`.
- [ ] (If enabled) POST `/api/user/theme` persists theme to DB after login.
- [ ] Unknown or missing theme falls back to **default**.

## Visual (each theme)
- [ ] Background uses `bg-bg`, text uses `text-fg`, cards use `bg-card`.
- [ ] Primary/secondary/accent tokens are applied to buttons, links, focus, highlights.
- [ ] Contrast meets WCAG AA: body text ≥ 4.5:1; large text ≥ 3:1.
- [ ] Borders/dividers use `border-muted` or `border-card`.
- [ ] Shadows are subtle and consistent across themes.

## Components
- [ ] Buttons: primary/secondary/ghost have correct hover/active/disabled states.
- [ ] Inputs: `bg-card`, `text-fg`, `placeholder:text-muted`, focus ring uses `primary`.
- [ ] Navigation: active item readable in all themes (text and/or indicator).
- [ ] Cards: titles/body readable; no low-contrast gray-on-gray.
- [ ] Charts (if present): colors inherit tokens or ensure accessible defaults.

## Transitions & Performance
- [ ] Color transition is smooth: `transition-colors duration-300`.
- [ ] No FOWT (Flash Of Wrong Theme) on load; inline pre-load script applied if needed.
- [ ] No notable CPU/GPU spikes when switching themes repeatedly.

## Accessibility
- [ ] Focus outlines visible in all themes (e.g., `ring-primary/40`).
- [ ] Theme selector keyboard navigable and screen-reader labeled.
- [ ] Emojis or color-only indicators have text equivalents.

## Dev Guardrails (PR review)
- [ ] No raw hex colors or fixed Tailwind colors (e.g., `bg-white`, `text-black`) in shared components.
- [ ] Only token classes used: `bg-bg`, `text-fg`, `bg-card`, `text-muted`, `bg-primary`, etc.
- [ ] No per-theme branching in components (theme is purely token-driven).
