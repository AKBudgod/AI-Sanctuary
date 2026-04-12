# AI Companion App Design

## Overview
- **Motion Style**: Fluid Kinetic Intelligence
- **Animation Intensity**: Ultra-Dynamic
- **Technology Stack**: React, GSAP (ScrollTrigger, Flip), WebGL (Three.js for subtle distortions), CSS Houdini

## Brand Foundation
- **Colors**: 
  - Primary: #8c4bff (Purple)
  - Background: #f4f4f4 (Light Gray)
  - Text: #3f3f3f (Dark Gray)
  - Accents: #8c4bff (Links), #000 (Black for strong contrast)
- **Typography**: 
  - **Font Family**: Inter, sans-serif (Weights: 400, 500, 600, 700)
  - **Headings**: Uppercase treatment for strong hierarchy
- **Core Message**: Intelligent, fluid, responsive AI
- **Visual Language**: High contrast, bold typography, liquid motion

## Global Motion System

### Animation Timing
- **Easing Library**: 
  - `custom-expo`: `cubic-bezier(0.16, 1, 0.3, 1)` (Crisp, snappy)
  - `custom-fluid`: `cubic-bezier(0.4, 0, 0.2, 1)` (Smooth, flowing)
- **Duration Scale**: 
  - Micro-interactions: 0.2s - 0.4s
  - Layout shifts: 0.8s - 1.2s
  - Ambient cycles: 10s - 20s
- **Stagger Patterns**: 0.05s per character for text, 0.1s per element for lists

### Continuous Effects
- **Living Textures**: Subtle grain overlay (opacity 0.03) on solid backgrounds to prevent banding and add tactile feel.
- **Purposeful Motion**: Elements never truly stop moving; they breathe (scale 1.01 -> 1.0) or shift slightly (translateY 2px) to indicate "aliveness".

### Scroll Engine
- **Velocity Awareness**: Elements skew slightly based on scroll speed (`skewY`).
- **Parallax Zones**: Different speeds for text vs. images (Ratio 1:1.2).
- **Progress Tracking**: Scrollbars are customized and visually integrated into the layout.

---

## Section 1: Hero - The Command Center

### Layout
**Concept**: The interface is not static; it's a living HUD (Heads-Up Display). The layout breaks the traditional center alignment by treating the phone mockup as a "gravity well" that pulls the layout around it.

#### Spatial Composition
- **Grid**: Custom CSS Grid that splits the screen asymmetrically.
- **Z-Index Strategy**: Text elements float *above* the phone mockup with a glassmorphism blur effect.
- **Overflow**: Visible, allowing animated elements to drift off-screen.

### Content
- **Subtitle**: "AI Companion"
- **Main Heading**: "YOUR PERSONAL AI ASSISTANT"
- **Description**: "Experience the next generation of AI interaction with voice, images, and intelligent assistance."
- **CTA**: "Start Chatting"

### Images
**Hero Phone Mockup**
- **Resolution:** 1080 x 1920
- **Aspect Ratio:** 9:16
- **Transparent Background:** No
- **Visual Style:** Modern smartphone interface mockup
- **Subject:** AI chat interface with purple gradient accents
- **Color Palette:** Purple, white, dark gray
- **Generation Prompt:** "Create a modern smartphone mockup showing an AI chat assistant app interface. The UI should feature a clean white background with subtle purple gradient accents, a chat conversation with AI avatar, and rounded message bubbles. The phone should be slightly tilted with a subtle drop shadow. Professional product photography style, high resolution, 9:16 aspect ratio."

### Motion Choreography

#### Entrance Sequence
| Element | Animation | Values | Duration | Delay | Easing |
|---------|-----------|--------|----------|-------|--------|
| Heading | Split-Text Reveal | Y: 100% → 0% | 1.0s | 0.2s | custom-expo |
| Phone | 3D Rotation + Scale | RotX: 45deg → 0, Scale: 0.8 → 1 | 1.4s | 0.4s | custom-expo |
| Description | Blur Fade | Blur: 10px → 0px, Opacity: 0 → 1 | 0.8s | 0.6s | custom-fluid |
| CTA | Magnetic Pop | Scale: 0 → 1 | 0.6s | 0.8s | elastic |

#### Scroll Effects
| Trigger | Element | Effect | Start | End | Values |
|---------|---------|--------|-------|-----|--------|
| Scroll | Phone Mockup | Parallax Y | Top | Bottom | Y: -50px |
| Scroll | Heading | Opacity Fade | Top | 50% | Opacity: 1 → 0 |

#### Continuous Animations
- **Phone Screen**: A subtle "screen glow" pulsing effect (box-shadow opacity 0.2 -> 0.4) every 4 seconds.
- **Floating Elements**: The background gradient shapes drift slowly (20s loop).

#### Interaction Effects
- **Magnetic Button**: The CTA button attracts the cursor within a 50px radius.
- **Phone Tilt**: The phone mockup tilts slightly towards the cursor position (max 5 degrees) using CSS `transform: perspective(1000px) rotateX(...) rotateY(...)`.

---

## Section 2: Voice Chat - The Conversation Hub

### Layout
**Concept**: A split-screen conversation. The left side (text) pushes the boundaries of readability with massive scale, while the right side (visual) provides the anchor.

#### Spatial Composition
- **Typography**: The "Voice Chat" heading is clipped by the container, requiring a slight scroll to reveal fully.
- **Layering**: The phone mockup on the right overlaps the text section slightly, creating depth.

### Content
- **Subtitle**: "Voice Assistant"
- **Heading**: "TALK LIKE A FRIEND"
- **Description**: "Natural conversations with realistic AI voices that understand context and emotion."
- **Caption**: "Real-time voice processing"

### Images
**Voice Chat Interface**
- **Resolution:** 1080 x 1920
- **Aspect Ratio:** 9:16
- **Transparent Background:** No
- **Visual Style:** Voice waveform visualization UI
- **Subject:** AI voice chat screen with animated waveform
- **Color Palette:** Purple, white, gray
- **Generation Prompt:** "Create a modern smartphone UI mockup showing an AI voice chat interface. Feature a large animated waveform visualization in the center, with a friendly AI avatar at the top. Include voice controls and status indicators. Clean minimalist design with purple accent colors. Professional app UI design, 9:16 aspect ratio."

### Motion Choreography

#### Entrance Sequence
| Element | Animation | Values | Duration | Delay | Easing |
|---------|-----------|--------|----------|-------|--------|
| Heading | Horizontal Slide | X: -100px → 0 | 1.0s | 0.0s | custom-expo |
| Phone | Slide + Fade | X: 100px → 0, Opacity: 0 → 1 | 1.0s | 0.2s | custom-expo |
| Waveform Img | Scale Reveal | Clip-path: Circle(0%) → Circle(100%) | 1.2s | 0.4s | custom-fluid |

#### Scroll Effects
| Trigger | Element | Effect | Start | End | Values |
|---------|---------|--------|-------|-----|--------|
| Scroll | Heading | Letter Spacing | Enter | Center | 0px → 5px |
| Scroll | Phone | Rotate | Enter | Exit | -5deg → 5deg |

#### Continuous Animations
- **Waveform Simulation**: If implemented via Canvas/WebGL, the waveform bars bounce dynamically. If static image, a "scanning" light bar moves up and down the phone screen image.

---

## Section 3: AI Actions - The Feature Matrix

### Layout
**Concept**: Breaking the grid with "Floating Islands". Instead of a rigid 2-column grid, feature cards float at different vertical positions, creating a more organic, non-linear scan path.

#### Spatial Composition
- **Asymmetric Grid**: Left column starts higher, right column starts lower.
- **Depth**: Cards have varying z-depths and shadow intensities.

### Content
- **Features**:
  1. Set Reminders
  2. Create Notes
  3. Manage Tasks
  4. Generate Images
  5. Make Videos
  6. Browse Web

### Images
**Feature Icons (6 total)**
- **Resolution:** 80 x 80px each
- **Aspect Ratio:** 1:1
- **Transparent Background:** Yes (icons on cards)
- **Visual Style:** Minimalist line icons
- **Subject:** Reminder bell, Note document, Task checklist, Image frame, Video camera, Web globe
- **Color Palette:** Purple, white
- **Generation Prompt:** "Create a minimalist line icon of [specific feature] in purple color. Simple geometric design with clean lines. 80x80px size. Transparent background."

### Motion Choreography

#### Entrance Sequence
| Element | Animation | Values | Duration | Delay | Easing |
|---------|-----------|--------|----------|-------|--------|
| Cards | Staggered Lift | Y: 100px → 0, Opacity: 0 → 1 | 0.8s | 0.1s (stagger) | custom-expo |

#### Interaction Effects
- **3D Tilt**: Cards tilt in 3D space based on mouse position (`transform-style: preserve-3d`).
- **Glow**: A radial gradient follows the mouse cursor *inside* the card border (using `mask-image` or `background` trick).
- **Icon Animation**: Icons draw themselves (stroke-dashoffset) on hover.

---

## Section 4: Image Generation - The Creative Studio

### Layout
**Concept**: Immersive Full-Screen Takeover. This section expands to fill the viewport, focusing entirely on the creative output.

#### Spatial Composition
- **Split Screen**: Left side text, Right side gallery.
- **Gallery**: A masonry layout that shifts vertically at a different speed than the scroll.

### Content
- **Subtitle**: "AI Creative"
- **Heading**: "GENERATE IMAGES"
- **Description**: "Transform your ideas into stunning visuals with AI image generation."

### Images
**Gallery Images (4 images)**
- **Resolution:** 600 x 600px each
- **Aspect Ratio:** 1:1
- **Transparent Background:** No
- **Visual Style:** AI-generated artistic images
- **Subject:** Fantasy landscapes, abstract art, digital paintings
- **Color Palette:** Vibrant, diverse
- **Generation Prompt:** "Create a stunning AI-generated artwork showing [fantasy landscape/abstract concept]. Vibrant colors, highly detailed, digital art style. Square aspect ratio."

**iPhone Mockup with Gallery**
- **Resolution:** 1080 x 1920
- **Aspect Ratio:** 9:16
- **Transparent Background:** No
- **Visual Style:** Phone showing image generation interface
- **Subject:** AI image generation results screen
- **Color Palette:** Purple, white, colorful images

### Motion Choreography

#### Scroll Effects
| Trigger | Element | Effect | Start | End | Values |
|---------|---------|--------|-------|-----|--------|
| Scroll | Gallery Column 1 | Parallax | Top | Bottom | Y: -100px |
| Scroll | Gallery Column 2 | Parallax | Top | Bottom | Y: -50px |
| Scroll | Heading | Scale | Enter | Center | 0.9 → 1.0 |

#### Interaction Effects
- **Image Hover**: Images scale up (1.05) and "pop" out of the grid (z-index increase). A "View" cursor appears.
- **Lightbox**: Clicking an image expands it using the FLIP animation technique (Layout Animation) for a seamless transition.

---

## Section 5: Video Generation - The Motion Lab

### Layout
**Concept**: Cinematic Dark Mode. This section inverts the color scheme to dark (Dark Gray #3f3f3f background, White text) to signify a different mode of creation.

#### Spatial Composition
- **Contrast**: Sharp transition from previous section.
- **Focus**: The phone mockup is centered and treated as a "stage".

### Content
- **Subtitle**: "AI Video"
- **Heading**: "CREATE VIDEOS"
- **Description**: "Bring your imagination to life with AI-powered video generation."

### Images
**Video Generation Interface**
- **Resolution:** 1080 x 1920
- **Aspect Ratio:** 9:16
- **Transparent Background:** No
- **Visual Style:** Video editing/generation UI
- **Subject:** Phone showing video timeline and preview
- **Color Palette:** Dark, purple accents

### Motion Choreography
- **Video Preview**: The phone screen image has a subtle "shimmer" effect (opacity variation) to suggest rendering/processing.
- **Text Reveal**: Words slide up from behind a mask.

---

## Section 6: Testimonials - The Social Proof

### Layout
**Concept**: Infinite Kinetic Tape. Instead of a static grid, testimonials are arranged in a horizontal strip that moves automatically (Marquee effect) or can be dragged.

#### Spatial Composition
- **Full Bleed**: The section extends to the edges of the screen.
- **Cards**: Floating cards with soft edges.

### Content
- **Heading**: "WHAT USERS SAY"
- **Testimonials**: 6 User reviews with names and roles.

### Images
**User Avatars (6 total)**
- **Resolution:** 60 x 60px
- **Aspect Ratio:** 1:1
- **Transparent Background:** No
- **Visual Style:** Professional headshots
- **Subject:** Diverse users - Sarah Chen, Marcus Johnson, etc.
- **Color Palette:** Natural skin tones
- **Generation Prompt:** "Create a professional headshot of a [demographics] person smiling naturally. Soft lighting, neutral background. 60x60px circular crop."

### Motion Choreography
- **Continuous Flow**: The row of testimonials moves left at 50px/s continuously.
- **Hover Pause**: Hovering over the track pauses the movement.
- **Focus**: The hovered card scales up (1.1) and becomes fully opaque, while others dim.

---

## Section 7: FAQ - The Knowledge Base

### Layout
**Concept**: Kinetic Accordion. The questions are large and dominant. Opening one causes the others to slide away with a spring physics feel.

#### Spatial Composition
- **Central Column**: Max-width 800px.
- **Typography**: Questions are H3 size, making them easy targets.

### Content
- **Questions & Answers**: 6 common questions about the app.

### Motion Choreography
- **Accordion Open**: 
  - Height: 0 -> Auto (using GSAP Flip for performance)
  - Opacity: 0 -> 1
  - The "+" icon rotates 45 degrees to become "x".
- **Stagger**: When the page loads, the questions slide in one by one from the left.

---

## Section 8: Final CTA - The Portal

### Layout
**Concept**: The Grand Finale. A massive, immersive footer that acts as a final gateway.

#### Spatial Composition
- **Centered**: All focus is on the action.
- **Background**: A dynamic, generative gradient mesh that shifts colors slowly.

### Content
- **Heading**: "START YOUR AI JOURNEY"
- **Description**: "Download now and experience the future."
- **CTA**: "Download on App Store"

### Motion Choreography
- **Background**: Mesh gradient colors morph between purple and blue hues.
- **Button Pulse**: The main CTA button has a "heartbeat" scale animation every 2 seconds.
- **Text**: The heading uses a "Gradient Text" effect where the text color is an animated moving gradient.

---

## Technical Implementation Notes

### Required Libraries
- **GSAP (GreenSock)**: Core animation engine (ScrollTrigger, Flip plugin).
- **Lenis**: For smooth, momentum-based scrolling (essential for the parallax effects).
- **Three.js / React-Three-Fiber**: For the subtle distortion effects on images (optional, can be fallback to CSS filters).

### Critical Performance Rules
- ✅ **Use `transform` and `opacity`**: Only animate these properties.
- ✅ **Will-Change**: Apply `will-change: transform` to the Hero Phone and Parallax elements only when in viewport.
- ❌ **No Layout Thrashing**: Never animate `width`, `height`, `margin`, or `padding` during scroll (except in accordion with FLIP).
- ✅ **Image Optimization**: All images must be lazy-loaded with a blur-up placeholder.

### Browser Support
- **Media Queries**: `prefers-reduced-motion` must disable parallax and smooth scrolling, reverting to standard layout.
- **Fallbacks**: CSS Grid fallbacks for older browsers.

---

## Output Path
`/mnt/okcomputer/output/design.md`
