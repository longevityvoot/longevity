# Design Tokens — Longevity Designer

> Pulled from `styles.css`. Copy these into `tailwind.config.ts` and `globals.css` directly.

---

## Colors

### Pillar palette (MyFitnessPal-inspired bright accents)

ใช้เป็น accent/data viz เป็นหลัก ไม่ใช่ surface fills

| Pillar | Ink (text/data) | Wash (badge bg) | Tailwind suggested name |
|---|---|---|---|
| Nutrition (โภชนาการ) | `#00C9A7` vibrant teal | `#E0F8F2` | `pillar-nutrition` |
| Sleep (การนอน) | `#2E5BFF` electric blue | `#DFE6FF` | `pillar-sleep` |
| Activity (กิจกรรม) | `#FF6B6B` coral | `#FFE3E3` | `pillar-activity` |
| Stress (ความเครียด) | `#FFA940` amber | `#FFF1DC` | `pillar-stress` |
| Social (สังคม) | `#52C41A` fresh green | `#E5F7D9` | `pillar-social` |
| Substances (สารต่างๆ) | `#722ED1` purple | `#ECE0F8` | `pillar-substances` |

### Semantic

| Token | Value | Used for |
|---|---|---|
| `--success` | `#14B870` | positive deltas, "normal" lab flag, taken meds |
| `--warning` | `#FFA940` | mild flags, attention status |
| `--danger` | `#FF4D4F` | critical flags, urgent client |

### Neutrals

| Token | Value | Used for |
|---|---|---|
| `--ink` | `#14142B` | primary text, primary button bg |
| `--ink-2` | `#2D2D55` | secondary text |
| `--ink-3` | `#5A5A7A` | tertiary text, captions |
| `--ink-4` | `#8A8AA3` | placeholders, axis labels |
| `--ink-5` | `#C4C4D4` | disabled, dividers in dark contexts |
| `--border` | `#ECECF2` | card borders, dividers |
| `--border-strong` | `#DEDEE7` | input borders, ghost buttons |
| `--canvas` | `#F6F7FB` | page background |
| `--surface` | `#FFFFFF` | card background |
| `--surface-soft` | `#FAFAFD` | subtle fills, hover states |

### Lab result flags

```
normal   → ink-3 + p-social-wash
low      → p-stress (amber)
high     → p-activity (coral)
critical → danger
```

### Adherence colors (med tracking)

```
≥ 80%  → success
50-79% → warning
< 50%  → p-activity
```

---

## Typography

### Font families

```css
--font-thai: 'Noto Sans Thai', 'IBM Plex Sans Thai', system-ui, sans-serif;
--font-sans: 'Inter', 'Noto Sans Thai', system-ui, sans-serif;
--font-num:  'Inter', 'IBM Plex Sans', system-ui, sans-serif;
```

- **Thai-first** — body copy ใช้ `var(--font-thai)`
- **Inter** สำหรับตัวเลข/ตัวอักษร Latin ส่วนใหญ่ (โดยเฉพาะ data displays — `font-variant-numeric: tabular-nums`)
- ใช้ Google Fonts CDN:
  ```html
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Thai:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  ```

### Scale

| Class | Size | Weight | Line-height | Tracking | Used for |
|---|---|---|---|---|---|
| `.h-hero` | 32px | 700 | 1.15 | -0.02em | onboarding step titles |
| `.h-section` | 22-24px | 600 | 1.25 | -0.015em | page titles |
| `.h-sub` | 17px | 600 | 1.3 | -0.01em | section headers |
| body | 15px | 400 | 1.55 | normal | paragraph text |
| `.t-meta` | 13px | 400 | 1.5 | normal | metadata, captions |
| `.t-tiny` | 11px | 600 | normal | 0.04em | uppercased labels |
| number display | 22-56px | 700 | 1 | -0.03em | scores, hero numbers |

### Body sizing rules

- Base 15-16px on mobile, 14px on desktop (denser UI)
- **Never < 11px** (a11y for 40-60 year olds)
- Numbers always `font-variant-numeric: tabular-nums` so columns align

---

## Spacing

4-based scale, used via CSS gaps / Tailwind spacing utilities:

```
4 / 8 / 12 / 16 / 20 / 24 / 28 / 32 / 40 / 48 / 64
```

### Layout containers

| Context | Max width |
|---|---|
| Phone artboard | 360px |
| Phone body padding | 20px horizontal |
| Desktop sidebar | 240px |
| Desktop content max | 920px (form pages) / fluid (dashboards) |
| Tablet breakpoint | 768px |

### Touch targets

- Buttons: 48px height (lg), 36px (sm)
- Bottom nav items: 44px+ tap area
- Form fields: 44-48px height
- Icon buttons: 36-40px square

---

## Radii

| Token | Value | Used for |
|---|---|---|
| `--r-sm` | 8px | small chips, segment tabs |
| `--r-md` | 12px | buttons, inline cards |
| `--r-lg` | 16px | content cards |
| `--r-xl` | 24px | hero cards, full-bleed sections |
| `--r-pill` | 999px | chips, filter pills, avatars |

---

## Shadows

Subtle — MyFitnessPal-ish, never glow/glassmorphism

```css
--shadow-sm: 0 1px 2px rgba(20, 20, 43, 0.04), 0 1px 1px rgba(20, 20, 43, 0.03);
--shadow-md: 0 4px 12px rgba(20, 20, 43, 0.05), 0 1px 3px rgba(20, 20, 43, 0.04);
--shadow-lg: 0 12px 32px rgba(20, 20, 43, 0.08), 0 2px 6px rgba(20, 20, 43, 0.04);
```

Accent button shadows (colored):
```css
/* coral accent button */
box-shadow: 0 4px 12px rgba(255, 107, 107, 0.25);
/* teal */
box-shadow: 0 4px 12px rgba(0, 201, 167, 0.25);
```

---

## Motion

| Token | Value |
|---|---|
| Quick (taps, hovers) | 80-120ms ease |
| Base (state changes) | 150-200ms ease |
| Page transitions | 250ms ease-out |
| Slide-in (sheets/modals) | 280ms cubic-bezier(0.2, 0.7, 0.3, 1) |

**Rules:**
- No bounce, no parallax
- Tap feedback = scale(0.985) + opacity 0.85 for 80ms
- Donut rings fade in segment-by-segment on mount (stagger 20ms)

---

## Tailwind config snippet

```ts
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        'pillar-nutrition':  { DEFAULT: '#00C9A7', wash: '#E0F8F2' },
        'pillar-sleep':      { DEFAULT: '#2E5BFF', wash: '#DFE6FF' },
        'pillar-activity':   { DEFAULT: '#FF6B6B', wash: '#FFE3E3' },
        'pillar-stress':     { DEFAULT: '#FFA940', wash: '#FFF1DC' },
        'pillar-social':     { DEFAULT: '#52C41A', wash: '#E5F7D9' },
        'pillar-substances': { DEFAULT: '#722ED1', wash: '#ECE0F8' },
        ink: {
          DEFAULT: '#14142B',
          2: '#2D2D55',
          3: '#5A5A7A',
          4: '#8A8AA3',
          5: '#C4C4D4',
        },
        canvas: '#F6F7FB',
        surface: { DEFAULT: '#FFFFFF', soft: '#FAFAFD' },
        success: '#14B870',
        warning: '#FFA940',
        danger:  '#FF4D4F',
      },
      fontFamily: {
        thai: ['"Noto Sans Thai"', '"IBM Plex Sans Thai"', 'system-ui', 'sans-serif'],
        sans: ['Inter', '"Noto Sans Thai"', 'system-ui', 'sans-serif'],
        num:  ['Inter', '"IBM Plex Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '8px',
        DEFAULT: '12px',
        lg: '16px',
        xl: '24px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(20,20,43,0.04), 0 1px 1px rgba(20,20,43,0.03)',
        DEFAULT: '0 4px 12px rgba(20,20,43,0.05), 0 1px 3px rgba(20,20,43,0.04)',
        lg: '0 12px 32px rgba(20,20,43,0.08), 0 2px 6px rgba(20,20,43,0.04)',
      },
    },
  },
};
```

---

## Component conventions

### Cards

- Default: white surface, 16px radius, subtle shadow OR 1px border (not both)
- Hero cards: ink background, white text, 20px radius
- Empty/dashed: 1.5px dashed border-strong, transparent bg, no shadow

### Buttons (defined in styles.css)

| Variant | Bg | Text | Use case |
|---|---|---|---|
| Primary | ink | white | main actions |
| Accent | pillar-activity (coral) | white | daily check-in CTA |
| Teal | pillar-nutrition | white | confirm/save secondary |
| Ghost | transparent | ink-2 | secondary actions |

### Chips

```
height: 22-26px
radius: 999px
padding: 0 10px
font-size: 11-12px
font-weight: 600
```

Pillar chip pattern: wash bg + ink text + 6px dot prefix
Source chip pattern: themed bg per source (doctor=blue, pharmacist=teal, coach=amber, self=neutral)
