# 🎮 Grid Nexus: Ultimate Tic-Tac-Toe

**Grid Nexus** is a premium, highly interactive, and completely original Tic-Tac-Toe game designed to look and feel like a modern indie video game rather than a standard web project. Drawing inspiration from visual interfaces like *Clash Royale*, *Brawl Stars*, *Marvel Snap*, *Nintendo Switch menus*, and *Chess.com*, it offers an immersive gaming experience right from the browser.

---

## ✨ Features

### 📡 Immersive Audio Synthesis (Web Audio API)
*   **Asset-free Sound Design**: Generates all audio programmatically using the browser's Web Audio API (sine, triangle, and sawtooth oscillators). No external audio files to load or trigger CORS errors.
*   **Action Sounds**: Satisfying sound effects for button hovers, menu clicks, symbol placements (different notes for X and O), victory fanfares, and defeat sweeps.
*   **Ethereal Ambient Core**: Synthesizes a slow, spacey, looping major chord progression in the background that can be toggled or adjusted in the Settings panel.

### 🌌 HTML5 Canvas Particle Physics
*   **Theme-tailored Particle Backgrounds**: Continuous drift animations including floating neon space dust, ultraviolet stars, digital pixel squares, rising lava embers, or floating bubbles.
*   **Placement Sparks**: Impact sparks burst outward from cells when grid pieces are placed.
*   **Victory Celebration**: Full-screen confetti explosions and fireworks light up the overlay upon winning a match.

### 🧠 Tactical AI Core & Minimax Engine
*   **Difficulty Scaling**: 
    *   **Easy**: Simple probabilistic tree, moves randomly 80% of the time.
    *   **Medium**: 40% random, 60% strategic blocks.
    *   **Hard**: 90% smart play, 10% room for error.
    *   **Impossible**: 100% flawless **Minimax Algorithm**. The AI is mathematically unbeatable—forcing either a draw or an AI win.
*   **Visual Thinking State**: The AI plays an animated scanner overlay on the board with a calculated delay (800ms - 1500ms) to simulate strategic calculation.

### 🏆 RPG Progression & Customization
*   **XP System & Leveling**: Gain XP from every game (wins vs higher difficulties yield more XP). Leveling up unlocks premium avatars, borders, and themes.
*   **Daily Challenges**: Generates a random challenge every 24 hours (e.g., *Win 3 matches vs Medium AI*) for bonus XP and Trophies.
*   **Achievements Archive**: Complete milestones like *Matrix Breaker* (defeating Impossible AI) or *Supernova* (building a 5-match win streak) to earn collectible medals displayed in your Trophy case.
*   **Profile Customizer**: Update your username, choose from 4 vector-drawn avatars, and equip unlocked premium borders.

### 🎨 8 Swappable Visual Themes
*   **Cyber Neon**: Cyberpunk carbon base with vibrant cyan and magenta lights.
*   **Galaxy**: Cosmic violet space with drifting nebula dust.
*   **Arcade**: Retro 8-bit theme with neon green colors and boxy retro styling.
*   **Space Arena**: Holographic hazard orange accents and slate grey panels.
*   **Crystal**: Frozen frosted glassmorphic theme with light blue ice details.
*   **Volcano**: Pit black igneous stone with rising magma embers.
*   **Ocean**: Deep marine blue colors with ascending seafoam bubbles.
*   **Royal Gold**: Elegant, luxurious carbon overlay with shimmering gold details.

---

## 🛠️ Technology Stack
*   **Structure**: HTML5 (semantic layout, inline SVG definitions)
*   **Styles**: Vanilla CSS3 (Custom properties, grid alignment, keyframe animations, glassmorphism overlays)
*   **Logic**: Pure Vanilla JavaScript (Web Audio synthesis, 2D Canvas rendering loop, Minimax state solver, LocalStorage caching)
*   **Fonts**: *Orbitron* (headers/titles) and *Outfit* (body details) via Google Fonts

---

## 📂 File Structure
```bash
├── index.html       # Structural layouts, SVGs, and modal overlays
├── styles.css       # Layout grids, responsive sizing, and 8 color theme maps
├── app.js           # Sound synthesizer, particle physics, game state, and AI
└── README.md        # Documentation and guide
```

---

## 🚀 How to Run Locally

Since the application is built entirely using vanilla frontend technologies (without external asset files), you can run it instantly using any static server.

### Option 1: Python HTTP Server (Recommended)
1.  Open your terminal in the project directory.
2.  Start the server:
    ```bash
    python -m http.server 8080
    ```
3.  Open **[http://localhost:8080](http://localhost:8080)** in your web browser.

### Option 2: VS Code Live Server
1.  Open the folder in Visual Studio Code.
2.  Click **Go Live** in the bottom-right corner of the status bar.

### Option 3: Direct Load
Double-click `index.html` to open it in your browser. *(Note: Browsers may restrict Web Audio playback until you interact with the page. Click **PRESS START** on the splash screen to begin).*
