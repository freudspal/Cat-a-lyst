import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, ChevronLeft, ChevronRight, Crown, Flame, 
  Plus, Minus, ArrowUpDown, Sparkles
} from 'lucide-react';
import { Team } from '../types';

interface SideScoresPanelProps {
  teams: Team[];
  activeTeamIdx: number;
  onScoreAdjust?: (teamId: number, delta: number) => void;
}

export default function SideScoresPanel({
  teams,
  activeTeamIdx,
  onScoreAdjust
}: SideScoresPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [sortByRank, setSortByRank] = useState<boolean>(false);

  // Compute sorted teams if sorted by rank, else keep original order
  const displayTeams = [...teams].map((team, originalIdx) => ({
    ...team,
    originalIdx
  }));

  if (sortByRank) {
    displayTeams.sort((a, b) => b.score - a.score);
  }

  // Find the highest score to identify leaders
  const highestScore = Math.max(...teams.map(t => t.score));

  return (
    <aside
      id="side-scores-preview-panel"
      aria-label="Current Squad Scores Preview"
      className="fixed left-2 sm:left-4 top-1/2 -translate-y-1/2 z-[60] flex items-center select-none"
    >
      <AnimatePresence mode="wait">
        {!isCollapsed ? (
          <motion.div
            key="side-panel-expanded"
            initial={{ opacity: 0, x: -30, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="w-64 sm:w-72 bg-slate-950/90 backdrop-blur-xl border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.6)] rounded-2xl p-3.5 sm:p-4 flex flex-col gap-3 text-slate-100"
          >
            {/* Header with Title and Collapse toggle */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-yellow-400/20 text-yellow-300 border border-yellow-400/30">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-black text-xs uppercase tracking-wider text-white flex items-center gap-1.5">
                    Squad Scores
                  </h3>
                  <span className="text-[10px] text-cyan-300 font-mono font-bold uppercase tracking-wider">
                    {teams.length} Active Squads
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Sort Toggle */}
                <button
                  type="button"
                  onClick={() => setSortByRank(!sortByRank)}
                  title={sortByRank ? "Switch to Turn Order" : "Switch to Ranked by Score"}
                  className={`p-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1 ${
                    sortByRank
                      ? 'bg-yellow-400/20 border-yellow-400/40 text-yellow-300'
                      : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  <ArrowUpDown className="w-3 h-3" />
                  <span className="hidden sm:inline">{sortByRank ? "Rank" : "Turn"}</span>
                </button>

                {/* Collapse Button */}
                <button
                  id="btn-collapse-side-scores"
                  type="button"
                  onClick={() => setIsCollapsed(true)}
                  title="Collapse Scoreboard"
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-white/70 hover:text-white transition cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Squads List */}
            <div className="space-y-2 max-h-[58vh] overflow-y-auto pr-1">
              {displayTeams.map((team, rankIdx) => {
                const isActive = team.originalIdx === activeTeamIdx;
                const isLeader = team.score === highestScore && highestScore > 0;

                return (
                  <motion.div
                    key={team.id}
                    layout
                    id={`side-score-team-${team.id}`}
                    className={`relative rounded-xl p-2.5 transition-all duration-200 border flex items-center justify-between gap-2.5 ${
                      isActive
                        ? 'bg-white/15 border-yellow-400/90 shadow-[0_0_20px_rgba(250,204,21,0.35)] ring-1 ring-yellow-400/50'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {/* Active turn badge banner */}
                    {isActive && (
                      <span className="absolute -top-2 right-3 bg-yellow-400 text-indigo-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1">
                        <Flame className="w-2.5 h-2.5 fill-indigo-950" />
                        Turn
                      </span>
                    )}

                    {/* Left side: Color swatch + Rank + Name */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Color indicator swatch */}
                      <div
                        title={`Squad color`}
                        className={`w-3.5 h-7 rounded-md shrink-0 ${team.color} shadow-md border border-white/30`}
                      />

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          {/* Leader Crown or Rank tag */}
                          {isLeader ? (
                            <Crown className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
                          ) : (
                            <span className="text-[10px] font-mono font-bold text-white/40">
                              #{rankIdx + 1}
                            </span>
                          )}

                          <p
                            className={`text-xs font-bold truncate max-w-[105px] sm:max-w-[125px] ${
                              isActive ? 'text-yellow-200 font-black' : 'text-white'
                            }`}
                            title={team.name}
                          >
                            {team.name}
                          </p>
                        </div>
                        <span className="text-[9px] font-mono text-cyan-300/80 uppercase block tracking-wider">
                          Squad {team.originalIdx + 1}
                        </span>
                      </div>
                    </div>

                    {/* Right side: Score and optional Quick Adjust */}
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Quick Adjust buttons (only if handler provided) */}
                      {onScoreAdjust && (
                        <div className="flex flex-col gap-0.5 opacity-60 hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => onScoreAdjust(team.id, 1)}
                            title="Add 1 pt"
                            className="p-0.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 rounded cursor-pointer"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onScoreAdjust(team.id, -1)}
                            title="Deduct 1 pt"
                            className="p-0.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 rounded cursor-pointer"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      )}

                      {/* Prominent Score */}
                      <div className="text-right pl-1">
                        <span
                          className={`font-display text-lg sm:text-xl font-black block leading-none ${
                            team.score > 0
                              ? 'text-yellow-300'
                              : team.score < 0
                              ? 'text-rose-400'
                              : 'text-white/80'
                          }`}
                        >
                          {team.score}
                        </span>
                        <span className="text-[8px] font-mono text-white/40 uppercase tracking-wider block">
                          PTS
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Micro footer hint */}
            <div className="text-[9px] font-mono text-center text-white/40 border-t border-white/5 pt-1.5 flex items-center justify-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-yellow-300" />
              <span>Real-time Battlefield Scores</span>
            </div>
          </motion.div>
        ) : (
          /* Collapsed Mini Sidebar */
          <motion.div
            key="side-panel-collapsed"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-slate-950/90 backdrop-blur-xl border border-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.6)] rounded-2xl p-2 flex flex-col items-center gap-2 text-slate-100"
          >
            {/* Expand Toggle */}
            <button
              id="btn-expand-side-scores"
              type="button"
              onClick={() => setIsCollapsed(false)}
              title="Expand Squad Scores"
              className="p-2 rounded-xl bg-yellow-400 text-indigo-950 hover:bg-yellow-300 transition shadow-md cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Vertical stack of compact team chips */}
            <div className="space-y-2 py-1">
              {teams.map((team, idx) => {
                const isActive = idx === activeTeamIdx;
                return (
                  <button
                    key={team.id}
                    type="button"
                    onClick={() => setIsCollapsed(false)}
                    title={`${team.name}: ${team.score} pts ${isActive ? '(Active Turn)' : ''}`}
                    className={`relative w-8 h-10 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer border ${
                      isActive
                        ? 'border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.6)] scale-110 z-10'
                        : 'border-white/10 hover:border-white/30'
                    } ${team.color}`}
                  >
                    {isActive && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-yellow-300 border border-indigo-950 animate-ping" />
                    )}
                    <span className="font-display text-xs font-black text-white drop-shadow-md">
                      {team.score}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}
