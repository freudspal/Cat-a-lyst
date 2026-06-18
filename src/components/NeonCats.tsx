import React from 'react';
import { motion } from 'motion/react';

// Neon drop-shadow classes or custom style
const glowStyleCyan = { filter: 'drop-shadow(0 0 8px rgba(34, 211, 238, 0.8))' };
const glowStyleMagenta = { filter: 'drop-shadow(0 0 8px rgba(236, 72, 153, 0.8))' };
const glowStyleYellow = { filter: 'drop-shadow(0 0 8px rgba(250, 204, 21, 0.8))' };
const glowStyleGreen = { filter: 'drop-shadow(0 0 8px rgba(52, 211, 153, 0.8))' };

export function CyberCat({ className = "w-16 h-16", color = "cyan" }: { className?: string; color?: 'cyan' | 'magenta' | 'yellow' | 'green' }) {
  const glow = color === 'cyan' ? glowStyleCyan : color === 'magenta' ? glowStyleMagenta : color === 'yellow' ? glowStyleYellow : glowStyleGreen;
  const strokeColor = color === 'cyan' ? '#22d3ee' : color === 'magenta' ? '#ec4899' : color === 'yellow' ? '#facc15' : '#34d399';

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className={className}
      style={glow}
      animate={{
        y: [0, -5, 0],
        scale: [1, 1.02, 1],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {/* Cat head outline */}
      <path
        d="M20 30 L32 15 L45 32 L55 32 L68 15 L80 30 L85 65 L70 85 L30 85 L15 65 Z"
        fill="rgba(15, 23, 42, 0.8)"
        stroke={strokeColor}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Cyber Glasses / Visor */}
      <polygon
        points="22,42 78,42 74,56 26,56"
        fill="rgba(236, 72, 153, 0.3)"
        stroke="#ec4899"
        strokeWidth="2.5"
      />
      <line x1="22" y1="49" x2="78" y2="49" stroke="#ec4899" strokeWidth="1.5" strokeDasharray="3 2" />
      
      {/* Cat nose */}
      <polygon points="46,65 54,65 50,71" fill={strokeColor} />

      {/* Cyber Whiskers */}
      <line x1="18" y1="65" x2="2" y2="60" stroke={strokeColor} strokeWidth="2.5" />
      <line x1="18" y1="71" x2="3" y2="73" stroke={strokeColor} strokeWidth="2.5" />
      <line x1="82" y1="65" x2="98" y2="60" stroke={strokeColor} strokeWidth="2.5" />
      <line x1="82" y1="71" x2="97" y2="73" stroke={strokeColor} strokeWidth="2.5" />

      {/* Futuristic ear details */}
      <polygon points="26,27 33,18 39,28" fill="rgba(34, 211, 238, 0.2)" stroke="#22d3ee" strokeWidth="1" />
      <polygon points="74,27 67,18 61,28" fill="rgba(34, 211, 238, 0.2)" stroke="#22d3ee" strokeWidth="1" />
    </motion.svg>
  );
}

export function CosmicCat({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className={className}
      style={glowStyleMagenta}
      animate={{
        rotate: [0, 4, -4, 0],
        scale: [0.98, 1.03, 0.98],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {/* Outer alien cat skull silhouette */}
      <path
        d="M25 25 L35 8 L46 25 L54 25 L65 8 L75 25 L82 55 L75 80 Q50 95 25 80 L18 55 Z"
        fill="rgba(30, 27, 75, 0.9)"
        stroke="#ec4899"
        strokeWidth="3.5"
      />
      {/* Third Cosmic Eye */}
      <path
        d="M40 38 Q50 28 60 38 Q50 48 40 38 Z"
        fill="rgba(250, 204, 21, 0.2)"
        stroke="#facc15"
        strokeWidth="2.5"
      />
      <circle cx="50" cy="38" r="4" fill="#facc15" style={glowStyleYellow} />

      {/* Cyber eyes */}
      <path d="M28 50 L40 54" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" />
      <path d="M72 50 L60 54" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" />

      {/* Smile/glowing wires */}
      <path d="M42 68 Q50 74 58 68" fill="none" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" />

      {/* Cheek cyber implants */}
      <circle cx="28" cy="65" r="3" fill="#34d399" />
      <circle cx="72" cy="65" r="3" fill="#34d399" />
    </motion.svg>
  );
}

export function DJNeonCat({ className = "w-20 h-20" }: { className?: string }) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className={className}
      style={glowStyleYellow}
      animate={{
        y: [0, -6, 2, 0],
      }}
      transition={{
        duration: 2.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {/* Cat body & DJ decks */}
      <path
        d="M 15 35 L 28 12 L 40 32 L 60 32 L 72 12 L 85 35 L 85 75 L 15 75 Z"
        fill="rgba(15, 23, 42, 0.95)"
        stroke="#facc15"
        strokeWidth="3.5"
      />
      {/* Headphones */}
      <path
        d="M 10 45 Q 10 10 90 45"
        fill="none"
        stroke="#ec4899"
        strokeWidth="5"
        strokeLinecap="round"
        style={glowStyleMagenta}
      />
      {/* Earcups */}
      <rect x="5" y="40" width="12" height="18" rx="4" fill="#ec4899" />
      <rect x="83" y="40" width="12" height="18" rx="4" fill="#ec4899" />

      {/* Cool Neon Glasses */}
      <rect x="22" y="42" width="22" height="12" rx="3" fill="none" stroke="#22d3ee" strokeWidth="3" />
      <rect x="56" y="42" width="22" height="12" rx="3" fill="none" stroke="#22d3ee" strokeWidth="3" />
      <line x1="44" y1="48" x2="56" y2="48" stroke="#22d3ee" strokeWidth="3" />

      {/* LED equalizer pattern on cheeks */}
      <line x1="20" y1="64" x2="35" y2="64" stroke="#a855f7" strokeWidth="2" />
      <line x1="20" y1="68" x2="30" y2="68" stroke="#34d399" strokeWidth="2" />
      <line x1="80" y1="64" x2="65" y2="64" stroke="#a855f7" strokeWidth="2" />
      <line x1="80" y1="68" x2="70" y2="68" stroke="#34d399" strokeWidth="2" />

      {/* Smiling fangs */}
      <path d="M 45 61 Q 50 67 55 61" fill="none" stroke="#facc15" strokeWidth="2" />
      <polygon points="46,61 48,64 50,61" fill="#facc15" />
      <polygon points="54,61 52,64 50,61" fill="#facc15" />
    </motion.svg>
  );
}

export function DynamicCatBanner() {
  return (
    <div className="flex justify-center items-center gap-6 py-4 px-6 bg-black/40 border border-white/10 rounded-2xl max-w-lg mx-auto shadow-[0_0_20px_rgba(251,191,36,0.15)] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-pink-500/5 to-yellow-500/5 pointer-events-none" />
      <CyberCat className="w-14 h-14" color="cyan" />
      <CosmicCat className="w-14 h-14" />
      <DJNeonCat className="w-14 h-14" />
      <div className="text-left">
        <h4 className="text-sm font-black text-white tracking-widest uppercase italic">Cat-a-lyzed Matrix</h4>
        <p className="text-[10px] font-bold text-yellow-300 uppercase tracking-widest leading-none mt-1">Strobe level: CAT-TASTIC 🐱</p>
      </div>
    </div>
  );
}
