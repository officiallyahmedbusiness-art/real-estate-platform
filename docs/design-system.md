# Design System (Phase 4)

## Tokens (CSS variables)
Defined in `src/app/globals.css`.

Spacing
- `--space-1..--space-8`

Radius
- `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-2xl`

Shadows
- `--shadow-sm`, `--shadow-md`, `--shadow`, `--shadow-strong`

Typography
- `--font-body` (min 16px)
- `--font-h1`, `--font-h2`, `--font-h3`
- `--line-body`

Container
- `--container-max`, `--container-pad`, `--container-pad-lg`

## Component Usage
- Card: `src/components/ui/Card.tsx` uses `--radius-2xl` and `--shadow`.
- Button: `src/components/ui/Button.tsx` uses `--radius-lg` and transition tokens.
- Inputs/Select/Textarea: `src/components/ui.tsx` + `src/components/FieldHelp.tsx` use `--radius-lg`.
- Listing media: `listing-card-media` uses `--radius-lg`.

## Layout Rules
- Default container max width: 1200px via `--container-max` and `.max-w-7xl` override.
- Mobile padding: 16px, desktop: 24px.

## Motion
- `fade-in`, `fade-up`, `sheet-up` respect reduced-motion.
- Hover elevation only on hover-capable devices.
