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
  LayoutHistoryItem 
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
      {isIntersecting ? children : <div className={`${placeholderHeight} w-full animate-pulse bg-slate-100 dark:bg-slate-800 rounded-2xl`} />}
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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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
  const [imgError, setImgError] = useState(false);

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {!imgError ? (
        <img 
          src="./logo.png"
          alt="SEATAI"
          className="h-full w-auto object-contain transition-transform hover:scale-105 drop-shadow-sm"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="flex items-center gap-3">
          <div className="bg-primary-600 p-2 rounded-xl text-white shadow-lg shadow-primary-500/30">
            <Armchair size={24} />
          </div>
          <span className={`text-xl font-black tracking-tighter uppercase drop-shadow-md ${variant === 'light' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
            SEATAI
          </span>
        </div>
      )}
    </div>
  );
};

const StudentInfoPopover: React.FC<{ student: Student, lang: Language }> = ({ student, lang }) => {
  const answers = MOCK_ANSWERS[student.id];
  const insights = analyzeStudentData(answers, lang);
  const seatingAdvice = getSeatingAdvice(answers, lang);
  const isRtl = lang === 'he' || lang === 'ar';

  const cognitiveInsights = insights.filter(i => i.category === 'cognitive');

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
        <p className="text-[10px] font-medium mt-2 opacity-90 leading-tight bg-black/10 p-2 rounded-lg">
          "{seatingAdvice.reason}"
        </p>
      </div>

      <div className="p-5 space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-2">
          <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center font-black text-slate-500 text-sm">
            {student.code.split('-')[1]}
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white leading-none">{student.code}</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Quick Analysis Profile</p>
          </div>
        </div>

        {cognitiveInsights.length > 0 && (
          <div>
            <h5 className="flex items-center gap-2 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2">
              <BrainCircuit size={12} /> {lang === 'he' ? 'פרופיל קוגניטיבי' : 'Cognitive Style'}
            </h5>
            <div className="space-y-2">
              {cognitiveInsights.map((insight, idx) => (
                <div key={idx} className="bg-emerald-50/50 dark:bg-emerald-900/10 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{insight.title}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">{insight.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
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
       
       <div className="mb-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
         <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 leading-relaxed italic">
           "{synergy.academicRationale}"
         </p>
       </div>
       
       <div className="grid grid-cols-2 gap-3 mb-3">
         <div>
           <h5 className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1.5">
             <CheckCircle2 size={10} /> Benefits
           </h5>
           <ul className="space-y-1">
             {synergy.advantages.slice(0, 2).map((adv, i) => (
               <li key={i} className="text-[9px] font-medium text-emerald-700 dark:text-emerald-300 leading-tight flex items-start gap-1">
                 <span className="mt-0.5 w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
                 {adv}
               </li>
             ))}
           </ul>
         </div>
         <div>
           <h5 className="flex items-center gap-1.5 text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1.5">
             <AlertTriangle size={10} /> Risks
           </h5>
           <ul className="space-y-1">
             {synergy.risks.slice(0, 2).map((risk, i) => (
               <li key={i} className="text-[9px] font-medium text-amber-700 dark:text-amber-300 leading-tight flex items-start gap-1">
                 <span className="mt-0.5 w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
                 {risk}
               </li>
             ))}
           </ul>
         </div>
       </div>
       
       <p className="text-[8px] font-black text-slate-300 dark:text-slate-600 text-center uppercase tracking-[0.2em] mt-2 pt-2 border-t border-slate-50 dark:border-slate-800">
         {lang === 'he' ? 'לחץ להרחבה' : 'Click to expand'}
       </p>
       
       <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/95 dark:bg-slate-900/95 rotate-45 border-b border-r border-primary-100 dark:border-slate-700 backdrop-blur-xl"></div>
    </div>
  );
};

const HistoryModal: React.FC<{ 
  history: LayoutHistoryItem[], 
  onRestore: (item: LayoutHistoryItem) => void,
  onDelete: (id: string) => void,
  onClose: () => void,
  lang: Language 
}> = ({ history, onRestore, onDelete, onClose, lang }) => {
  const t = TRANSLATIONS[lang];
  const isRtl = lang === 'he' || lang === 'ar';

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in zoom-in-95 duration-200" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 dark:border-slate-800 relative flex flex-col max-h-[80vh]">
        <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              <History size={24} className="text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t.historyTitle}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X size={20} className="text-slate-400" /></button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-center">
              <History size={48} className="mb-4 opacity-20" />
              <p className="text-sm font-bold uppercase tracking-widest">{t.historyEmpty}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 group hover:border-primary-300 dark:hover:border-primary-700 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm">
                      <LayoutGrid size={18} className="text-slate-400 group-hover:text-primary-500 transition-colors" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 dark:text-white">
                        {new Date(item.timestamp).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </p>
                      <p className="text-xs font-bold text-slate-400">
                        {new Date(item.timestamp).toLocaleTimeString(undefined, { timeStyle: 'short' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onRestore(item)}
                      className="px-4 py-2 bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-all border border-slate-200 dark:border-slate-600 flex items-center gap-2"
                    >
                      <RotateCcw size={14} /> {t.restore}
                    </button>
                    <button 
                      onClick={() => onDelete(item.id)}
                      className="p-2 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all border border-rose-100 dark:border-rose-900/30"
                      title={t.delete}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CookieBanner: React.FC<{ onAccept: () => void, onSettings: () => void, lang: Language }> = ({ onAccept, onSettings, lang }) => {
  const t = TRANSLATIONS[lang].cookies;
  const isRtl = lang === 'he' || lang === 'ar';
  
  return (
    <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-[900] p-4 animate-in slide-in-from-bottom-full duration-500">
      <div className="max-w-5xl mx-auto bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md text-white p-6 rounded-[32px] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 border border-white/10 ring-1 ring-black/20" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="flex items-center gap-4">
          <div className="bg-primary-600 p-3 rounded-2xl shrink-0 animate-bounce">
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
          <button onClick={onAccept} className="px-6 py-3 rounded-xl bg-primary-600 text-white text-xs font-black uppercase tracking-widest hover:bg-primary-500 shadow-lg shadow-primary-900/50 transition-all w-full md:w-auto">
            {t.acceptAll}
          </button>
        </div>
      </div>
    </div>
  );
};

const CookieSettingsModal: React.FC<{ 
  onClose: () => void, 
  onSave: (prefs: { analytics: boolean, marketing: boolean }) => void,
  initialPrefs: { analytics: boolean, marketing: boolean },
  lang: Language 
}> = ({ onClose, onSave, initialPrefs, lang }) => {
  const t = TRANSLATIONS[lang].cookies;
  const isRtl = lang === 'he' || lang === 'ar';
  const [prefs, setPrefs] = useState(initialPrefs);

  const toggle = (key: 'analytics' | 'marketing') => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <Cookie className="text-amber-500" /> {t.title}
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-slate-400"><X size={20} /></button>
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">{t.intro}</p>
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 opacity-75 cursor-not-allowed">
              <div className="mt-1"><ToggleRight className="text-primary-400" size={24} /></div>
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white mb-1">{t.essentialTitle}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.essentialDesc}</p>
              </div>
            </div>
            <div 
              onClick={() => toggle('analytics')}
              className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer group ${prefs.analytics ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700'}`}
            >
              <div className="mt-1">
                {prefs.analytics ? <ToggleRight className="text-primary-600 dark:text-primary-400 transition-transform" size={24} /> : <ToggleLeft className="text-slate-300 dark:text-slate-600 group-hover:text-primary-400 transition-colors" size={24} />}
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white mb-1">{t.analyticsTitle}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.analyticsDesc}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <button onClick={() => onSave({ analytics: true, marketing: true })} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm uppercase tracking-wide hover:bg-primary-600 dark:hover:bg-slate-200 transition-all shadow-lg">{t.acceptAll}</button>
            <button onClick={() => onSave(prefs)} className="w-full py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl font-black text-sm uppercase tracking-wide hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">{t.saveSelection}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ThemeSettingsModal: React.FC<{
  onClose: () => void,
  theme: 'light' | 'dark',
  setTheme: (t: 'light' | 'dark') => void,
  accent: string,
  setAccent: (a: string) => void,
  lang: Language
}> = ({ onClose, theme, setTheme, accent, setAccent, lang }) => {
  const isRtl = lang === 'he' || lang === 'ar';
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3"><Palette className="text-primary-500" /> {lang === 'he' ? 'עיצוב ונראות' : 'Appearance'}</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-slate-400"><X size={20} /></button>
          </div>
          <div className="space-y-8">
             <div>
               <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">{lang === 'he' ? 'מצב תצוגה' : 'Display Mode'}</h4>
               <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setTheme('light')} className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 ${theme === 'light' ? 'border-primary-600 bg-primary-50 text-primary-900' : 'border-slate-100 text-slate-400'}`}>
                    <Sun size={24} /> <span className="text-xs font-black uppercase">{lang === 'he' ? 'בהיר' : 'Light'}</span>
                  </button>
                  <button onClick={() => setTheme('dark')} className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 ${theme === 'dark' ? 'border-primary-600 bg-primary-900/20 text-primary-100' : 'border-slate-800 text-slate-400'}`}>
                    <Moon size={24} /> <span className="text-xs font-black uppercase">{lang === 'he' ? 'כהה' : 'Dark'}</span>
                  </button>
               </div>
             </div>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
             <button onClick={onClose} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm uppercase tracking-wide hover:bg-primary-600 dark:hover:bg-slate-200 transition-all shadow-lg">{lang === 'he' ? 'סגור' : 'Close'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoModal: React.FC<{ pageKey: string, lang: Language, onClose: () => void }> = ({ pageKey, lang, onClose }) => {
  const content = FOOTER_CONTENT[pageKey] || FOOTER_CONTENT['overview'];
  const isRtl = lang === 'he' || lang === 'ar';
  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in zoom-in-95 duration-200" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-800 relative flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between shrink-0">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{content.title[lang]}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X size={24} className="text-slate-400" /></button>
        </div>
        <div className="p-8 overflow-y-auto">
          <p className="text-base font-medium text-slate-600 dark:text-slate-300 leading-8 whitespace-pre-line">{content.content[lang] || content.content['en']}</p>
        </div>
      </div>
    </div>
  );
};

const SynergyModal: React.FC<{ pair: [string, string], lang: Language, onClose: () => void }> = ({ pair, lang, onClose }) => {
  const synergy = getPairSynergy(pair[0], pair[1], MOCK_ANSWERS, lang);
  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in zoom-in-95 duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{synergy.label}</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-slate-400"><X size={20} /></button>
          </div>
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-2xl p-6 mb-8 flex items-center justify-between border border-primary-100 dark:border-primary-800">
            <div><p className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-1">Synergy Score</p><div className="text-4xl font-black text-primary-600 dark:text-primary-400">{synergy.score}%</div></div>
          </div>
          <div className="space-y-6">
            <section className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700">
              <h4 className="text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-3 flex items-center gap-2"><BrainCircuit size={14} /> Theory Reference</h4>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 italic">{synergy.academicRationale}</p>
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
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);
  const [view, setView] = useState<'dashboard' | 'report' | 'seating'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSynergyPair, setActiveSynergyPair] = useState<[string, string] | null>(null);
  const [hoveredStudentId, setHoveredStudentId] = useState<string | null>(null);
  const [hoveredSynergyId, setHoveredSynergyId] = useState<string | null>(null);

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
  const [layoutHistory, setLayoutHistory] = useState<LayoutHistoryItem[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showCookieSettings, setShowCookieSettings] = useState(false);
  const [showCookieBanner, setShowCookieBanner] = useState(true);
  const [cookiePrefs, setCookiePrefs] = useState({ analytics: false, marketing: false });
  const [activeInfoPage, setActiveInfoPage] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [accent, setAccent] = useState('indigo');
  const [showThemeSettings, setShowThemeSettings] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isTaskMode, setIsTaskMode] = useState(false);
  const [taskDueDate, setTaskDueDate] = useState('');

  const t = TRANSLATIONS[lang];
  const isRtl = lang === 'he' || lang === 'ar';

  const safeJsonParse = (str: string | null, fallback: any) => {
    if (!str) return fallback;
    try { return JSON.parse(str); } catch (e) { return fallback; }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('seatai-auth-token');
    const savedCookiePrefs = localStorage.getItem('seatai-cookie-prefs');
    const savedNotes = localStorage.getItem('seatai-notes');
    const savedTheme = localStorage.getItem('seatai-theme');
    const savedAccent = localStorage.getItem('seatai-accent');
    if (savedCookiePrefs) {
      setCookiePrefs(safeJsonParse(savedCookiePrefs, { analytics: false, marketing: false }));
      setShowCookieBanner(false);
    }
    if (savedNotes) setNotes(safeJsonParse(savedNotes, []));
    if (savedTheme === 'dark') setTheme('dark');
    if (savedAccent) setAccent(savedAccent);
    if (savedToken) {
      const teacher = MOCK_TEACHERS.find(t => t.id === savedToken);
      if (teacher) { setActiveTeacher(teacher); setIsLoggedIn(true); }
    }
    setTimeout(() => setIsLoadingAuth(false), 800);
  }, []);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('seatai-theme', theme);
  }, [theme]);

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

  const handleSaveCookiePrefs = (prefs: { analytics: boolean, marketing: boolean }) => {
    setCookiePrefs(prefs);
    localStorage.setItem('seatai-cookie-prefs', JSON.stringify(prefs));
    setShowCookieBanner(false); setShowCookieSettings(false);
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
      const result = calculateAutomatedLayout(filteredStudents, MOCK_ANSWERS, lang);
      setAutoSeating(result as any);
      if (seatingMode === 'auto') setManualSeating(result as any);
    }
  }, [selectedClass, lang, filteredStudents, seatingMode]);

  const currentSeatingMap = seatingMode === 'auto' ? autoSeating : manualSeating;

  const handleSaveLayout = () => {
    if (!selectedClass) return;
    localStorage.setItem(`seatai-layout-${selectedClass}`, JSON.stringify(currentSeatingMap));
    const updatedHistory = [{ id: Date.now().toString(), timestamp: new Date().toISOString(), layout: currentSeatingMap }, ...layoutHistory];
    setLayoutHistory(updatedHistory);
    localStorage.setItem(`seatai-history-${selectedClass}`, JSON.stringify(updatedHistory));
    setHasSavedLayout(true);
    setNotification({ message: t.layoutSaved, type: 'success' });
    setTimeout(() => setNotification(null), 3000);
  };

  // Fixed GoogleGenAI initialization to follow guidelines by creating a new instance before call.
  const handleGenerateAIAnalysis = async () => {
    if (!activeStudent) return;
    setIsGeneratingAnalysis(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const result = await generateAIDeepAnalysis(ai, activeStudent.code, MOCK_ANSWERS[activeStudent.id], lang);
    setAiAnalysis(result);
    setIsGeneratingAnalysis(false);
  };

  const handleRestoreHistory = (item: LayoutHistoryItem) => {
    setManualSeating(item.layout); setSeatingMode('manual'); setShowHistoryModal(false);
    setNotification({ message: t.layoutRestored, type: 'success' });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDragStart = (e: React.DragEvent, studentId: string) => {
    setDraggedStudentId(studentId);
    e.dataTransfer.setData('studentId', studentId);
  };

  const handleDrop = (e: React.DragEvent, targetRow: number, targetCol: number) => {
    e.preventDefault();
    const studentId = e.dataTransfer.getData('studentId') || draggedStudentId;
    if (!studentId || !selectedClass) return;
    setDragOverDesk(null); setDraggedStudentId(null);
    if (seatingMode === 'auto') { setSeatingMode('manual'); setShowManualToast(true); setTimeout(() => setShowManualToast(false), 3000); }
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
            <input type={showPassword ? "text" : "password"} placeholder={t.teacherCodePlaceholder} className="w-full px-6 py-6 border rounded-3xl bg-white/60 text-center text-4xl font-black outline-none mt-8" value={teacherCode} onChange={(e) => setTeacherCode(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
            <button onClick={handleLogin} className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-lg uppercase shadow-2xl mt-6 hover:bg-primary-600 transition-all">{t.loginButton}</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-screen bg-slate-50 dark:bg-slate-900 flex flex-col md:flex-row overflow-hidden transition-all" dir={isRtl ? 'rtl' : 'ltr'}>
      {activeSynergyPair && <SynergyModal pair={activeSynergyPair} lang={lang} onClose={() => setActiveSynergyPair(null)} />}
      {showCookieBanner && <CookieBanner onAccept={() => handleSaveCookiePrefs({ analytics: true, marketing: true })} onSettings={() => setShowCookieSettings(true)} lang={lang} />}
      {showHistoryModal && <HistoryModal history={layoutHistory} onRestore={handleRestoreHistory} onDelete={(id) => setLayoutHistory(lh => lh.filter(x => x.id !== id))} onClose={() => setShowHistoryModal(false)} lang={lang} />}
      
      <aside className={`hidden md:flex w-20 lg:w-72 bg-white dark:bg-slate-800 border-${isRtl ? 'l' : 'r'} border-slate-200 dark:border-slate-700 flex-col shadow-sm relative z-20`}>
        <div className="p-8 border-b dark:border-slate-700 flex items-center justify-center lg:justify-start h-24"><Logo className="h-full" /></div>
        <nav className="flex-1 p-4 space-y-3">
          <button onClick={() => setView('dashboard')} className={`w-full flex items-center gap-4 p-4 rounded-2xl ${view === 'dashboard' ? 'bg-primary-600 text-white shadow-xl' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}><LayoutDashboard size={20} /><span className="hidden lg:block text-sm font-bold uppercase tracking-wide">Dashboard</span></button>
          <button onClick={() => setView('seating')} className={`w-full flex items-center gap-4 p-4 rounded-2xl ${view === 'seating' ? 'bg-primary-600 text-white shadow-xl' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}><LayoutGrid size={20} /><span className="hidden lg:block text-sm font-bold uppercase tracking-wide">Seating</span></button>
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
                      <div 
                        key={student.id} 
                        onClick={() => { setActiveStudent(student); setView('report'); setAiAnalysis(null); }} 
                        className="bento-card bg-white dark:bg-slate-800 p-6 border border-slate-200 dark:border-slate-700 cursor-pointer shadow-md group hover:ring-4 ring-primary-500/10 transition-all flex flex-col h-full"
                      >
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
                          <h3 className="text-sm font-black text-slate-900 dark:text-white mb-1 group-hover:text-primary-600 transition-colors uppercase tracking-tight">
                            {student.code}
                          </h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Pedagogical Insights</p>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-700">
                          <div>
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Resilience</span>
                              <span className="text-[9px] font-black text-emerald-600 uppercase">{score.q1}/5</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-emerald-500 transition-all duration-1000" 
                                style={{width: `${(score.q1/5)*100}%`}} 
                              />
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Focus</span>
                              <span className="text-[9px] font-black text-primary-600 uppercase">{score.q3}/5</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary-500 transition-all duration-1000" 
                                style={{width: `${(score.q3/5)*100}%`}} 
                              />
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
                    <div className="flex justify-between items-center mb-12">
                      <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase">{t.seatingLegend}</h3>
                      <div className="flex gap-4">
                        <button onClick={handleSaveLayout} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-md hover:bg-slate-800"><Save size={16} /> {t.saveLayout}</button>
                        <button onClick={() => setShowHistoryModal(true)} className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100"><History size={16} /></button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto py-8">
                      {Array.from({ length: 4 }).map((_, row) => Array.from({ length: 2 }).map((_, col) => {
                        const deskStudents = filteredStudents.filter(s => currentSeatingMap[s.id]?.row === row && currentSeatingMap[s.id]?.col === col)
                          .sort((a, b) => (currentSeatingMap[a.id].seatIndex - currentSeatingMap[b.id].seatIndex));
                        
                        const isTargetDesk = dragOverDesk?.row === row && dragOverDesk?.col === col;
                        const synergy = deskStudents.length === 2 ? getPairSynergy(deskStudents[0].id, deskStudents[1].id, MOCK_ANSWERS, lang) : null;

                        return (
                          <div 
                            key={`${row}-${col}`} 
                            onDragOver={(e) => { e.preventDefault(); setDragOverDesk({row, col}); }} 
                            onDrop={(e) => handleDrop(e, row, col)} 
                            className={`relative p-8 rounded-[40px] border-4 border-dashed min-h-[240px] flex items-center justify-center transition-all duration-300 ${
                              isTargetDesk ? 'border-primary-500 bg-primary-50/50' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30'
                            }`}
                          >
                            <div className="flex gap-8 items-center relative z-10">
                              {deskStudents.length === 0 && <div className="w-24 h-24 rounded-3xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-200"><UserPlus size={40} /></div>}
                              
                              {deskStudents.map((s, idx) => (
                                <div 
                                  key={s.id} 
                                  draggable 
                                  onDragStart={(e) => handleDragStart(e, s.id)} 
                                  onMouseEnter={() => setHoveredStudentId(s.id)} 
                                  onMouseLeave={() => setHoveredStudentId(null)} 
                                  className="w-24 h-24 bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-600 flex flex-col items-center justify-center relative hover:scale-105 transition-all cursor-grab active:cursor-grabbing group/student"
                                >
                                  {hoveredStudentId === s.id && <StudentInfoPopover student={s} lang={lang} />}
                                  <div className="bg-primary-50 dark:bg-primary-900/30 p-2 rounded-xl mb-1 text-primary-600 dark:text-primary-400 group-hover/student:scale-110 transition-transform">
                                    <User size={24} />
                                  </div>
                                  <span className="text-[10px] font-black dark:text-white uppercase tracking-tighter">{s.code}</span>
                                </div>
                              ))}

                              {synergy && (
                                <>
                                  <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160%] h-[120%] -z-10 pointer-events-none transition-all duration-500`}>
                                     <div className={`absolute inset-0 border-2 rounded-[3rem] ${
                                       synergy.type === 'warning' ? 'border-rose-400 bg-rose-50/40 ring-rose-100' : 
                                       synergy.type === 'anchoring' ? 'border-primary-400 bg-primary-50/40 ring-primary-100' :
                                       synergy.type === 'modeling' ? 'border-emerald-400 bg-emerald-50/40 ring-emerald-100' :
                                       'border-blue-400 bg-blue-50/40 ring-blue-100'
                                     } transition-all duration-500 ring-8`} />
                                  </div>

                                  <div 
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
                                    onMouseEnter={() => setHoveredSynergyId(`${row}-${col}`)}
                                    onMouseLeave={() => setHoveredSynergyId(null)}
                                    onClick={() => setActiveSynergyPair([deskStudents[0].id, deskStudents[1].id])}
                                  >
                                    <div className={`w-10 h-10 bg-white dark:bg-slate-800 rounded-full border shadow-xl flex items-center justify-center cursor-help hover:scale-125 transition-all group ${
                                      synergy.type === 'warning' ? 'border-rose-200 text-rose-500' : 'border-primary-200 text-primary-600'
                                    }`}>
                                      <Zap size={18} className="fill-current" />
                                    </div>
                                    
                                    {hoveredSynergyId === `${row}-${col}` && (
                                      <SynergyInfoPopover pair={[deskStudents[0].id, deskStudents[1].id]} lang={lang} />
                                    )}
                                  </div>
                                </>
                              )}

                              {deskStudents.length === 1 && <div className="w-24 h-24 rounded-3xl border-2 border-dashed border-slate-100 flex items-center justify-center text-slate-100"><UserPlus size={32} /></div>}
                            </div>
                          </div>
                        );
                      }))}
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
                    <button 
                      onClick={handleGenerateAIAnalysis} 
                      disabled={isGeneratingAnalysis}
                      className="px-8 py-4 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:shadow-2xl hover:shadow-primary-500/40 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                    >
                      {isGeneratingAnalysis ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                      {t.aiAnalysisBtn}
                    </button>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-8 md:p-12 rounded-[40px] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:rotate-12 transition-transform duration-1000">
                      <Target size={200} />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center">
                      <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center text-5xl border border-white/30 shrink-0 shadow-inner">
                        {getSeatingAdvice(MOCK_ANSWERS[activeStudent.id], lang).icon}
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <p className="text-primary-300 font-black text-xs uppercase tracking-[0.3em] mb-3">{lang === 'he' ? 'המלצת הושבה אופטימלית' : 'Optimal Seating Placement'}</p>
                        <h4 className="text-3xl font-black uppercase mb-4 tracking-tight">
                          {getSeatingAdvice(MOCK_ANSWERS[activeStudent.id], lang).zone}
                        </h4>
                        <div className="bg-black/20 p-6 rounded-3xl border border-white/10">
                          <p className="text-base font-medium text-slate-100 leading-relaxed italic">
                            "{getSeatingAdvice(MOCK_ANSWERS[activeStudent.id], lang).reason}"
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-[40px] p-8 border border-slate-200 dark:border-slate-700 shadow-sm h-[450px]">
                      <div className="flex items-center justify-between mb-8">
                         <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Dimension Analysis</h4>
                         <Activity size={18} className="text-primary-500" />
                      </div>
                      <div className="h-[320px] w-full bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-4">
                        <SafeResponsiveContainer>
                          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                            { subject: QUESTION_LABELS.q1[lang], A: MOCK_ANSWERS[activeStudent.id].q1, fullMark: 5 },
                            { subject: QUESTION_LABELS.q2[lang], A: MOCK_ANSWERS[activeStudent.id].q2, fullMark: 5 },
                            { subject: QUESTION_LABELS.q3[lang], A: MOCK_ANSWERS[activeStudent.id].q3, fullMark: 5 },
                            { subject: QUESTION_LABELS.q4[lang], A: MOCK_ANSWERS[activeStudent.id].q4, fullMark: 5 },
                            { subject: QUESTION_LABELS.q5[lang], A: MOCK_ANSWERS[activeStudent.id].q5, fullMark: 5 },
                          ]}>
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                            <Radar name="Student" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                            <Tooltip />
                          </RadarChart>
                        </SafeResponsiveContainer>
                      </div>
                    </div>

                    <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-[40px] p-10 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                       <h4 className="flex items-center gap-3 text-primary-600 dark:text-primary-400 font-black text-xs uppercase tracking-[0.2em] mb-6">
                          <BrainCircuit size={20} /> {t.aiAnalysisTitle}
                       </h4>
                       <div className="min-h-[250px] flex flex-col">
                          {aiAnalysis ? (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                               <p className="text-xl font-bold text-slate-700 dark:text-slate-200 leading-relaxed">
                                  {aiAnalysis}
                                </p>
                            </div>
                          ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                               <Sparkles size={48} className="mb-4 opacity-20 animate-pulse" />
                               <p className="text-sm font-black uppercase tracking-widest">{isGeneratingAnalysis ? t.generating : "Deep Profile Ready to Generate"}</p>
                            </div>
                          )}
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="bg-white dark:bg-slate-800 rounded-[32px] p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                           <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl shadow-inner"><BrainCircuit size={24} /></div>
                           <h5 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Cognitive Depth</h5>
                        </div>
                        <div className="space-y-4">
                           {analyzeStudentData(MOCK_ANSWERS[activeStudent.id], lang).filter(i => i.category === 'cognitive').map((insight, idx) => {
                              const colors = getInsightColor(insight.category);
                              return (
                                 <div key={idx} className={`${colors.bg} dark:bg-emerald-900/10 p-5 rounded-2xl border ${colors.border} dark:border-emerald-900/30`}>
                                    <p className={`text-xs font-black ${colors.text} dark:text-emerald-400 mb-1`}>{insight.title}</p>
                                    <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 leading-relaxed mb-4">{insight.description}</p>
                                    <div className="flex items-start gap-2 bg-white/50 dark:bg-slate-900/50 p-2 rounded-lg">
                                       <span className={`${colors.icon} text-xs`}>💡</span>
                                       <p className={`text-[10px] font-bold ${colors.text} dark:text-emerald-300 italic leading-snug`}>"{insight.recommendations[0]?.practical}"</p>
                                    </div>
                                 </div>
                              );
                           })}
                        </div>
                     </div>

                     <div className="bg-white dark:bg-slate-800 rounded-[32px] p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                           <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-2xl shadow-inner"><Heart size={24} /></div>
                           <h5 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Emotional State</h5>
                        </div>
                        <div className="space-y-4">
                           {analyzeStudentData(MOCK_ANSWERS[activeStudent.id], lang).filter(i => i.category === 'emotional').map((insight, idx) => {
                              const colors = getInsightColor(insight.category);
                              return (
                                 <div key={idx} className={`${colors.bg} dark:bg-rose-900/10 p-5 rounded-2xl border ${colors.border} dark:border-rose-900/30`}>
                                    <p className={`text-xs font-black ${colors.text} dark:text-rose-400 mb-1`}>{insight.title}</p>
                                    <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 leading-relaxed mb-4">{insight.description}</p>
                                    <div className="flex items-start gap-2 bg-white/50 dark:bg-slate-900/50 p-2 rounded-lg">
                                       <span className={`${colors.icon} text-xs`}>🧘</span>
                                       <p className={`text-[10px] font-bold ${colors.text} dark:text-rose-300 italic leading-snug`}>"{insight.recommendations[0]?.practical}"</p>
                                    </div>
                                 </div>
                              );
                           })}
                        </div>
                     </div>

                     <div className="bg-white dark:bg-slate-800 rounded-[32px] p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                           <div className="p-3 bg-violet-50 dark:bg-violet-900/20 text-violet-600 rounded-2xl shadow-inner"><Users size={24} /></div>
                           <h5 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Pedagogical Needs</h5>
                        </div>
                        <div className="space-y-4">
                           {analyzeStudentData(MOCK_ANSWERS[activeStudent.id], lang).filter(i => i.category === 'needs').map((insight, idx) => {
                              const colors = getInsightColor(insight.category);
                              return (
                                 <div key={idx} className={`${colors.bg} dark:bg-violet-900/10 p-5 rounded-2xl border ${colors.border} dark:border-violet-900/30`}>
                                    <p className={`text-xs font-black ${colors.text} dark:text-violet-400 mb-1`}>{insight.title}</p>
                                    <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 leading-relaxed mb-4">{insight.description}</p>
                                    <div className="flex items-start gap-2 bg-white/50 dark:bg-slate-900/50 p-2 rounded-lg">
                                       <span className={`${colors.icon} text-xs`}>📋</span>
                                       <p className={`text-[10px] font-bold ${colors.text} dark:text-violet-300 italic leading-snug`}>"{insight.recommendations[0]?.practical}"</p>
                                    </div>
                                 </div>
                              );
                           })}
                        </div>
                     </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-[40px] border border-slate-200 dark:border-slate-700 shadow-inner">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                       <MessageCircle size={18} /> {t.teacherNotes}
                    </h4>
                    <div className="space-y-4 max-h-60 overflow-y-auto mb-6 pr-2">
                      {notes.filter(n => n.studentId === activeStudent.id).length === 0 ? (
                        <p className="text-xs font-bold text-slate-300 uppercase tracking-widest text-center py-4">{t.noNotes}</p>
                      ) : (
                        notes.filter(n => n.studentId === activeStudent.id).map(note => (
                          <div key={note.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-start justify-between group">
                            <div className="flex gap-3">
                              {note.isTask ? <Bell size={14} className="text-amber-500 mt-0.5" /> : <FileText size={14} className="text-slate-400 mt-0.5" />}
                              <p className="text-xs font-medium text-slate-600 dark:text-slate-300">{note.content}</p>
                            </div>
                            <button onClick={() => setNotes(notes.filter(n => n.id !== note.id))} className="text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /></button>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={newNoteContent}
                          onChange={(e) => setNewNoteContent(e.target.value)}
                          placeholder={t.notesPlaceholder}
                          className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl text-xs outline-none focus:ring-2 ring-primary-500/20"
                        />
                        <button onClick={addNote} className="p-4 bg-primary-600 text-white rounded-2xl hover:bg-primary-500 transition-all shadow-lg"><Plus size={20} /></button>
                      </div>
                      <div className="flex items-center gap-4 px-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={isTaskMode} onChange={(e) => setIsTaskMode(e.target.checked)} className="rounded border-slate-300" />
                          <span className="text-[10px] font-black uppercase text-slate-400">{t.asTask}</span>
                        </label>
                        {isTaskMode && <input type="date" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} className="bg-transparent border-b border-slate-200 text-[10px] font-black text-slate-500 outline-none" />}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 flex justify-around items-center z-50">
        <button onClick={() => setView('dashboard')} className={`p-3 rounded-2xl ${view === 'dashboard' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400'}`}><LayoutDashboard size={24} /></button>
        <button onClick={() => setView('seating')} className={`p-3 rounded-2xl ${view === 'seating' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400'}`}><LayoutGrid size={24} /></button>
        <button onClick={handleLogout} className="p-3 rounded-2xl text-slate-400"><LogOut size={24} /></button>
      </nav>

      {showThemeSettings && (
        <ThemeSettingsModal 
          onClose={() => setShowThemeSettings(false)} 
          theme={theme} 
          setTheme={setTheme} 
          accent={accent} 
          setAccent={setAccent} 
          lang={lang} 
        />
      )}
      
      {activeInfoPage && (
        <InfoModal 
          pageKey={activeInfoPage} 
          lang={lang} 
          onClose={() => setActiveInfoPage(null)} 
        />
      )}
    </div>
  );
};

export default App;