/* ==========================================================================
   GRID NEXUS - GAME LOGIC, PROGRESSION SYSTEM, CANVAS PARTICLES & SOUND SYNTH
   ========================================================================== */

// --- GLOBAL GAME STATE ---
const DEFAULT_STATE = {
  username: "PLAYER1",
  avatar: "avatar-cyber-punk",
  border: "bronze",
  theme: "cyber-neon",
  level: 1,
  xp: 0,
  trophies: 0,
  streak: 0,
  maxStreak: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  unlockedThemes: ["cyber-neon", "galaxy"],
  unlockedBorders: ["bronze", "silver"],
  unlockedAvatars: ["avatar-cyber-punk", "avatar-galaxy-mage"],
  battleLog: [],
  dailyProgress: 0,
  dailyCompleted: false,
  dailyChallengeType: "win_medium", // default
  dailyChallengeTarget: 3,
  unlockedAchievements: [],
  sfxVolume: 0.7,
  musicVolume: 0.4,
  lastDailyReset: 0
};

let gameState = { ...DEFAULT_STATE };

// --- DATA persistence ---
function loadGameState() {
  const saved = localStorage.getItem("grid_nexus_state");
  if (saved) {
    try {
      gameState = { ...DEFAULT_STATE, ...JSON.parse(saved) };
    } catch (e) {
      console.error("Failed to parse saved state, resetting...", e);
      gameState = { ...DEFAULT_STATE };
    }
  } else {
    gameState = { ...DEFAULT_STATE };
    gameState.lastDailyReset = Date.now();
  }
}

function saveGameState() {
  localStorage.setItem("grid_nexus_state", JSON.stringify(gameState));
}

// --- SOUND MANAGER (WEB AUDIO API SYNTHESIS) ---
class WebAudioSoundManager {
  constructor() {
    this.ctx = null;
    this.ambientSequencer = null;
    this.ambientOscillators = [];
    this.ambientGainNode = null;
    this.musicPlaying = false;
  }

  init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();
    
    // Setup master ambient gain node
    this.ambientGainNode = this.ctx.createGain();
    this.ambientGainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    this.ambientGainNode.connect(this.ctx.destination);
    
    this.startAmbientMusic();
  }

  setSFXVolume(val) {
    gameState.sfxVolume = val;
    saveGameState();
  }

  setMusicVolume(val) {
    gameState.musicVolume = val;
    saveGameState();
    if (this.ambientGainNode) {
      // Smooth volume transition
      this.ambientGainNode.gain.linearRampToValueAtTime(val * 0.15, this.ctx.currentTime + 0.5);
    }
  }

  // Synthesize sound effects on the fly
  playSFX(type) {
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    const vol = gameState.sfxVolume;
    if (vol <= 0) return;

    try {
      switch (type) {
        case 'hover':
          this.synthHover(vol);
          break;
        case 'click':
          this.synthClick(vol);
          break;
        case 'moveX':
          this.synthMoveX(vol);
          break;
        case 'moveO':
          this.synthMoveO(vol);
          break;
        case 'victory':
          this.synthVictory(vol);
          break;
        case 'defeat':
          this.synthDefeat(vol);
          break;
        case 'levelUp':
          this.synthLevelUp(vol);
          break;
        case 'themeSwitch':
          this.synthThemeSwitch(vol);
          break;
        case 'achievement':
          this.synthAchievementUnlocked(vol);
          break;
      }
    } catch (e) {
      console.warn("Audio node creation failed", e);
    }
  }

  synthHover(vol) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, this.ctx.currentTime + 0.08);
    
    gain.gain.setValueAtTime(vol * 0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.09);
  }

  synthClick(vol) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.15);
    
    gain.gain.setValueAtTime(vol * 0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.16);
  }

  synthMoveX(vol) {
    // High-tech laser sweep
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.25);
    
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(850, this.ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(vol * 0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
    
    osc.connect(gain);
    osc2.connect(gain);
    
    // Add bandpass filter for Sci-fi feel
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 400;
    
    gain.connect(filter);
    filter.connect(this.ctx.destination);
    
    osc.start();
    osc2.start();
    osc.stop(this.ctx.currentTime + 0.26);
    osc2.stop(this.ctx.currentTime + 0.26);
  }

  synthMoveO(vol) {
    // Round hollow bubble chime
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.setValueAtTime(400, this.ctx.currentTime + 0.05);
    osc.frequency.setValueAtTime(800, this.ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(vol * 0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.26);
  }

  synthVictory(vol) {
    // Triumphant ascending major arpeggio
    const now = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C Major
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.setValueAtTime(vol * 0.15, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.4);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.45);
    });
  }

  synthDefeat(vol) {
    // Descending detuned buzzer
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const oscDetuned = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(60, now + 0.8);
    
    oscDetuned.type = 'sawtooth';
    oscDetuned.frequency.setValueAtTime(177, now);
    oscDetuned.frequency.linearRampToValueAtTime(58, now + 0.8);
    
    gain.gain.setValueAtTime(vol * 0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    
    osc.connect(gain);
    oscDetuned.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    oscDetuned.start();
    osc.stop(now + 0.85);
    oscDetuned.stop(now + 0.85);
  }

  synthLevelUp(vol) {
    const now = this.ctx.currentTime;
    // Ascending sci-fi power-up
    const notes = [440, 554, 659, 880, 1109, 1318, 1760]; // A Major arpeggio
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.setValueAtTime(vol * 0.12, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.3);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.35);
    });
  }

  synthThemeSwitch(vol) {
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(100, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(450, this.ctx.currentTime + 0.4);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(50, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.4);
    
    gain.gain.setValueAtTime(vol * 0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.51);
  }

  synthAchievementUnlocked(vol) {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.15); // E5
    osc.frequency.setValueAtTime(783.99, now + 0.3); // G5
    osc.frequency.setValueAtTime(1046.50, now + 0.45); // C6
    
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(526.25, now);
    osc2.frequency.setValueAtTime(662.25, now + 0.15);
    osc2.frequency.setValueAtTime(786.99, now + 0.3);
    osc2.frequency.setValueAtTime(1049.50, now + 0.45);
    
    gain.gain.setValueAtTime(vol * 0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    
    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc2.start();
    osc.stop(now + 0.75);
    osc2.stop(now + 0.75);
  }

  // Looping ethereal spacer synth chords sequencer
  startAmbientMusic() {
    if (this.musicPlaying) return;
    this.musicPlaying = true;
    
    // Set initial volume
    this.ambientGainNode.gain.setValueAtTime(gameState.musicVolume * 0.15, this.ctx.currentTime);
    
    const chords = [
      [130.81, 164.81, 196.00, 246.94], // Cmaj7 (C3, E3, G3, B3)
      [110.00, 146.83, 174.61, 220.00], // Fmaj7 inverted (A2, D3, F3, A3)
      [110.00, 130.81, 164.81, 196.00], // Am7 (A2, C3, E3, G3)
      [97.99, 146.83, 196.00, 246.94]   // G7 (G2, D3, G3, B3)
    ];
    
    let chordIdx = 0;
    
    const playChord = () => {
      if (!this.musicPlaying) return;
      
      const now = this.ctx.currentTime;
      const notes = chords[chordIdx];
      const duration = 5.0; // Seconds per chord
      
      // Stop old notes
      this.ambientOscillators.forEach(oscObj => {
        try {
          oscObj.gain.gain.linearRampToValueAtTime(0, now + 0.8);
          oscObj.osc.stop(now + 0.85);
        } catch (e) {}
      });
      this.ambientOscillators = [];
      
      // Play new chord notes
      notes.forEach(freq => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        
        // Ethereal slow filter sweep
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, now);
        filter.frequency.exponentialRampToValueAtTime(1000, now + duration * 0.5);
        filter.frequency.exponentialRampToValueAtTime(250, now + duration);
        
        // Attack / Decay envelope
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 1.2); // Slow attack
        gain.gain.setValueAtTime(0.2, now + duration - 1.5);
        gain.gain.linearRampToValueAtTime(0, now + duration); // Slow release
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ambientGainNode);
        
        osc.start(now);
        this.ambientOscillators.push({ osc, gain });
      });
      
      chordIdx = (chordIdx + 1) % chords.length;
      
      // Schedule next chord
      this.ambientSequencer = setTimeout(playChord, duration * 1000 - 800); // Overlay trigger slightly
    };
    
    playChord();
  }

  stopAmbientMusic() {
    this.musicPlaying = false;
    clearTimeout(this.ambientSequencer);
    const now = this.ctx ? this.ctx.currentTime : 0;
    this.ambientOscillators.forEach(oscObj => {
      try {
        oscObj.gain.gain.linearRampToValueAtTime(0, now + 0.5);
        oscObj.osc.stop(now + 0.6);
      } catch (e) {}
    });
    this.ambientOscillators = [];
  }
}

const Sound = new WebAudioSoundManager();

// --- HTML5 CANVAS PARTICLE ENGINE ---
class ParticleEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.backgroundDust = [];
    this.active = false;
    this.dustCount = 45;
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.active = true;
    this.generateBackgroundDust();
    this.loop();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  getThemeColors() {
    const t = gameState.theme;
    if (t === 'cyber-neon') return ['#00f2fe', '#fe019a', '#00ff88'];
    if (t === 'galaxy') return ['#9d4edd', '#e0aaff', '#7b2cbf'];
    if (t === 'arcade') return ['#39ff14', '#fff01f', '#ff007f'];
    if (t === 'space-arena') return ['#ff7a00', '#00e0ff', '#88a3cc'];
    if (t === 'crystal') return ['#0077b6', '#00b4d8', '#90e0ef'];
    if (t === 'volcano') return ['#ff2600', '#ff9100', '#3d0a00'];
    if (t === 'ocean') return ['#00f5d4', '#00bbf9', '#0077b6'];
    if (t === 'royal-gold') return ['#d4af37', '#f3e5ab', '#ffffff'];
    return ['#00f2fe', '#fe019a'];
  }

  generateBackgroundDust() {
    this.backgroundDust = [];
    const colors = this.getThemeColors();
    for (let i = 0; i < this.dustCount; i++) {
      this.backgroundDust.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        r: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4 - 0.2, // Drifts upward slowly
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.5 + 0.15,
        pulse: Math.random() * 0.02
      });
    }
  }

  // Triggered on symbols placement
  burstCellParticles(x, y) {
    const colors = this.getThemeColors();
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 2;
      this.particles.push({
        x,
        y,
        r: Math.random() * 3 + 2,
        speedX: Math.cos(angle) * speed,
        speedY: Math.sin(angle) * speed,
        decay: Math.random() * 0.02 + 0.015,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 1.0,
        gravity: 0.02
      });
    }
  }

  // Triggered on victory screen
  launchConfetti() {
    const colors = ['#ff0055', '#00ff66', '#00ccff', '#ffcc00', '#ff00ff', '#ffffff'];
    
    // Left side corner launch
    for (let i = 0; i < 60; i++) {
      this.particles.push({
        x: 0,
        y: this.canvas.height * 0.85,
        r: Math.random() * 5 + 3,
        speedX: Math.random() * 7 + 4,
        speedY: -Math.random() * 12 - 6,
        decay: Math.random() * 0.01 + 0.008,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 1.0,
        gravity: 0.25,
        wobble: Math.random() * 10,
        wobbleSpeed: Math.random() * 0.1 + 0.05
      });
    }

    // Right side corner launch
    for (let i = 0; i < 60; i++) {
      this.particles.push({
        x: this.canvas.width,
        y: this.canvas.height * 0.85,
        r: Math.random() * 5 + 3,
        speedX: -Math.random() * 7 - 4,
        speedY: -Math.random() * 12 - 6,
        decay: Math.random() * 0.01 + 0.008,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 1.0,
        gravity: 0.25,
        wobble: Math.random() * 10,
        wobbleSpeed: Math.random() * 0.1 + 0.05
      });
    }
  }

  launchFireworks() {
    const colors = this.getThemeColors();
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    // Schedule 3 fireworks bursts
    for (let f = 0; f < 3; f++) {
      setTimeout(() => {
        const fireworkX = Math.random() * (w * 0.6) + w * 0.2;
        const fireworkY = Math.random() * (h * 0.4) + h * 0.15;
        
        for (let i = 0; i < 40; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 5 + 3;
          this.particles.push({
            x: fireworkX,
            y: fireworkY,
            r: Math.random() * 2 + 1.5,
            speedX: Math.cos(angle) * speed,
            speedY: Math.sin(angle) * speed,
            decay: Math.random() * 0.015 + 0.01,
            color: colors[Math.floor(Math.random() * colors.length)],
            opacity: 1.0,
            gravity: 0.08,
            sparkle: Math.random() > 0.5
          });
        }
      }, f * 350);
    }
  }

  loop() {
    if (!this.active) return;
    requestAnimationFrame(() => this.loop());

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. Draw and update background dust
    this.backgroundDust.forEach(dust => {
      dust.x += dust.speedX;
      dust.y += dust.speedY;
      dust.opacity += dust.pulse;

      // Wrap around bounds
      if (dust.x < 0) dust.x = this.canvas.width;
      if (dust.x > this.canvas.width) dust.x = 0;
      if (dust.y < 0) dust.y = this.canvas.height;
      if (dust.y > this.canvas.height) dust.y = this.canvas.height;

      // Pulse opacity
      if (dust.opacity > 0.75 || dust.opacity < 0.1) {
        dust.pulse = -dust.pulse;
      }

      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(dust.x, dust.y, dust.r, 0, Math.PI * 2);
      this.ctx.fillStyle = dust.color;
      this.ctx.globalAlpha = Math.max(0, Math.min(1, dust.opacity));
      
      // Theme specific glowing effect
      if (gameState.theme !== 'arcade' && gameState.theme !== 'crystal') {
        this.ctx.shadowBlur = 8;
        this.ctx.shadowColor = dust.color;
      }
      this.ctx.fill();
      this.ctx.restore();
    });

    // 2. Draw and update bursts & confetti
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.speedX;
      p.y += p.speedY;
      p.speedY += p.gravity;
      p.opacity -= p.decay;

      // If wobble exists (confetti tumbling)
      if (p.wobble !== undefined) {
        p.wobble += p.wobbleSpeed;
        p.x += Math.sin(p.wobble) * 0.8;
      }

      if (p.opacity <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.beginPath();
      
      if (p.wobble !== undefined) {
        // Draw rectangle ribbon for confetti
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.wobble);
        this.ctx.rect(-p.r, -p.r * 2, p.r * 2, p.r * 4);
      } else {
        // Draw circle spark
        this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      }

      // Sparkle flash effect
      if (p.sparkle && Math.random() > 0.6) {
        this.ctx.fillStyle = '#ffffff';
      } else {
        this.ctx.fillStyle = p.color;
      }
      
      this.ctx.globalAlpha = p.opacity;
      if (gameState.theme !== 'arcade') {
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = p.color;
      }
      this.ctx.fill();
      this.ctx.restore();
    }
  }

  stop() {
    this.active = false;
  }
}

const Particles = new ParticleEngine('bg-canvas');

// --- THE MASCOT DIALOG CORE ---
const MASCOT_MESSAGES = {
  welcome: [
    "System matrix online. Ready to dominate the grid, Commander?",
    "Telemetry scans show optimal logic pathways. Let's combat!",
    "Nexus cores fully synchronized. Click ENTER ARENA to launch."
  ],
  selectMode: [
    "Training protocols or raw organic combat? Choose wisely.",
    "System AI ranges from simplistic to absolute chess-grade perfection."
  ],
  aiThinking: [
    "Minimax algorithms checking index nodes... I am sweating!",
    "AI is analyzing grid coordinates. Watch your flanks!",
    "System CPU utilizing full calculations..."
  ],
  win: [
    "UNBELIEVABLE! Grid Nexus security completely breached!",
    "A stunning mathematical display. You dominated!",
    "Victory registered. Level XP and medals incoming!"
  ],
  loss: [
    "Warning: AI tactical victory confirmed. Try again, pilot.",
    "Nexus nodes offline. Re-calibrate your heuristics.",
    "Defeat is simply a code optimization process. Go again!"
  ],
  draw: [
    "Equilibrium reached. Code loop terminated in stalemate.",
    "A perfect gridlock. Neither CPU nor human could advance.",
    "Draw. Equal tactical processing."
  ],
  levelUp: [
    "ALERT: System capacity expanded! Welcome to the next tier!",
    "Level Up completed! New customization files unlocked!",
    "Core optimization finalized. Check your profiles directory!"
  ],
  clicks: [
    "Hey! That tickled my digital nodes!",
    "Core diagnostics: 100% cute. 100% tactical.",
    "Don't press my antennal transmitter unless it's emergency!",
    "I scan 8 custom themes. Swapping is clean!"
  ]
};

function triggerMascotText(category) {
  const bubbles = MASCOT_MESSAGES[category];
  if (!bubbles) return;
  const msg = bubbles[Math.floor(Math.random() * bubbles.length)];
  const txtElement = document.getElementById("mascot-text");
  if (txtElement) {
    txtElement.textContent = msg;
    // Animation bump
    const container = document.getElementById("mascot-widget");
    container.classList.remove("bump-anim");
    void container.offsetWidth; // trigger reflow
    container.classList.add("bump-anim");
  }
}

// --- TIC-TAC-TOE GAME ENGINE & MINIMAX AI ---
class TicTacToeEngine {
  constructor() {
    this.board = Array(9).fill(''); // '', 'X', 'O'
    this.currentPlayer = 'X'; // X starts (always Player 1)
    this.mode = 'ai'; // 'ai' or 'pvp'
    this.difficulty = 'medium'; // easy, medium, hard, impossible
    this.gameActive = false;
    this.movesCount = 0;
  }

  start(mode, difficulty) {
    this.board = Array(9).fill('');
    this.currentPlayer = 'X';
    this.mode = mode;
    this.difficulty = difficulty;
    this.gameActive = true;
    this.movesCount = 0;
  }

  makeMove(idx, symbol) {
    if (this.board[idx] !== '' || !this.gameActive) return false;
    this.board[idx] = symbol;
    this.movesCount++;
    return true;
  }

  switchTurn() {
    this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
  }

  checkWinner() {
    const winCombos = [
      [0,1,2], [3,4,5], [6,7,8], // rows
      [0,3,6], [1,4,7], [2,5,8], // cols
      [0,4,8], [2,4,6]           // diagonals
    ];

    for (let i = 0; i < winCombos.length; i++) {
      const [a, b, c] = winCombos[i];
      if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
        return { winner: this.board[a], combo: winCombos[i] };
      }
    }

    if (this.board.every(cell => cell !== '')) {
      return { winner: 'draw', combo: null };
    }

    return null;
  }

  // MINIMAX ALGORITHM
  getBestMove() {
    if (this.difficulty === 'easy') {
      return this.getRandomMove(0.8); // 80% random, 20% optimal
    } else if (this.difficulty === 'medium') {
      return this.getRandomMove(0.4); // 40% random, 60% optimal
    } else if (this.difficulty === 'hard') {
      return this.getRandomMove(0.1); // 10% random, 90% optimal
    } else {
      // Impossible Mode - Perfect Minimax
      return this.getMinimaxMove();
    }
  }

  getRandomMove(probabilityRandom) {
    const emptyIndices = this.board.map((cell, idx) => cell === '' ? idx : null).filter(val => val !== null);
    
    // Probabilistic check
    if (Math.random() < probabilityRandom) {
      return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    }
    
    // Otherwise play optimally (Minimax)
    return this.getMinimaxMove();
  }

  getMinimaxMove() {
    let bestScore = -Infinity;
    let bestMove = null;
    
    for (let i = 0; i < 9; i++) {
      if (this.board[i] === '') {
        this.board[i] = 'O'; // AI places hypothetical token
        let score = this.minimax(this.board, 0, false);
        this.board[i] = ''; // Reset cell
        
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }
    return bestMove;
  }

  minimax(board, depth, isMaximizing) {
    const check = this.checkWinner();
    if (check) {
      if (check.winner === 'O') return 10 - depth;
      if (check.winner === 'X') return depth - 10;
      if (check.winner === 'draw') return 0;
    }

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
          board[i] = 'O';
          let score = this.minimax(board, depth + 1, false);
          board[i] = '';
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
          board[i] = 'X';
          let score = this.minimax(board, depth + 1, true);
          board[i] = '';
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  }
}

const Game = new TicTacToeEngine();

// --- PROGRESSION CORE (XP, LEVELS & UNLOCKS) ---
class ProgressionManager {
  addXP(amount) {
    let xpGained = amount;
    
    // Win streak multiplier bonus
    if (gameState.streak >= 3) xpGained = Math.round(xpGained * 1.25);
    if (gameState.streak >= 5) xpGained = Math.round(xpGained * 1.5);
    
    gameState.xp += xpGained;
    
    let leveledUp = false;
    let xpNeeded = this.getXPNeeded(gameState.level);
    
    while (gameState.xp >= xpNeeded) {
      gameState.xp -= xpNeeded;
      gameState.level++;
      leveledUp = true;
      xpNeeded = this.getXPNeeded(gameState.level);
    }
    
    saveGameState();
    return { leveledUp, xpGained };
  }

  getXPNeeded(lvl) {
    return lvl * 100;
  }

  // Automatically unlocks themes/avatars on Level milestones
  checkUnlocks(prevLvl, currentLvl) {
    let unlockedText = [];
    
    for (let l = prevLvl + 1; l <= currentLvl; l++) {
      if (l === 2) {
        this.unlockTheme("galaxy");
        this.unlockAvatar("avatar-galaxy-mage");
        unlockedText.push("GALAXY THEME & GALAXY MAGE AVATAR");
      }
      if (l === 3) {
        this.unlockTheme("arcade");
        this.unlockAvatar("avatar-pixel-bot");
        unlockedText.push("ARCADE THEME & PIXEL BOT AVATAR");
      }
      if (l === 4) {
        this.unlockTheme("space-arena");
        unlockedText.push("SPACE ARENA THEME");
      }
      if (l === 5) {
        this.unlockTheme("crystal");
        this.unlockBorder("crystal");
        unlockedText.push("CRYSTAL THEME & CRYSTAL BORDER");
      }
      if (l === 6) {
        this.unlockTheme("volcano");
        this.unlockAvatar("avatar-lava-beast");
        unlockedText.push("VOLCANO THEME & LAVA BEAST AVATAR");
      }
      if (l === 7) {
        this.unlockTheme("ocean");
        this.unlockBorder("neon");
        unlockedText.push("OCEAN THEME & NEON BORDER");
      }
      if (l === 8) {
        this.unlockTheme("royal-gold");
        this.unlockBorder("champion");
        unlockedText.push("ROYAL GOLD THEME & CHAMPION BORDER");
      }
    }
    
    if (unlockedText.length > 0) {
      saveGameState();
      return unlockedText.join(", ");
    }
    return null;
  }

  unlockTheme(theme) {
    if (!gameState.unlockedThemes.includes(theme)) {
      gameState.unlockedThemes.push(theme);
    }
  }

  unlockAvatar(avatar) {
    if (!gameState.unlockedAvatars.includes(avatar)) {
      gameState.unlockedAvatars.push(avatar);
    }
  }

  unlockBorder(border) {
    if (!gameState.unlockedBorders.includes(border)) {
      gameState.unlockedBorders.push(border);
    }
  }

  updateStreak(won) {
    if (won) {
      gameState.streak++;
      if (gameState.streak > gameState.maxStreak) {
        gameState.maxStreak = gameState.streak;
      }
    } else {
      gameState.streak = 0;
    }
    saveGameState();
  }

  checkDailyChallenge(outcome, difficulty) {
    if (gameState.dailyCompleted) return false;
    
    if (gameState.dailyChallengeType === "win_medium" && outcome === "win" && difficulty === "medium") {
      gameState.dailyProgress++;
    } else if (gameState.dailyChallengeType === "win_hard" && outcome === "win" && difficulty === "hard") {
      gameState.dailyProgress++;
    } else if (gameState.dailyChallengeType === "play_any" && outcome !== "") {
      gameState.dailyProgress++;
    }

    if (gameState.dailyProgress >= gameState.dailyChallengeTarget) {
      gameState.dailyCompleted = true;
      // Grant reward
      this.addXP(100);
      gameState.trophies += 1;
      saveGameState();
      return true; // completed challenge
    }
    
    saveGameState();
    return false;
  }

  generateDailyChallenge() {
    const types = [
      { type: "win_medium", desc: "Win 3 matches vs Medium AI", target: 3 },
      { type: "win_hard", desc: "Win 1 match vs Hard AI", target: 1 },
      { type: "play_any", desc: "Play 3 matches in any mode", target: 3 }
    ];
    
    const picked = types[Math.floor(Math.random() * types.length)];
    gameState.dailyChallengeType = picked.type;
    gameState.dailyChallengeTarget = picked.target;
    gameState.dailyProgress = 0;
    gameState.dailyCompleted = false;
    gameState.lastDailyReset = Date.now();
    saveGameState();
  }

  // Tracks achievements progress
  checkAchievements() {
    const newlyUnlocked = [];
    const list = [
      { id: "first_win", name: "First Nexus", desc: "Win your first combat match", check: () => gameState.wins >= 1, xp: 50 },
      { id: "medium_tamer", name: "AI Tamer", desc: "Win vs Medium AI", check: () => gameState.battleLog.some(log => log.difficulty === 'medium' && log.outcome === 'win'), xp: 75 },
      { id: "hard_slayer", name: "Legendary Warrior", desc: "Win vs Hard AI", check: () => gameState.battleLog.some(log => log.difficulty === 'hard' && log.outcome === 'win'), xp: 100 },
      { id: "impossible_breaker", name: "Matrix Breaker", desc: "Win vs Impossible AI", check: () => gameState.battleLog.some(log => log.difficulty === 'impossible' && log.outcome === 'win'), xp: 200 },
      { id: "streak_3", name: "Fire Starter", desc: "Reach a 3 win streak", check: () => gameState.maxStreak >= 3, xp: 80 },
      { id: "streak_5", name: "Supernova", desc: "Reach a 5 win streak", check: () => gameState.maxStreak >= 5, xp: 150 },
      { id: "collector", name: "Grand Collector", desc: "Change username, border and avatar", check: () => gameState.username !== "PLAYER1" && gameState.border !== "bronze" && gameState.avatar !== "avatar-cyber-punk", xp: 100 },
      { id: "explorer", name: "Multiverse Explorer", desc: "Play matches on 5 different themes", check: () => {
        const uniqueThemes = new Set(gameState.battleLog.map(l => l.theme));
        return uniqueThemes.size >= 5;
      }, xp: 120 }
    ];

    list.forEach(ach => {
      if (!gameState.unlockedAchievements.includes(ach.id) && ach.check()) {
        gameState.unlockedAchievements.push(ach.id);
        this.addXP(ach.xp);
        gameState.trophies += 1;
        newlyUnlocked.push(ach);
      }
    });

    if (newlyUnlocked.length > 0) {
      saveGameState();
    }
    return newlyUnlocked;
  }
}

const Progression = new ProgressionManager();

// --- USER INTERFACE CONTROL ENGINE ---
class UIController {
  constructor() {
    this.currentScreen = 'screen-splash';
    this.selectedSetupMode = 'ai';
    this.selectedSetupDifficulty = 'medium';
    this.tempAvatar = 'avatar-cyber-punk';
    this.tempBorder = 'bronze';
  }

  init() {
    this.bindEvents();
    this.loadSplashProgress();
    this.applyTheme(gameState.theme);
  }

  changeScreen(screenId) {
    // Hide all
    document.querySelectorAll('.game-screen').forEach(scr => {
      scr.classList.remove('screen-active');
    });

    const target = document.getElementById(screenId);
    if (target) {
      target.classList.add('screen-active');
      this.currentScreen = screenId;
    }
    
    // Clean screen background triggers
    if (screenId === 'screen-main-menu') {
      triggerMascotText('welcome');
      this.renderMenuHeader();
    }
  }

  // Simulates console load loader progress
  loadSplashProgress() {
    let progress = 0;
    const bar = document.getElementById("splash-loader");
    const statusText = document.getElementById("loader-status");
    const launchBtn = document.getElementById("btn-splash-launch");
    
    const messages = [
      "LOADING GLOW MATRIX CORES...",
      "SYNCHRONIZING DIGITAL SOUND ARPEGGIO...",
      "COMPILING SYSTEM MINIMAX ALGORITHMS...",
      "ACQUIRING LOCAL CACHE FILES...",
      "SYSTEM CONTEXT READINESS: OPTIMAL"
    ];

    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 12) + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        statusText.textContent = "READY FOR OPERATION CORE.";
        launchBtn.classList.remove("hidden");
        // Trigger hover state sound synth check
      } else {
        const msgIdx = Math.floor((progress / 100) * messages.length);
        statusText.textContent = messages[msgIdx] || messages[0];
      }
      bar.style.width = `${progress}%`;
    }, 100);
  }

  applyTheme(themeName) {
    document.body.className = `theme-${themeName}`;
    gameState.theme = themeName;
    saveGameState();
    Particles.generateBackgroundDust();
    
    // Trigger audio switch effect
    Sound.playSFX('themeSwitch');
  }

  renderMenuHeader() {
    document.getElementById("header-username").textContent = gameState.username.toUpperCase();
    document.getElementById("header-level").textContent = `LV. ${gameState.level}`;
    document.getElementById("header-trophies").textContent = gameState.trophies;
    document.getElementById("header-streak").textContent = gameState.streak;
    
    // XP Bar
    const xpNeeded = Progression.getXPNeeded(gameState.level);
    const xpPercent = (gameState.xp / xpNeeded) * 100;
    document.getElementById("header-xp-fill").style.width = `${xpPercent}%`;
    document.getElementById("header-xp-text").textContent = `${gameState.xp} / ${xpNeeded} XP`;
    
    // Set Avatar inside container
    const avatarContainer = document.getElementById("header-avatar-container");
    avatarContainer.className = `avatar-ring border-${gameState.border}`;
    avatarContainer.innerHTML = `<svg viewBox="0 0 100 100" class="avatar-svg"><use href="#${gameState.avatar}"></use></svg>`;

    // Side widgets - Stats summary
    document.getElementById("stats-total-wins").textContent = gameState.wins;
    document.getElementById("stats-max-streak").textContent = gameState.maxStreak;
    const totalPlayed = gameState.wins + gameState.losses + gameState.draws;
    const winRate = totalPlayed > 0 ? Math.round((gameState.wins / totalPlayed) * 100) : 0;
    document.getElementById("stats-win-rate").textContent = `${winRate}%`;

    // Daily Challenge details
    this.renderDailyChallengeDetails();
  }

  renderDailyChallengeDetails() {
    // Generate new challenge if date passes 24 hours
    const timePassed = Date.now() - gameState.lastDailyReset;
    if (timePassed > 24 * 60 * 60 * 1000) {
      Progression.generateDailyChallenge();
    }

    let challengeDesc = "Win 3 matches vs Medium AI";
    if (gameState.dailyChallengeType === "win_hard") challengeDesc = "Win 1 match vs Hard AI";
    if (gameState.dailyChallengeType === "play_any") challengeDesc = `Play 3 matches in any mode`;

    document.getElementById("daily-challenge-title").textContent = challengeDesc;
    const progPercent = (gameState.dailyProgress / gameState.dailyChallengeTarget) * 100;
    document.getElementById("daily-challenge-progress").style.width = `${Math.min(100, progPercent)}%`;
    document.getElementById("daily-challenge-text").textContent = `${gameState.dailyProgress} / ${gameState.dailyChallengeTarget}`;
    
    if (gameState.dailyCompleted) {
      document.getElementById("daily-challenge-title").innerHTML = `<span style="text-decoration: line-through; opacity: 0.6;">${challengeDesc}</span> <b style="color: var(--accent-secondary);">[COMPLETED]</b>`;
    }
  }

  bindEvents() {
    // SFX Hover sounds to all buttons
    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest('.btn, .grid-cell, .setup-mode-option, .difficulty-btn, .select-item-frame, .theme-dot, .btn-theme-swapper');
      if (target && !target.classList.contains('locked')) {
        Sound.playSFX('hover');
      }
    });

    document.addEventListener('click', (e) => {
      const target = e.target.closest('.btn, .btn-theme-swapper, .setup-mode-option, .difficulty-btn');
      if (target && !target.classList.contains('locked') && target.id !== 'btn-splash-launch') {
        Sound.playSFX('click');
      }
    });

    // 1. Splash launch click
    document.getElementById("btn-splash-launch").addEventListener('click', () => {
      // Resume audio context and play music
      Sound.init();
      this.changeScreen('screen-main-menu');
    });

    // 2. Play Button menu
    document.getElementById("btn-menu-play").addEventListener('click', () => {
      this.changeScreen('screen-game-setup');
      triggerMascotText('selectMode');
    });

    // Setup mode selections
    document.getElementById("opt-mode-ai").addEventListener('click', () => {
      this.selectedSetupMode = 'ai';
      document.getElementById("opt-mode-ai").classList.add('selected');
      document.getElementById("opt-mode-pvp").classList.remove('selected');
      document.getElementById("difficulty-selection-area").classList.remove('hidden');
    });

    document.getElementById("opt-mode-pvp").addEventListener('click', () => {
      this.selectedSetupMode = 'pvp';
      document.getElementById("opt-mode-pvp").classList.add('selected');
      document.getElementById("opt-mode-ai").classList.remove('selected');
      document.getElementById("difficulty-selection-area").classList.add('hidden');
    });

    // Setup difficulty buttons selection
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const diffBtn = e.target.closest('.difficulty-btn');
        document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('selected'));
        diffBtn.classList.add('selected');
        this.selectedSetupDifficulty = diffBtn.getAttribute('data-diff');
      });
    });

    document.getElementById("btn-setup-back").addEventListener('click', () => {
      this.changeScreen('screen-main-menu');
    });

    // Start Arena click
    document.getElementById("btn-setup-start").addEventListener('click', () => {
      this.launchMatch();
    });

    // Theme dots short keys in Menu
    document.querySelectorAll('.theme-dot').forEach(dot => {
      dot.addEventListener('click', (e) => {
        const theme = e.target.getAttribute('data-theme');
        this.applyTheme(theme);
        this.renderMenuHeader();
      });
    });

    // Mascot triggers expressions on click
    document.getElementById("mascot-widget").addEventListener('click', () => {
      const eyePath = document.getElementById("mascot-eyes");
      const mouthPath = document.getElementById("mascot-mouth");
      
      // Wink expression
      eyePath.setAttribute("d", "M40 45 L48 45 M52 45 A5 5 0 0 0 62 45");
      mouthPath.setAttribute("d", "M40 60 Q50 50 60 60");
      Sound.playSFX('hover');
      triggerMascotText('clicks');

      setTimeout(() => {
        eyePath.setAttribute("d", "M40 45 A5 5 0 0 0 50 45 M50 45 A5 5 0 0 0 60 45");
        mouthPath.setAttribute("d", "M42 60 Q50 68 58 60");
      }, 1500);
    });

    // Grid board cell clicking
    document.querySelectorAll('.grid-cell').forEach(cell => {
      cell.addEventListener('click', (e) => {
        const cellIdx = parseInt(e.target.getAttribute('data-idx'));
        this.handleGridCellInteraction(cellIdx, e.target);
      });
    });

    // Arena reset & quit
    document.getElementById("btn-arena-restart").addEventListener('click', () => {
      this.startArenaGameplay();
    });

    document.getElementById("btn-arena-quit").addEventListener('click', () => {
      this.changeScreen('screen-main-menu');
    });

    // Game Over buttons
    document.getElementById("btn-over-retry").addEventListener('click', () => {
      this.changeScreen('screen-game-setup');
    });

    document.getElementById("btn-over-menu").addEventListener('click', () => {
      this.changeScreen('screen-main-menu');
    });

    // Profile Screen toggling
    document.getElementById("btn-menu-profile").addEventListener('click', () => {
      this.tempAvatar = gameState.avatar;
      this.tempBorder = gameState.border;
      this.changeScreen('screen-profile');
      this.renderProfileDrawer();
    });

    document.getElementById("btn-profile-back").addEventListener('click', () => {
      this.changeScreen('screen-main-menu');
    });

    document.getElementById("btn-save-username").addEventListener('click', () => {
      const inp = document.getElementById("input-username").value.trim();
      if (inp.length > 0) {
        gameState.username = inp.substring(0, 14);
        Progression.checkAchievements(); // check change profile achievement
        saveGameState();
        this.renderMenuHeader();
        this.renderProfileDrawer();
      }
    });

    // Achievements Screen toggling
    document.getElementById("btn-menu-achievements").addEventListener('click', () => {
      this.changeScreen('screen-achievements');
      this.renderAchievementsGrid();
    });

    document.getElementById("btn-achievements-back").addEventListener('click', () => {
      this.changeScreen('screen-main-menu');
    });

    // Combat Log toggling
    document.getElementById("btn-menu-log").addEventListener('click', () => {
      this.changeScreen('screen-log');
      this.renderBattleLog();
    });

    document.getElementById("btn-log-back").addEventListener('click', () => {
      this.changeScreen('screen-main-menu');
    });

    // Settings panel toggling
    document.getElementById("btn-menu-settings").addEventListener('click', () => {
      this.changeScreen('screen-settings');
      this.renderSettingsValues();
    });

    document.getElementById("btn-settings-back").addEventListener('click', () => {
      this.changeScreen('screen-main-menu');
    });

    // Volume sliders changes
    document.getElementById("slider-sfx").addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      document.getElementById("val-sfx").textContent = `${val}%`;
      Sound.setSFXVolume(val / 100);
    });

    document.getElementById("slider-music").addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      document.getElementById("val-music").textContent = `${val}%`;
      Sound.setMusicVolume(val / 100);
    });

    // DEV Utilities button triggers
    document.getElementById("btn-dev-max-out").addEventListener('click', () => {
      gameState.level = 10;
      gameState.xp = 0;
      gameState.trophies += 50;
      gameState.wins += 20;
      gameState.maxStreak = 10;
      // Unlock all
      gameState.unlockedThemes = ["cyber-neon", "galaxy", "arcade", "space-arena", "crystal", "volcano", "ocean", "royal-gold"];
      gameState.unlockedBorders = ["bronze", "silver", "gold", "champion", "neon", "galaxy", "volcano", "crystal"];
      gameState.unlockedAvatars = ["avatar-cyber-punk", "avatar-galaxy-mage", "avatar-pixel-bot", "avatar-lava-beast"];
      saveGameState();
      Sound.playSFX('levelUp');
      this.renderSettingsValues();
      alert("Nexus codes maximized. Level 10 configurations completed.");
    });

    document.getElementById("btn-dev-reset").addEventListener('click', () => {
      if (confirm("WARNING: Are you absolutely sure you want to scrub all memory files? This resets XP, streaks, levels and items!")) {
        localStorage.removeItem("grid_nexus_state");
        gameState = { ...DEFAULT_STATE };
        gameState.lastDailyReset = Date.now();
        saveGameState();
        this.applyTheme(gameState.theme);
        this.renderSettingsValues();
        alert("Nexus profile resets complete.");
      }
    });

    // Easter egg trigger
    document.getElementById("secret-trigger").addEventListener('click', () => {
      Sound.playSFX('achievement');
      alert("👾 SYSTEM INTEGRITY DETECTED: Special developer codes accepted. Level increased +1!");
      gameState.level++;
      saveGameState();
      this.renderMenuHeader();
    });
  }

  renderSettingsValues() {
    const sfxVal = Math.round(gameState.sfxVolume * 100);
    const musicVal = Math.round(gameState.musicVolume * 100);
    
    document.getElementById("slider-sfx").value = sfxVal;
    document.getElementById("val-sfx").textContent = `${sfxVal}%`;

    document.getElementById("slider-music").value = musicVal;
    document.getElementById("val-music").textContent = `${musicVal}%`;
  }

  launchMatch() {
    this.changeScreen('screen-game-arena');
    this.startArenaGameplay();
  }

  startArenaGameplay() {
    Game.start(this.selectedSetupMode, this.selectedSetupDifficulty);
    
    // Reset Grid visuals
    document.querySelectorAll('.grid-cell').forEach(cell => {
      cell.className = 'grid-cell';
      cell.textContent = '';
    });

    // Setup arena panel profiles names & avatars
    document.getElementById("arena-p1-name").textContent = gameState.username.toUpperCase();
    
    const p1Container = document.getElementById("arena-p1-avatar-container");
    p1Container.className = `avatar-ring border-${gameState.border}`;
    p1Container.innerHTML = `<svg viewBox="0 0 100 100" class="avatar-svg"><use href="#${gameState.avatar}"></use></svg>`;

    const p2Name = document.getElementById("arena-p2-name");
    const p2Container = document.getElementById("arena-p2-avatar-container");
    
    if (this.selectedSetupMode === 'ai') {
      p2Name.textContent = `AI: ${this.selectedSetupDifficulty.toUpperCase()}`;
      // pick avatar for AI
      p2Container.className = "avatar-ring border-gold";
      p2Container.innerHTML = `<svg viewBox="0 0 100 100" class="avatar-svg"><use href="#avatar-galaxy-mage"></use></svg>`;
    } else {
      p2Name.textContent = "P2 VISITOR";
      p2Container.className = "avatar-ring border-silver";
      p2Container.innerHTML = `<svg viewBox="0 0 100 100" class="avatar-svg"><use href="#avatar-pixel-bot"></use></svg>`;
    }

    this.updateActiveTurnIndicator();
  }

  updateActiveTurnIndicator() {
    const p1Card = document.getElementById("arena-p1-card");
    const p2Card = document.getElementById("arena-p2-card");
    const turnVal = document.getElementById("turn-player-name");

    if (Game.currentPlayer === 'X') {
      p1Card.classList.add('active');
      p2Card.classList.remove('active');
      turnVal.textContent = gameState.username.toUpperCase();
      turnVal.style.color = "var(--primary-glow)";
    } else {
      p2Card.classList.add('active');
      p1Card.classList.remove('active');
      turnVal.textContent = this.selectedSetupMode === 'ai' ? "SYSTEM AI" : "P2 TURN";
      turnVal.style.color = "var(--accent-glow)";
    }
  }

  handleGridCellInteraction(cellIdx, element) {
    if (!Game.gameActive || Game.board[cellIdx] !== '') return;

    // Reject clicking on AI's turn
    if (Game.mode === 'ai' && Game.currentPlayer === 'O') return;

    const currentSymbol = Game.currentPlayer;
    
    // Play move placement audio
    if (currentSymbol === 'X') {
      Sound.playSFX('moveX');
      element.classList.add('x');
      element.innerHTML = `<span class="cell-sym">X</span>`;
    } else {
      Sound.playSFX('moveO');
      element.classList.add('o');
      element.innerHTML = `<span class="cell-sym">O</span>`;
    }

    // Capture coordinate for particle sparks
    const rect = element.getBoundingClientRect();
    const midX = rect.left + rect.width / 2;
    const midY = rect.top + rect.height / 2;
    Particles.burstCellParticles(midX, midY);

    // Write to logic board
    Game.makeMove(cellIdx, currentSymbol);

    // Check winner
    const endMatchState = Game.checkWinner();
    if (endMatchState) {
      this.concludeMatch(endMatchState);
      return;
    }

    Game.switchTurn();
    this.updateActiveTurnIndicator();

    // Trigger AI play if mode is AI
    if (Game.mode === 'ai' && Game.currentPlayer === 'O') {
      this.triggerAIMovementProcess();
    }
  }

  triggerAIMovementProcess() {
    const thinkingOverlay = document.getElementById("ai-thinking-overlay");
    thinkingOverlay.classList.remove('hidden');
    triggerMascotText('aiThinking');

    // Simulate calculated delay
    const delay = Math.floor(Math.random() * 800) + 700; // 700ms - 1500ms
    setTimeout(() => {
      thinkingOverlay.classList.add('hidden');
      if (!Game.gameActive) return;

      const aiMoveIdx = Game.getBestMove();
      if (aiMoveIdx !== null) {
        const cellElement = document.querySelector(`.grid-cell[data-idx="${aiMoveIdx}"]`);
        
        Sound.playSFX('moveO');
        cellElement.classList.add('o');
        cellElement.innerHTML = `<span class="cell-sym">O</span>`;

        // Particles
        const rect = cellElement.getBoundingClientRect();
        Particles.burstCellParticles(rect.left + rect.width/2, rect.top + rect.height/2);

        Game.makeMove(aiMoveIdx, 'O');

        const endMatchState = Game.checkWinner();
        if (endMatchState) {
          this.concludeMatch(endMatchState);
          return;
        }

        Game.switchTurn();
        this.updateActiveTurnIndicator();
      }
    }, delay);
  }

  concludeMatch(outcomeObj) {
    Game.gameActive = false;
    
    // Draw winning flash cells
    if (outcomeObj.combo) {
      outcomeObj.combo.forEach(cellIdx => {
        document.querySelector(`.grid-cell[data-idx="${cellIdx}"]`).classList.add('win-line');
      });
    }

    let battleLogOutcome = 'draw';
    let xpGain = 15; // default draw
    let winReason = "Equilibrium stalemate";
    let trophyGained = 0;

    if (outcomeObj.winner === 'X') {
      battleLogOutcome = 'win';
      winReason = "Grid core security bypassed";
      xpGain = 35;
      
      // Scaling XP & medals based on difficulty
      if (Game.mode === 'ai') {
        if (Game.difficulty === 'easy') xpGain = 20;
        if (Game.difficulty === 'medium') xpGain = 35;
        if (Game.difficulty === 'hard') {
          xpGain = 60;
          trophyGained = 1;
        }
        if (Game.difficulty === 'impossible') {
          xpGain = 100;
          trophyGained = 3;
        }
      } else {
        xpGain = 25; // PvP wins
      }
    } else if (outcomeObj.winner === 'O') {
      battleLogOutcome = 'loss';
      winReason = "Grid core overrun by system AI";
      xpGain = 5; // minimum loss rewards
    }

    // Save statistics & local history logs
    if (Game.mode === 'ai') {
      if (battleLogOutcome === 'win') {
        gameState.wins++;
        Progression.updateStreak(true);
      } else if (battleLogOutcome === 'loss') {
        gameState.losses++;
        Progression.updateStreak(false);
      } else {
        gameState.draws++;
        Progression.updateStreak(false); // breaks streak
      }

      // Add to battle log list
      gameState.battleLog.unshift({
        mode: `VS AI: ${Game.difficulty.toUpperCase()}`,
        difficulty: Game.difficulty,
        outcome: battleLogOutcome,
        theme: gameState.theme,
        date: new Date().toLocaleString()
      });
    } else {
      // PvP stats
      if (battleLogOutcome === 'win') {
        gameState.wins++;
      } else if (battleLogOutcome === 'loss') {
        gameState.losses++;
      } else {
        gameState.draws++;
      }
      gameState.battleLog.unshift({
        mode: "LOCAL PVP",
        difficulty: "NONE",
        outcome: battleLogOutcome,
        theme: gameState.theme,
        date: new Date().toLocaleString()
      });
    }

    // Bound array logs to 10
    if (gameState.battleLog.length > 10) {
      gameState.battleLog.pop();
    }

    // Check daily challenge milestones
    const dailyChallengeUnlocked = Progression.checkDailyChallenge(battleLogOutcome, Game.difficulty);
    
    // Check level achievements
    const prevLvl = gameState.level;
    const { leveledUp, xpGained } = Progression.addXP(xpGain);
    gameState.trophies += trophyGained;
    
    const themeUnlocksText = Progression.checkUnlocks(prevLvl, gameState.level);
    const achievementsUnlockedList = Progression.checkAchievements();

    // Trigger visual transitions overlay after slight board pause
    setTimeout(() => {
      this.displayMatchOverScreen(battleLogOutcome, xpGained, leveledUp, themeUnlocksText, achievementsUnlockedList, trophyGained, dailyChallengeUnlocked);
    }, 1200);
  }

  displayMatchOverScreen(outcome, xpGained, leveledUp, themeUnlocksText, achievementsUnlockedList, trophyGained, dailyChallengeUnlocked) {
    this.changeScreen('screen-game-over');
    
    const resultTitle = document.getElementById("match-result-title");
    const resultSubtitle = document.getElementById("match-result-subtitle");
    const rewardGraphic = document.getElementById("reward-graphic");
    
    resultTitle.className = "result-title animate-glow";
    
    if (outcome === 'win') {
      resultTitle.textContent = "VICTORY";
      resultTitle.classList.add('victory');
      resultSubtitle.textContent = "NEXUS DEFENSES BREACHED";
      rewardGraphic.innerHTML = `<svg viewBox="0 0 100 100" class="reward-svg-item"><use href="#icon-trophy"></use></svg>`;
      
      Sound.playSFX('victory');
      Particles.launchConfetti();
      Particles.launchFireworks();
      triggerMascotText('win');

      // Camera shake and full screen flash effects
      document.body.classList.add('shake-animation');
      setTimeout(() => document.body.classList.remove('shake-animation'), 500);
      
      // Inject flash element
      const flash = document.createElement('div');
      flash.className = 'flash-effect';
      document.body.appendChild(flash);
      setTimeout(() => flash.remove(), 1000);

    } else if (outcome === 'loss') {
      resultTitle.textContent = "DEFEAT";
      resultTitle.classList.add('defeat');
      resultSubtitle.textContent = "NEXUS SYSTEMS COMPROMISED";
      rewardGraphic.innerHTML = `
        <svg viewBox="0 0 100 100" class="reward-svg-item" style="color: #ff2600; filter: drop-shadow(0 0 10px #ff2600);">
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" stroke-width="4"/>
          <line x1="20" y1="20" x2="80" y2="80" stroke="currentColor" stroke-width="6"/>
          <line x1="80" y1="20" x2="20" y2="80" stroke="currentColor" stroke-width="6"/>
        </svg>
      `;
      Sound.playSFX('defeat');
      triggerMascotText('loss');
    } else {
      resultTitle.textContent = "STALEMATE";
      resultTitle.classList.add('draw');
      resultSubtitle.textContent = "SECURITY MATRIX IN EQUILIBRIUM";
      rewardGraphic.innerHTML = `
        <svg viewBox="0 0 100 100" class="reward-svg-item" style="color: var(--primary-glow);">
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" stroke-width="4"/>
          <line x1="15" y1="50" x2="85" y2="50" stroke="currentColor" stroke-width="4"/>
        </svg>
      `;
      Sound.playSFX('defeat');
      triggerMascotText('draw');
    }

    // Streak Text
    const streakCard = document.getElementById("game-over-streak-card");
    if (gameState.streak > 0) {
      streakCard.classList.remove("hidden");
      document.getElementById("game-over-streak-text").textContent = `${gameState.streak} Match Win Streak!`;
    } else {
      streakCard.classList.add("hidden");
    }

    // XP & Level Gained details animation loading
    document.getElementById("xp-earned-badge").textContent = `+${xpGained} XP`;
    if (trophyGained > 0) {
      document.getElementById("xp-earned-badge").textContent += ` | 🏆 +${trophyGained}`;
    }

    const xpNeeded = Progression.getXPNeeded(gameState.level);
    const xpPercent = (gameState.xp / xpNeeded) * 100;
    
    // Ticker progress animation
    const gameOverXpFill = document.getElementById("game-over-xp-fill");
    gameOverXpFill.style.width = '0%';
    setTimeout(() => {
      gameOverXpFill.style.width = `${xpPercent}%`;
    }, 200);

    document.getElementById("game-over-xp-text").textContent = `Lvl ${gameState.level} | ${gameState.xp} / ${xpNeeded} XP`;

    // Leveled Up trigger notifications
    const levelUpBadge = document.getElementById("game-over-level-up-badge");
    if (leveledUp) {
      levelUpBadge.classList.remove('hidden');
      Sound.playSFX('levelUp');
      triggerMascotText('levelUp');
    } else {
      levelUpBadge.classList.add('hidden');
    }

    // Display theme or achievement unlocks
    const unlocksFeed = document.getElementById("game-over-unlocks");
    const unlocksText = document.getElementById("game-over-unlock-text");
    
    let unlockedItemsList = [];
    if (themeUnlocksText) unlockedItemsList.push(themeUnlocksText);
    if (achievementsUnlockedList.length > 0) {
      achievementsUnlockedList.forEach(ach => unlockedItemsList.push(`ACHIEVEMENT: ${ach.name}`));
    }
    if (dailyChallengeUnlocked) unlockedItemsList.push("DAILY CHALLENGE COMPLETED (+100 XP)");

    if (unlockedItemsList.length > 0) {
      unlocksFeed.classList.remove('hidden');
      unlocksText.textContent = unlockedItemsList.join(" | ");
      Sound.playSFX('achievement');
    } else {
      unlocksFeed.classList.add('hidden');
    }

    saveGameState();
  }

  renderProfileDrawer() {
    document.getElementById("input-username").value = gameState.username;
    
    // 1. Populate custom avatars grid selector
    const avatars = [
      { id: "avatar-cyber-punk", name: "Cyberpunk" },
      { id: "avatar-galaxy-mage", name: "Galaxy Mage" },
      { id: "avatar-pixel-bot", name: "Pixel Bot" },
      { id: "avatar-lava-beast", name: "Lava Beast" }
    ];

    const avGrid = document.getElementById("avatar-grid");
    avGrid.innerHTML = '';
    avatars.forEach(av => {
      const frame = document.createElement('div');
      const isLocked = !gameState.unlockedAvatars.includes(av.id);
      frame.className = `select-item-frame ${gameState.avatar === av.id ? 'selected' : ''} ${isLocked ? 'locked' : ''}`;
      frame.innerHTML = `<svg viewBox="0 0 100 100"><use href="#${av.id}"></use></svg>`;
      
      if (!isLocked) {
        frame.addEventListener('click', () => {
          gameState.avatar = av.id;
          Progression.checkAchievements(); // check change profile achievement
          saveGameState();
          this.renderMenuHeader();
          this.renderProfileDrawer();
        });
      }
      avGrid.appendChild(frame);
    });

    // 2. Populate custom borders grid selector
    const borders = [
      { id: "bronze", name: "Bronze" },
      { id: "silver", name: "Silver" },
      { id: "gold", name: "Gold" },
      { id: "champion", name: "Champion" },
      { id: "neon", name: "Neon Cyan" },
      { id: "galaxy", name: "Nebula Violet" },
      { id: "volcano", name: "Magma Red" },
      { id: "crystal", name: "Frost Blue" }
    ];

    const borderGrid = document.getElementById("borders-grid");
    borderGrid.innerHTML = '';
    borders.forEach(b => {
      const frame = document.createElement('div');
      const isLocked = !gameState.unlockedBorders.includes(b.id);
      frame.className = `select-item-frame ${gameState.border === b.id ? 'selected' : ''} ${isLocked ? 'locked' : ''}`;
      frame.innerHTML = `<div class="border-ring-selector ${b.id}"></div>`;
      
      if (!isLocked) {
        frame.addEventListener('click', () => {
          gameState.border = b.id;
          Progression.checkAchievements();
          saveGameState();
          this.renderMenuHeader();
          this.renderProfileDrawer();
        });
      }
      borderGrid.appendChild(frame);
    });

    // 3. Populate theme swapper list
    const themes = [
      { id: "cyber-neon", name: "CYBER NEON" },
      { id: "galaxy", name: "GALAXY SPACE" },
      { id: "arcade", name: "RETRO ARCADE" },
      { id: "space-arena", name: "SPACE ARENA" },
      { id: "crystal", name: "DIAMOND CRYSTAL" },
      { id: "volcano", name: "MAGMA VOLCANO" },
      { id: "ocean", name: "DEEP AQUATIC" },
      { id: "royal-gold", name: "ROYAL GOLD" }
    ];

    const thGrid = document.getElementById("themes-list-grid");
    thGrid.innerHTML = '';
    themes.forEach(theme => {
      const btn = document.createElement('button');
      const isLocked = !gameState.unlockedThemes.includes(theme.id);
      btn.className = `btn-theme-swapper ${gameState.theme === theme.id ? 'selected' : ''} ${isLocked ? 'locked' : ''}`;
      
      if (isLocked) {
        btn.innerHTML = `<span>${theme.name}</span> <span class="theme-lock-badge">LOCKED</span>`;
      } else {
        btn.innerHTML = `<span>${theme.name}</span>`;
        btn.addEventListener('click', () => {
          this.applyTheme(theme.id);
          this.renderProfileDrawer();
          this.renderMenuHeader();
        });
      }
      thGrid.appendChild(btn);
    });

    // 4. Populate Trophy shelf case
    const achievements = [
      { id: "first_win", name: "Nexus Trophy", type: "gold-cup" },
      { id: "medium_tamer", name: "Tamer Medal", type: "silver-medal" },
      { id: "hard_slayer", name: "Slayer Crest", type: "ruby-heart" },
      { id: "impossible_breaker", name: "Impossible Ring", type: "champion" }
    ];

    const trophyGrid = document.getElementById("trophy-shelf-grid");
    trophyGrid.innerHTML = '';
    achievements.forEach(ach => {
      const shelfItem = document.createElement('div');
      const isLocked = !gameState.unlockedAchievements.includes(ach.id);
      shelfItem.className = `trophy-item ${ach.type} ${isLocked ? 'locked' : ''}`;
      shelfItem.innerHTML = `
        <svg viewBox="0 0 100 100" class="trophy-icon-shelf"><use href="#icon-trophy"></use></svg>
        <span class="trophy-title">${ach.name}</span>
      `;
      trophyGrid.appendChild(shelfItem);
    });
  }

  renderAchievementsGrid() {
    const list = [
      { id: "first_win", name: "First Nexus", desc: "Win your first combat match", xp: 50 },
      { id: "medium_tamer", name: "AI Tamer", desc: "Win vs Medium AI", xp: 75 },
      { id: "hard_slayer", name: "Legendary Warrior", desc: "Win vs Hard AI", xp: 100 },
      { id: "impossible_breaker", name: "Matrix Breaker", desc: "Win vs Impossible AI (Defeat calculations)", xp: 200 },
      { id: "streak_3", name: "Fire Starter", desc: "Reach a 3 match win streak", xp: 80 },
      { id: "streak_5", name: "Supernova", desc: "Reach a 5 match win streak", xp: 150 },
      { id: "collector", name: "Grand Collector", desc: "Modify username, avatar frame and border", xp: 100 },
      { id: "explorer", name: "Multiverse Explorer", desc: "Play matches on 5 different themes", xp: 120 }
    ];

    const container = document.getElementById("achievements-container");
    container.innerHTML = '';

    list.forEach(ach => {
      const isCompleted = gameState.unlockedAchievements.includes(ach.id);
      
      const card = document.createElement('div');
      card.className = `achievement-row-card ${isCompleted ? 'completed' : ''}`;
      
      card.innerHTML = `
        <div class="achievement-icon-wrapper">${isCompleted ? '🏅' : '🔒'}</div>
        <div class="achievement-info">
          <h3>${ach.name.toUpperCase()}</h3>
          <p>${ach.desc}</p>
          <div class="achievement-progress-row">
            <div class="achievement-bar-container">
              <div class="achievement-bar-fill" style="width: ${isCompleted ? 100 : 0}%"></div>
            </div>
            <span class="achievement-num-text">${isCompleted ? '1/1' : '0/1'}</span>
          </div>
        </div>
        <div class="achievement-reward-tag">
          <span class="reward-tag-lbl">REWARD</span>
          <span class="reward-tag-val">+${ach.xp} XP</span>
        </div>
      `;
      container.appendChild(card);
    });
  }

  renderBattleLog() {
    const tbody = document.getElementById("battle-log-tbody");
    tbody.innerHTML = '';
    
    if (gameState.battleLog.length === 0) {
      document.getElementById("empty-log-warning").classList.remove('hidden');
      return;
    } else {
      document.getElementById("empty-log-warning").classList.add('hidden');
    }

    gameState.battleLog.forEach(log => {
      const row = document.createElement('tr');
      
      let outcomeClass = 'draw';
      if (log.outcome === 'win') outcomeClass = 'win';
      if (log.outcome === 'loss') outcomeClass = 'loss';

      row.innerHTML = `
        <td><b>${log.mode}</b></td>
        <td><span style="font-family: var(--font-title); font-size: 0.75rem;">${log.difficulty.toUpperCase()}</span></td>
        <td><span class="battle-outcome ${outcomeClass}">${log.outcome.toUpperCase()}</span></td>
        <td><span style="color: var(--primary-glow);">${log.theme.toUpperCase()}</span></td>
        <td style="opacity: 0.6; font-size: 0.75rem;">${log.date}</td>
      `;
      tbody.appendChild(row);
    });
  }
}

const UI = new UIController();

// --- INITIALIZATION ---
window.addEventListener('DOMContentLoaded', () => {
  loadGameState();
  Particles.init();
  UI.init();
});
