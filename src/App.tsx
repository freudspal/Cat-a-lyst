import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, RefreshCw, Star, Info, Volume2, Award, FileText, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

import { defaultQuestions } from './data/defaultQuestions';
import { Team, Question, GamePhase } from './types';
import SetupScreen from './components/SetupScreen';
import QuestionModal from './components/QuestionModal';
import VictoryScreen from './components/VictoryScreen';
import { CyberCat, CosmicCat, DJNeonCat } from './components/NeonCats';

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [teams, setTeams] = useState<Team[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [gridCount, setGridCount] = useState<number>(12);

  // Confirm state for resetting (vypassing iframe window.confirm block)
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetTimeoutId, setResetTimeoutId] = useState<any>(null);

  const handleResetActivation = () => {
    if (confirmReset) {
      if (resetTimeoutId) clearTimeout(resetTimeoutId);
      setConfirmReset(false);
      setResetTimeoutId(null);
      handleResetGame();
    } else {
      setConfirmReset(true);
      const tId = setTimeout(() => {
        setConfirmReset(false);
      }, 4000);
      setResetTimeoutId(tId);
    }
  };

  // Gameplay state
  const [activeTeamIdx, setActiveTeamIdx] = useState<number>(0);
  const [clickedQuestions, setClickedQuestions] = useState<number[]>([]); // stores question.id of solved questions
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  
  // Tiebreaker state
  const [tiebreakerPool, setTiebreakerPool] = useState<Question[]>([]);
  const [currentTiebreakerIdx, setCurrentTiebreakerIdx] = useState<number>(0);
  const [tiedTeams, setTiedTeams] = useState<Team[]>([]);

  // Sound feedback states (simple visual indicators or mute)
  const [isMuted, setIsMuted] = useState(false);
  const [systemAlert, setSystemAlert] = useState<{ message: string; type: 'success' | 'info' | 'warn' } | null>(null);

  // Launching the game from Setup
  const handleStartGame = (configuredTeams: Team[], loadedQuestions: Question[], count: number) => {
    // Fisher-Yates shuffle the loaded questions to draw randomly to fill the grid,
    // and provide random backup questions for tiebreaker sudden-death
    const shuffledQuestions = [...loadedQuestions];
    for (let i = shuffledQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledQuestions[i], shuffledQuestions[j]] = [shuffledQuestions[j], shuffledQuestions[i]];
    }

    setTeams(configuredTeams);
    setQuestions(shuffledQuestions);
    setGridCount(count);
    
    // Reset gameplay state
    setActiveTeamIdx(0);
    setClickedQuestions([]);
    setSelectedQuestion(null);
    setPhase('playing');
    triggerAlert(`Game started! ${configuredTeams[0].name} goes first to pick a number!`, 'success');
  };

  const triggerAlert = (msg: string, type: 'success' | 'info' | 'warn' = 'info') => {
    setSystemAlert({ message: msg, type });
    setTimeout(() => {
      setSystemAlert(null);
    }, 4500);
  };

  // Turn management & Question resolution
  const handleQuestionSelect = (question: Question) => {
    if (clickedQuestions.includes(question.id)) return;
    setSelectedQuestion(question);
  };

  const handleAnswerResolved = (isCorrect: boolean, scoreChange: number) => {
    if (!selectedQuestion) return;

    // Adjust active team's score
    const updatedTeams = teams.map((team, idx) => {
      if (idx === activeTeamIdx) {
        // Prevent negative scores if we want to be nice? 
        // Guide: "if incorrect they will be deducted one point. then the game goes to the next team."
        // We will do literal subtraction, allowing negative values if they play poorly!
        const nextScore = team.score + scoreChange;
        return { ...team, score: nextScore };
      }
      return team;
    });

    setTeams(updatedTeams);
    
    // Add to clicked/solved list
    const updatedClicked = [...clickedQuestions, selectedQuestion.id];
    setClickedQuestions(updatedClicked);
    
    // Close modal
    setSelectedQuestion(null);

    // Provide helpful alert
    const activeTeamName = teams[activeTeamIdx].name;
    if (isCorrect) {
      triggerAlert(`${activeTeamName} answered CORRECTLY! +${scoreChange} points!`, 'success');
    } else {
      triggerAlert(`${activeTeamName} got it WRONG. Deducted 1 point!`, 'warn');
    }

    // Advance turn index
    const nextTeamIdx = (activeTeamIdx + 1) % teams.length;
    setActiveTeamIdx(nextTeamIdx);

    // Evaluate game-over condition (when all questions on the grid are exhausted)
    if (updatedClicked.length >= gridCount) {
      evaluateGameOver(updatedTeams);
    }
  };

  const evaluateGameOver = (currentTeams: Team[]) => {
    // 1. Calculate highest score
    const maxScore = Math.max(...currentTeams.map(t => t.score));
    // 2. See how many teams achieved this score
    const winningTeams = currentTeams.filter(t => t.score === maxScore);

    if (winningTeams.length === 1) {
      // Direct Winner!
      triggerAlert(`A clear winner emerges: ${winningTeams[0].name}!`, 'success');
      setTimeout(() => {
        setPhase('victory');
      }, 1500);
    } else {
      // Tie breaker phase
      setTiedTeams(winningTeams);
      
      // Load remaining questions from pool that were NOT in the grid
      const gridIds = questions.slice(0, gridCount).map(q => q.id);
      const remainingUnused = questions.filter(q => !gridIds.includes(q.id));
      
      setTiebreakerPool(remainingUnused.length > 0 ? remainingUnused : questions);
      setCurrentTiebreakerIdx(0);
      
      triggerAlert("It's a TIE! Sudden death tiebreaker round activated!", 'warn');
      setTimeout(() => {
        setPhase('tiebreaker');
      }, 1500);
    }
  };

  // Award points in Suddent Death Tiebreaker
  const resolveTiebreakerWinner = (winnerTeamId: number) => {
    const finalTeams = teams.map((team) => {
      if (team.id === winnerTeamId) {
        return { ...team, score: team.score + 1 }; // Award small edge point to break tie
      }
      return team;
    });
    setTeams(finalTeams);
    triggerAlert("Tiebreaker resolved. Champion crowned!", 'success');
    setPhase('victory');
  };

  const handleNextTiebreakerQuestion = () => {
    if (currentTiebreakerIdx + 1 < tiebreakerPool.length) {
      setCurrentTiebreakerIdx(currentTiebreakerIdx + 1);
      triggerAlert("New sudden death challenge loaded!", 'info');
    } else {
      triggerAlert("Used all unused backup questions. Restarting pool list.", 'warn');
      setCurrentTiebreakerIdx(0);
    }
  };

  const handleResetGame = () => {
    setPhase('setup');
    setTeams([]);
    setClickedQuestions([]);
    setSelectedQuestion(null);
  };

  return (
    <div id="trivia-app-root" className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white select-none">
      
      {/* Alert Banner overlays */}
      <div className="fixed top-4 right-4 z-50 pointer-events-none max-w-sm w-full space-y-2">
        <AnimatePresence>
          {systemAlert && (
            <motion.div
              id="alert-banner"
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className={`p-4 rounded-xl border-l-4 shadow-xl flex items-start gap-3 backdrop-blur-md ${
                systemAlert.type === 'success'
                  ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
                  : systemAlert.type === 'warn'
                  ? 'bg-rose-950/90 border-rose-500 text-rose-200'
                  : 'bg-indigo-950/90 border-indigo-500 text-indigo-200'
              }`}
            >
              <Zap className="w-5 h-5 shrink-0 animate-bounce" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider font-mono opacity-80">Announcement</p>
                <p className="text-sm font-medium leading-normal">{systemAlert.message}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Primary Top Header */}
      <header id="main-navigation" className="p-6 flex flex-col sm:flex-row justify-between items-center z-10 shrink-0 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-gradient-to-tr from-cyan-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/30 border-2 border-cyan-400">
            <CyberCat className="w-11 h-11" color="cyan" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase italic text-white leading-none">
              THE <span className="text-yellow-400">CAT-A-LYST</span>
            </h1>
            <span className="text-[10px] font-mono text-cyan-300 tracking-widest font-black uppercase flex items-center gap-1.5 mt-0.5">
              NEON TRIVIA ARENA <span className="animate-pulse">🐱⚡</span>
            </span>
          </div>
        </div>

        {phase !== 'setup' && (
          <div className="flex gap-4">
            <button
              id="btn-nav-quit"
              onClick={handleResetActivation}
              className={`px-5 py-2.5 rounded-xl text-sm font-black tracking-wide uppercase transition-all duration-200 cursor-pointer shadow-lg border ${
                confirmReset
                  ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/40 text-black border-yellow-300 animate-pulse'
                  : 'bg-red-500 hover:bg-red-600 shadow-red-500/30 text-white border-red-400/20'
              }`}
            >
              {confirmReset ? '⚠️ Tab to Confirm Reset' : 'Reset Game'}
            </button>
          </div>
        )}
      </header>

      {/* Main Container Content */}
      <main id="app-main-view" className="flex-grow flex flex-col justify-center relative overflow-hidden">
        <AnimatePresence mode="wait">
          
          {phase === 'setup' && (
            <motion.div
              key="setup-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="py-6"
            >
              <SetupScreen defaultQuestions={defaultQuestions} onStartGame={handleStartGame} />
            </motion.div>
          )}

          {phase === 'playing' && (
            <motion.div
              key="playing-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-6xl w-full mx-auto px-4 py-4 flex flex-col space-y-6"
            >
              
              {/* SQUADS SCOREBOARD ROW WITH TURN MARKQUE */}
              <div id="active-teams-dashboard" className="text-center">
                <span className="font-mono text-xs text-white/70 font-bold uppercase tracking-widest block mb-3">
                  ACTIVE SQUADS SCOREBOARD
                </span>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 justify-center">
                  {teams.map((team, idx) => {
                    const isActive = activeTeamIdx === idx;
                    
                    return (
                      <div
                        key={team.id}
                        id={`squad-card-${idx}`}
                        className={`relative rounded-2xl transition-all duration-300 ${
                          isActive 
                            ? 'bg-white/20 backdrop-blur-md p-4 border-4 border-yellow-400 shadow-[0_0_25px_rgba(250,204,21,0.5)] scale-[1.03]' 
                            : 'bg-white/10 backdrop-blur-sm p-4 border border-white/20 opacity-80 scale-95 hover:opacity-95'
                        }`}
                      >
                        {isActive && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-indigo-900 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest whitespace-nowrap">
                            Active Turn
                          </div>
                        )}

                        <div className="flex justify-between items-center h-full">
                          <div className="text-left">
                            <p className={`text-xs uppercase font-extrabold truncate max-w-[110px] ${isActive ? 'text-white' : 'text-white/50'}`}>
                              {team.name}
                            </p>
                            <h3 className="text-3xl font-black text-white">{team.score}</h3>
                          </div>
                          <div className="text-3xl shrink-0 ml-2">
                            {isActive ? '🔥' : '⭐'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CURRENT ACTION DECK INSTRUCTIONS */}
              <div id="playing-instructions" className="bg-white/10 backdrop-blur-sm border border-white/15 p-4 rounded-xl flex items-center justify-between gap-4 max-w-xl mx-auto shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-full bg-yellow-400 shrink-0 animate-pulse" />
                  <p className="text-sm font-sans font-medium text-white">
                    <span className="font-extrabold text-yellow-300 uppercase">{teams[activeTeamIdx].name}</span>, click any block below to reveal your question!
                  </p>
                </div>
              </div>

              {/* TRIVIA GRID NUMBERS CHANGER */}
              <div id="trivia-grid-card-display" className="p-6 bg-black/20 rounded-3xl border border-white/5 shadow-inner max-w-4xl mx-auto w-full">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {questions.slice(0, gridCount).map((q, idx) => {
                    const isSolved = clickedQuestions.includes(q.id);
                    
                    return (
                      <motion.button
                        key={q.id}
                        id={`grid-block-${q.id}`}
                        disabled={isSolved}
                        onClick={() => handleQuestionSelect(q)}
                        whileHover={!isSolved ? { scale: 1.05, y: -2, boxShadow: '0 8px 16px rgba(255,255,255,0.1)' } : {}}
                        whileTap={!isSolved ? { scale: 0.96 } : {}}
                        className={`aspect-video sm:aspect-square flex flex-col items-center justify-center rounded-xl font-display text-3xl font-black transition-all border-2 cursor-pointer relative overflow-hidden ${
                          isSolved
                            ? 'bg-green-500 border-white/10 text-white shadow-inner opacity-75'
                            : 'bg-indigo-500/40 hover:bg-indigo-400 border-white/10 text-white hover:text-white hover:border-white shadow-lg'
                        }`}
                      >
                        {isSolved ? (
                          <span className="text-3xl font-black">✓</span>
                        ) : (
                          <span className="text-3xl font-black">
                            {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

            </motion.div>
          )}

          {phase === 'tiebreaker' && (
            <motion.div
              key="tiebreaker-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl w-full mx-auto px-4 py-8 text-center space-y-8"
            >
              
              {/* Header tiebreaker warning */}
              <div className="p-6 bg-rose-500/10 border-2 border-rose-500/30 rounded-2xl">
                <span className="font-mono text-xs font-bold text-rose-400 bg-rose-400/10 border border-rose-400/20 px-3 py-1 rounded-full uppercase tracking-wider block w-max mx-auto mb-3">
                  SUDDEN DEATH TIEBREAKER
                </span>
                <h2 className="font-display text-2xl font-black text-rose-300">
                  Who Answers First Wins!
                </h2>
                <p className="text-sm text-gray-400 max-w-md mx-auto mt-2 leading-relaxed">
                  The scores are tied! We have loaded a sudden death question. No turn cycles apply—the first tied team to answer correctly wins the trophy!
                </p>
              </div>

              {/* Tied Teams Display */}
              <div id="tied-squads-panel" className="flex flex-wrap items-center justify-center gap-3">
                {tiedTeams.map((team) => (
                  <div
                    key={team.id}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2"
                  >
                    <div className={`w-3 h-3 rounded-full ${team.color} shrink-0 animate-pulse`} />
                    <span className="font-display text-sm font-bold text-white uppercase">{team.name}</span>
                    <span className="font-mono text-xs text-gray-400">({team.score} pts)</span>
                  </div>
                ))}
              </div>

              {/* The Tiebreaker Question card */}
              {tiebreakerPool.length > 0 && tiebreakerPool[currentTiebreakerIdx] && (
                <div id="tiebreaker-card" className="bg-slate-950 p-6 sm:p-8 rounded-2xl border border-slate-800 text-left space-y-6 shadow-xl shadow-black/50">
                  <span className="font-mono text-[10px] text-indigo-400 uppercase tracking-widest font-bold bg-indigo-505/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
                    Category: {tiebreakerPool[currentTiebreakerIdx].category || 'General'}
                  </span>
                  
                  <div className="space-y-1">
                    <p className="text-gray-500 font-mono text-xs uppercase tracking-wider">The Tiebreaker Prompt</p>
                    <p className="font-display text-xl sm:text-2xl font-extrabold text-white leading-relaxed">
                      {tiebreakerPool[currentTiebreakerIdx].question}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="font-mono text-xs text-indigo-400 uppercase tracking-wider font-bold block mb-1">Decisive Answer</span>
                    <p className="font-display font-extrabold text-white text-lg">
                      {tiebreakerPool[currentTiebreakerIdx].answer}
                    </p>
                  </div>

                  {/* Winner allocation buttons */}
                  <div className="space-y-4 pt-4 border-t border-slate-900">
                    <p className="text-xs text-center text-gray-400 font-semibold uppercase tracking-wider">
                      Click the team that buzzed and answered correctly:
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 justify-center">
                      {tiedTeams.map((team) => (
                        <button
                          key={team.id}
                          id={`btn-tiebreaker-winner-${team.id}`}
                          onClick={() => resolveTiebreakerWinner(team.id)}
                          className={`w-full px-5 py-3.5 rounded-xl border font-display text-sm font-black tracking-wide text-white transition cursor-pointer hover:shadow-lg hover:shadow-black/20 text-center ${team.color}`}
                        >
                          🎉 AWARD TO {team.name.toUpperCase()}!
                        </button>
                      ))}
                    </div>

                    <div className="text-center pt-2">
                      <button
                        id="btn-tiebreaker-next-q"
                        onClick={handleNextTiebreakerQuestion}
                        className="text-xs text-gray-500 hover:text-gray-300 font-bold border-b border-transparent hover:border-gray-500 py-0.5 transition"
                      >
                        Nobody got it? Get Another Question
                      </button>
                    </div>
                  </div>

                </div>
              )}

            </motion.div>
          )}

          {phase === 'victory' && (
            <motion.div
              key="victory-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <VictoryScreen teams={teams} onReset={handleResetGame} />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Embedded Active Question Modal Overlay */}
      <AnimatePresence>
        {selectedQuestion && (
          <QuestionModal
            question={selectedQuestion}
            activeTeam={teams[activeTeamIdx]}
            onAnswerResolved={handleAnswerResolved}
            onDismiss={() => setSelectedQuestion(null)}
          />
        )}
      </AnimatePresence>

      {/* Bottom Bar Info */}
      <footer id="main-footer" className="p-5 mt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center text-sm font-bold text-white/60 gap-4">
        <p>{gridCount - clickedQuestions.length} QUESTIONS REMAINING</p>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-full"></div> DONE</span>
          <span className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full"></div> FAILED</span>
          <span className="flex items-center gap-2"><div className="w-3 h-3 bg-indigo-500 rounded-full"></div> PENDING</span>
        </div>
        <p>DATABASE: {questions === defaultQuestions ? "DEFAULT_SCIENCE_STARS" : "CUSTOM_UPLOAD.XLSX"}</p>
      </footer>

    </div>
  );
}
