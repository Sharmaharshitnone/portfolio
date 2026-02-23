# Animation & Interaction Specification

> **Every animation, transition, and micro-interaction documented.**

---

## TerminalHero — Frame-Based Typing Animation

### Architecture

The terminal animation is a **pre-computed frame system**, not a real-time state machine. All frames are built at module load time.

```
Module Load → buildFrames() → FRAMES[] (constant)
Component  → state = frameIdx (integer)
Timer      → step(idx) → setFrameIdx(idx+1) → repeat
```

### Script

| Type | Content |
|---|---|
| prompt | `harshit@arch:~$ whoami` |
| output | `Harshit Sharma — Systems engineer & full-stack developer.` |
| prompt | `harshit@arch:~$ cat about.txt` |
| output | `I build high-performance distributed systems, write competitive programming solutions, and obsess over clean architecture.` |
| prompt | `harshit@arch:~$ ls skills/` |
| output | `rust/  go/  typescript/  python/  c++/  react/  kubernetes/  postgres/  redis/  linux/` |
| prompt | `harshit@arch:~$ uptime --career` |
| output | `Systems running for 5+ years. 0 critical failures.` |

### Timing

| Phase | Duration | Notes |
|---|---|---|
| Initial delay | 600ms | Before first keystroke |
| Character typing | 50–90ms per char | `50 + Math.floor(Math.random() * 40)` — natural variance |
| Command complete | 380ms | Pause after typing finishes |
| Output appear | Instant | Output = one frame (no typing) |
| Output dwell | 520ms | Pause after output before next prompt |
| Cursor blink | 530ms interval | Toggles on/off continuously |

### Visual Elements

#### Prompt Line

```
[green]harshit@arch[faint]:[blue]~[foreground]$ [foreground]command
```

| Part | Color |
|---|---|
| Username (`harshit@arch`) | `#3fb950` (green) |
| Colon `:` | `#484f58` (faint) |
| Path (`~`) | `#58a6ff` (blue) |
| Dollar `$` + space | `#e6edf3` (foreground) |
| Typed text | `#e6edf3` (foreground) |
| Cursor (block) | `#e6edf3`, `w-[7px] h-[1.15em]`, toggles opacity |

#### Output Line

```
[subtle]Output text here
```

- Color: `#c9d1d9` (subtle — slightly dimmer than commands)
- Spacing: `mt-0.5 mb-3`

#### Terminal Window

```
┌─ macOS Title Bar ───────────────────────────────┐
│ 🔴 🟡 🟢   harshit@arch: ~                      │
├─────────────────────────────────────────────────┤
│                                                 │
│  Terminal body on #010409                        │
│                                                 │
└─────────────────────────────────────────────────┘
```

| Element | Color |
|---|---|
| Title bar bg | `#161b22` |
| Title bar border | `1px solid #30363d` |
| Red dot | `#ff5f56` |
| Yellow dot | `#ffbd2e` |
| Green dot | `#27c93f` |
| Title text | `#484f58`, mono `text-xs` |
| Terminal body bg | `#010409` (darker than page) |

#### 3D Transform

```css
transform: perspective(1400px) rotateY(-2.5deg) rotateX(1deg);
```

Subtle 3D tilt effect. Applied with `will-change-transform` for GPU compositing.

### Production Fixes Required

1. **`prefers-reduced-motion`**: Skip to final frame if user prefers reduced motion
2. **Key stability**: Use content-based keys instead of array indices

---

## Page Transitions (Astro View Transitions)

Not implemented in the React prototype. In the Astro build, `<ClientRouter />` provides:

- Cross-fade between pages (built-in)
- Persist the Navbar across navigations
- Theme persistence via FOUC prevention `is:inline` script

---

## Micro-Interactions

### Hover Effects

| Element | Hover Behavior |
|---|---|
| Nav links | `text-dim → text-subtle` |
| Project cards | `bg-transparent → bg-surface` |
| Problem rows | `bg-transparent → bg-surface` |
| Tech stack icons | Box gets `bg-surface-raised`, label `text-faint → text-dim` |
| Log titles | `text-foreground → text-subtle` |
| Links/arrows | `text-faint → text-dim` |
| CTA primary | `hover:opacity-90` |
| CTA secondary | `text-dim → text-foreground` |
| Footer icons | `text-faint → text-dim` |

### Transitions

| Property | Duration | Easing |
|---|---|---|
| Color changes | `transition-colors` (150ms) | Default Tailwind ease |
| Opacity | `transition-opacity` (150ms) | Default |
| ChevronRight rotate | `transition-transform` (150ms) | Default |
| All combined | `transition-all` (150ms) | Default |

### States

| Component | States |
|---|---|
| Nav links | default / hover / active |
| Filter pills | default (bordered) / active (inverted) |
| Contact form | idle / submitting (spinner) / success (check) / error (alert) |
| Log entries | collapsed (chevron right) / expanded (chevron rotated 90°) |
| Hamburger menu | closed (Menu) / open (X) |

---

## Scroll Behaviors

```css
html { scroll-behavior: smooth; }
```

- Navbar: `sticky top-0` persists on scroll
- No scroll-driven animations in current design
- **Recommended enhancement:** Scroll-driven nav shrink (see review)
