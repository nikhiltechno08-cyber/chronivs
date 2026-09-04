# Chronivs Design System

Official design language extracted from the approved landing page. Every Chronivs surface — Studio, templates, experiences — must inherit these tokens and components.

**Package:** `@chronivs/ui`  
**Styles:** `@chronivs/ui/styles`  
**Tokens:** `@chronivs/ui/tokens`  
**Motion:** `@chronivs/ui/motion`

---

## Principles

1. **Dark-first** — Luxury cinematic aesthetic; light theme supported via `data-theme`
2. **Gold accent** — Primary actions and highlights use the gold gradient
3. **Restraint** — Motion supports emotion; never distracts
4. **Mobile-first** — Breakpoints from 390px upward
5. **Accessibility** — WCAG 2.1 AA target, reduced-motion support

---

## Color Palette

### Primary

| Token | Dark | Usage |
|-------|------|-------|
| `--chronivs-primary` | `#cda45e` | Primary accent, eyebrows |
| `--chronivs-primary-bright` | `#e6c584` | Hover, highlights, focus ring |
| `--chronivs-accent-champagne` | `#ddc79a` | Gradient mid-tones |
| `--chronivs-accent-ivory` | `#f4efe4` | Headlines, emphasis text |

### Neutrals

| Token | Dark | Usage |
|-------|------|-------|
| `--chronivs-neutral-ink` | `#efe9dc` | Body text |
| `--chronivs-neutral-muted` | `#a49c8d` | Secondary text |
| `--chronivs-neutral-faint` | `#736c60` | Captions, metadata |
| `--chronivs-neutral-black` | `#090909` | Page background |
| `--chronivs-neutral-black-soft` | `#0d0d0c` | Elevated surfaces |

### Surfaces

| Token | Usage |
|-------|-------|
| `--chronivs-bg-primary` | Page background |
| `--chronivs-bg-secondary` | Modals, drawers |
| `--chronivs-surface-primary` | Cards, inputs |
| `--chronivs-surface-strong` | Hover states |
| `--chronivs-glass-bg` | Glass morphism panels |

### Borders

| Token | Usage |
|-------|-------|
| `--chronivs-border-default` | Standard borders |
| `--chronivs-border-subtle` | Card borders |
| `--chronivs-border-strong` | Hover emphasis |

### Status

| Token | Usage |
|-------|-------|
| `--chronivs-success` | Success states |
| `--chronivs-warning` | Warnings |
| `--chronivs-danger` | Errors, destructive |
| `--chronivs-info` | Informational |

---

## Typography

| Scale | CSS Variable | Font | Usage |
|-------|-------------|------|-------|
| Hero XL | `--chronivs-text-hero-xl` | Fraunces | Landing hero |
| Hero L | `--chronivs-text-hero-l` | Fraunces | CTA sections |
| Heading | `--chronivs-text-heading` | Fraunces | Section titles |
| Sub Heading | `--chronivs-text-subheading` | Fraunces | Card titles |
| Body | `--chronivs-text-body` | Inter | Default text |
| Body SM | `--chronivs-text-body-sm` | Inter | Descriptions |
| Caption | `--chronivs-text-caption` | Inter | Metadata |
| Button | `--chronivs-text-button` | Inter | Button labels |
| Eyebrow | `--chronivs-text-eyebrow` | IBM Plex Mono | Section labels |

Utility classes: `.chronivs-text-hero-xl`, `.chronivs-text-heading`, `.chronivs-text-eyebrow`, etc.

---

## Spacing Scale

| Token | Value |
|-------|-------|
| `--chronivs-space-1` | 4px |
| `--chronivs-space-2` | 8px |
| `--chronivs-space-3` | 12px |
| `--chronivs-space-4` | 16px |
| `--chronivs-space-5` | 20px |
| `--chronivs-space-6` | 24px |
| `--chronivs-space-8` | 32px |
| `--chronivs-space-10` | 40px |
| `--chronivs-space-12` | 48px |
| `--chronivs-space-16` | 64px |
| `--chronivs-space-20` | 80px |

---

## Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--chronivs-radius-sm` | 6px | Small elements |
| `--chronivs-radius-md` | 8px | Inputs, chips |
| `--chronivs-radius-lg` | 12px | Cards inner |
| `--chronivs-radius-xl` | 16px | Cards, modals |
| `--chronivs-radius-pill` | 9999px | Buttons, badges |

---

## Elevation & Glass

| Shadow | Token |
|--------|-------|
| XS | `--chronivs-shadow-xs` |
| SM | `--chronivs-shadow-sm` |
| MD | `--chronivs-shadow-md` |
| LG | `--chronivs-shadow-lg` |
| XL | `--chronivs-shadow-xl` |

Glass: `.chronivs-glass` — blur 18px, saturation 140%, configurable opacity.

---

## Buttons

| Component | Variant | Usage |
|-----------|---------|-------|
| `PrimaryButton` | Gold gradient, pill | Main CTAs |
| `SecondaryButton` | Glass, bordered | Secondary actions |
| `GhostButton` | Transparent | Tertiary, nav items |
| `IconButton` | Circular, 44px touch | Icon-only actions |

All buttons support hover lift (`-translate-y-0.5`) and focus-visible gold ring.

---

## Cards

| Component | Variant | Usage |
|-----------|---------|-------|
| `Card` | Default surface | Feature cards, content |
| `GlassCard` | Glass morphism | Nav, overlays |
| `Card variant="elevated"` | Shadow + lift | Prominent content |

---

## Components

| Component | Description |
|-----------|-------------|
| `Input` / `Textarea` | Form fields with gold focus |
| `Modal` | Radix dialog, centered |
| `Drawer` | Slide-in panel (left/right) |
| `Tooltip` | Radix tooltip |
| `Badge` | Status labels |
| `Chip` | Selectable tags |
| `Divider` | Horizontal/vertical separator |
| `Avatar` | Image or initial fallback |
| `Progress` | Gold gradient bar |
| `Loading` | Spinner with aria-label |
| `SectionContainer` | Section wrapper + padding |
| `PageContainer` | Full page wrapper |
| `ResponsiveGrid` | Responsive column grid |
| `Icon` | Sized SVG wrapper |

---

## Motion

Import presets from `@chronivs/ui/motion`:

| Preset | Duration | Use Case |
|--------|----------|----------|
| `fade` | 300ms | Simple reveal |
| `fadeUp` | 500ms | Scroll reveals |
| `fadeDown` | 500ms | Dropdown menus |
| `blurReveal` | 600ms | Section entrance |
| `heroReveal` | 700ms | Hero content |
| `textReveal` | 500ms | Headline lines |
| `imageReveal` | 800ms | Media entrance |
| `scale` | 350ms spring | Cards, buttons |
| `floating` | 3s loop | Device mockups |
| `pulse` | 2s loop | Attention |
| `confetti` | 2.5s | Celebrations |
| `fireworks` | 3s | Milestone moments |
| `particleMotion` | 4s loop | Ambient particles |
| `sceneTransition` | 600ms | Experience scenes |
| `pageTransition` | 400ms | Route changes |

Each preset exports: `duration`, `delay`, `ease`, `spring`, `variants`, `transition`.

**Easing:** `--chronivs-ease-cinematic` = `cubic-bezier(0.22, 0.61, 0.36, 1)`

---

## Iconography

| Size | px | Usage |
|------|-----|-------|
| xs | 14 | Inline with caption |
| sm | 16 | Buttons, chips |
| md | 20 | Default |
| lg | 24 | Feature icons |
| xl | 32 | Hero accents |

**Stroke:** 1.5 default, 1.25 thin, 2 bold  
**Touch target:** 44px minimum for icon buttons  
**Library:** Lucide React (preferred), custom via `Icon` wrapper

---

## Responsive Guidelines

### Breakpoints

| Name | px | Usage |
|------|-----|-------|
| xs | 390 | Small mobile |
| sm | 430 | Large mobile |
| md | 768 | Tablet |
| lg | 1024 | Desktop |
| xl | 1280 | Max content |
| 2xl | 1440 | Wide desktop |
| 3xl | 1920 | Ultra-wide |

### Container

- Max width: `1280px`
- Padding: 22px mobile → 32px tablet → 48px desktop

### Utilities

- `.chronivs-h-dvh` / `.chronivs-min-h-svh` — dynamic viewport
- `.chronivs-safe-top/bottom/x` — safe area insets
- `.chronivs-mobile-only` / `.chronivs-tablet-up` / `.chronivs-desktop-only`
- `.chronivs-no-scroll-x` — overflow guard

---

## Theme

Apply via `data-theme` on `<html>` or any ancestor:

```html
<html data-theme="dark">  <!-- default, landing aesthetic -->
<html data-theme="light"> <!-- light variant -->
```

Wrap app surfaces in `.chronivs-app` for base styles.

---

## Accessibility

- Focus ring: 1.5px `--chronivs-primary-bright`, 4px offset
- All interactive elements: minimum 44×44px touch target
- `prefers-reduced-motion`: animations disabled globally
- Semantic HTML required in consuming apps
- Color contrast: ivory/gold on `#090909` meets AA for large text

---

## Animation Principles

1. **Cinematic ease** — default for all entrance animations
2. **Stagger** — 80–140ms between sequential elements
3. **Once** — scroll reveals fire once, not on every pass
4. **Reduced motion** — always provide static fallback
5. **Purpose** — animate to guide attention, not decorate

---

## Usage

```tsx
import '@chronivs/ui/styles';
import { PrimaryButton, Card, getMotionPreset } from '@chronivs/ui';

const preset = getMotionPreset('fadeUp');
```

---

## Source of Truth

Visual values extracted from the approved landing page (`chronivs-landing-page.html`). The landing page itself is frozen — new work consumes `@chronivs/ui` tokens.
