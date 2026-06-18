import React from 'react';
import { motion } from 'motion/react';
import { Trophy, RotateCcw, Award, Star, Flame } from 'lucide-react';
import { Team } from '../types';
import { DJNeonCat, CyberCat } from './NeonCats';

interface VictoryScreenProps {
  teams: Team[];
  onReset: () => void;
}

export default function VictoryScreen({ teams, onReset }: VictoryScreenProps) {
  // Find highest score teams
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
  const winner = sortedTeams[0];
  
  // Detect if there was any real tie
  const runnersUp = sortedTeams.slice(1);

  return (
    <div id="victory-screen" className="max-w-xl mx-auto text-center px-4 py-12 flex flex-col items-center justify-center min-h-[80vh]">
      
      {/* Decorative stars / ambient light */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Trophy Spotlight */}
      <div id="trophy-spotlight" className="relative mb-6 flex items-center justify-center gap-6">
        <div className="hidden sm:block">
          <CyberCat className="w-16 h-16" color="yellow" />
        </div>

        <div className="relative">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="absolute -inset-6 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 rounded-full opacity-35 blur-xl shrink-0"
          />
          
          {/* Animated bounce floating trophy */}
          <motion.div
            initial={{ scale: 0.2, y: 100, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 10, stiffness: 100, delay: 0.1 }}
            className="relative inline-flex items-center justify-center p-8 bg-slate-950 border-2 border-yellow-400 rounded-full shadow-xxl"
          >
            <Trophy className="w-16 h-16 text-yellow-400 fill-yellow-400/20" />
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
              className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 rounded-full p-2"
            >
              <Star className="w-4 h-4 fill-current text-white" />
            </motion.div>
          </motion.div>
        </div>

        <div className="hidden sm:block">
          <DJNeonCat className="w-16 h-16" />
        </div>
      </div>

      {/* Winning Announcement Card */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring' }}
        className="space-y-4 mb-8 relative z-10"
      >
        <span className="font-mono text-xs text-yellow-300 uppercase tracking-widest font-extrabold bg-white/10 px-4 py-1.5 rounded-full border border-white/20">
          🏆 CHAMPION CROWNED
        </span>
        <h1 className="font-display text-5xl sm:text-6xl font-black text-white leading-none uppercase italic tracking-tight">
          {winner.name.toUpperCase()}
        </h1>
        <p className="font-sans text-yellow-100/90 text-base sm:text-lg max-w-md mx-auto font-medium leading-relaxed">
          Dominating the arena with a spectacular score of <span className="text-yellow-300 font-black font-mono text-2xl drop-shadow">{winner.score}</span> points! This squad is crowned victorious.
        </p>
      </motion.div>

      {/* Grid Scoreboard Podium */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="w-full bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 mb-8 text-left space-y-4 relative z-10 shadow-xl"
      >
        <h3 className="font-display font-black text-white text-base uppercase tracking-wider flex items-center gap-2 border-b border-white/15 pb-3">
          <Award className="w-5 h-5 text-yellow-300" />
          Final Arena Standings
        </h3>

        <div className="space-y-3">
          {sortedTeams.map((team, idx) => (
            <div
              key={team.id}
              className={`p-4 rounded-xl flex items-center justify-between transition-all ${
                idx === 0 
                  ? 'bg-yellow-400/20 border-2 border-yellow-400 text-yellow-100 font-extrabold shadow-md' 
                  : 'bg-black/20 border border-white/10 text-white/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-black text-white/50 w-5">
                  #{idx + 1}
                </span>
                <div className={`w-3.5 h-3.5 rounded-full ${team.color} shadow-sm`} />
                <span className={`font-sans font-bold ${idx === 0 ? 'text-white' : ''}`}>
                  {team.name}
                </span>
              </div>
              <span className="font-mono font-black text-base">
                {team.score} pts
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Restart/Reset CTA */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="relative z-10"
      >
        <button
          id="btn-restart-game"
          onClick={onReset}
          className="px-10 py-4 rounded-2xl bg-yellow-400 hover:bg-yellow-500 text-indigo-950 font-display text-base font-black shadow-lg shadow-yellow-400/20 transition flex items-center gap-2.5 cursor-pointer uppercase italic tracking-wider"
        >
          <RotateCcw className="w-5 h-5 stroke-[3px]" />
          PLAY AGAIN / RESET GAME
        </button>
      </motion.div>

    </div>
  );
}
