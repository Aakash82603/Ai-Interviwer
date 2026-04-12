# Design System Specification: The Intelligent Precision Framework

## 1. Overview & Creative North Star: "The Digital Pulse"
This design system is built to move beyond the cold, static nature of traditional SaaS interfaces. Our Creative North Star is **The Digital Pulse**. This concept represents a living, breathing intelligence that feels authoritative yet fluid. 

We break the "template" look by rejecting rigid, boxed-in layouts. Instead, we utilize **Tonal Layering** and **Intentional Asymmetry**. We favor breathing room over borders and depth over flat surfaces. The interface should feel like a high-end command center—sophisticated, responsive, and unmistakably premium.

---

## 2. Color & Atmospheric Depth
Our palette is not just a collection of hex codes; it is a tool for atmospheric hierarchy. We utilize a dark-mode-first approach where light is treated as a physical material.

### Color Tokens
*   **Core Tones:**
    *   `background`: `#0b1326` (The void; the foundational canvas)
    *   `primary`: `#adc6ff` (The active pulse)
    *   `primary_container`: `#4d8eff` (Sub-action emphasis)
    *   `secondary`: `#b1c6f9` (Functional support)
*   **Semantic Accents:**
    *   `success`: `#22C55E` (Validation)
    *   `tertiary_container` (Warning): `#df7412` (Cautionary focus)
    *   `error`: `#ffb4ab` (Critical alerts)

### The "No-Line" Rule
**Explicit Instruction:** Traditional 1px solid borders for sectioning are strictly prohibited. Boundaries must be defined through background color shifts. To separate a sidebar from a main feed, transition from `surface_container_low` to `surface`. This creates a seamless, "editorial" feel rather than a "spreadsheet" look.

### Surface Hierarchy & Nesting
Treat the UI as a series of nested physical layers. 
1.  **Level 0 (Background):** `surface_dim` (#0b1326) - The base layer.
2.  **Level 1 (Sections):** `surface_container_low` (#131b2e) - Large layout regions.
3.  **Level 2 (Cards/Modules):** `surface_container` (#171f33) - Content groupings.
4.  **Level 3 (Interactive/Floating):** `surface_container_highest` (#2d3449) - Modals and active states.

### The "Glass & Gradient" Rule
For high-impact moments (AI processing states, Hero headers), use glassmorphism. Apply `surface_variant` at 60% opacity with a `24px` backdrop-blur. Use a subtle linear gradient on primary CTAs: `primary` (#adc6ff) to `primary_container` (#4d8eff) at a 135-degree angle to provide "visual soul."

---

## 3. Typography: Editorial Authority
The interplay between "Plus Jakarta Sans" and "Inter" creates a hierarchy of "Personality vs. Utility."

*   **Display & Headlines (Plus Jakarta Sans):** These are our "Voice." Use `display-lg` (3.5rem) for hero moments and `headline-md` (1.75rem) for section starts. The generous x-height conveys confidence.
*   **Body & UI (Inter):** Our "Function." Use `body-md` (0.875rem) for general readability. Inter’s neutrality ensures that the AI’s data takes center stage.
*   **The Data Layer (JetBrains Mono):** Exclusive to scores, timers, and code snippets. This monospace font signals precision and technical accuracy.

---

## 4. Elevation & Depth
We reject traditional drop shadows in favor of **Tonal Elevation**.

*   **The Layering Principle:** Depth is achieved by "stacking." Place a `surface_container_highest` card on a `surface_container_low` section to create a soft, natural lift.
*   **Ambient Shadows:** If a floating element (like a dropdown) requires a shadow, it must be an "Ambient Shadow": `0px 24px 48px rgba(0, 0, 0, 0.4)`. The shadow should feel like a soft glow rather than a harsh outline.
*   **The "Ghost Border" Fallback:** If accessibility requires a stroke, use a "Ghost Border": `outline_variant` (#424754) at **15% opacity**. Never use 100% opaque borders.

---

## 5. Components

### Buttons
*   **Primary:** Background: `primary` (#adc6ff); Text: `on_primary` (#002e6a); Radius: `8px`. Use a subtle inner-glow (1px white at 10% opacity) on the top edge for a "3D glass" effect.
*   **Secondary:** Transparent background with a `primary` ghost border (15% opacity). Text: `primary`.
*   **Danger:** Background: `error_container`; Text: `on_error_container`.

### Input Fields
*   **Styling:** Forgo the 4-sided box. Use a `surface_container_highest` background with a 2px bottom-accent in `outline_variant` that transforms to `primary` on focus.
*   **Radii:** `8px` for inputs to maintain the "Modern SaaS" sleekness.

### Cards & Lists
*   **No Dividers:** Forbid the use of divider lines. Separate list items using `16px` of vertical whitespace or by alternating subtle background tints (`surface_container_low` vs `surface_container`).
*   **Radii:** Cards must use `12px` (lg scale) to feel substantial and premium.

### Signature Component: The "Intelligence Badge"
*   **Design:** Used for AI confidence scores. 
*   **Style:** `20px` pill radius (full), `JetBrains Mono` font, using `tertiary_fixed_dim` text on a `surface_bright` background.

---

## 6. Do’s and Don’ts

### Do:
*   **Embrace Negative Space:** Use whitespace as a structural element to separate disparate ideas.
*   **Animate Transitions:** All hover states should use a `200ms ease-out` transition.
*   **Use Tonal Shifts:** Use `surface_bright` to highlight active navigation items instead of heavy borders.

### Don’t:
*   **Don't use pure black (#000):** It kills the depth of the dark-blue atmosphere. Use `surface_container_lowest`.
*   **Don't use 100% opaque borders:** They clutter the UI and make it look like a legacy application.
*   **Don't crowd the typography:** Give headlines room to breathe; let the "Plus Jakarta Sans" evoke the premium editorial feel it was chosen for.