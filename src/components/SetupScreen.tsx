import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, Download, Users, Play, Plus, Trash2, 
  CheckCircle2, AlertCircle, FileSpreadsheet, Info, 
  Globe, Lock, User, Dice5, Eye, EyeOff, Save, PlusCircle, BookmarkCheck
} from 'lucide-react';
import { Team, Question } from '../types';
import { CyberCat, CosmicCat, DJNeonCat, DynamicCatBanner } from './NeonCats';
import { DatabaseState, CustomQuiz, saveDatabase } from '../lib/jsonbin';

// Fun cat team name generators
const CAT_ADJECTIVES_1 = [
  'Chonky', 'Cosmic', 'Glitch', 'Hyper', 'Laser', 'Cyber', 'Mighty', 'Radiant', 
  'Zesty', 'Slinky', 'Neon', 'Spicy', 'Quantum', 'Glitter', 'Glow', 'Rogue', 
  'Retro', 'Mega', 'Sassy', 'Tonic', 'Turbo', 'Zen'
];

const CAT_ADJECTIVES_2 = [
  'Whiskered', 'Fluffy', 'Purring', 'Meowing', 'Howling', 'Bouncing', 'Snoozing', 
  'Glaring', 'Caffeinated', 'Luminous', 'Vaporwave', 'Hissing', 'Cuddly', 'Sparkly', 
  'Dazzling', 'Fuzzy', 'Sneaky', 'Feisty', 'Chubby', 'Spunky'
];

const CAT_BREEDS = [
  'Persian', 'Siamese', 'Maine Coon', 'Bengal', 'Sphynx', 'Ragdoll', 'Munchkin', 
  'Calico', 'Tabby', 'Abyssinian', 'Siberian', 'Chartreux', 'Bombay', 'Balinese'
];

export function generateCatTeamName(): string {
  const adj1 = CAT_ADJECTIVES_1[Math.floor(Math.random() * CAT_ADJECTIVES_1.length)];
  const adj2 = CAT_ADJECTIVES_2[Math.floor(Math.random() * CAT_ADJECTIVES_2.length)];
  const breed = CAT_BREEDS[Math.floor(Math.random() * CAT_BREEDS.length)];
  return `${adj1} ${adj2} ${breed}`;
}

interface SetupScreenProps {
  defaultQuestions: Question[];
  onStartGame: (teams: Team[], questions: Question[], gridCount: number) => void;
  currentUser: string | null;
  dbState: DatabaseState;
  onOpenAuth: () => void;
  onLogout: () => void;
}

const PRESET_COLORS = [
  { name: 'Sunset Orange', class: 'bg-gradient-to-br from-orange-500 to-red-600', text: 'text-orange-400', border: 'border-orange-500' },
  { name: 'Neon Emerald', class: 'bg-gradient-to-br from-emerald-400 to-teal-600', text: 'text-emerald-400', border: 'border-emerald-500' },
  { name: 'Vibrant Magenta', class: 'bg-gradient-to-br from-pink-500 to-rose-600', text: 'text-pink-400', border: 'border-pink-500' },
  { name: 'Ocean Cyan', class: 'bg-gradient-to-br from-cyan-400 to-blue-600', text: 'text-cyan-400', border: 'border-cyan-500' },
  { name: 'Royal Purple', class: 'bg-gradient-to-br from-purple-500 to-indigo-600', text: 'text-purple-400', border: 'border-purple-500' },
  { name: 'Cyber Amber', class: 'bg-gradient-to-br from-amber-400 to-orange-500', text: 'text-amber-400', border: 'border-amber-500' },
];

export default function SetupScreen({ 
  defaultQuestions, 
  onStartGame, 
  currentUser, 
  dbState, 
  onOpenAuth,
  onLogout 
}: SetupScreenProps) {
  
  // Setup state for teams
  const [numTeams, setNumTeams] = useState<number>(3);
  const [teamList, setTeamList] = useState<Team[]>(() => [
    { id: 1, name: generateCatTeamName(), score: 0, color: PRESET_COLORS[0].class },
    { id: 2, name: generateCatTeamName(), score: 0, color: PRESET_COLORS[1].class },
    { id: 3, name: generateCatTeamName(), score: 0, color: PRESET_COLORS[4].class },
  ]);

  // Redesigned Question database routing tabs
  const [activeTab, setActiveTab] = useState<'public' | 'my' | 'new'>('public');
  const [selectedQuizId, setSelectedQuizId] = useState<string>('default');

  // New Builder & Upload configuration sub-states
  const [newQuizMode, setNewQuizMode] = useState<'excel' | 'form'>('excel');
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Excel builder info
  const [excelTitle, setExcelTitle] = useState('');
  const [excelIsPublic, setExcelIsPublic] = useState(false);
  const [tempParsedQuestions, setTempParsedQuestions] = useState<Question[] | null>(null);

  // Manual Quiz Form builder info
  const [formTitle, setFormTitle] = useState('');
  const [formIsPublic, setFormIsPublic] = useState(false);
  const [formQuestions, setFormQuestions] = useState<Question[]>([]);
  // Input fields for adding an entry to the current manual list
  const [inputCategory, setInputCategory] = useState('');
  const [inputQuestion, setInputQuestion] = useState('');
  const [inputAnswer, setInputAnswer] = useState('');
  const [inputTip, setInputTip] = useState('');

  // Grid size configuration
  const [gridSize, setGridSize] = useState<number>(12);

  // Compute active question count for grid boundary
  const getActiveQuizQuestions = () => {
    if (selectedQuizId === 'default') return defaultQuestions;
    const selected = dbState.quizzes.find(q => q.id === selectedQuizId);
    return selected ? selected.questions : defaultQuestions;
  };
  const activeQuestions = getActiveQuizQuestions();
  const totalQuestionsAvailable = activeQuestions.length;

  // Sync grid dimensions limit if active dataset is smaller than current selection
  useEffect(() => {
    if (gridSize > totalQuestionsAvailable) {
      // Find nearest smaller supported size if possible
      const sizes = [9, 12, 16, 20, 24, 30];
      const valid = sizes.filter(s => s <= totalQuestionsAvailable);
      if (valid.length > 0) {
        setGridSize(valid[valid.length - 1]);
      } else {
        setGridSize(totalQuestionsAvailable);
      }
    }
  }, [selectedQuizId, totalQuestionsAvailable]);

  // Adjust team count
  const handleNumTeamsChange = (count: number) => {
    setNumTeams(count);
    const newTeams: Team[] = [];
    for (let i = 0; i < count; i++) {
      if (teamList[i]) {
        newTeams.push(teamList[i]);
      } else {
        newTeams.push({
          id: i + 1,
          name: generateCatTeamName(),
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

  const handleShuffleTeamName = (index: number) => {
    const updated = [...teamList];
    updated[index].name = generateCatTeamName();
    setTeamList(updated);
  };

  // Excel Excel parser
  const processExcelData = (data: ArrayBuffer) => {
    try {
      setUploadError(null);
      setUploadSuccess(null);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const json: any[] = XLSX.utils.sheet_to_json(worksheet);

      if (json.length === 0) {
        throw new Error("Spreadsheet is empty or rows could not be parsed.");
      }

      // Check format
      const tempParsed: Question[] = [];
      json.forEach((row, idx) => {
        const questionText = row.Question || row.question || row.Prompt || row.prompt;
        const answerText = row.Answer || row.answer || row.Solution || row.solution;
        if (!questionText || !answerText) {
          throw new Error(`Row ${idx + 2} is missing either an explicit 'Question' or 'Answer' column mapping.`);
        }
        tempParsed.push({
          id: Date.now() + idx,
          question: String(questionText),
          answer: String(answerText),
          tip: String(row.Tip || row.tip || row.Hint || row.hint || "No feline tip provided."),
          category: String(row.Category || row.category || "General")
        });
      });

      setTempParsedQuestions(tempParsed);
      setUploadSuccess(`Succesfully scanned ${tempParsed.length} trivia items! Give this database a title to continue.`);
    } catch (err: any) {
      setUploadError(err.message || "Invalid or corrupt Excel file formatting.");
      setTempParsedQuestions(null);
    }
  };

  const handleExcelImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempParsedQuestions) return;

    const finalTitle = excelTitle.trim() || `Excel Upload (${tempParsedQuestions.length} Qs)`;
    const newQuiz: CustomQuiz = {
      id: 'quiz-' + Date.now(),
      title: finalTitle,
      creator: currentUser || 'Anonymous',
      isPublic: excelIsPublic,
      questions: tempParsedQuestions
    };

    const updatedQuizzes = [...dbState.quizzes, newQuiz];
    const success = await saveDatabase({
      ...dbState,
      quizzes: updatedQuizzes
    });

    if (success) {
      setSelectedQuizId(newQuiz.id);
      setExcelTitle('');
      setTempParsedQuestions(null);
      setUploadSuccess(`Perfect! Saved "${finalTitle}" successfully.`);
      // Redirect to appropriate tab
      setActiveTab(excelIsPublic ? 'public' : 'my');
    } else {
      setUploadError("Database synchronization timed out. Saved locally instead.");
    }
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
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          processExcelData(evt.target.result as ArrayBuffer);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          processExcelData(evt.target.result as ArrayBuffer);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  // Add question to manual form quiz builder
  const handleFormAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuestion.trim() || !inputAnswer.trim()) {
      setUploadError("Question prompt and answer resolved values are required.");
      return;
    }

    const newQ: Question = {
      id: Date.now() + Math.random(),
      question: inputQuestion.trim(),
      answer: inputAnswer.trim(),
      tip: inputTip.trim() || "No hint specified.",
      category: inputCategory.trim() || "General"
    };

    setFormQuestions([...formQuestions, newQ]);
    setInputQuestion('');
    setInputAnswer('');
    setInputTip('');
    setUploadError(null);
  };

  // Remove question from manual form builder
  const handleRemoveFormQuestion = (idx: number) => {
    const updated = [...formQuestions];
    updated.splice(idx, 1);
    setFormQuestions(updated);
  };

  // Save manual form quiz
  const handleSaveFormQuiz = async () => {
    const finalTitle = formTitle.trim();
    if (!finalTitle) {
      setUploadError("Please provide a name/title for your custom questions database.");
      return;
    }

    if (formQuestions.length === 0) {
      setUploadError("Add at least 1 question to compile your database.");
      return;
    }

    const newQuiz: CustomQuiz = {
      id: 'quiz-form-' + Date.now(),
      title: finalTitle,
      creator: currentUser || 'Anonymous',
      isPublic: formIsPublic,
      questions: formQuestions
    };

    const updatedQuizzes = [...dbState.quizzes, newQuiz];
    const success = await saveDatabase({
      ...dbState,
      quizzes: updatedQuizzes
    });

    if (success) {
      setSelectedQuizId(newQuiz.id);
      setFormTitle('');
      setFormQuestions([]);
      setUploadSuccess(`Saved manual database "${finalTitle}" successfully!`);
      setActiveTab(formIsPublic ? 'public' : 'my');
    } else {
      setUploadError("Failed to persist database to cloud. Saved locally.");
    }
  };

  // Toggle Privacy Switch in My Quizzes
  const handleTogglePrivacy = async (quiz: CustomQuiz) => {
    const updatedQuizzes = dbState.quizzes.map((q) => {
      if (q.id === quiz.id) {
        return { ...q, isPublic: !q.isPublic };
      }
      return q;
    });

    await saveDatabase({
      ...dbState,
      quizzes: updatedQuizzes
    });
  };

  // Delete quiz permanently
  const handleDeleteQuiz = async (quizId: string) => {
    const updatedQuizzes = dbState.quizzes.filter(q => q.id !== quizId);
    await saveDatabase({
      ...dbState,
      quizzes: updatedQuizzes
    });
    if (selectedQuizId === quizId) {
      setSelectedQuizId('default');
    }
  };

  const downloadTemplate = () => {
    const sampleData = [
      { Question: "How many whiskers do cats have on average?", Answer: "24 (12 on each side)", Tip: "They use whiskers to map their environment in darkness.", Category: "Feline Trivia" },
      { Question: "What percentage of their life do cats spend sleeping?", Answer: "About 70%", Tip: "Cats conserve calories by sleeping up to 16 hours a day.", Category: "Feline Science" },
      { Question: "Which chemical compound in catnip affects cats?", Answer: "Nepetalactone", Tip: "It mimics feline pheromones in the nasal tissue.", Category: "Biochemistry" },
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Feline Template");
    XLSX.writeFile(wb, "The_Catalyst_Question_Template.xlsx");
  };

  const handleStart = () => {
    onStartGame(teamList, activeQuestions, Math.min(gridSize, totalQuestionsAvailable));
  };

  // Filters for public / private databases
  const publicQuizzes = dbState.quizzes.filter(q => q.isPublic);
  const myQuizzes = currentUser 
    ? dbState.quizzes.filter(q => q.creator === currentUser)
    : dbState.quizzes.filter(q => q.creator === 'Anonymous');

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
        <p className="text-yellow-105/80 text-sm sm:text-base max-w-xl mx-auto font-sans font-medium leading-relaxed bg-white/5 border border-white/10 p-4 rounded-xl shadow-inner">
          Conquer the neon board! Draft funny-named squads, build manual quiz vaults, upload spreadsheets, and launch into the matrix arena. 
        </p>

        <DynamicCatBanner />
      </div>

      <div id="setup-form-grid" className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column: Team Customization (7 cols) - Adjusted to fill space matching right tall sidebar */}
        <div id="team-setup-panel" className="md:col-span-7 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 flex flex-col justify-start space-y-6 shadow-xl">
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
                  className={`px-3 py-1 text-sm font-black rounded-md transition-all duration-200 cursor-pointer ${
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

          {/* Teams list with flex-grow layout to natively fill the vertical box space */}
          <div className="space-y-4 overflow-y-auto pr-2 flex-grow h-0 min-h-[350px]">
            <AnimatePresence initial={false}>
              {teamList.map((team, idx) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 rounded-xl bg-white/5 border border-white/15 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 hover:border-white/30 transition shadow-inner"
                >
                  {/* Color blob indicator */}
                  <div className={`w-8 h-8 rounded-lg shrink-0 ${team.color} shadow-lg shadow-black/30 self-center`} />
                  
                  {/* Name Input with shuffle option */}
                  <div className="flex-grow w-full space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-yellow-300 uppercase tracking-widest">SQUAD {idx + 1}</label>
                      <button
                        type="button"
                        onClick={() => handleShuffleTeamName(idx)}
                        title="Randomize Cat breed squad name"
                        className="text-cyan-400 hover:text-cyan-200 transition text-[9px] flex items-center gap-1 font-mono uppercase bg-cyan-400/10 border border-cyan-400/20 rounded px-1 py-0.5 cursor-pointer"
                      >
                        <Dice5 className="w-3 h-3" /> Re-roll
                      </button>
                    </div>
                    <input
                      id={`input-team-name-${idx}`}
                      type="text"
                      className="bg-black/30 border border-white/20 rounded-lg px-3 py-1.5 w-full text-white font-sans focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-300 font-bold placeholder-white/30"
                      value={team.name}
                      onChange={(e) => updateTeamName(idx, e.target.value)}
                      placeholder={`Squad Name ${idx + 1}`}
                    />
                  </div>

                  {/* Colors choice */}
                  <div className="flex flex-wrap gap-1.5 pt-2 sm:pt-0 shrink-0 self-center items-center">
                    {PRESET_COLORS.map((color, colorIdx) => (
                      <button
                        key={colorIdx}
                        id={`btn-color-${idx}-${colorIdx}`}
                        type="button"
                        onClick={() => updateTeamColor(idx, color.class)}
                        className={`w-6 h-6 rounded-full transition-all focus:outline-none border-2 cursor-pointer ${color.class} ${
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

        {/* Right Column: Question Database selector & builder (5 cols) */}
        <div id="game-options-panel" className="md:col-span-5 flex flex-col gap-6">
          
          {/* Question Database tabbed panel */}
          <div id="excel-uploader" className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 flex flex-col space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="font-display text-lg font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                <FileSpreadsheet className="w-5 h-5 text-yellow-300" />
                Question Database
              </h2>
            </div>

            {/* TAB SELECTOR */}
            <div className="grid grid-cols-3 gap-1 bg-black/30 p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => { setActiveTab('public'); setUploadError(null); setUploadSuccess(null); }}
                className={`py-1.5 text-xs font-black rounded-lg transition uppercase ${
                  activeTab === 'public'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white cursor-pointer'
                }`}
              >
                🌐 Public
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('my'); setUploadError(null); setUploadSuccess(null); }}
                className={`py-1.5 text-xs font-black rounded-lg transition uppercase ${
                  activeTab === 'my'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white cursor-pointer'
                }`}
              >
                🔒 Mine
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('new'); setUploadError(null); setUploadSuccess(null); }}
                className={`py-1.5 text-xs font-black rounded-lg transition uppercase ${
                  activeTab === 'new'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white cursor-pointer'
                }`}
              >
                ➕ New
              </button>
            </div>

            {/* ERROR & SUCCESS ALERTS */}
            {uploadError && (
              <div className="p-3 text-xs bg-rose-550/20 border border-rose-500/30 text-rose-300 rounded-xl flex items-start gap-2 animate-pulse">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{uploadError}</span>
              </div>
            )}
            {uploadSuccess && (
              <div className="p-3 text-xs bg-emerald-550/20 border border-emerald-500/30 text-emerald-300 rounded-xl flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                <span>{uploadSuccess}</span>
              </div>
            )}

            {/* TAB 1 CONTENT: PUBLIC QUIZZES */}
            {activeTab === 'public' && (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Available Public Databases</p>
                
                {/* Default choice */}
                <div
                  onClick={() => setSelectedQuizId('default')}
                  className={`p-3 rounded-xl border text-left transition duration-150 cursor-pointer ${
                    selectedQuizId === 'default'
                      ? 'border-yellow-400 bg-yellow-400/10 shadow-lg shadow-yellow-500/5'
                      : 'border-white/10 bg-white/5 hover:border-white/30'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-display font-black text-sm text-white">Default Science Stars</span>
                    <span className="text-[10px] font-bold text-yellow-300 px-2 py-0.5 rounded-full bg-yellow-400/10 border border-yellow-400/20">Active</span>
                  </div>
                  <p className="text-[10px] text-cyan-300 mt-1 font-mono uppercase tracking-wider">30 questions • BY SYSTEM</p>
                </div>

                {/* DB list */}
                {publicQuizzes.length === 0 ? (
                  <div className="text-center p-6 bg-black/20 rounded-xl border border-white/5 text-xs text-gray-500">
                    No custom public databases created yet. Write or upload one under the "New" tab!
                  </div>
                ) : (
                  publicQuizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      onClick={() => setSelectedQuizId(quiz.id)}
                      className={`p-3 rounded-xl border text-left transition duration-150 cursor-pointer relative group ${
                        selectedQuizId === quiz.id
                          ? 'border-yellow-400 bg-yellow-400/10 shadow-lg shadow-yellow-500/5'
                          : 'border-white/10 bg-white/5 hover:border-white/30'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-display font-black text-sm text-white truncate max-w-[180px]">{quiz.title}</span>
                        {selectedQuizId === quiz.id ? (
                          <span className="text-[10px] font-bold text-yellow-300 px-2 py-0.5 rounded-full bg-yellow-400/10 border border-yellow-400/20">Active</span>
                        ) : (
                          <span className="text-[9px] text-gray-400">Adopted</span>
                        )}
                      </div>
                      <p className="text-[10px] text-cyan-300 mt-1 font-mono uppercase tracking-wider truncate">
                        {quiz.questions.length} questions • BY {quiz.creator}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 2 CONTENT: MY QUIZZES */}
            {activeTab === 'my' && (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {!currentUser ? (
                  <div className="text-center p-6 bg-indigo-950/20 border border-indigo-500/30 rounded-xl space-y-3">
                    <Lock className="w-8 h-8 text-indigo-400 mx-auto" />
                    <p className="text-xs text-indigo-300 font-bold leading-normal">
                      Authorization Required
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Sign in with your Commander account to unlock saving, sharing, and cataloging custom quizzes.
                    </p>
                    <button
                      type="button"
                      onClick={onOpenAuth}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold text-white transition tracking-wide uppercase cursor-pointer"
                    >
                      Authenticate Entry
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Commander quiz pool ({myQuizzes.length})</p>
                    </div>

                    {myQuizzes.length === 0 ? (
                      <div className="text-center p-6 bg-black/20 rounded-xl border border-white/5 text-xs text-gray-500">
                        You haven't loaded any databases yet. Create one in the "New" tab to save it permanently!
                      </div>
                    ) : (
                      myQuizzes.map((quiz) => (
                        <div
                          key={quiz.id}
                          className={`p-3 rounded-xl border text-left transition duration-150 ${
                            selectedQuizId === quiz.id
                              ? 'border-yellow-400 bg-yellow-400/10'
                              : 'border-white/10 bg-white/5'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div 
                              className="flex-grow cursor-pointer"
                              onClick={() => setSelectedQuizId(quiz.id)}
                            >
                              <span className="font-display font-black text-sm text-white block truncate max-w-[150px]">{quiz.title}</span>
                              <span className="text-[10px] text-cyan-300 font-mono uppercase tracking-wider block mt-0.5">
                                {quiz.questions.length} questions
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mt-0.5 shrink-0">
                              {/* Privacy Switch */}
                              <button
                                type="button"
                                onClick={() => handleTogglePrivacy(quiz)}
                                title={quiz.isPublic ? "Publicly Shared: click to make Private" : "Private: click to make Public"}
                                className={`flex items-center gap-1 text-[9px] font-bold uppercase p-1 px-1.5 rounded border transition-all cursor-pointer ${
                                  quiz.isPublic
                                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
                                    : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/25'
                                }`}
                              >
                                {quiz.isPublic ? <Globe className="w-2.5 h-2.5 text-emerald-400" /> : <Lock className="w-2.5 h-2.5 text-indigo-400" />}
                                <span>{quiz.isPublic ? "Public" : "Private"}</span>
                              </button>

                              {/* Delete button */}
                              <button
                                type="button"
                                onClick={() => handleDeleteQuiz(quiz.id)}
                                className="p-1 text-rose-450 hover:text-rose-300 transition hover:bg-rose-500/10 rounded cursor-pointer"
                                title="Delete Database"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {selectedQuizId === quiz.id && (
                            <div className="mt-2 text-[10px] text-yellow-300 text-right font-black uppercase tracking-wider">
                              ★ Current Play Selection
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </>
                )}
              </div>
            )}

            {/* TAB 3 CONTENT: CREATION PORTAL */}
            {activeTab === 'new' && (
              <div className="space-y-4">
                {/* Mode Selector for creation */}
                <div className="flex rounded-md bg-black/20 p-1 border border-white/5 text-[11px] font-bold uppercase">
                  <button
                    type="button"
                    onClick={() => { setNewQuizMode('excel'); setUploadError(null); setUploadSuccess(null); }}
                    className={`flex-1 py-1 rounded transition text-center ${
                      newQuizMode === 'excel' ? 'bg-indigo-600/60 text-white' : 'text-gray-400 cursor-pointer'
                    }`}
                  >
                    📂 Excel Import
                  </button>
                  <button
                    type="button"
                    onClick={() => { setNewQuizMode('form'); setUploadError(null); setUploadSuccess(null); }}
                    className={`flex-1 py-1 rounded transition text-center ${
                      newQuizMode === 'form' ? 'bg-indigo-600/60 text-white' : 'text-gray-400 cursor-pointer'
                    }`}
                  >
                    ✏️ Manual Builder
                  </button>
                </div>

                {/* Sub-Mode 1: Excel Uploader */}
                {newQuizMode === 'excel' && (
                  <div className="space-y-4">
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
                        id="excel-file-picker"
                        type="file"
                        accept=".xlsx, .xls"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <label htmlFor="excel-file-picker" className="cursor-pointer space-y-2 block">
                        <Upload className="w-8 h-8 text-yellow-300 mx-auto animate-pulse" />
                        <span className="text-xs text-white pl-1 font-bold block">
                          Drag spreadsheet or <span className="text-yellow-400 underline">click to search</span>
                        </span>
                        <span className="text-[10px] text-gray-400 block font-mono font-medium">Supports .xlsx / .xls formatted grids</span>
                      </label>
                    </div>

                    {/* Metadata customization after successful scan */}
                    {tempParsedQuestions && (
                      <form onSubmit={handleExcelImportSubmit} className="space-y-2 text-left bg-black/40 border border-indigo-500/20 p-3 rounded-xl animate-fadeIn">
                        <div>
                          <label className="text-[9px] font-black text-yellow-300 uppercase tracking-widest pl-0.5">Database Title</label>
                          <input
                            type="text"
                            className="bg-black/40 border border-white/20 rounded-lg px-2.5 py-1.5 w-full text-white text-xs font-semibold focus:outline-none"
                            placeholder="e.g. Feline history challenge"
                            value={excelTitle}
                            onChange={(e) => setExcelTitle(e.target.value)}
                          />
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] text-gray-300 font-bold">Share publicly in catalog?</span>
                          <button
                            type="button"
                            onClick={() => setExcelIsPublic(!excelIsPublic)}
                            className={`flex items-center gap-1.5 py-1 px-2 border-2 text-[10px] label-btn font-extrabold transition-all uppercase rounded-lg cursor-pointer ${
                              excelIsPublic ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300' : 'border-indigo-500/30 bg-indigo-500/5 text-indigo-300'
                            }`}
                          >
                            <span>{excelIsPublic ? "🌐 Yes, Public" : "🔒 No, Private"}</span>
                          </button>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2 bg-yellow-400 hover:bg-yellow-300 text-indigo-950 rounded-lg text-xs font-black uppercase tracking-wider transition cursor-pointer mt-2"
                        >
                          Compile & Load Quiz!
                        </button>
                      </form>
                    )}

                    {/* Template download link */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <span className="text-[10px] text-yellow-101/60 font-medium">Download layout format?</span>
                      <button
                        id="btn-download-template"
                        type="button"
                        onClick={downloadTemplate}
                        className="text-[10px] text-yellow-300 hover:text-yellow-200 flex items-center gap-1 font-extrabold focus:outline-none transition cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /> Template.xlsx
                      </button>
                    </div>
                  </div>
                )}

                {/* Sub-Mode 2: Form Creator */}
                {newQuizMode === 'form' && (
                  <div className="space-y-4 text-left">
                    {/* Basic properties */}
                    <div className="space-y-2 bg-black/25 p-3 rounded-xl border border-white/10">
                      <div>
                        <label className="text-[9px] font-black text-yellow-300 uppercase tracking-widest pl-0.5">Quiz Title</label>
                        <input
                          type="text"
                          className="bg-black/40 border border-white/20 rounded-lg px-2.5 py-1.5 w-full text-white text-xs font-semibold focus:outline-none"
                          placeholder="e.g. World Cat Species"
                          value={formTitle}
                          onChange={(e) => setFormTitle(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-gray-300 font-bold">Public or Private?</span>
                        <button
                          type="button"
                          onClick={() => setFormIsPublic(!formIsPublic)}
                          className={`flex items-center gap-1.5 py-1 px-2 border-2 text-[10px] font-extrabold transition-all uppercase rounded-lg cursor-pointer ${
                            formIsPublic ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300' : 'border-indigo-500/30 bg-indigo-500/5 text-indigo-300'
                          }`}
                        >
                          <span>{formIsPublic ? "🌐 Public" : "🔒 Private"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Inline Question Add Form */}
                    <form onSubmit={handleFormAddQuestion} className="space-y-2.5 bg-black/40 border border-indigo-500/15 p-3.5 rounded-xl">
                      <p className="text-[10px] text-yellow-300 font-black uppercase tracking-wider border-b border-white/5 pb-1">Assemble Questions ({formQuestions.length} saved)</p>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[8px] font-black text-gray-400 uppercase tracking-wider block mb-0.5">Category</label>
                          <input
                            type="text"
                            placeholder="e.g. Science"
                            className="bg-black/30 border border-white/10 rounded px-2 py-1 text-white text-xs w-full focus:outline-none"
                            value={inputCategory}
                            onChange={(e) => setInputCategory(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-[8px] font-black text-gray-400 uppercase tracking-wider block mb-0.5">Hint / Tip</label>
                          <input
                            type="text"
                            placeholder="e.g. It was a breed"
                            className="bg-black/30 border border-white/10 rounded px-2 py-1 text-white text-xs w-full focus:outline-none"
                            value={inputTip}
                            onChange={(e) => setInputTip(e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-wider block mb-0.5">Question Prompt</label>
                        <input
                          type="text"
                          placeholder="e.g. What is a cat's color?"
                          className="bg-black/30 border border-white/10 rounded px-2 py-1 text-white text-xs w-full focus:outline-none"
                          value={inputQuestion}
                          onChange={(e) => setInputQuestion(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-wider block mb-0.5">Answer</label>
                        <input
                          type="text"
                          placeholder="e.g. Orange"
                          className="bg-black/30 border border-white/10 rounded px-2 py-1 text-white text-xs w-full focus:outline-none"
                          value={inputAnswer}
                          onChange={(e) => setInputAnswer(e.target.value)}
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-1.5 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5" /> Add Question
                      </button>
                    </form>

                    {/* List of currently compiled questions */}
                    {formQuestions.length > 0 && (
                      <div className="space-y-1.5 max-h-[140px] overflow-y-auto bg-black/20 p-2 rounded-lg border border-white/5">
                        {formQuestions.map((q, idx) => (
                          <div key={idx} className="flex justify-between items-center text-[10px] p-1.5 rounded bg-white/5 border border-white/5">
                            <div className="truncate max-w-[200px]">
                              <span className="font-bold text-yellow-300">#{idx + 1}: </span>
                              <span className="text-white">{q.question}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveFormQuestion(idx)}
                              className="text-rose-450 hover:text-rose-300 transition cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Master save compiled button */}
                    <button
                      type="button"
                      disabled={formQuestions.length === 0}
                      onClick={handleSaveFormQuiz}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-widest rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/10"
                    >
                      <Save className="w-4 h-4" /> Save & Compile Quiz Database
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Grid Settings Block - Rebranded to Question Database */}
          <div id="grid-settings" className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 flex flex-col space-y-4 shadow-xl">
            <h2 className="font-display text-xl font-bold text-white flex items-center gap-2 uppercase tracking-wide">
              <Info className="w-5 h-5 text-yellow-300" />
              Grid Dimensions
            </h2>
            <p className="text-xs text-yellow-101/80 font-medium leading-relaxed">
              Select active blocks for the match. If the selected questions database ({totalQuestionsAvailable} total Qs) is smaller than the grid block scale, values will downscale automatically.
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
                        : 'border-white/15 bg-black/25 text-white/80 hover:border-white/40 hover:text-white cursor-pointer'
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
