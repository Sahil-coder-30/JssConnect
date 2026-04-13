# JSS Connect - Design System Documentation

This document outlines the core design language, typography, color palette, and visual elements used in the **JSS Connect** project, explicitly tailored for a premium, cinematic, and brutalist-inspired aesthetic.

## 1. Typography

The typographic hierarchy relies on a combination of highly readable sans-serif fonts for UI elements and a sophisticated serif for primary headings.

* **Headline & Label Font:** `Plus Jakarta Sans` 
  * Used for brand lock-ups, highly tracked labels (e.g., uppercase input labels, global navigation), and geometric styling.
* **Body Font:** `Inter`
  * Used for general body text, paragraphs, and descriptions. Provides excellent legibility at smaller sizes.
* **Serif Font:** `Playfair Display`
  * Used for elegant, welcoming headings (e.g., "Welcome back.") to add a touch of editorial sophistication.
* **Icons:** `Material Symbols Outlined`
  * Used for various UI icons like social media, visibility toggles, and support agents.

## 2. Color Palette

The color system is defined extensively through Tailwind CSS custom properties, achieving a balance between authoritative dark tones, clean neutral surfaces, and vibrant brand accents.

### Primary Colors
* **Primary (Deep Blue):** `#1B2B5E`
  * Used for primary headings, focused borders, hover states, and primary brand identity elements.
* **Secondary & Tertiary (Teal/Green):** `#0D9B8A`
  * Used for system status indicators, tertiary accents, and secondary status elements.
* **Brand Accents (Golden/Amber):** 
  * Base: `#F4A62A`
  * Dark/Hover: `#E0901A`
  * *Used for text highlights (e.g., "FORGOT?"), shadows, and the primary Call-To-Action interactive elements.*

### Neutrals & Surfaces
* **Background / Surface Dim:** `#FAFAF7` - Main application background color yielding a soft, warm neutral tone.
* **Surface (White):** `#FFFFFF` - Dominant in forms, overlay cards, and floating elements.
* **Outline Variant / Borders:** `#E5E5E0`
* **On-Surface / Text Main:** `#1E1E1E` - Primary readable text color.
* **Outline / Text Muted:** `#8B8B8B` - Used for subdued labels, input placeholders, side instructions, and footer text.

### Brand Gradient
* Linear Gradient (`135deg, #F4A62A 0%, #E0901A 100%`)
  * Applied to the primary CTA button and logo icons, providing a vibrant, premium golden energy against the starker layouts.

## 3. UI Components & Elements

### Glassmorphism & Layers
* **Elite Glass Panel (`.glass-panel-elite`):** Used for the main authorization form, maintaining a semi-transparent, frosted-glass appearance. 
  * Background: `rgba(255, 255, 255, 0.65)` 
  * Backdrop filter: `blur(40px) saturate(180%)`
  * Border: `0.5px solid rgba(255, 255, 255, 0.15)`
  * Box-shadow: A custom multi-layered shadow emphasizing elevation: `0 20px 50px -12px rgba(27, 43, 94, 0.12)`.
* **Input Fields (`.input-elite`):** Starts with a semi-transparent background `rgba(0, 0, 0, 0.03)` with a smooth transition. On focus, transitions to an opaque white `rgba(255, 255, 255, 0.8)` with a primary-colored `#1B2B5E` border and a delicate shadow for emphasis.

### Shapes & Structural Formatting
* **Border Radii:** Emphasizes generously rounded corners across the interface (e.g., `rounded-[40px]` strictly for main container cards, `rounded-2xl` for inputs and buttons) to create a friendly but sleek ecosystem.
* **Tracking & Spacing:** High tracking (letter-spacing) is prominent in all labels and sub-navigation links to emulate a structured, sophisticated corporate aesthetic (e.g., `tracking-[0.2em]`).

## 4. Animations & Cinematic Effects

The project heavily integrates complex CSS animations via standard classes and keyframes to create a dynamic, "living" interface without relying on JavaScript state.

* **Dot Grid Background:** A softly panning `24px` dotted grid overlay (`.animate-grid-pan`) serving as the structural backdrop pattern.
* **Cinematic Glows & Blobs:** Animated, gradient-filled radial blobs positioned in the corners (`blob-1`, `blob-2`, `blob-3`). They use a `mix-blend-multiply` and a heavy `blur-3xl` filter to create visually appealing ambient, shifting lights behind the glass elements.
* **Organic Concentric Circles (`.organic-circles`):** Shape-shifting borders that animate sequentially (morphing border-radius mapping from `60% 40% 30% 70%` while continuously rotating).
* **Floating Elements (`.animate-float`):** Small translucent UI fragments floating independently in the background to create parallax depth characteristics.
* **Micro-Interactions:** 
  * Subtle hover translates (e.g., CTA arrow slides slightly right).
  * Active button scaling to give tactical click feedback (`active:scale-[0.98]`).
  * Fading opacity on secondary buttons (e.g., Google Identity logo transition from 90% to 100% opacity upon hover).
