# Design System Strategy: The Intelligent Atmosphere

## 1. Overview & Creative North Star
**Creative North Star: "The Cognitive Echo"**
The objective of this design system is to move beyond the "SaaS Dashboard" trope and into an editorial, high-end digital environment that mirrors the sophistication of Artificial Intelligence. We are not just building an interface; we are building an "Intelligent Atmosphere."

This system breaks the "template" look by prioritizing **Tonal Depth** over structural lines. By utilizing intentional asymmetry, overlapping layers, and high-contrast typography scales, we create a sense of focused energy. The "AI Interviewer" should feel like a premium, quiet room where high-stakes conversations happen—calm, authoritative, and deeply technical.

---

## 2. Colors & Surface Philosophy
The palette is rooted in a deep, midnight foundation with an "Electric Blue" pulse.

### The "No-Line" Rule
**Explicit Instruction:** Prohibit 1px solid borders for sectioning. Traditional "boxes" make an app feel like a spreadsheet. Instead:
- Define boundaries through **Background Shifts** (e.g., a `surface_container_low` section sitting on a `surface` background).
- Use **Vertical Rhythm** and negative space to imply containment.
- Separation is achieved through light, not lines.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—stacked sheets of frosted glass.
- **Base Layer:** `surface` (#0b1326) – The canvas.
- **Sectioning:** `surface_container_low` (#131b2e) – To define large content areas.
- **Interactive Elements:** `surface_container_high` (#222a3d) – For cards or modals that need to "step forward."
- **Nesting Logic:** An inner container must always be at least one tier higher or lower than its parent to maintain optical depth.

### The "Glass & Gradient" Rule
To evoke "intelligence," main CTAs and hero elements should utilize **Signature Textures**:
- Use semi-transparent surface colors with a `20px` backdrop-blur for floating overlays.
- **Primary Gradient:** Transition from `primary` (#adc6ff) to `primary_container` (#4d8eff) at a 135-degree angle to provide a "soulful" glow that flat colors lack.

---

### 3. Typography
We use **Manrope** for its geometric balance and modern legibility.

| Level | Token | Size | Weight/Style | Role |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | `display-lg` | 3.5rem | 800 (ExtraBold) | Hero statements, high-impact data points. |
| **Headline** | `headline-md`| 1.75rem | 600 (SemiBold) | Section headers. Use tight letter-spacing (-0.02em). |
| **Title** | `title-md` | 1.125rem| 500 (Medium) | Card titles, sub-section headers. |
| **Body** | `body-md` | 0.875rem| 400 (Regular) | Standard UI text. High-contrast `on_surface`. |
| **Label** | `label-sm` | 0.6875rem| 700 (Bold) | All-caps metadata, status indicators. |

**Editorial Contrast:** Pair a `display-lg` headline with a `body-md` description. The extreme jump in scale creates an "Apple-esque" premium feel.

---

## 4. Elevation & Depth
Depth is achieved via **Tonal Layering**, mimicking how light interacts with dark materials.

*   **The Layering Principle:** Avoid shadows for static layout pieces. Place a `surface_container_lowest` card on a `surface_container_low` background to create a "recessed" or "pressed" feel.
*   **Ambient Shadows:** For floating elements (Modals/Popovers), use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(6, 14, 32, 0.4)`. The shadow color must be a tint of `surface_container_lowest`, never pure black.
*   **The "Ghost Border" Fallback:** If a divider is mandatory, use `outline_variant` at **15% opacity**. This provides a "suggestion" of a line rather than a hard boundary.
*   **Intelligent Motion:** Use Framer Motion for all state transitions. 
    *   *Entry:* `y: 20, opacity: 0` to `y: 0, opacity: 1` with a `stiffness: 100` spring.
    *   *Hover:* Subtle scale increase (1.02) and a shift in `surface_tint`.

---

## 5. Components

### Buttons
*   **Primary:** `primary` background with `on_primary` text. No border. Slight `0.5rem` glow on hover using `primary_fixed_dim`.
*   **Secondary:** `surface_container_high` background. No border. Text in `primary`.
*   **Tertiary:** Ghost style. No background. `primary` text. Underline only on hover.

### Input Fields
*   **Structure:** No background or a very subtle `surface_container_lowest`. 
*   **Active State:** A 1px "Ghost Border" using `primary` at 40% opacity. 
*   **Focus:** Use a `0px 0px 0px 2px` ring of `primary_container` at 20% opacity.

### Cards & Lists
*   **Rule:** Forbid divider lines. Use `1.5rem` vertical spacing (padding) to separate list items.
*   **Hover Interaction:** Transition the background from `surface` to `surface_container_low` smoothly (300ms ease).

### AI-Specific Components
*   **The Pulse Indicator:** A small `2px` dot using `tertiary` (#ffb786) with a CSS pulse animation to indicate "AI Thinking" or "Live Analysis."
*   **Transcript Blocks:** Use `surface_container_highest` for "Interviewee" and `surface_container_low` for "Interviewer" to create a rhythmic visual dialogue without borders.

---

## 6. Do's and Don'ts

### Do
*   **DO** use `ROUND_FOUR` (4px) consistently for that sharp, professional "engineered" look.
*   **DO** use `surface_bright` (#31394d) for extremely high-importance tooltips to ensure they pop against the dark navy.
*   **DO** embrace "Breathing Room." If you think there is enough margin, add 8px more.

### Don't
*   **DON'T** use 100% white text. Always use `on_surface` (#dae2fd) to reduce eye strain and maintain the "atmosphere."
*   **DON'T** use pure black (#000000). The deepest dark should be `surface_container_lowest` (#060e20).
*   **DON'T** use standard "Select" dropdowns. Use custom, motion-enhanced popovers that utilize backdrop-blur.