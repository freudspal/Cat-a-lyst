import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Download, Users, Play, Plus, Trash2, CheckCircle2, AlertCircle, FileSpreadsheet, Info } from 'lucide-react';
import { Team, Question } from '../types';
import { CyberCat, CosmicCat, DJNeonCat, DynamicCatBanner } from './NeonCats';

interface SetupScreenProps {
  defaultQuestions: Question[];
  onStartGame: (teams: Team[], questions: Question[], gridCount: number) => void;
}

const PRESET_COLORS = [
  { name: 'Sunset Orange', class: 'bg-gradient-to-br from-orange-500 to-red-600', text: 'text-orange-400', border: 'border-orange-500' },
  { name: 'Neon Emerald', class: 'bg-gradient-to-br from-emerald-400 to-teal-600', text: 'text-emerald-400', border: 'border-emerald-500' },
  { name: 'Vibrant Magenta', class: 'bg-gradient-to-br from-pink-500 to-rose-600', text: 'text-pink-400', border: 'border-pink-500' },
  { name: 'Ocean Cyan', class: 'bg-gradient-to-br from-cyan-400 to-blue-600', text: 'text-cyan-400', border: 'border-cyan-500' },
  { name: 'Royal Purple', class: 'bg-gradient-to-br from-purple-500 to-indigo-600', text: 'text-purple-400', border: 'border-purple-500' },
  { name: 'Cyber Amber', class: 'bg-gradient-to-br from-amber-400 to-orange-500', text: 'text-amber-400', border: 'border-amber-500' },
];

export default function SetupScreen({ defaultQuestions, onStartGame }: SetupScreenProps) {
  // Setup state
  const [numTeams, setNumTeams] = useState<number>(3);
  const [teamList, setTeamList] = useState<Team[]>([
    { id: 1, name: 'Team Alpha', score: 0, color: PRESET_COLORS[0].class },
    { id: 2, name: 'Team Beta', score: 0, color: PRESET_COLORS[1].class },
    { id: 3, name: 'Team Gamma', score: 0, color: PRESET_COLORS[4].class },
  ]);
  const [customQuestions, setCustomQuestions] = useState<Question[] | null>(null);
  const [gridSize, setGridSize] = useState<number>(12);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Sync team counts
  const handleNumTeamsChange = (count: number) => {
    setNumTeams(count);
    const newTeams: Team[] = [];
    for (let i = 0; i < count; i++) {
      if (teamList[i]) {
        newTeams.push(teamList[i]);
      } else {
        newTeams.push({
          id: i + 1,
          name: `Team ${String.fromCharCode(65 + i)}`,
          score: 0,
          color: PRESET_COLORS[i % PRESET_COLORS.length].class,
        });
      }
    }
    setTeamList(newTeams);
  };

  const updateTeamName = (index: number, name: string) => {
    const updated = [...teamList];
    updated[index].name = name;
    setTeamList(updated);
  };

  const updateTeamColor = (index: number, colorClass: string) => {
    const updated = [...teamList];
    updated[index].color = colorClass;
    setTeamList(updated);
  };

  // Parsed and validated questions
  const totalQuestionsAvailable = customQuestions ? customQuestions.length : defaultQuestions.length;

  // Handle excel parser
  const processExcelData = (data: ArrayBuffer) => {
    try {
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rawJson = XLSX.utils.sheet_to_json<any>(worksheet);

      if (!rawJson || rawJson.length === 0) {
        throw new Error("The Excel file seems to be empty.");
      }

      const parsedQuestions: Question[] = [];
      rawJson.forEach((row, index) => {
        // Handle case-insensitive keys
        const qKey = Object.keys(row).find(k => /question/i.test(k) || k.toLowerCase() === 'q');
        const aKey = Object.keys(row).find(k => /answer/i.test(k) || k.toLowerCase() === 'a');
        const tKey = Object.keys(row).find(k => /tip/i.test(k) || /hint/i.test(k) || k.toLowerCase() === 't');
        const cKey = Object.keys(row).find(k => /category/i.test(k) || k.toLowerCase() === 'c');

        const questionText = qKey ? String(row[qKey]).trim() : '';
        const answerText = aKey ? String(row[aKey]).trim() : '';
        const tipText = tKey ? String(row[tKey]).trim() : 'No tip available for this question!';
        const categoryText = cKey ? String(row[cKey]).trim() : 'General';

        if (questionText && answerText) {
          parsedQuestions.push({
            id: index + 1,
            question: questionText,
            answer: answerText,
            tip: tipText,
            category: categoryText,
          });
        }
      });

      if (parsedQuestions.length === 0) {
        throw new Error("Could not find valid 'Question' and 'Answer' columns. Please check your Excel layout.");
      }

      setCustomQuestions(parsedQuestions);
      // Auto-adjust grid size if total questions is smaller than selected
      if (gridSize > parsedQuestions.length) {
        setGridSize(Math.min(12, parsedQuestions.length));
      }
      setUploadSuccess(`Succesfully loaded ${parsedQuestions.length} custom questions from Excel!`);
      setUploadError(null);
    } catch (err: any) {
      setUploadError(err.message || "An error occurred while parsing the Excel file.");
      setUploadSuccess(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result instanceof ArrayBuffer) {
        processExcelData(event.target.result);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result instanceof ArrayBuffer) {
          processExcelData(event.target.result);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  // Download excel helper template
  const downloadTemplate = () => {
    const sampleData = [
      { Question: "What mineral is the hardest natural substance on Earth?", Answer: "Diamond", Tip: "It's made of pure carbon and popular in wedding rings.", Category: "Science" },
      { Question: "Which superhero is known as the 'Man of Steel'?", Answer: "Superman", Tip: "He is from the planet Krypton.", Category: "Pop Culture" },
      { Question: "How many bones are in an adult human body?", Answer: "206", Tip: "Babies are born with more, but they fuse together.", Category: "Science" },
      { Question: "Who is the main protagonist in the Legend of Zelda video game series?", Answer: "Link", Tip: "He wears green/blue and carries the Master Sword (not Zelda!).", Category: "Gaming" },
      { Question: "Which planet is closest to the Sun?", Answer: "Mercury", Tip: "It has a rocky surface and is named after the speedy Roman messenger god.", Category: "Space" }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Trivia Template");
    XLSX.writeFile(wb, "Trivia_Grid_Template.xlsx");
  };

  const handleResetQuestions = () => {
    setCustomQuestions(null);
    setUploadSuccess(null);
    setUploadError(null);
  };

  const handleStart = () => {
    const questions = customQuestions || defaultQuestions;
    onStartGame(teamList, questions, Math.min(gridSize, questions.length));
  };

  return (
    <div id="setup-screen-container" className="max-w-4xl mx-auto px-4 py-8">
      {/* Title Header */}
      <div id="setup-header" className="text-center mb-10 space-y-6">
        <div className="flex justify-center items-center gap-4">
          <CyberCat className="w-16 h-16 sm:w-20 sm:h-20" color="cyan" />
          <DJNeonCat className="w-20 h-20 sm:w-24 sm:h-24" />
          <CosmicCat className="w-16 h-16 sm:w-20 sm:h-20" />
        </div>
        <div>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-white mb-2 uppercase italic drop-shadow-[0_4px_12px_rgba(34,211,238,0.2)]">
            THE <span className="text-yellow-300">CAT-A-LYST</span>
          </h1>
          <p className="text-cyan-200 text-xs sm:text-sm font-mono uppercase tracking-widest font-black max-w-md mx-auto">
            🚀 NEON BATTLEFIELD MATRIX CAT EDITION ⚡
          </p>
        </div>
        <p className="text-yellow-100/80 text-sm sm:text-base max-w-xl mx-auto font-sans font-medium leading-relaxed bg-white/5 border border-white/10 p-4 rounded-xl shadow-inner">
          Prepare your squads, configure your grid, or upload your custom Excel sheets to launch into ultimate group battle cat-show action!
        </p>

        <DynamicCatBanner />
      </div>

      <div id="setup-form-grid" className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column: Team Customization (7 cols) */}
        <div id="team-setup-panel" className="md:col-span-7 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 flex flex-col space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="font-display text-xl font-bold text-white flex items-center gap-2 uppercase tracking-wide">
              <Users className="w-5 h-5 text-yellow-300" />
              Tune Your Squads
            </h2>
            <div className="flex bg-black/20 p-1 rounded-lg border border-white/10">
              {[2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  id={`btn-teams-${num}`}
                  type="button"
                  onClick={() => handleNumTeamsChange(num)}
                  className={`px-3 py-1 text-sm font-black rounded-md transition-all duration-200 ${
                    numTeams === num
                      ? 'bg-yellow-400 text-indigo-900 shadow-md'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Teams list input and color selector */}
          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2">
            <AnimatePresence initial={false}>
              {teamList.map((team, idx) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 rounded-xl bg-white/5 border border-white/15 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:border-white/30 transition shadow-inner"
                >
                  {/* Color blob indicator */}
                  <div className={`w-8 h-8 rounded-lg shrink-0 ${team.color} shadow-lg shadow-black/30`} />
                  
                  {/* Name Input */}
                  <div className="flex-grow w-full">
                    <label className="text-[10px] font-black text-yellow-300 uppercase tracking-widest mb-1 block">SQUAD {idx + 1}</label>
                    <input
                      id={`input-team-name-${idx}`}
                      type="text"
                      className="bg-black/30 border border-white/20 rounded-lg px-3 py-2 w-full text-white font-sans focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-300 font-bold placeholder-white/30"
                      value={team.name}
                      onChange={(e) => updateTeamName(idx, e.target.value)}
                      placeholder={`Team Name ${idx + 1}`}
                    />
                  </div>

                  {/* Colors select panel */}
                  <div className="flex flex-wrap gap-1.5 pt-2 sm:pt-0 shrink-0">
                    {PRESET_COLORS.map((color, colorIdx) => (
                      <button
                        key={colorIdx}
                        id={`btn-color-${idx}-${colorIdx}`}
                        type="button"
                        onClick={() => updateTeamColor(idx, color.class)}
                        className={`w-6 h-6 rounded-full transition-all focus:outline-none border-2 ${color.class} ${
                          team.color === color.class ? 'border-yellow-300 scale-125' : 'border-transparent hover:scale-110'
                        }`}
                        title={color.name}
                      />
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Excel Options & Grid Size (5 cols) */}
        <div id="game-options-panel" className="md:col-span-5 flex flex-col gap-6">
          
          {/* Excel Uploader Block */}
          <div id="excel-uploader" className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 flex flex-col space-y-4 shadow-xl">
            <h2 className="font-display text-xl font-bold text-white flex items-center gap-2 uppercase tracking-wide">
              <FileSpreadsheet className="w-5 h-5 text-yellow-300" />
              Trivia Database
            </h2>
            <p className="text-xs text-yellow-100/80 leading-relaxed font-sans font-medium">
              Play with our carefully curated loaded database, or drop an Excel spreadsheet (<code>.xlsx</code> / <code>.xls</code>) to upload custom challenges.
            </p>

            {/* Drag and Drop Zone */}
            <div
              id="drag-drop-zone"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                dragOver
                  ? 'border-yellow-300 bg-yellow-400/10 scale-[1.02]'
                  : 'border-white/20 bg-black/10 hover:border-white/40 hover:bg-black/20'
              }`}
            >
              <input
                id="excel-file-fileinput"
                type="file"
                className="hidden"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
              />
              <label htmlFor="excel-file-fileinput" className="cursor-pointer block">
                <Upload className="w-8 h-8 text-yellow-300 mx-auto mb-2" />
                <span className="text-sm font-extrabold text-white block">Choose Excel File</span>
                <span className="text-[10px] text-yellow-100/60 tracking-wider font-bold mt-1 block uppercase">Or drag and drop here</span>
              </label>
            </div>

            {/* Excel status feedback */}
            <AnimatePresence mode="wait">
              {uploadError && (
                <motion.div
                  id="excel-upload-error"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-start gap-2 bg-red-950/80 border border-red-500/40 text-red-100 p-3 rounded-lg text-xs"
                >
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block uppercase tracking-wider text-[10px]">Upload Failed</span>
                    {uploadError}
                  </div>
                </motion.div>
              )}

              {uploadSuccess && (
                <motion.div
                  id="excel-upload-success"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-start gap-2 bg-emerald-950/80 border border-emerald-500/40 text-emerald-100 p-3 rounded-lg text-xs"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="flex-grow">
                    <span className="font-bold block uppercase tracking-wider text-[10px]">Success!</span>
                    {uploadSuccess}
                  </div>
                  <button
                    id="btn-reset-questions"
                    type="button"
                    onClick={handleResetQuestions}
                    className="text-white bg-white/10 hover:bg-white/20 shrink-0 font-mono text-[10px] border border-white/20 rounded px-1.5 py-0.5"
                  >
                    Clear
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Guidelines & Download template */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <span className="text-xs text-yellow-100/60 font-medium">Need the format?</span>
              <button
                id="btn-download-template"
                type="button"
                onClick={downloadTemplate}
                className="text-xs text-yellow-300 hover:text-yellow-200 flex items-center gap-1 font-extrabold focus:outline-none transition"
              >
                <Download className="w-3.5 h-3.5 animate-bounce" />
                Get Template (.xlsx)
              </button>
            </div>
          </div>

          {/* Grid Settings Block */}
          <div id="grid-settings" className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 flex flex-col space-y-4 shadow-xl">
            <h2 className="font-display text-xl font-bold text-white flex items-center gap-2 uppercase tracking-wide">
              <Info className="w-5 h-5 text-yellow-300" />
              Grid Dimensions
            </h2>
            <p className="text-xs text-yellow-100/80 font-medium leading-relaxed">
              Customize the number of active numbered boxes shown in the battle arena. Total questions loaded: {totalQuestionsAvailable}.
            </p>

            <div className="grid grid-cols-3 gap-2">
              {[9, 12, 16, 20, 24, 30].map((size) => {
                const disabled = size > totalQuestionsAvailable;
                return (
                  <button
                    key={size}
                    id={`btn-gridsize-${size}`}
                    type="button"
                    disabled={disabled}
                    onClick={() => setGridSize(size)}
                    className={`p-2.5 rounded-xl font-mono text-xs font-bold border transition ${
                      disabled
                        ? 'opacity-20 border-white/10 bg-black/40 text-white/20 cursor-not-allowed'
                        : gridSize === size
                        ? 'border-yellow-400 bg-yellow-400/20 text-yellow-200 font-extrabold'
                        : 'border-white/15 bg-black/25 text-white/80 hover:border-white/40 hover:text-white'
                    }`}
                  >
                    {size} Blocks
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* Start Button */}
      <div id="start-button-row" className="text-center mt-12 bg-black/10 border border-white/5 py-8 px-4 rounded-3xl max-w-xl mx-auto shadow-inner relative overflow-hidden">
        <div className="absolute top-2 left-2 opacity-5 pointer-events-none">
          <CyberCat className="w-24 h-24" color="yellow" />
        </div>
        <div className="absolute bottom-2 right-2 opacity-5 pointer-events-none">
          <CosmicCat className="w-24 h-24" />
        </div>
        <p className="text-xs font-mono text-cyan-300 font-bold tracking-widest uppercase mb-4">SYSTEM READY FOR INTEGRATION</p>
        <motion.button
          id="btn-launch-game"
          whileHover={{ scale: 1.05, boxShadow: '0 0 35px rgba(250,204,21,0.6)' }}
          whileTap={{ scale: 0.98 }}
          onClick={handleStart}
          className="px-12 py-4 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-indigo-950 font-display text-xl font-black shadow-lg shadow-yellow-400/30 flex items-center gap-3.5 mx-auto cursor-pointer focus:outline-none tracking-wider uppercase italic transition-colors"
        >
          <span>🐾</span>
          START THE CAT-A-LYST!
        </motion.button>
      </div>
    </div>
  );
}
