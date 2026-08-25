---
name: omnikon-design
description: Enforces Omnikon's distinct visual identity, Cyberpunk/Dev-Terminal dark design system, color palette, typography, and UI component standards. Use when styling, layouting, or building UI components for Omnikon.
---

# Omnikon Design System & Visual Identity Guide

## 1. Visual Philosophy
Omnikon's visual identity is rooted in a **Developer HUD / Cyberpunk Terminal** aesthetic. It reflects an open-source, hacker-centric, student-first community. The interface must look alive, high-tech, responsive, and technical without sacrificing readability or accessibility.

### CORE PRINCIPLES
- **Dark Mode Native**: Deep obsidian backgrounds with neon accent highlights.
- **Terminal Aesthetics**: Monospace code headers, system status badges, pulse indicators, and console-inspired layout elements.
- **Subtle Glows & Borders**: Fine 1px borders, subtle glowing hover states, background grid lines.
- **NO Generic SaaS**: Avoid soft pastel light-mode card grids, generic SaaS hero gradients, or white corporate layouts.

---

## 2. Color Palette & Tokens

### Primary & Background Colors
| Token | Hex / Value | Usage |
| :--- | :--- | :--- |
| `bg-root` | `#050505` | Primary site background (Deep obsidian) |
| `bg-surface-container` | `#0A0A0A` | Card & panel background |
| `bg-surface-container-low` | `#121212` | Slightly raised elements & section blocks |
| `bg-surface-container-high` | `#18181B` | Modal background / elevated overlays |
| `border-surface-variant` | `#27272A` | Default subtle structural border |
| `border-surface-highlight` | `#3F3F46` | Hover border state |

### Accent & Indicator Colors
| Token | Hex / Value | Usage |
| :--- | :--- | :--- |
| `color-primary` | `#FF3131` | Neon Red - Primary brand accent, CTA highlights, active indicators |
| `color-primary-glow` | `rgba(255, 49, 49, 0.4)` | Subtle glow shadows on hover |
| `color-accent-cyan` | `#38BDF8` | Code tags, secondary technical highlights |
| `color-accent-green` | `#22C55E` | Active statuses, merged PRs, success tags |
| `color-text-primary` | `#FAFAFA` | Main body text & high emphasis headings |
| `color-text-secondary` | `#A1A1AA` | Secondary labels, timestamps, metadata text |

---

## 3. Typography & Fonts

### Font Families
- **Monospace Font**: `JetBrains Mono` (Weights: 400, 500, 700)
  - Usage: Terminal headers, code tags, badge labels, navigation links, system status indicators (`SYS.BLOG.INIT`), metrics counters.
- **Sans-Serif Font**: `Inter` (Weights: 400, 600, 700)
  - Usage: Headings, body copy, article text, form inputs.

### Typography Hierarchy
- **Display Headings (`h1`)**: Inter Bold, 2.5rem - 3.5rem (`text-4xl` to `text-5xl`), tight tracking, terminal cursor accent option.
- **Section Headings (`h2`)**: Inter SemiBold / Bold, 1.75rem - 2.25rem (`text-2xl` to `text-3xl`).
- **Card Titles (`h3`)**: JetBrains Mono / Inter Bold, 1.125rem - 1.25rem (`text-lg` to `text-xl`).
- **Code & System Labels**: JetBrains Mono, 0.75rem - 0.875rem (`text-xs` to `text-sm`), uppercase, wide letter spacing (`tracking-widest`).

---

## 4. UI Components & Layout Rules

### Terminal Card Headers
Each major section or card should incorporate terminal-style HUD headers where appropriate:
```html
<div class="flex items-center gap-3">
    <div class="h-2 w-2 rounded-full bg-[#FF3131] animate-pulse"></div>
    <span class="text-[#FF3131] font-mono text-xs uppercase tracking-widest opacity-80">SYS.MODULE.INIT</span>
</div>
```

### Hover & Glow Effects
- Cards must use 1px borders with subtle hover lighting:
```css
.glow-hover {
    transition: all 0.2s ease-in-out;
}
.glow-hover:hover {
    border-color: #FF3131;
    box-shadow: 0 0 15px rgba(255, 49, 49, 0.3);
}
```

### Grid Background Pattern (`grid-bg`)
- Backgrounds should use fine CSS grid overlays with radial mask falloff to evoke a developer canvas feel.

---

## 5. Design Anti-Patterns (STRICTLY PROHIBITED)
- ❌ **No Light Mode Fallbacks or White Boxes**: Omnikon is strictly dark-theme native.
- ❌ **No Generic SaaS Gradients**: Do not use purple-to-pink pastel gradients.
- ❌ **No Round Soft Bubble Buttons**: Buttons should have sharp or minimally rounded corners (2px - 6px max) with crisp borders.
- ❌ **No Ad-Hoc Styling**: All colors and font sizes must draw directly from the design system tokens.
