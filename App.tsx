import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Users, 
  LayoutGrid, 
  LogOut, 
  ChevronLeft,
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
  Info
} from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip, Legend } from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { 
  Language, 
  Student,
  SeatPos,
  Recommendation
} from './types';
import { 
  TRANSLATIONS, 
  MOCK_TEACHERS, 
  MOCK_STUDENTS, 
  MOCK_ANSWERS,
  QUESTION_LABELS,
  FOOTER_CONTENT
} from './constants';
import { calculateAutomatedLayout, getPairSynergy, analyzeStudentData, getInsightColor, generateAIDeepAnalysis } from './services/analysisEngine';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const VideoBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="w-full h-full object-cover scale-105 transition-transform duration-[10s] hover:scale-110"
        poster="https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2000&auto=format&fit=crop"
      >
        <source src="https://assets.mixkit.co/videos/preview/mixkit-abstract-flowing-blue-and-purple-gradient-background-video-2535-large.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" />
    </div>
  );
};

const LazyView: React.FC<{ children: React.ReactNode, threshold?: number, placeholderHeight?: string }> = ({ 
  children, 
  threshold = 0.1, 
  placeholderHeight = "h-20" 
}) => {
  const [isIntersecting, setIntersecting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIntersecting(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin: '50px' }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div ref={ref} className={`transition-all duration-700 ease-out ${isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {isIntersecting ? children : <div className={`${placeholderHeight} w-full animate-pulse bg-slate-100 rounded-2xl`} />}
    </div>
  );
};

// Safe wrapper to prevent Recharts "width(-1)" error during animations
const SafeResponsiveContainer: React.FC<{ children: React.ReactElement, width?: string | number, height?: string | number }> = ({ 
  children, 
  width = "100%", 
  height = "100%" 
}) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Delay rendering chart slightly to ensure container has painted dimensions
    const timer = setTimeout(() => setIsReady(true), 150);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) return (
    <div className="w-full h-full flex items-center justify-center bg-slate-50/50 rounded-2xl">
      <Loader2 className="animate-spin text-indigo-200" />
    </div>
  );

  return (
    <ResponsiveContainer width={width as any} height={height as any} minWidth={0} minHeight={0}>
      {children}
    </ResponsiveContainer>
  );
};

const StudentInfoPopover: React.FC<{ student: Student, lang: Language }> = ({ student, lang }) => {
  const insights = analyzeStudentData(MOCK_ANSWERS[student.id], lang);
  const isRtl = lang === 'he' || lang === 'ar';

  return (
    <div className={`absolute z-[600] bottom-full mb-4 w-72 bg-white rounded-[32px] shadow-2xl border border-slate-200 p-6 animate-in fade-in zoom-in-90 duration-200 pointer-events-none ring-1 ring-black/5 ${isRtl ? 'right-0' : 'left-0'}`}>
      <div className="flex items-center gap-4 mb-4 border-b border-slate-100 pb-4">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-100 text-lg">
          {student.code.split('-')[1]}
        </div>
        <div>
          <p className="text-sm font-black text-slate-900 leading-none mb-1">{student.code}</p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pedagogical Profile</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {insights.slice(0, 2).map((insight, idx) => {
          const styles = getInsightColor(insight.category);
          return (
            <div key={idx} className="space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${styles.bg} ${styles.text}`}>
                  {insight.category}
                </span>
                <span className="text-[9px] font-bold text-slate-400">Level: {insight.level}</span>
              </div>
              <h5 className="text-[11px] font-black text-slate-800 leading-tight">{insight.title}</h5>
              <p className="text-[10px] font-semibold text-slate-500 leading-normal line-clamp-2">{insight.description}</p>
            </div>
          );
        })}
      </div>
      
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="flex gap-1.5">
          {Object.keys(QUESTION_LABELS).map(q => (
            <div key={q} className="w-1.5 h-4 rounded-full bg-slate-100 overflow-hidden relative">
              <div 
                className="absolute bottom-0 left-0 w-full bg-indigo-500 rounded-full transition-all duration-500" 
                style={{ height: `${(MOCK_ANSWERS[student.id][q] / 5) * 100}%` }} 
              />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 uppercase tracking-tight">
          <Activity size={12} /> Live Analysis
        </div>
      </div>
    </div>
  );
};

const CookieBanner: React.FC<{ onAccept: () => void, onSettings: () => void, lang: Language }> = ({ onAccept, onSettings, lang }) => {
  const t = TRANSLATIONS[lang].cookies;
  const isRtl = lang === 'he' || lang === 'ar';
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[900] p-4 animate-in slide-in-from-bottom-full duration-500">
      <div className="max-w-5xl mx-auto bg-slate-900/95 backdrop-blur-md text-white p-6 rounded-[32px] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 border border-white/10 ring-1 ring-black/20" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-3 rounded-2xl shrink-0 animate-bounce">
            <Cookie size={24} className="text-white" />
          </div>
          <div>
            <h4 className="font-black text-sm uppercase tracking-wide mb-1">{t.title}</h4>
            <p className="text-xs font-medium text-slate-400 max-w-xl leading-relaxed">{t.intro}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
          <button onClick={onSettings} className="px-6 py-3 rounded-xl border border-white/20 text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-colors w-full md:w-auto">
            {t.saveSelection}
          </button>
          <button onClick={onAccept} className="px-6 py-3 rounded-xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-500 shadow-lg shadow-indigo-900/50 transition-all w-full md:w-auto">
            {t.acceptAll}
          </button>
        </div>
      </div>
    </div>
  );
};

const CookieSettingsModal: React.FC<{ onClose: () => void, lang: Language }> = ({ onClose, lang }) => {
  const t = TRANSLATIONS[lang].cookies;
  const isRtl = lang === 'he' || lang === 'ar';

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <Cookie className="text-amber-500" /> {t.title}
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
          </div>
          
          <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">
            {t.intro}
          </p>

          <div className="space-y-4 mb-8">
            {/* Essential */}
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 opacity-75 cursor-not-allowed">
              <div className="mt-1"><ToggleRight className="text-indigo-400" size={24} /></div>
              <div>
                <h4 className="text-sm font-black text-slate-900 mb-1">{t.essentialTitle}</h4>
                <p className="text-xs text-slate-500">{t.essentialDesc}</p>
              </div>
            </div>
            
            {/* Analytics */}
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 transition-colors group cursor-pointer">
              <div className="mt-1"><ToggleRight className="text-indigo-600 group-hover:scale-110 transition-transform" size={24} /></div>
              <div>
                <h4 className="text-sm font-black text-slate-900 mb-1">{t.analyticsTitle}</h4>
                <p className="text-xs text-slate-500">{t.analyticsDesc}</p>
              </div>
            </div>

            {/* Marketing */}
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 transition-colors group cursor-pointer">
              <div className="mt-1"><ToggleLeft className="text-slate-300 group-hover:text-indigo-600 transition-colors" size={24} /></div>
              <div>
                <h4 className="text-sm font-black text-slate-900 mb-1">{t.marketingTitle}</h4>
                <p className="text-xs text-slate-500">{t.marketingDesc}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-wide hover:bg-indigo-600 transition-all shadow-lg">
              {t.acceptAll}
            </button>
            <button onClick={onClose} className="w-full py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-black text-sm uppercase tracking-wide hover:bg-slate-50 transition-all">
              {t.saveSelection}
            </button>
          </div>
          
          <div className="mt-6 text-center">
             <a href="#" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-500 border-b border-transparent hover:border-indigo-500 transition-all pb-0.5">{t.policyLink}</a>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoModal: React.FC<{ pageKey: string, lang: Language, onClose: () => void }> = ({ pageKey, lang, onClose }) => {
  const content = FOOTER_CONTENT[pageKey] || FOOTER_CONTENT['overview'];
  const isRtl = lang === 'he' || lang === 'ar';
  
  const getIcon = () => {
    switch(pageKey) {
      case 'security': return <ShieldCheck size={32} className="text-emerald-500" />;
      case 'privacy': return <Lock size={32} className="text-indigo-500" />;
      case 'terms': return <Scale size={32} className="text-amber-500" />;
      case 'help': return <Info size={32} className="text-blue-500" />;
      case 'accessibility': return <UserCircle size={32} className="text-teal-500" />;
      default: return <FileText size={32} className="text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in zoom-in-95 duration-200" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 relative flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-50 rounded-2xl shadow-sm border border-slate-100">
              {getIcon()}
            </div>
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{content.title[lang] || content.title['en']}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} className="text-slate-400" /></button>
        </div>
        
        <div className="p-8 overflow-y-auto">
          <div className="prose prose-slate max-w-none">
            <p className="text-base font-medium text-slate-600 leading-8 whitespace-pre-line">
              {content.content[lang] || content.content['en']}
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-slate-50 bg-slate-50/50 flex justify-end shrink-0">
           <button onClick={onClose} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all">
             Close
           </button>
        </div>
      </div>
    </div>
  );
};

const SynergyModal: React.FC<{ pair: [string, string], lang: Language, onClose: () => void }> = ({ pair, lang, onClose }) => {
  const synergy = getPairSynergy(pair[0], pair[1], MOCK_ANSWERS, lang);
  
  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in zoom-in-95 duration-200">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{synergy.label}</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
          </div>
          
          <div className="bg-indigo-50 rounded-2xl p-6 mb-8 flex items-center justify-between border border-indigo-100">
            <div>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Synergy Score</p>
              <div className="text-4xl font-black text-indigo-600">{synergy.score}%</div>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin-slow flex items-center justify-center">
              <Zap size={24} className="text-indigo-600" />
            </div>
          </div>

          <div className="space-y-6">
            <section>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500" /> Pedagogical Advantages
              </h4>
              <ul className="grid grid-cols-1 gap-2">
                {synergy.advantages.map((adv, i) => (
                  <li key={i} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-100">{adv}</li>
                ))}
              </ul>
            </section>
            
            <section>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <AlertTriangle size={14} className="text-amber-500" /> Points to Monitor
              </h4>
              <ul className="grid grid-cols-1 gap-2">
                {synergy.risks.map((risk, i) => (
                  <li key={i} className="px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-xs font-bold border border-amber-100">{risk}</li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
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
  const [studentNotes, setStudentNotes] = useState<Record<string, string>>({});
  const [hoveredStudentId, setHoveredStudentId] = useState<string | null>(null);

  const [seatingMode, setSeatingMode] = useState<'auto' | 'manual'>('auto');
  const [autoSeating, setAutoSeating] = useState<Record<string, SeatPos>>({});
  const [manualSeating, setManualSeating] = useState<Record<string, SeatPos>>({});
  const [draggedStudentId, setDraggedStudentId] = useState<string | null>(null);
  const [dragOverDesk, setDragOverDesk] = useState<{row: number, col: number} | null>(null);
  const [showManualToast, setShowManualToast] = useState(false);
  const [hasSavedLayout, setHasSavedLayout] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'info'} | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  
  const [showCookieSettings, setShowCookieSettings] = useState(false);
  const [showCookieBanner, setShowCookieBanner] = useState(true);
  const [activeInfoPage, setActiveInfoPage] = useState<string | null>(null);

  const t = TRANSLATIONS[lang];
  const isRtl = lang === 'he' || lang === 'ar';

  useEffect(() => {
    const savedToken = localStorage.getItem('seatai-auth-token');
    const cookiesAccepted = localStorage.getItem('seatai-cookies-accepted');
    
    if (cookiesAccepted) {
      setShowCookieBanner(false);
    }

    if (savedToken) {
      const teacher = MOCK_TEACHERS.find(t => t.id === savedToken);
      if (teacher) {
        setActiveTeacher(teacher);
        setIsLoggedIn(true);
      }
    }
    setTimeout(() => setIsLoadingAuth(false), 800);
  }, []);

  const handleLogin = () => {
    setAuthError(false);
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
    setIsLoggedIn(false);
    setActiveTeacher(null);
    setSelectedClass(null);
    setTeacherCode('');
  };

  const handleAcceptCookies = () => {
    localStorage.setItem('seatai-cookies-accepted', 'true');
    setShowCookieBanner(false);
    setShowCookieSettings(false);
  };

  const filteredStudents = useMemo(() => {
    return MOCK_STUDENTS.filter(s => s.classId === selectedClass && MOCK_ANSWERS[s.id] && s.code.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [selectedClass, searchQuery]);

  const classAverages = useMemo(() => {
    if (!filteredStudents.length) return {};
    const totals: Record<string, number> = { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0 };
    filteredStudents.forEach(s => {
      const ans = MOCK_ANSWERS[s.id];
      if (ans) Object.keys(totals).forEach(key => totals[key] += ans[key] || 0);
    });
    const averages: Record<string, number> = {};
    Object.keys(totals).forEach(key => averages[key] = totals[key] / filteredStudents.length);
    return averages;
  }, [filteredStudents]);

  // Handle Seating Mode Transitions and Initial Save Check
  useEffect(() => {
    if (selectedClass) {
      const result = calculateAutomatedLayout(filteredStudents, MOCK_ANSWERS, lang);
      setAutoSeating(result as any);
      
      const saved = localStorage.getItem(`seatai-layout-${selectedClass}`);
      setHasSavedLayout(!!saved);

      if (seatingMode === 'auto') {
        setManualSeating(result as any);
      }
    }
  }, [selectedClass, lang, filteredStudents]);

  const currentSeatingMap = seatingMode === 'auto' ? autoSeating : manualSeating;

  const handleSaveLayout = () => {
    if (!selectedClass) return;
    localStorage.setItem(`seatai-layout-${selectedClass}`, JSON.stringify(currentSeatingMap));
    setHasSavedLayout(true);
    setNotification({ message: t.layoutSaved, type: 'success' });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLoadLayout = () => {
    if (!selectedClass) return;
    const saved = localStorage.getItem(`seatai-layout-${selectedClass}`);
    if (saved) {
      setManualSeating(JSON.parse(saved));
      setSeatingMode('manual');
      setNotification({ message: t.layoutLoaded, type: 'success' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleGenerateAIAnalysis = async () => {
    if (!activeStudent) return;
    setIsGeneratingAnalysis(true);
    const scores = MOCK_ANSWERS[activeStudent.id];
    const result = await generateAIDeepAnalysis(ai, activeStudent.code, scores, lang);
    setAiAnalysis(result);
    setIsGeneratingAnalysis(false);
  };

  const handleDragStart = (e: React.DragEvent, studentId: string) => {
    setDraggedStudentId(studentId);
    e.dataTransfer.setData('studentId', studentId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, row: number, col: number) => {
    e.preventDefault();
    setDragOverDesk({ row, col });
  };

  const handleDrop = (e: React.DragEvent, targetRow: number, targetCol: number) => {
    e.preventDefault();
    const studentId = e.dataTransfer.getData('studentId') || draggedStudentId;
    if (!studentId) return;

    setDragOverDesk(null);
    setDraggedStudentId(null);

    if (seatingMode === 'auto') {
      setSeatingMode('manual');
      setShowManualToast(true);
      setTimeout(() => setShowManualToast(false), 3000);
    }

    const newManualSeating = { ...manualSeating };
    
    const studentsAtTarget = Object.entries(newManualSeating)
      .filter(([id, pos]) => pos.row === targetRow && pos.col === targetCol)
      .map(([id, pos]) => ({ id, ...pos }));

    if (studentsAtTarget.length >= 2) {
      const targetStudent = studentsAtTarget.find(s => s.seatIndex === 0) || studentsAtTarget[0];
      const oldPos = newManualSeating[studentId];
      
      if (!oldPos) return;

      newManualSeating[studentId] = { 
        ...oldPos, 
        row: targetRow, 
        col: targetCol, 
        seatIndex: targetStudent.seatIndex 
      };
      
      newManualSeating[targetStudent.id] = { 
        ...newManualSeating[targetStudent.id], 
        row: oldPos.row, 
        col: oldPos.col, 
        seatIndex: oldPos.seatIndex 
      };
    } else {
      const oldPos = newManualSeating[studentId];
      if (!oldPos) return;

      const nextIndex = studentsAtTarget.length === 0 ? 0 : (studentsAtTarget[0].seatIndex === 0 ? 1 : 0);
      
      newManualSeating[studentId] = { 
        ...oldPos, 
        row: targetRow, 
        col: targetCol, 
        seatIndex: nextIndex 
      };
    }

    setManualSeating(newManualSeating);
  };

  const handleResetToAI = () => {
    setSeatingMode('auto');
    setManualSeating(autoSeating);
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="bg-indigo-600 p-4 rounded-3xl animate-pulse shadow-2xl shadow-indigo-500/50">
            <BrainCircuit size={48} className="text-white" />
          </div>
          <div className="flex gap-2">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
          </div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
        <VideoBackground />
        {showCookieBanner && <CookieBanner onAccept={handleAcceptCookies} onSettings={() => setShowCookieSettings(true)} lang={lang} />}
        {showCookieSettings && <CookieSettingsModal onClose={() => setShowCookieSettings(false)} lang={lang} />}
        {activeInfoPage && <InfoModal pageKey={activeInfoPage} lang={lang} onClose={() => setActiveInfoPage(null)} />}
        
        <div className="relative z-10 flex flex-col min-h-screen">
          <header className="w-full p-6 flex justify-between items-center max-w-6xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/30">
                <BrainCircuit size={24} />
              </div>
              <h1 className="text-xl font-black text-white tracking-tighter uppercase drop-shadow-md">SEATAI</h1>
            </div>
            <LanguageSwitcher current={lang} set={setLang} />
          </header>
          
          <div className="flex-1 flex items-center justify-center p-6 w-full">
            <div className={`glass p-10 rounded-[48px] shadow-2xl w-full max-w-md border border-white/40 relative overflow-hidden animate-in fade-in zoom-in duration-700 ${authError ? 'animate-shake border-rose-500/50' : ''}`}>
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />
              
              <div className="flex justify-center mb-8">
                <div className="bg-slate-900/90 p-6 rounded-[32px] text-white shadow-2xl backdrop-blur-md ring-4 ring-white/20">
                  <KeyRound size={44} />
                </div>
              </div>

              <h1 className="text-3xl font-black text-center text-slate-900 mb-2 uppercase tracking-tight leading-none">{t.loginTitle}</h1>
              <p className="text-center text-slate-500 mb-10 font-bold text-sm uppercase tracking-wide px-4">{t.loginSubtitle}</p>

              <div className="space-y-6">
                <div className="relative group">
                  <input 
                    type="password" 
                    placeholder={t.teacherCodePlaceholder} 
                    className="w-full px-6 py-6 border border-white/50 rounded-3xl bg-white/60 focus:bg-white transition-all text-center text-4xl font-black shadow-inner outline-none focus:ring-8 ring-indigo-500/10 placeholder:text-slate-300" 
                    value={teacherCode} 
                    onChange={(e) => setTeacherCode(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()} 
                  />
                </div>

                <button 
                  onClick={handleLogin} 
                  className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-lg uppercase shadow-2xl hover:bg-indigo-600 transition-all active:scale-[0.98] transform hover:-translate-y-1 flex items-center justify-center gap-3 group"
                >
                  {t.loginButton}
                  <ArrowRight size={20} className={`transition-transform group-hover:translate-x-1 ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                </button>

                {authError && (
                  <p className="text-rose-600 text-center font-black text-xs uppercase tracking-widest animate-in fade-in slide-in-from-top-2">
                    {t.authError}
                  </p>
                )}
              </div>

              <div className="mt-12 flex items-center justify-center gap-6 border-t border-slate-200 pt-8">
                <div className="flex flex-col items-center gap-1 opacity-50 grayscale hover:grayscale-0 transition-all cursor-default">
                  <ShieldCheck size={20} className="text-emerald-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">HIPAA COMPLIANT</span>
                </div>
                <div className="w-px h-6 bg-slate-200" />
                <div className="flex flex-col items-center gap-1 opacity-50 grayscale hover:grayscale-0 transition-all cursor-default">
                  <Lock size={20} className="text-indigo-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">AES-256 ENCRYPTED</span>
                </div>
              </div>
            </div>
          </div>
          
          <footer className="w-full p-8 text-center bg-white/10 backdrop-blur-md border-t border-white/20">
             <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black text-white/70 uppercase tracking-widest">
               <div className="flex flex-col md:flex-row items-center gap-6">
                 <span className="opacity-80">© 2024 SEATAI INC.</span>
                 <span className="hidden md:inline text-white/20">|</span>
                 <div className="flex items-center gap-6">
                     <button onClick={() => setActiveInfoPage('help')} className="hover:text-white transition-colors">Help</button>
                     <button onClick={() => setActiveInfoPage('accessibility')} className="hover:text-white transition-colors">Accessibility</button>
                     <button onClick={() => setActiveInfoPage('security')} className="hover:text-white transition-colors">Security</button>
                 </div>
               </div>
               <div className="flex items-center gap-6">
                 <button onClick={() => setShowCookieSettings(true)} className="hover:text-white transition-colors flex items-center gap-2">
                   <Cookie size={12} /> Cookies
                 </button>
                 <button onClick={() => setActiveInfoPage('privacy')} className="hover:text-white transition-colors">Privacy</button>
                 <button onClick={() => setActiveInfoPage('terms')} className="hover:text-white transition-colors">Terms</button>
               </div>
             </div>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex" dir={isRtl ? 'rtl' : 'ltr'}>
      {activeSynergyPair && <SynergyModal pair={activeSynergyPair} lang={lang} onClose={() => setActiveSynergyPair(null)} />}
      {showCookieBanner && <CookieBanner onAccept={handleAcceptCookies} onSettings={() => setShowCookieSettings(true)} lang={lang} />}
      {showCookieSettings && <CookieSettingsModal onClose={() => setShowCookieSettings(false)} lang={lang} />}
      {activeInfoPage && <InfoModal pageKey={activeInfoPage} lang={lang} onClose={() => setActiveInfoPage(null)} />}
      
      {showManualToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[1000] animate-in slide-in-from-top-4 duration-300">
          <div className="bg-amber-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-amber-500">
            <Hand size={18} />
            <span className="text-xs font-black uppercase tracking-widest">{lang === 'he' ? 'מצב הושבה ידני הופעל' : 'Manual Seating Mode Active'}</span>
          </div>
        </div>
      )}

      {notification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[1000] animate-in slide-in-from-top-4 duration-300">
          <div className="bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500">
            <CheckCircle2 size={18} />
            <span className="text-xs font-black uppercase tracking-widest">{notification.message}</span>
          </div>
        </div>
      )}
      
      <aside className={`w-20 lg:w-72 bg-white border-${isRtl ? 'l' : 'r'} border-slate-200 flex flex-col transition-all shadow-sm shrink-0 relative z-20`}>
        <div className="p-8 border-b border-slate-50 flex items-center gap-4">
          <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-100"><BrainCircuit size={28} /></div>
          <span className="text-xl font-black text-slate-900 hidden lg:block uppercase tracking-tighter">SEATAI</span>
        </div>
        
        <div className="p-6 hidden lg:block">
          <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Session</span>
            </div>
            <p className="text-sm font-black text-slate-900">{activeTeacher?.name}</p>
            <p className="text-[11px] font-bold text-indigo-500 uppercase">{activeTeacher?.role}</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-3">
          <button onClick={() => setView('dashboard')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${view === 'dashboard' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 font-bold' : 'text-slate-500 hover:bg-slate-50 font-semibold'}`}><LayoutDashboard size={20} /><span className="hidden lg:block text-sm uppercase tracking-wide">Dashboard</span></button>
          <button onClick={() => setView('seating')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${view === 'seating' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 font-bold' : 'text-slate-500 hover:bg-slate-50 font-semibold'}`}><LayoutGrid size={20} /><span className="hidden lg:block text-sm uppercase tracking-wide">Smart Seating</span></button>
        </nav>

        <div className="p-6 border-t border-slate-50">
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-4 p-4 rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all w-full font-black text-xs uppercase tracking-widest group"
          >
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
            <span className="hidden lg:block">{t.logout}</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200 p-6 lg:px-10 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-6">
            {selectedClass && <button onClick={() => setSelectedClass(null)} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-400 transition-colors shadow-sm"><ArrowLeft size={20} className={isRtl ? 'rotate-180' : ''} /></button>}
            <div>
              <h2 className="text-2xl font-black text-slate-900 leading-none mb-1 uppercase tracking-tight">{selectedClass || 'System Root'}</h2>
              <div className="flex items-center gap-2"><span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{selectedClass ? `${filteredStudents.length} Profiles Synced` : 'Waiting for context'}</span></div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <LanguageSwitcher current={lang} set={setLang} />
            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg overflow-hidden ring-4 ring-white">
              <UserCircle size={28} />
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 lg:p-12 max-w-7xl mx-auto w-full">
          {!selectedClass ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 mt-10">
              <div className="w-full max-w-3xl text-center">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="w-12 h-1 bg-indigo-600 rounded-full" />
                  <span className="text-sm font-black text-indigo-600 uppercase tracking-widest">Pedagogical Access</span>
                  <div className="w-12 h-1 bg-indigo-600 rounded-full" />
                </div>
                <h2 className="text-5xl font-black text-slate-900 mb-12 uppercase tracking-tighter">{t.selectClass}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {activeTeacher?.classes.map((cls: string) => (
                    <button key={cls} onClick={() => setSelectedClass(cls)} className="bg-white p-16 rounded-[48px] border-2 border-transparent hover:border-indigo-500 hover:shadow-2xl hover:-translate-y-2 transition-all group flex flex-col items-center shadow-xl border-slate-100">
                      <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center text-indigo-600 mb-8 group-hover:bg-indigo-600 group-hover:text-white group-hover:rotate-6 transition-all duration-500 shadow-inner">
                        <Users size={48} />
                      </div>
                      <span className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-2">{cls}</span>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Select Workspace</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
              {view === 'dashboard' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                  {filteredStudents.map(student => (
                    <LazyView key={student.id} placeholderHeight="h-40">
                      <div onClick={() => { setActiveStudent(student); setView('report'); }} className="bento-card bg-white p-7 border border-slate-200 cursor-pointer shadow-md group hover:ring-4 ring-indigo-500/10">
                        <div className="flex items-center justify-between mb-6">
                          <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg group-hover:rotate-12 transition-transform">{student.code.split('-')[1]}</div>
                          {MOCK_ANSWERS[student.id].q1 <= 2 && <div className="p-2 bg-rose-50 rounded-xl text-rose-500 animate-pulse"><AlertTriangle size={18} /></div>}
                        </div>
                        <h3 className="text-base font-black text-slate-900 mb-1">{student.code}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">View Analytics</p>
                        <div className="space-y-3 mt-4">
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 transition-all duration-1000" style={{width: `${(MOCK_ANSWERS[student.id].q1/5)*100}%`}} /></div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 transition-all duration-1000" style={{width: `${(MOCK_ANSWERS[student.id].q3/5)*100}%`}} /></div>
                        </div>
                      </div>
                    </LazyView>
                  ))}
                </div>
              )}

              {view === 'seating' && (
                <div className="space-y-12 animate-in fade-in duration-500">
                  <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between mb-12">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{t.seatingLegend}</h3>
                          {seatingMode === 'manual' && (
                            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                              <Hand size={12} /> Manual Override
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-2">AI-Driven Spatial Topology</p>
                      </div>
                      <div className="flex gap-4">
                        {hasSavedLayout && (
                          <button 
                            onClick={handleLoadLayout}
                            className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
                          >
                            <Download size={16} /> {t.loadLayout}
                          </button>
                        )}
                        
                        <button 
                          onClick={handleSaveLayout}
                          className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-md"
                        >
                          <Save size={16} /> {t.saveLayout}
                        </button>

                        {seatingMode === 'manual' ? (
                          <button 
                            onClick={handleResetToAI}
                            className="px-6 py-3 bg-indigo-100 text-indigo-700 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-200 transition-all shadow-sm"
                          >
                            <RefreshCw size={16} /> {lang === 'he' ? 'חזור להצעת AI' : 'Reset to AI'}
                          </button>
                        ) : (
                          <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg hover:bg-indigo-700 transition-all">
                            <RefreshCw size={16} /> Recalculate AI
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto py-8">
                      {Array.from({ length: 4 }).map((_, row) => (
                        Array.from({ length: 2 }).map((_, col) => {
                          const deskStudents = filteredStudents.filter(s => {
                            const pos = currentSeatingMap[s.id];
                            return pos && pos.row === row && pos.col === col;
                          }).sort((a, b) => (currentSeatingMap[a.id].seatIndex - currentSeatingMap[b.id].seatIndex));
                          
                          const isOver = dragOverDesk?.row === row && dragOverDesk?.col === col;

                          return (
                            <LazyView key={`${row}-${col}`} placeholderHeight="h-56">
                              <div 
                                onDragOver={(e) => handleDragOver(e, row, col)}
                                onDrop={(e) => handleDrop(e, row, col)}
                                className={`relative p-6 rounded-[32px] border-4 border-dashed flex flex-col items-center justify-center min-h-[220px] transition-all duration-300 ${
                                  isOver ? 'border-indigo-500 bg-indigo-50/50 scale-[1.02]' : 'border-slate-200 bg-slate-50'
                                } group hover:border-indigo-300`}
                              >
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white px-4 py-1 rounded-full border border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">Desk {row + 1}-{col + 1}</div>
                                
                                <div className="flex gap-6 items-center">
                                  {deskStudents.length === 0 && (
                                    <div className="w-24 h-24 rounded-2xl border-2 border-slate-100 border-dashed flex items-center justify-center text-slate-200">
                                      <UserPlus size={40} />
                                    </div>
                                  )}
                                  {deskStudents.map((s, i) => (
                                    <div 
                                      key={s.id} 
                                      draggable
                                      onDragStart={(e) => handleDragStart(e, s.id)}
                                      onDragEnd={() => setDraggedStudentId(null)}
                                      className={`w-24 h-24 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center relative hover:scale-105 transition-all group/student cursor-grab active:cursor-grabbing ${
                                        draggedStudentId === s.id ? 'opacity-40 grayscale blur-[1px]' : 'opacity-100'
                                      }`}
                                      onMouseEnter={() => setHoveredStudentId(s.id)}
                                      onMouseLeave={() => setHoveredStudentId(null)}
                                    >
                                      {hoveredStudentId === s.id && <StudentInfoPopover student={s} lang={lang} />}
                                      <User size={32} className="text-indigo-600 mb-2 pointer-events-none" />
                                      <span className="text-xs font-black text-slate-900 pointer-events-none">{s.code}</span>
                                      
                                      {/* Indicator for manual override on specific card */}
                                      {seatingMode === 'manual' && (
                                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-sm border border-white animate-in zoom-in">
                                          <Hand size={10} />
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                  {deskStudents.length === 1 && (
                                    <div className="w-24 h-24 rounded-2xl border-2 border-slate-100 border-dashed flex items-center justify-center text-slate-100">
                                      <UserPlus size={40} />
                                    </div>
                                  )}
                                </div>

                                {deskStudents.length === 2 && seatingMode === 'auto' && (
                                  <button 
                                    onClick={() => setActiveSynergyPair([deskStudents[0].id, deskStudents[1].id])}
                                    className="mt-6 flex items-center gap-2 px-4 py-1.5 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-indigo-700 active:scale-95 transition-all"
                                  >
                                    <LinkIcon size={12} /> View AI Synergy
                                  </button>
                                )}
                              </div>
                            </LazyView>
                          );
                        })
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {view === 'report' && activeStudent && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm transition-all"><ChevronLeft size={14} className={isRtl ? 'rotate-180' : ''} />{t.backToDashboard}</button>
                  <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-8"><div className="w-20 h-20 bg-indigo-600 text-white rounded-3xl flex items-center justify-center font-black text-4xl shadow-xl">{activeStudent.code.split('-')[1]}</div><div><h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">{activeStudent.code}</h3><div className="flex gap-2"><span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-widest">Pedagogical DNA</span></div></div></div>
                    <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg flex items-center gap-2"><Save size={20} /> Save Report</button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8 min-w-0">
                      <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden min-h-[450px]">
                        <div className="flex items-center justify-between mb-8">
                          <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">DNA Synthesis</h4>
                          <button 
                            onClick={handleGenerateAIAnalysis}
                            disabled={isGeneratingAnalysis}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-100 transition-all disabled:opacity-50"
                          >
                            {isGeneratingAnalysis ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                            {isGeneratingAnalysis ? t.generating : t.aiAnalysisBtn}
                          </button>
                        </div>

                        {/* AI Deep Dive Section */}
                        {aiAnalysis && (
                          <div className="mb-8 p-6 bg-indigo-50 rounded-2xl border border-indigo-100 animate-in fade-in slide-in-from-top-2">
                            <h5 className="flex items-center gap-2 text-xs font-black text-indigo-700 uppercase tracking-widest mb-3">
                              <BrainCircuit size={14} /> {t.aiAnalysisTitle}
                            </h5>
                            <p className="text-sm text-slate-700 leading-relaxed font-medium">{aiAnalysis}</p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <div className="h-72 w-full relative min-h-[288px] min-w-0 bg-slate-50/50 rounded-2xl overflow-hidden">
                            <SafeResponsiveContainer>
                              <RadarChart 
                                data={Object.keys(QUESTION_LABELS).map(key => ({ 
                                  subject: QUESTION_LABELS[key][lang], 
                                  value: MOCK_ANSWERS[activeStudent.id][key], 
                                  average: classAverages[key] || 0, // Add Class Average
                                  fullMark: 5 
                                }))}
                              >
                                <PolarGrid stroke="#f1f5f9" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'black' }} />
                                {/* Class Average Radar */}
                                <Radar 
                                  name={t.classAverage} 
                                  dataKey="average" 
                                  stroke="#94a3b8" 
                                  fill="#94a3b8" 
                                  fillOpacity={0.2} 
                                  strokeDasharray="4 4" 
                                />
                                {/* Student Radar */}
                                <Radar 
                                  name={t.studentScore} 
                                  dataKey="value" 
                                  stroke="#6366f1" 
                                  fill="#6366f1" 
                                  fillOpacity={0.4} 
                                />
                                <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                                <Tooltip 
                                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                />
                              </RadarChart>
                            </SafeResponsiveContainer>
                          </div>
                          <div className="flex flex-col justify-center space-y-6">
                            {analyzeStudentData(MOCK_ANSWERS[activeStudent.id], lang).map((insight, idx) => (
                              <div key={idx} className={`p-6 rounded-2xl border ${getInsightColor(insight.category).bg} ${getInsightColor(insight.category).border}`}>
                                <h5 className={`text-sm font-black uppercase mb-3 ${getInsightColor(insight.category).text}`}>{insight.title}</h5>
                                <p className="text-xs font-bold text-slate-700">{insight.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <LazyView placeholderHeight="h-96">
                        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
                          <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8 flex items-center gap-4 border-b pb-4"><Zap size={24} className="text-amber-500 fill-amber-500" />{t.actionableRecs}</h4>
                          <div className="grid grid-cols-1 gap-6">
                            {analyzeStudentData(MOCK_ANSWERS[activeStudent.id], lang).flatMap(i => i.recommendations).map((rec: Recommendation, idx) => (
                              <div key={idx} className="flex flex-col gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-200 group hover:border-indigo-300 transition-all">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs">{idx + 1}</div>
                                  <h5 className="text-sm font-black text-slate-900 uppercase tracking-wide">{rec.action}</h5>
                                </div>
                                <div className="flex gap-4 items-start pl-2">
                                  <div className={`pt-1 ${isRtl ? 'rotate-180' : ''}`}><ArrowRight size={18} className="text-indigo-400 shrink-0" /></div>
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Practical Step:</p>
                                    <p className="text-sm font-bold text-slate-600 leading-relaxed italic border-l-2 border-indigo-100 pl-4 bg-indigo-50/30 py-2 rounded-r-lg">{rec.practical}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </LazyView>
                    </div>
                    <div className="space-y-8">
                      <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm h-fit">
                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-3"><FileText size={18} className="text-indigo-600" /> Professional Notes</h4>
                        <textarea 
                          className={`w-full h-48 p-6 bg-slate-50 border rounded-3xl outline-none resize-none text-slate-800 font-bold text-sm ${isRtl ? 'text-right' : 'text-left'}`} 
                          placeholder="Enter observations..." 
                          value={studentNotes[activeStudent.id] || ''} 
                          onChange={e => setStudentNotes({...studentNotes, [activeStudent.id]: e.target.value})} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <footer className="mt-auto border-t border-slate-200 bg-white relative z-10">
            <div className="max-w-7xl mx-auto p-12 lg:p-16">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                <div className="col-span-1 md:col-span-1">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/30">
                      <BrainCircuit size={24} />
                    </div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase">SEATAI</h1>
                  </div>
                  <p className="text-xs text-slate-500 font-bold leading-relaxed mb-6">
                    Advanced pedagogical analytics platform powered by AI, designed for privacy-first educational environments.
                  </p>
                  <div className="flex gap-4">
                    <button className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"><Twitter size={16} /></button>
                    <button className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"><Linkedin size={16} /></button>
                    <button className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"><Facebook size={16} /></button>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-black text-xs text-slate-900 uppercase tracking-widest mb-6">Platform</h4>
                  <ul className="space-y-4 text-xs font-bold text-slate-500">
                    <li><button onClick={() => setActiveInfoPage('overview')} className="hover:text-indigo-600 transition-colors">Overview</button></li>
                    <li><button onClick={() => setActiveInfoPage('features')} className="hover:text-indigo-600 transition-colors">Features</button></li>
                    <li><button onClick={() => setActiveInfoPage('security')} className="hover:text-indigo-600 transition-colors">Security</button></li>
                    <li><button onClick={() => setActiveInfoPage('roadmap')} className="hover:text-indigo-600 transition-colors">Roadmap</button></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-black text-xs text-slate-900 uppercase tracking-widest mb-6">Support</h4>
                  <ul className="space-y-4 text-xs font-bold text-slate-500">
                    <li><button onClick={() => setActiveInfoPage('help')} className="hover:text-indigo-600 transition-colors">Help Center</button></li>
                    <li><button onClick={() => setActiveInfoPage('features')} className="hover:text-indigo-600 transition-colors">Documentation</button></li>
                    <li><button onClick={() => setActiveInfoPage('help')} className="hover:text-indigo-600 transition-colors">Contact Us</button></li>
                    <li><button onClick={() => setActiveInfoPage('overview')} className="hover:text-indigo-600 transition-colors">System Status</button></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-black text-xs text-slate-900 uppercase tracking-widest mb-6">Legal</h4>
                  <ul className="space-y-4 text-xs font-bold text-slate-500">
                    <li><button onClick={() => setActiveInfoPage('privacy')} className="hover:text-indigo-600 transition-colors">Privacy Policy</button></li>
                    <li><button onClick={() => setActiveInfoPage('terms')} className="hover:text-indigo-600 transition-colors">Terms of Service</button></li>
                    <li><button onClick={() => setShowCookieSettings(true)} className="hover:text-indigo-600 transition-colors">Cookie Policy</button></li>
                    <li><button onClick={() => setActiveInfoPage('accessibility')} className="hover:text-indigo-600 transition-colors">Accessibility</button></li>
                  </ul>
                </div>
              </div>
              
              <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">© 2024 SEATAI INC. All rights reserved.</p>
                <button onClick={() => setShowCookieSettings(true)} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">
                  <Cookie size={14} /> Cookie Preferences
                </button>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
};

// Simplified Language Switcher to match the new UI
const LanguageSwitcher: React.FC<{ current: Language, set: (l: Language) => void }> = ({ current, set }) => {
  return (
    <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
      {['he', 'en', 'ar', 'ru'].map((l) => (
        <button 
          key={l} 
          onClick={() => set(l as Language)} 
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${current === l ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
};

export default App;