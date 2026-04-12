```markdown
# Design System Strategy: The Digital Interlocutor

## 1. Overview & Creative North Star: "The Intelligent Atmosphere"

In the context of an AI Interviewer platform, the design system must transcend the cold, robotic nature of automation. Our Creative North Star is **The Intelligent Atmosphere**. We are moving away from the "Dashboard-as-a-Grid" mentality and toward an editorial, immersive experience that feels both authoritative and breathable.

To achieve this, we reject the rigid constraints of traditional SaaS templates. We utilize **intentional asymmetry**, high-contrast typographic scales, and **tonal depth** to guide the candidate's focus. The interface should feel like a high-end physical studio—quiet, professional, and focused—where the tech-forward nature is felt through fluid transitions and glassmorphism rather than loud, disruptive patterns.

---

## 2. Colors: Depth over Definition

This system utilizes a "Deep Tech" palette. The goal is to create a workspace that feels premium and easy on the eyes during long interview sessions.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning. Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` section sitting on a `surface` background creates a natural, sophisticated break without the "boxed-in" feel of a traditional grid.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the surface-container tiers to define importance:
- **Base Layer:** `surface` (#f7f9fb)
- **Secondary Sectioning:** `surface-container-low` (#f2f4f6)
- **Interactive/Floating Elements:** `surface-container-lowest` (#ffffff) for high contrast and "lift."
- **Focus Areas:** `surface-container-high` (#e6e8ea) to recess secondary information.

### The "Glass & Gradient" Rule
To inject "soul" into the AI experience:
- **Main CTAs/Hero Moments:** Use a subtle linear gradient transitioning from `primary` (#000000) to `primary-container` (#131b2e) to provide a weighted, premium feel.
- **Floating Overlays:** Utilize `surface-variant` with a `backdrop-blur` of 12px–20px to create frosted glass effects. This allows the deep blue tones of the background to bleed through, softening the interface.

---

## 3. Typography: Editorial Authority

We use a dual-typeface system to balance technical precision with human-centric readability.

*   **Display & Headlines (Manrope):** Chosen for its geometric modernism. Use `display-lg` (3.5rem) with tighter letter-spacing (-0.02em) to create an authoritative, editorial look.
*   **Body & Labels (Inter):** The workhorse. `body-md` (0.875rem) provides maximum legibility for interview transcripts and feedback notes.

**Hierarchy as Identity:** 
By pairing a massive `display-md` headline with a quiet `label-md` uppercase subtitle (using `on-surface-variant`), we create an intentional hierarchy that feels curated, not just "inputted."

---

## 4. Elevation & Depth: Tonal Layering

Traditional shadows are often a crutch for poor layout. In this system, we prioritize **Tonal Layering**.

*   **The Layering Principle:** Achieve depth by stacking. A `surface-container-lowest` card placed on a `surface-container-low` background provides a soft, natural lift.
*   **Ambient Shadows:** Where floating is required (e.g., Modals), use a "Diffusion Shadow": 0px 20px 40px rgba(25, 28, 30, 0.06). The shadow color is a tinted version of `on-surface`, mimicking natural light.
*   **The "Ghost Border" Fallback:** If a boundary is strictly required for accessibility, use the `outline-variant` (#c6c6cd) at **15% opacity**. Never use a 100% opaque border.
*   **Glassmorphism Depth:** For the AI "Processing" states, use a semi-transparent `tertiary-fixed-dim` (#4cd7f6) with a heavy blur to signify active intelligence.

---

## 5. Components: Refined Interaction

### Buttons
*   **Primary:** Solid `primary` (#000000) with `on-primary` (#ffffff) text. Radius: `md` (0.375rem).
*   **Secondary:** `secondary-container` (#d0e1fb) with `on-secondary-container` (#54647a).
*   **Glass (Tertiary):** Surface-variant with 40% opacity and 10px backdrop-blur. Use this for "Cancel" or secondary actions on dark backgrounds.

### Cards & Lists
*   **Constraint:** Absolute prohibition of horizontal divider lines.
*   **Execution:** Use vertical white space (32px or 48px) and subtle shifts from `surface-container-lowest` to `surface-container-low` to separate interview stages. Cards should have an `xl` (0.75rem) corner radius for a modern, friendly feel.

### Status Indicators (The "Pulse")
*   **Active Interview:** A `tertiary` (Cyan) soft glow using a 4px blur behind a solid 8px dot. 
*   **Completed:** `secondary` (#505f76) with low saturation to signify a finished state.

### Input Fields
*   **Quiet State:** No visible border, only a `surface-container-highest` (#e0e3e5) background. 
*   **Focus State:** A "Ghost Border" of `tertiary` at 20% opacity and a slight tonal shift to `surface-container-lowest`.

---

## 6. Do's and Don'ts

### Do:
*   **Do** use asymmetrical layouts (e.g., a wide transcript column next to a narrow "AI Insights" column).
*   **Do** prioritize "negative space" as a functional element to reduce candidate anxiety.
*   **Do** use the `tertiary-fixed` (#acedff) cyan sparingly as a "laser-focused" accent for AI-generated insights.

### Don't:
*   **Don't** use 100% black text on 100% white backgrounds; use `on-surface` on `surface` for a premium, low-strain experience.
*   **Don't** use standard 1px borders to separate content. Let the background tones do the work.
*   **Don't** use sharp corners. Stick to the `md` to `xl` roundedness scale to maintain a "trustworthy and approachable" persona.
*   **Don't** use traditional "Drop Shadows" that look like "dirty" glows; keep them diffused and atmospheric.

---

## 7. Signature Platform Component: The "Insight Pane"
For the AI Interviewer context, we introduce the **Insight Pane**. This is a glassmorphic overlay (`surface-container-lowest` at 80% opacity + blur) that slides over the transcript. It uses `tertiary-container` (#001f26) for callouts, ensuring the AI's "voice" feels distinct from the human interview text.```