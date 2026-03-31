# Design System Specification: High-End Automation Editorial



## 1. Overview & Creative North Star: "The Kinetic Curator"

The objective of this design system is to move beyond the "SaaS template" look. For an AI video automation platform, the interface must feel as fluid and high-fidelity as the media it generates.



**The Creative North Star: The Kinetic Curator.**

This system balances the rigid precision of automation with the premium aesthetics of a high-end film studio. We achieve this through **Intentional Asymmetry** and **Tonal Depth**. Instead of a standard 12-column grid that feels "boxed in," we use expansive white space and overlapping layers to create a sense of motion. The UI shouldn't just sit there; it should feel like it's breathing.



---



## 2. Colors & Atmospheric Surface Theory

We move away from the "flat blue" trend. This palette uses a sophisticated range of tech blues and functional accents, applied through a lens of environmental lighting.



### Functional Accents (Status)

* **Running (Electric Blue):** `primary` (#003ec7) — The heartbeat of the system.

* **Success (Emerald Green):** `tertiary_container` (#007550) — High-contrast, authoritative.

* **Failed (Coral Red):** `error` (#ba1a1a) — Urgent but sophisticated.

* **Pending (Soft Gray):** `secondary` (#565e71) — Recessive and calm.

* **Skipped (Amber):** `on_secondary_container` (#5c6477) — High-visibility warning.



### The "No-Line" Rule

**Strict Mandate:** Designers are prohibited from using 1px solid borders to define major sections.

* **Boundary via Shift:** Use the transition from `surface` (#f8f9ff) to `surface_container_low` (#eff4ff) to define the sidebar or header.

* **Nesting Hierarchy:** Treat the UI as stacked sheets of glass.

* *Level 0 (Base):* `surface`

* *Level 1 (Sections):* `surface_container_low`

* *Level 2 (Cards/Nodes):* `surface_container_lowest` (#ffffff) for a "lifted" feel.



### The "Glass & Gradient" Rule

To inject "soul" into the tech-heavy UI, use Glassmorphism for floating overlays (e.g., Command Palettes or Tooltips).

* **Blur:** 12px–20px backdrop-blur.

* **Fill:** `surface_container_lowest` at 80% opacity.

* **CTA Soul:** Main buttons should use a linear gradient from `primary` (#003ec7) to `primary_container` (#0052ff) at a 135° angle to prevent a static, flat appearance.



---



## 3. Typography: Editorial Authority

We pair **Manrope** (Display) for personality with **Inter** (UI) for clinical precision.



* **The Power Scale:** Use `display-lg` (3.5rem) sparingly for "Big Numbers" (e.g., Total Videos Rendered).

* **The Narrative Lead:** `headline-md` (1.75rem) in Manrope is used for page titles, set with -0.02em letter spacing to feel "tight" and premium.

* **The Utility Workhorse:** `body-md` (0.875rem) in Inter is the default for all data tables and form labels, ensuring maximum readability during high-productivity tasks.

* **Hierarchy Tip:** Always use `on_surface_variant` (#434656) for secondary metadata to create a clear visual "quietness" compared to the bold `on_surface` (#0b1c30) primary text.



---



## 4. Elevation & Depth: Tonal Layering

Traditional drop shadows are often messy. We use **Ambient Lighting** and **Tonal Stacking**.



* **The Layering Principle:** Place a `surface_container_lowest` (#ffffff) object on a `surface_container_low` (#eff4ff) background. The delta in hex value creates a natural edge that feels "physical" without a single line being drawn.

* **Ambient Shadows:** For floating elements (Modals, Popovers), use:

* `box-shadow: 0px 24px 48px -12px rgba(11, 28, 48, 0.08);`

* The shadow is a tinted version of `on_surface`, not pure black.

* **The "Ghost Border" Fallback:** If a border is required for accessibility (e.g., in a high-density data table), use `outline_variant` (#c3c5d9) at **15% opacity**. It should be felt, not seen.



---



## 5. Components



### Pipeline Nodes (The Automation Heart)

* **Visual Style:** Rounded `xl` (1.5rem / 24px).

* **Structure:** Use `surface_container_highest` (#d3e4fe) for the node container.

* **Connectivity:** Connection lines between nodes must use `outline_variant` with a 2px stroke—no arrows, just clean paths.

* **States:** Use a 2px outer glow of `primary` when a node is "Running."



### Data Tables & Lists

* **No Dividers:** Forbid the use of horizontal rules (`

`). Separate rows using 8px of vertical spacing (`spacing.2`) and a subtle hover state shift to `surface_container_high`.



* **Status Badges:** Use `full` (9999px) rounding. Fill should be the "container" version of the color (e.g., `error_container`) with text in the "on-container" version.



### Interactive Elements

* **Buttons:**

* *Primary:* Gradient fill, `lg` rounding (1rem).

* *Secondary:* `surface_container_highest` fill, no border.

* **Form Inputs:** Use `surface_container_low` as the background fill. On focus, transition the background to `surface_container_lowest` and add a 2px "Ghost Border" of `primary`.

* **Checkboxes/Radios:** Never use the default browser styling. Use `primary` for the active state and `outline` for the inactive state.



---



## 6. Do’s and Don’ts



### Do:

* **Do** use asymmetrical margins. A wider left margin on a dashboard creates an editorial "white space" feel that looks custom-built.

* **Do** stack surfaces. A card (`lowest`) inside a section (`low`) inside a page (`surface`) creates professional depth.

* **Do** use `manrope` for any text larger than 24px to maintain brand character.



### Don’t:

* **Don’t** use pure black (#000000) for anything. Even shadows must be tinted with our "Deep Tech Blue" (`on_surface`).

* **Don’t** use 1px solid borders for layout separation. It makes the platform look like a legacy "Bootstrap" app.

* **Don’t** crowd the components. If in doubt, add one extra step of `spacing` (e.g., move from `spacing.4` to `spacing.5`). High-end design requires room to breathe.