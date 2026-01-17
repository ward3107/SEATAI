
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Users, 
  LayoutGrid, 
  LogOut, 
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  BrainCircuit,
  Sparkles,
  RefreshCw,
  Link as LinkIcon,
  FileText,
  Save,
  X,
  Zap,
  AlertTriangle,
  LayoutDashboard,
  ShieldCheck,
  UserCircle,
  MessageCircle,
  Send,
  ArrowLeft,
  Globe,
  Lock,
  ChevronDown,
  Shield,
  BookOpen,
  Scale,
  ArrowRight,
  Cookie,
  User,
  UserPlus,
  Activity,
  Hand,
  Download,
  Loader2,
  KeyRound,
  ToggleLeft,
  ToggleRight,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  FileQuestion,
  Info,
  Trash2,
  Bell,
  Plus,
  Calendar,
  Moon,
  Sun,
  Palette,
  Check,
  Eye,
  EyeOff,
  Ear,
  Layers,
  Home,
  History,
  RotateCcw,
  Armchair,
  MapPin,
  Heart,
  Lightbulb,
  ExternalLink,
  Target
} from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip, Legend } from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { 
  Language, 
  Student, 
  SeatPos, 
  Recommendation, 
  Note, 
  LayoutHistoryItem,
  SeatingShape
} from './types';
import { 
  TRANSLATIONS, 
  MOCK_TEACHERS, 
  MOCK_STUDENTS, 
  MOCK_ANSWERS, 
  QUESTION_LABELS, 
  FOOTER_CONTENT, 
  CATEGORY_NAMES 
} from './constants';
import { calculateAutomatedLayout, getPairSynergy, analyzeStudentData, getInsightColor, generateAIDeepAnalysis, getSeatingAdvice } from './services/analysisEngine';

const ImageBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <img
        src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000&auto=format&fit=crop"
        alt="Futuristic Office Background"
        className="w-full h-full object-cover scale-105 transition-transform duration-[60s] hover:scale-110"
      />
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[3px] bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-slate-900/30" />
    </div>
  );
};

const SafeResponsiveContainer: React.FC<{ children: React.ReactElement, width?: string | number, height?: string | number }> = ({ 
  children, 
  width = "100%", 
  height = "100%" 
}) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setTimeout(() => setIsReady(true), 200);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  if (!isReady) return (
    <div className="w-full h-full flex items-center justify-center bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl">
      <Loader2 className="animate-spin text-primary-200" />
    </div>
  );

  return (
    <div style={{ width, height }} className="recharts-wrapper-container">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
        {children}
      </ResponsiveContainer>
    </div>
  );
};

const LanguageSwitcher: React.FC<{ current: Language, set: (l: Language) => void }> = ({ current, set }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages = [
    { code: 'he', label: 'עברית' },
    { code: 'en', label: 'English' },
    { code: 'ar', label: 'العربية' },
    { code: 'ru', label: 'Русский' }
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-200 dark:hover:border-primary-800 transition-all shadow-sm group"
        title="Change Language"
      >
        <Globe size={20} className="group-hover:rotate-12 transition-transform duration-500" />
      </button>
      
      {isOpen && (
        <div className="absolute top-full mt-2 end-0 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 min-w-[140px] z-[100] animate-in fade-in zoom-in-95 duration-200">
          <div className="space-y-1">
            {languages.map((l) => (
              <button 
                key={l.code} 
                onClick={() => {
                  set(l.code as Language);
                  setIsOpen(false);
                }} 
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-black uppercase transition-all ${current === l.code ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
              >
                <span>{l.label}</span>
                {current === l.code && <CheckCircle2 size={14} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Logo: React.FC<{ className?: string, variant?: 'light' | 'dark' }> = ({ className = "h-12", variant = 'dark' }) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div className="bg-primary-600 p-2 rounded-xl text-white shadow-lg shadow-primary-500/30">
        <Armchair size={24} />
      </div>
      <span className={`text-xl font-black tracking-tighter uppercase drop-shadow-md ${variant === 'light' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
        SEATAI
      </span>
    </div>
  );
};

const StudentInfoPopover: React.FC<{ student: Student, lang: Language }> = ({ student, lang }) => {
  const answers = MOCK_ANSWERS[student.id];
  const insights = analyzeStudentData(answers, lang);
  const seatingAdvice = getSeatingAdvice(answers, lang);
  const isRtl = lang === 'he' || lang === 'ar';

  return (
    <div className={`absolute z-[100] bottom-full mb-4 w-96 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-[32px] shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200 pointer-events-none ring-1 ring-black/5 ${isRtl ? 'right-0' : 'left-0'}`}>
      <div className="bg-gradient-to-r from-primary-600 to-indigo-600 p-4 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <MapPin size={18} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">{lang === 'he' ? 'מיקום מומלץ' : 'Best Seat'}</p>
              <h4 className="text-sm font-black uppercase tracking-wide leading-none mt-0.5">{seatingAdvice.zone}</h4>
            </div>
          </div>
          <div className="text-right">
             <span className="text-2xl">{seatingAdvice.icon}</span>
          </div>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-base font-black text-slate-900 dark:text-white leading-none mb-4">{student.code}</h3>
        <div className="space-y-2">
          {insights.slice(0, 2).map((insight, idx) => {
             const colors = getInsightColor(insight.category);
             return (
               <div key={idx} className={`${colors.bg} p-3 rounded-xl border ${colors.border}`}>
                 <p className={`text-[11px] font-black ${colors.text}`}>{insight.title}</p>
                 <p className="text-[10px] font-bold text-slate-900 opacity-80 mt-1">{insight.description}</p>
               </div>
             );
          })}
        </div>
      </div>
      <div className="absolute -bottom-2 left-8 w-4 h-4 bg-white/95 dark:bg-slate-900/95 rotate-45 border-b border-r border-slate-200 dark:border-slate-700 backdrop-blur-xl"></div>
    </div>
  );
};

const SynergyInfoPopover: React.FC<{ pair: [string, string], lang: Language }> = ({ pair, lang }) => {
  const synergy = getPairSynergy(pair[0], pair[1], MOCK_ANSWERS, lang);
  const isRtl = lang === 'he' || lang === 'ar';
  
  return (
    <div 
      className={`absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-primary-100 dark:border-slate-700 p-5 z-[100] animate-in fade-in slide-in-from-bottom-2 duration-200 pointer-events-none text-left`} 
      dir={isRtl ? 'rtl' : 'ltr'}
    >
       <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100 dark:border-slate-700">
         <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-primary-600 dark:text-primary-400 shadow-sm">
                <Sparkles size={14} />
            </div>
            <div>
                <span className="block text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white leading-tight mb-0.5">{synergy.label}</span>
                <span className="inline-block px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[9px] font-bold text-slate-500 uppercase tracking-wide">{synergy.theoryReference}</span>
            </div>
         </div>
         <div className="flex flex-col items-end">
            <span className="text-xl font-black text-primary-600 dark:text-primary-400 leading-none tracking-tight">{synergy.score}%</span>
         </div>
       </div>
       <p className="text-[11px] font-black text-slate-900 leading-relaxed mb-4 italic">
         "{synergy.academicRationale}"
       </p>
       <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/95 dark:bg-slate-900/95 rotate-45 border-b border-r border-primary-100 dark:border-slate-700 backdrop-blur-xl"></div>
    </div>
  );
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('he');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTeacher, setActiveTeacher] = useState<any>(null);
  const [teacherCode, setTeacherCode] = useState('');
  const [authError, setAuthError] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);
  const [view, setView] = useState<'dashboard' | 'report' | 'seating'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSynergyPair, setActiveSynergyPair] = useState<[string, string] | null>(null);
  const [hoveredStudentId, setHoveredStudentId] = useState<string | null>(null);
  const [hoveredSynergyId, setHoveredSynergyId] = useState<string | null>(null);

  const [seatingShape, setSeatingShape] = useState<SeatingShape>('rows');
  const [seatingMode, setSeatingMode] = useState<'auto' | 'manual'>('auto');
  const [autoSeating, setAutoSeating] = useState<Record<string, SeatPos>>({});
  const [manualSeating, setManualSeating] = useState<Record<string, SeatPos>>({});
  const [draggedStudentId, setDraggedStudentId] = useState<string | null>(null);
  const [dragOverDesk, setDragOverDesk] = useState<{row: number, col: number} | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'info'} | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  const [layoutHistory, setLayoutHistory] = useState<LayoutHistoryItem[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isTaskMode, setIsTaskMode] = useState(false);
  const [taskDueDate, setTaskDueDate] = useState('');

  const t = TRANSLATIONS[lang];
  const isRtl = lang === 'he' || lang === 'ar';

  useEffect(() => {
    const savedToken = localStorage.getItem('seatai-auth-token');
    const savedNotes = localStorage.getItem('seatai-notes');
    const savedTheme = localStorage.getItem('seatai-theme');
    if (savedNotes) setNotes(JSON.parse(savedNotes));
    if (savedTheme === 'dark') setTheme('dark');
    if (savedToken) {
      const teacher = MOCK_TEACHERS.find(t => t.id === savedToken);
      if (teacher) { setActiveTeacher(teacher); setIsLoggedIn(true); }
    }
    setTimeout(() => setIsLoadingAuth(false), 800);
  }, []);

  const handleLogin = () => {
    const teacher = MOCK_TEACHERS.find(t => t.code === teacherCode);
    if (teacher) {
      localStorage.setItem('seatai-auth-token', teacher.id);
      setActiveTeacher(teacher);
      setIsLoggedIn(true);
    } else {
      setAuthError(true);
      setTimeout(() => setAuthError(false), 2000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('seatai-auth-token');
    setIsLoggedIn(false); setActiveTeacher(null); setSelectedClass(null); setTeacherCode('');
  };

  const addNote = () => {
    if (!activeStudent || !newNoteContent.trim()) return;
    const newNote: Note = {
      id: Date.now().toString(), studentId: activeStudent.id, content: newNoteContent,
      createdAt: new Date().toISOString(), isTask: isTaskMode, reminderDate: isTaskMode ? taskDueDate : undefined, isCompleted: false
    };
    const updated = [...notes, newNote];
    setNotes(updated);
    localStorage.setItem('seatai-notes', JSON.stringify(updated));
    setNewNoteContent(''); setIsTaskMode(false);
  };

  const filteredStudents = useMemo(() => {
    return MOCK_STUDENTS.filter(s => s.classId === selectedClass && MOCK_ANSWERS[s.id] && s.code.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [selectedClass, searchQuery]);

  useEffect(() => {
    if (selectedClass) {
      const result = calculateAutomatedLayout(filteredStudents, MOCK_ANSWERS, lang, seatingShape);
      setAutoSeating(result as any);
      if (seatingMode === 'auto') setManualSeating(result as any);
    }
  }, [selectedClass, lang, filteredStudents, seatingMode, seatingShape]);

  const currentSeatingMap = seatingMode === 'auto' ? autoSeating : manualSeating;

  const handleSaveLayout = () => {
    if (!selectedClass) return;
    const updatedHistory = [{ id: Date.now().toString(), timestamp: new Date().toISOString(), layout: currentSeatingMap, shape: seatingShape }, ...layoutHistory];
    setLayoutHistory(updatedHistory);
    setNotification({ message: t.layoutSaved, type: 'success' });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleGenerateAIAnalysis = async () => {
    if (!activeStudent) return;
    setIsGeneratingAnalysis(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const result = await generateAIDeepAnalysis(ai, activeStudent.code, MOCK_ANSWERS[activeStudent.id], lang);
    setAiAnalysis(result);
    setIsGeneratingAnalysis(false);
  };

  const handleDrop = (e: React.DragEvent, targetRow: number, targetCol: number) => {
    e.preventDefault();
    const studentId = e.dataTransfer.getData('studentId');
    if (!studentId || !selectedClass) return;
    setDragOverDesk(null);
    setSeatingMode('manual');
    const newManualSeating = { ...manualSeating };
    const oldPos = newManualSeating[studentId];
    if (oldPos) {
      newManualSeating[studentId] = { ...oldPos, row: targetRow, col: targetCol };
      setManualSeating(newManualSeating);
    }
  };

  if (isLoadingAuth) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="bg-primary-600 p-4 rounded-3xl animate-pulse shadow-2xl shadow-primary-500/50"><BrainCircuit size={48} className="text-white" /></div>
    </div>
  );

  if (!isLoggedIn) return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
      <ImageBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="w-full p-6 flex justify-between items-center max-w-6xl mx-auto"><Logo variant="light" className="h-14" /><LanguageSwitcher current={lang} set={setLang} /></header>
        <div className="flex-1 flex items-center justify-center p-6 w-full">
          <div className={`glass p-10 rounded-[48px] shadow-2xl w-full max-w-md border border-white/40 animate-in fade-in zoom-in duration-700 ${authError ? 'animate-shake' : ''}`}>
            <h1 className="text-3xl font-black text-center text-slate-900 mb-2 uppercase">{t.loginTitle}</h1>
            <input type="password" placeholder={t.teacherCodePlaceholder} className="w-full px-6 py-6 border rounded-3xl bg-white/60 text-center text-4xl font-black outline-none mt-8" value={teacherCode} onChange={(e) => setTeacherCode(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
            <button onClick={handleLogin} className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-lg uppercase shadow-2xl mt-6 hover:bg-primary-600 transition-all">{t.loginButton}</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-screen bg-slate-50 dark:bg-slate-900 flex flex-col md:flex-row overflow-hidden transition-all" dir={isRtl ? 'rtl' : 'ltr'}>
      <aside className={`hidden md:flex w-20 lg:w-72 bg-white dark:bg-slate-800 border-${isRtl ? 'l' : 'r'} border-slate-200 dark:border-slate-700 flex-col shadow-sm relative z-20`}>
        <div className="p-8 border-b dark:border-slate-700 flex items-center justify-center lg:justify-start h-24"><Logo className="h-full" /></div>
        <nav className="flex-1 p-4 space-y-3">
          <button onClick={() => setView('dashboard')} className={`w-full flex items-center gap-4 p-4 rounded-2xl ${view === 'dashboard' ? 'bg-primary-600 text-white shadow-xl' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}><LayoutDashboard size={20} /><span className="hidden lg:block text-sm font-black uppercase tracking-wide">Dashboard</span></button>
          <button onClick={() => setView('seating')} className={`w-full flex items-center gap-4 p-4 rounded-2xl ${view === 'seating' ? 'bg-primary-600 text-white shadow-xl' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}><LayoutGrid size={20} /><span className="hidden lg:block text-sm font-black uppercase tracking-wide">Seating</span></button>
        </nav>
        <div className="p-6 border-t dark:border-slate-700"><button onClick={handleLogout} className="flex items-center gap-4 p-4 rounded-2xl text-slate-400 hover:text-rose-600 font-black text-xs uppercase tracking-widest w-full"><LogOut size={20} /><span className="hidden lg:block">{t.logout}</span></button></div>
      </aside>

      <main className="flex-1 flex flex-col overflow-y-auto pb-24 md:pb-0">
        <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 p-4 md:p-6 lg:px-10 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-4">
            {selectedClass && <button onClick={() => { if(view === 'report') setView('dashboard'); else setSelectedClass(null); }} className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 rounded-2xl text-slate-400"><ArrowLeft size={20} className={isRtl ? 'rotate-180' : ''} /></button>}
            <h2 className="text-lg md:text-2xl font-black text-slate-900 dark:text-white uppercase">{selectedClass || 'System Root'}</h2>
          </div>
          <div className="flex items-center gap-4"><LanguageSwitcher current={lang} set={setLang} /><UserCircle size={32} className="text-slate-400" /></div>
        </header>

        <div className="flex-1 p-4 md:p-8 lg:p-12 max-w-7xl mx-auto w-full">
          {!selectedClass ? (
            <div className="mt-10 text-center">
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-12 uppercase">{t.selectClass}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {activeTeacher?.classes.map((cls: string) => (
                  <button key={cls} onClick={() => setSelectedClass(cls)} className="bg-white dark:bg-slate-800 p-16 rounded-[48px] border-2 border-transparent hover:border-primary-500 shadow-xl flex flex-col items-center group transition-all">
                    <Users size={48} className="text-primary-600 mb-8 group-hover:rotate-6 transition-transform" />
                    <span className="text-3xl font-black text-slate-900 dark:text-white uppercase">{cls}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
              {view === 'dashboard' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                  {filteredStudents.map(student => {
                    const score = MOCK_ANSWERS[student.id];
                    const isAtRisk = score.q1 <= 2;
                    return (
                      <div key={student.id} onClick={() => { setActiveStudent(student); setView('report'); setAiAnalysis(null); }} className="bento-card bg-white dark:bg-slate-800 p-6 border border-slate-200 dark:border-slate-700 cursor-pointer shadow-md group hover:ring-4 ring-primary-500/10 transition-all flex flex-col h-full">
                        <div className="flex items-start justify-between mb-6">
                          <div className="w-12 h-12 bg-primary-600 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg group-hover:rotate-12 transition-transform">
                            {student.code.split('-')[1]}
                          </div>
                          {isAtRisk && (
                            <div className="p-2 bg-rose-50 dark:bg-rose-900/30 rounded-xl text-rose-500 animate-pulse border border-rose-100 dark:border-rose-900/50">
                              <AlertTriangle size={18} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-black text-slate-900 dark:text-white mb-1 group-hover:text-primary-600 transition-colors uppercase tracking-tight">{student.code}</h3>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Pedagogical Insights</p>
                        </div>
                        <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-700">
                          <div>
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Resilience</span>
                              <span className="text-[9px] font-black text-emerald-600 uppercase">{score.q1}/5</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 transition-all duration-1000" style={{width: `${(score.q1/5)*100}%`}} />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Focus</span>
                              <span className="text-[9px] font-black text-primary-600 uppercase">{score.q3}/5</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div className="h-full bg-primary-500 transition-all duration-1000" style={{width: `${(score.q3/5)*100}%`}} />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {view === 'seating' && (
                <div className="space-y-12">
                  <div className="bg-white dark:bg-slate-800 p-8 rounded-[40px] border dark:border-slate-700 shadow-sm relative overflow-hidden">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
                      <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase">{t.seatingLegend}</h3>
                      <div className="flex flex-wrap gap-4">
                        <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-2xl">
                          {(['rows', 'clusters', 'ushape'] as SeatingShape[]).map(s => (
                            <button key={s} onClick={() => setSeatingShape(s)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${seatingShape === s ? 'bg-white dark:bg-slate-600 text-primary-600 shadow-sm' : 'text-slate-400'}`}>
                              {s}
                            </button>
                          ))}
                        </div>
                        <button onClick={handleSaveLayout} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-md hover:bg-slate-800"><Save size={16} /> {t.saveLayout}</button>
                      </div>
                    </div>

                    <div className={`grid gap-8 py-8 ${seatingShape === 'clusters' ? 'grid-cols-2 lg:grid-cols-3' : seatingShape === 'rows' ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-5'}`}>
                      {/* Generating desks based on current shape mapping */}
                      {/* Fix: Explicitly cast Object.values to SeatPos[] to prevent 'unknown' type errors on line 522 */}
                      {Array.from(new Set((Object.values(currentSeatingMap) as SeatPos[]).map(p => `${p.row}-${p.col}`))).map(posKey => {
                        const [row, col] = posKey.split('-').map(Number);
                        const deskStudents = filteredStudents.filter(s => currentSeatingMap[s.id]?.row === row && currentSeatingMap[s.id]?.col === col)
                          .sort((a, b) => currentSeatingMap[a.id].seatIndex - currentSeatingMap[b.id].seatIndex);
                        const synergy = deskStudents.length >= 2 ? getPairSynergy(deskStudents[0].id, deskStudents[1].id, MOCK_ANSWERS, lang) : null;

                        return (
                          <div key={posKey} onDragOver={(e) => { e.preventDefault(); setDragOverDesk({row, col}); }} onDrop={(e) => handleDrop(e, row, col)} className={`relative p-6 rounded-[32px] border-2 border-dashed flex flex-wrap gap-3 items-center justify-center transition-all ${dragOverDesk?.row === row && dragOverDesk?.col === col ? 'border-primary-500 bg-primary-50' : 'border-slate-200 bg-slate-50/50'}`}>
                            {deskStudents.map(s => (
                              <div key={s.id} draggable onDragStart={(e) => e.dataTransfer.setData('studentId', s.id)} onMouseEnter={() => setHoveredStudentId(s.id)} onMouseLeave={() => setHoveredStudentId(null)} className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 flex flex-col items-center justify-center relative hover:scale-105 transition-all cursor-grab active:cursor-grabbing group">
                                {hoveredStudentId === s.id && <StudentInfoPopover student={s} lang={lang} />}
                                <User size={20} className="text-primary-500 mb-1" />
                                <span className="text-[9px] font-black uppercase">{s.code.split('-')[1]}</span>
                              </div>
                            ))}
                            {synergy && (
                              <div className="absolute -top-3 -right-3" onMouseEnter={() => setHoveredSynergyId(posKey)} onMouseLeave={() => setHoveredSynergyId(null)}>
                                <div className={`w-8 h-8 rounded-full shadow-xl flex items-center justify-center border-2 bg-white ${synergy.type === 'warning' ? 'text-rose-500 border-rose-200' : 'text-primary-600 border-primary-200'}`}>
                                  <Zap size={14} className="fill-current" />
                                </div>
                                {hoveredSynergyId === posKey && <SynergyInfoPopover pair={[deskStudents[0].id, deskStudents[1].id]} lang={lang} />}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {view === 'report' && activeStudent && (
                <div className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-800 p-8 rounded-[40px] border border-slate-200 dark:border-slate-700 shadow-xl">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-primary-600 text-white rounded-[32px] flex items-center justify-center text-3xl font-black shadow-2xl ring-4 ring-primary-50 dark:ring-primary-900/30">
                        {activeStudent.code.split('-')[1]}
                      </div>
                      <div>
                        <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-2">
                          {activeStudent.code}
                        </h3>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-emerald-500" /> Deep Pedagogical Profile
                        </p>
                      </div>
                    </div>
                    <button onClick={handleGenerateAIAnalysis} disabled={isGeneratingAnalysis} className="px-8 py-4 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:shadow-2xl hover:shadow-primary-500/40 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                      {isGeneratingAnalysis ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                      {t.aiAnalysisBtn}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     {(['cognitive', 'emotional', 'needs'] as const).map(cat => (
                        <div key={cat} className="bg-white dark:bg-slate-800 rounded-[32px] p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                          <h5 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-3">
                            {cat === 'cognitive' ? <BrainCircuit size={20} /> : cat === 'emotional' ? <Heart size={20} /> : <Users size={20} />}
                            {cat.toUpperCase()}
                          </h5>
                          <div className="space-y-4">
                            {analyzeStudentData(MOCK_ANSWERS[activeStudent.id], lang).filter(i => i.category === cat).map((insight, idx) => {
                               const colors = getInsightColor(insight.category);
                               return (
                                  <div key={idx} className={`${colors.bg} p-5 rounded-2xl border ${colors.border}`}>
                                     <p className={`text-sm font-black ${colors.text} mb-2`}>{insight.title}</p>
                                     <p className="text-xs font-bold text-slate-900 leading-relaxed mb-4">{insight.description}</p>
                                     <div className="flex items-start gap-2 bg-white/60 p-3 rounded-xl border border-black/5">
                                        <p className={`text-[11px] font-black ${colors.text} italic leading-snug`}>"{insight.recommendations[0]?.practical}"</p>
                                     </div>
                                  </div>
                               );
                            })}
                          </div>
                        </div>
                     ))}
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-[40px] border border-slate-200 dark:border-slate-700 shadow-inner">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2"><MessageCircle size={18} /> {t.teacherNotes}</h4>
                    <div className="space-y-4 max-h-60 overflow-y-auto mb-6 pr-2">
                      {notes.filter(n => n.studentId === activeStudent.id).map(note => (
                        <div key={note.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-start justify-between group">
                          <div className="flex gap-3">
                            {note.isTask ? <Bell size={14} className="text-amber-500 mt-0.5" /> : <FileText size={14} className="text-slate-400 mt-0.5" />}
                            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{note.content}</p>
                          </div>
                          <button onClick={() => setNotes(notes.filter(n => n.id !== note.id))} className="text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /></button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input type="text" value={newNoteContent} onChange={(e) => setNewNoteContent(e.target.value)} placeholder={t.notesPlaceholder} className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl text-xs font-bold outline-none focus:ring-2 ring-primary-500/20" />
                      <button onClick={addNote} className="p-4 bg-primary-600 text-white rounded-2xl hover:bg-primary-500 transition-all shadow-lg"><Plus size={20} /></button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 p-4 flex justify-around items-center z-50">
        <button onClick={() => setView('dashboard')} className={`p-3 rounded-2xl ${view === 'dashboard' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400'}`}><LayoutDashboard size={24} /></button>
        <button onClick={() => setView('seating')} className={`p-3 rounded-2xl ${view === 'seating' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400'}`}><LayoutGrid size={24} /></button>
        <button onClick={handleLogout} className="p-3 rounded-2xl text-slate-400"><LogOut size={24} /></button>
      </nav>
    </div>
  );
};

export default App;
