import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, Eye, Lightbulb, Check, X, Award, AlertTriangle, ArrowRight } from 'lucide-react';
import { Question, Team } from '../types';

interface QuestionModalProps {
  question: Question;
  activeTeam: Team;
  onAnswerResolved: (isCorrect: boolean, pointsAwarded: number) => void;
  onDismiss: () => void;
}

export default function QuestionModal({ question, activeTeam, onAnswerResolved, onDismiss }: QuestionModalProps) {
  const [showTip, setShowTip] = useState(false);
  const [checked, setChecked] = useState(false);
  
  // Scoring rules
  const pointsAvailable = showTip ? 1 : 2;

  const handleCorrect = () => {
    // Correct gets either 2 points or 1 point if tip was viewed
    onAnswerResolved(true, pointsAvailable);
  };

  const handleIncorrect = () => {
    // Incorrect deducts 1 point (handled as -1)
    onAnswerResolved(false, -1);
  };

  return (
    <div id="question-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-950/90 backdrop-blur-lg">
      <motion.div
        id="question-modal-card"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: -20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="w-full max-w-2xl bg-white text-indigo-950 rounded-[2rem] p-8 sm:p-10 flex flex-col items-center text-center shadow-2xl relative border-8 border-yellow-400"
      >
        
        {/* Modal Header Badge */}
        <div id="modal-header-badge" className="absolute -top-6 bg-indigo-600 text-white px-8 py-2.5 rounded-full font-black text-xs sm:text-sm uppercase tracking-widest shadow-xl flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
          <span>{activeTeam.name}&apos;S TURN</span>
        </div>

        {/* Content Area */}
        <div id="modal-body" className="w-full space-y-6 pt-4 flex flex-col items-center">
          
          {/* Question Category Tag */}
          {question.category && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-700 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              {question.category}
            </div>
          )}

          {/* Worth Indicator */}
          <div className="text-xs font-mono font-black text-indigo-400 uppercase tracking-widest">
            VALUE: {pointsAvailable} {pointsAvailable === 1 ? 'Point' : 'Points'}
          </div>

          {/* Question Text */}
          <div className="space-y-1 text-center w-full max-w-xl">
            <h3 className="font-mono text-[10px] text-gray-400 uppercase tracking-widest font-bold">The Challenge</h3>
            <p className="font-display text-2xl sm:text-3xl font-black text-indigo-950 leading-relaxed">
              {question.question}
            </p>
          </div>

          {/* Tip Section */}
          <div id="tip-section" className="pt-2 w-full">
            <AnimatePresence mode="wait">
              {!showTip ? (
                <motion.button
                  key="show-tip"
                  id="btn-reveal-tip"
                  onClick={() => setShowTip(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-sm font-black border border-amber-200 transition cursor-pointer mx-auto shadow-sm"
                >
                  <Lightbulb className="w-4 h-4 fill-amber-300" />
                  Need a Tip? (Uses 1 Point)
                </motion.button>
              ) : (
                <motion.div
                  key="tip-content"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex gap-2.5 max-w-md mx-auto text-left shadow-sm"
                >
                  <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-[10px] uppercase tracking-wider text-amber-700 font-mono mb-0.5">HINT / TIP IS ACTIVE</span>
                    {question.tip}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Divider line */}
          <div className="border-t border-indigo-100 w-full my-2" />

          {/* Master Checking Panel */}
          <div className="w-full">
            <AnimatePresence mode="wait">
              {!checked ? (
                <motion.div
                  key="checking-trigger"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="pt-2 w-full text-center"
                >
                  <button
                    id="btn-reveal-answer"
                    onClick={() => setChecked(true)}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-display text-base font-black shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer mx-auto focus:outline-none"
                  >
                    <Eye className="w-5 h-5" />
                    CHECK CORRECTNESS
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="outcome-controls"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 w-full"
                >
                  {/* Correct Answer Display */}
                  <div id="answer-reveal" className="p-5 rounded-2xl bg-indigo-50 border border-indigo-100 text-center w-full max-w-md mx-auto shadow-sm">
                    <span className="font-mono text-[10px] text-indigo-500 uppercase tracking-wilder font-black block mb-1">Answer Key</span>
                    <p className="font-display text-2xl font-black text-indigo-950">{question.answer}</p>
                  </div>

                  <div className="text-center w-full pt-2">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-4">Did {activeTeam.name} answer correctly?</p>
                    <div className="flex flex-col sm:flex-row items-stretch justify-center gap-4 max-w-md mx-auto">
                      
                      {/* Correct is clicked */}
                      <button
                        key="btn-correct"
                        id="btn-confirm-correct"
                        onClick={handleCorrect}
                        className="flex-grow bg-emerald-500 hover:bg-emerald-600 text-white py-4 px-6 rounded-2xl font-black shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer transition focus:outline-none"
                      >
                        <Check className="w-5 h-5 stroke-[3px]" />
                        Correct (+{pointsAvailable})
                      </button>

                      {/* Incorrect is clicked */}
                      <button
                        key="btn-incorrect"
                        id="btn-confirm-incorrect"
                        onClick={handleIncorrect}
                        className="flex-grow bg-rose-500 hover:bg-rose-600 text-white py-4 px-6 rounded-2xl font-black shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer transition focus:outline-none"
                      >
                        <X className="w-5 h-5 stroke-[3px]" />
                        Incorrect (-1)
                      </button>

                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </motion.div>
    </div>
  );
}
