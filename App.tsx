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
  Home
} from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip, Legend } from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { 
  Language, 
  Student,
  SeatPos,
  Recommendation,
  Note
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
      {isIntersecting ? children : <div className={`${placeholderHeight} w-full animate-pulse bg-slate-100 dark:bg-slate-800 rounded-2xl`} />}
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
    // Using requestAnimationFrame ensures we wait for the next paint frame
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

const StudentInfoPopover: React.FC<{ student: Student, lang: Language }> = ({ student, lang }) => {
  const answers = MOCK_ANSWERS[student.id];
  const insights = analyzeStudentData(answers, lang);
  const isRtl = lang === 'he' || lang === 'ar';

  // Determine Learning Style
  const visualScore = answers.q4 || 0;
  const auditoryScore = answers.q5 || 0;
  let learningStyle = { label: 'Balanced', icon: <Layers size={14} />, color: 'text-slate-500' };
  
  if (visualScore >= 4 && auditoryScore >= 4) {
    learningStyle = { label: 'Multi-sensory', icon: <BrainCircuit size={14} />, color: 'text-purple-500' };
  } else if (visualScore >= 4) {
    learningStyle = { label: 'Visual Learner', icon: <Eye size={14} />, color: 'text-emerald-500' };
  } else if (auditoryScore >= 4) {
    learningStyle = { label: 'Auditory Learner', icon: <Ear size={14} />, color: 'text-blue-500' };
  }

  return (
    <div className={`absolute z-[100] bottom-full mb-4 w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-[24px] shadow-2xl border border-slate-200 dark:border-slate-700 p-5 animate-in fade-in zoom-in-95 duration-200 pointer-events-none ring-1 ring-black/5 ${isRtl ? 'right-0' : 'left-0'}`}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="relative">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-primary-500/20 text-xl">
            {student.code.split('-')[1]}
          </div>
          <div className="absolute -bottom-1.5 -right-1.5 bg-white dark:bg-slate-800 p-1 rounded-full shadow-sm">
             <div className={`w-3 h-3 rounded-full ${learningStyle.color.replace('text-', 'bg-')} animate-pulse`} />
          </div>
        </div>
        <div>
          <p className="text-base font-black text-slate-900 dark:text-white leading-none mb-1.5">{student.code}</p>
          <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${learningStyle.color} bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg`}>
            {learningStyle.icon} {learningStyle.label}
          </div>
        </div>
      </div>
      
      {/* Insights */}
      <div className="space-y-3 mb-5">
        {insights.slice(0, 2).map((insight, idx) => {
          const styles = getInsightColor(insight.category);
          return (
            <div key={idx} className="flex gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
              <div className={`mt-0.5 min-w-[3px] w-[3px] rounded-full ${styles.bg.replace('bg-', 'bg-')}-500`} />
              <div>
                <h5 className="text-[11px] font-black text-slate-800 dark:text-slate-200 leading-tight mb-1">{insight.title}</h5>
                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-normal line-clamp-2">{insight.description}</p>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Mini Charts */}
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center justify-between">
          <span>Core Metrics</span>
          <span className="text-primary-500">{answers.q1 + answers.q2 + answers.q3}/15</span>
        </p>
        <div className="space-y-2">
          {[
            { l: 'Emotional', v: answers.q1, c: 'bg-rose-500' },
            { l: 'Social', v: answers.q2, c: 'bg-amber-500' },
            { l: 'Cognitive', v: answers.q3, c: 'bg-emerald-500' }
          ].map((m) => (
            <div key={m.l} className="flex items-center gap-2">
              <span className="text-[9px] font-bold text-slate-400 w-14">{m.l}</span>
              <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${m.c} transition-all duration-500`} style={{ width: `${(m.v / 5) * 100}%` }} />
              </div>
              <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300 w-3 text-right">{m.v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute -bottom-2 left-8 w-4 h-4 bg-white/95 dark:bg-slate-900/95 rotate-45 border-b border-r border-slate-200 dark:border-slate-700 backdrop-blur-xl"></div>
    </div>
  );
};

const SynergyInfoPopover: React.FC<{ pair: [string, string], lang: Language }> = ({ pair, lang }) => {
  const synergy = getPairSynergy(pair[0], pair[1], MOCK_ANSWERS, lang);
  
  return (
    <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-primary-100 dark:border-slate-700 p-5 z-[100] animate-in fade-in slide-in-from-bottom-2 duration-200 pointer-events-none text-left" dir={lang === 'he' || lang === 'ar' ? 'rtl' : 'ltr'}>
       <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100 dark:border-slate-700">
         <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-600 dark:text-primary-400">
                <Sparkles size={12} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white leading-tight max-w-[140px]">{synergy.label}</span>
         </div>
         <div className="flex flex-col items-end">
            <span className="text-lg font-black text-primary-600 dark:text-primary-400 leading-none">{synergy.score}%</span>
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Match Score</span>
         </div>
       </div>
       
       <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">{synergy.description}</p>
       
       <div className="space-y-3">
         <div>
           <h5 className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1.5">
             <CheckCircle2 size={10} /> Benefits
           </h5>
           <div className="flex flex-wrap gap-1.5">
             {synergy.advantages.map((adv, i) => (
               <span key={i} className="text-[10px] font-bold px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg border border-emerald-100/50 dark:border-emerald-800/50">{adv}</span>
             ))}
           </div>
         </div>

         <div>
           <h5 className="flex items-center gap-1.5 text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1.5">
             <AlertTriangle size={10} /> Risks
           </h5>
           <div className="flex flex-wrap gap-1.5">
             {synergy.risks.map((r, i) => (
               <span key={i} className="text-[10px] font-bold px-2 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg border border-amber-100/50 dark:border-amber-800/50">{r}</span>
             ))}
           </div>
         </div>
       </div>
       
       <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-slate-900 rotate-45 border-b border-r border-primary-100 dark:border-slate-700"></div>
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
          
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
            {t.intro}
          </p>

          <div className="space-y-4 mb-8">
            {/* Essential */}
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 opacity-75 cursor-not-allowed">
              <div className="mt-1"><ToggleRight className="text-primary-400" size={24} /></div>
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white mb-1">{t.essentialTitle}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.essentialDesc}</p>
              </div>
            </div>
            
            {/* Analytics */}
            <div 
              onClick={() => toggle('analytics')}
              className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer group ${prefs.analytics ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700'}`}
            >
              <div className="mt-1">
                {prefs.analytics ? 
                  <ToggleRight className="text-primary-600 dark:text-primary-400 transition-transform" size={24} /> : 
                  <ToggleLeft className="text-slate-300 dark:text-slate-600 group-hover:text-primary-400 transition-colors" size={24} />
                }
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white mb-1">{t.analyticsTitle}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.analyticsDesc}</p>
              </div>
            </div>

            {/* Marketing */}
            <div 
              onClick={() => toggle('marketing')}
              className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer group ${prefs.marketing ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700'}`}
            >
              <div className="mt-1">
                {prefs.marketing ? 
                  <ToggleRight className="text-primary-600 dark:text-primary-400 transition-transform" size={24} /> : 
                  <ToggleLeft className="text-slate-300 dark:text-slate-600 group-hover:text-primary-400 transition-colors" size={24} />
                }
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white mb-1">{t.marketingTitle}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.marketingDesc}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => onSave({ analytics: true, marketing: true })} 
              className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm uppercase tracking-wide hover:bg-primary-600 dark:hover:bg-slate-200 transition-all shadow-lg"
            >
              {t.acceptAll}
            </button>
            <button 
              onClick={() => onSave(prefs)} 
              className="w-full py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl font-black text-sm uppercase tracking-wide hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            >
              {t.saveSelection}
            </button>
          </div>
          
          <div className="mt-6 text-center">
             <a href="#" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary-500 border-b border-transparent hover:border-primary-500 transition-all pb-0.5">{t.policyLink}</a>
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
  
  const accents = [
    { id: 'indigo', name: 'Default', color: 'bg-[#6366f1]' },
    { id: 'rose', name: 'Rose', color: 'bg-[#f43f5e]' },
    { id: 'emerald', name: 'Emerald', color: 'bg-[#10b981]' },
    { id: 'amber', name: 'Amber', color: 'bg-[#f59e0b]' },
    { id: 'blue', name: 'Ocean', color: 'bg-[#3b82f6]' },
  ];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <Palette className="text-primary-500" /> {lang === 'he' ? 'עיצוב ונראות' : 'Appearance'}
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-slate-400"><X size={20} /></button>
          </div>

          <div className="space-y-8">
             {/* Mode Selection */}
             <div>
               <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">{lang === 'he' ? 'מצב תצוגה' : 'Display Mode'}</h4>
               <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setTheme('light')}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 ${theme === 'light' ? 'border-primary-600 bg-primary-50 text-primary-900 dark:bg-primary-900/20 dark:text-primary-100' : 'border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-200 dark:hover:border-slate-700'}`}
                  >
                    <Sun size={24} />
                    <span className="text-xs font-black uppercase tracking-wide">{lang === 'he' ? 'בהיר' : 'Light'}</span>
                  </button>
                  <button 
                    onClick={() => setTheme('dark')}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 ${theme === 'dark' ? 'border-primary-600 bg-primary-50 text-primary-900 dark:bg-primary-900/20 dark:text-primary-100' : 'border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-200 dark:hover:border-slate-700'}`}
                  >
                    <Moon size={24} />
                    <span className="text-xs font-black uppercase tracking-wide">{lang === 'he' ? 'כהה' : 'Dark'}</span>
                  </button>
               </div>
             </div>

             {/* Accent Selection */}
             <div>
               <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">{lang === 'he' ? 'צבע נושא' : 'Accent Color'}</h4>
               <div className="flex flex-wrap gap-3">
                 {accents.map(acc => (
                   <button
                     key={acc.id}
                     onClick={() => setAccent(acc.id)}
                     className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${acc.color} ${accent === acc.id ? 'ring-4 ring-offset-2 ring-primary-300 dark:ring-offset-slate-900 scale-110' : 'hover:scale-105 opacity-80 hover:opacity-100'}`}
                     title={acc.name}
                   >
                     {accent === acc.id && <Check className="text-white" size={20} />}
                   </button>
                 ))}
               </div>
             </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
             <button onClick={onClose} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm uppercase tracking-wide hover:bg-primary-600 dark:hover:bg-slate-200 transition-all shadow-lg">
               {lang === 'he' ? 'סגור' : 'Close'}
             </button>
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
      case 'privacy': return <Lock size={32} className="text-primary-500" />;
      case 'terms': return <Scale size={32} className="text-amber-500" />;
      case 'help': return <Info size={32} className="text-blue-500" />;
      case 'accessibility': return <UserCircle size={32} className="text-teal-500" />;
      default: return <FileText size={32} className="text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in zoom-in-95 duration-200" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-800 relative flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              {getIcon()}
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{content.title[lang] || content.title['en']}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X size={24} className="text-slate-400" /></button>
        </div>
        
        <div className="p-8 overflow-y-auto">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-base font-medium text-slate-600 dark:text-slate-300 leading-8 whitespace-pre-line">
              {content.content[lang] || content.content['en']}
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-end shrink-0">
           <button onClick={onClose} className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary-600 dark:hover:bg-slate-200 transition-all">
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
      <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{synergy.label}</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-slate-400"><X size={20} /></button>
          </div>
          
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-2xl p-6 mb-8 flex items-center justify-between border border-primary-100 dark:border-primary-800">
            <div>
              <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-1">Synergy Score</p>
              <div className="text-4xl font-black text-primary-600 dark:text-primary-400">{synergy.score}%</div>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-primary-200 dark:border-primary-800 border-t-primary-600 dark:border-t-primary-400 animate-spin-slow flex items-center justify-center">
              <Zap size={24} className="text-primary-600 dark:text-primary-400" />
            </div>
          </div>

          <div className="space-y-6">
            <section>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500" /> Pedagogical Advantages
              </h4>
              <ul className="grid grid-cols-1 gap-2">
                {synergy.advantages.map((adv, i) => (
                  <li key={i} className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-bold border border-emerald-100 dark:border-emerald-900/50">{adv}</li>
                ))}
              </ul>
            </section>
            
            <section>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <AlertTriangle size={14} className="text-amber-500" /> Points to Monitor
              </h4>
              <ul className="grid grid-cols-1 gap-2">
                {synergy.risks.map((risk, i) => (
                  <li key={i} className="px-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-xl text-xs font-bold border border-amber-100 dark:border-amber-900/50">{risk}</li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper for icons
const getInsightIcon = (category: string) => {
  switch(category) {
    case 'emotional': return <Activity size={16} />;
    case 'social': return <Users size={16} />;
    case 'cognitive': return <BrainCircuit size={16} />;
    case 'behavioral': return <Scale size={16} />;
    default: return <Sparkles size={16} />;
  }
}

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
  
  const [showCookieSettings, setShowCookieSettings] = useState(false);
  const [showCookieBanner, setShowCookieBanner] = useState(true);
  const [cookiePrefs, setCookiePrefs] = useState({ analytics: false, marketing: false });
  const [activeInfoPage, setActiveInfoPage] = useState<string | null>(null);

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [accent, setAccent] = useState('indigo');
  const [showThemeSettings, setShowThemeSettings] = useState(false);

  // Notes State
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isTaskMode, setIsTaskMode] = useState(false);
  const [taskDueDate, setTaskDueDate] = useState('');

  const t = TRANSLATIONS[lang];
  const isRtl = lang === 'he' || lang === 'ar';

  // Safe JSON parse helper
  const safeJsonParse = (str: string | null, fallback: any) => {
    if (!str) return fallback;
    try {
      return JSON.parse(str);
    } catch (e) {
      console.error("Failed to parse JSON", e);
      return fallback;
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('seatai-auth-token');
    const savedCookiePrefs = localStorage.getItem('seatai-cookie-prefs');
    const oldCookiesAccepted = localStorage.getItem('seatai-cookies-accepted');
    const savedNotes = localStorage.getItem('seatai-notes');
    const savedTheme = localStorage.getItem('seatai-theme');
    const savedAccent = localStorage.getItem('seatai-accent');
    
    if (savedCookiePrefs) {
      setCookiePrefs(safeJsonParse(savedCookiePrefs, { analytics: false, marketing: false }));
      setShowCookieBanner(false);
    } else if (oldCookiesAccepted) {
      // Migrate old setting
      setCookiePrefs({ analytics: true, marketing: true });
      setShowCookieBanner(false);
    }

    if (savedNotes) {
      setNotes(safeJsonParse(savedNotes, []));
    }
    
    if (savedTheme === 'dark') setTheme('dark');
    if (savedAccent) setAccent(savedAccent);

    if (savedToken) {
      const teacher = MOCK_TEACHERS.find(t => t.id === savedToken);
      if (teacher) {
        setActiveTeacher(teacher);
        setIsLoggedIn(true);
      }
    }
    setTimeout(() => setIsLoadingAuth(false), 800);
  }, []);

  // Theme Effects
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('seatai-theme', theme);
  }, [theme]);

  useEffect(() => {
    // Remove all theme classes first
    const classes = document.body.className.split(' ').filter(c => !c.startsWith('theme-'));
    document.body.className = classes.join(' ');
    
    if (accent !== 'indigo') {
      document.body.classList.add(`theme-${accent}`);
    }
    localStorage.setItem('seatai-accent', accent);
  }, [accent]);

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

  const handleSaveCookiePrefs = (prefs: { analytics: boolean, marketing: boolean }) => {
    setCookiePrefs(prefs);
    localStorage.setItem('seatai-cookie-prefs', JSON.stringify(prefs));
    setShowCookieBanner(false);
    setShowCookieSettings(false);
  };

  // Notes Logic
  const saveNotesToStorage = (updatedNotes: Note[]) => {
    setNotes(updatedNotes);
    localStorage.setItem('seatai-notes', JSON.stringify(updatedNotes));
  };

  const addNote = () => {
    if (!activeStudent || !newNoteContent.trim()) return;
    const newNote: Note = {
      id: Date.now().toString(),
      studentId: activeStudent.id,
      content: newNoteContent,
      createdAt: new Date().toISOString(),
      isTask: isTaskMode,
      reminderDate: isTaskMode ? taskDueDate : undefined,
      isCompleted: false
    };
    const updated = [...notes, newNote];
    saveNotesToStorage(updated);
    setNewNoteContent('');
    setIsTaskMode(false);
    setTaskDueDate('');
  };

  const toggleTask = (noteId: string) => {
    const updated = notes.map(n => n.id === noteId ? { ...n, isCompleted: !n.isCompleted } : n);
    saveNotesToStorage(updated);
  };

  const deleteNote = (noteId: string) => {
    const updated = notes.filter(n => n.id !== noteId);
    saveNotesToStorage(updated);
  };

  const studentNotesList = useMemo(() => {
    if (!activeStudent) return [];
    return notes.filter(n => n.studentId === activeStudent.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [activeStudent, notes]);


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

  // Handle Class Selection Changes
  useEffect(() => {
    if (selectedClass) {
      const saved = localStorage.getItem(`seatai-layout-${selectedClass}`);
      if (saved) {
        const parsed = safeJsonParse(saved, null);
        if (parsed) {
          setManualSeating(parsed);
          setSeatingMode('manual');
          setHasSavedLayout(true);
        } else {
          setSeatingMode('auto');
          setHasSavedLayout(false);
        }
      } else {
        setSeatingMode('auto');
        setHasSavedLayout(false);
      }
    }
  }, [selectedClass]);

  // Handle Seating Layout Calculation
  useEffect(() => {
    if (selectedClass) {
      const result = calculateAutomatedLayout(filteredStudents, MOCK_ANSWERS, lang);
      setAutoSeating(result as any);

      if (seatingMode === 'auto') {
        setManualSeating(result as any);
      }
    }
  }, [selectedClass, lang, filteredStudents, seatingMode]);

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
      const parsed = safeJsonParse(saved, null);
      if (parsed) {
        setManualSeating(parsed);
        setSeatingMode('manual');
        setNotification({ message: t.layoutLoaded, type: 'success' });
        setTimeout(() => setNotification(null), 3000);
      }
    }
  };

  const handleClearLayout = () => {
    if (!selectedClass) return;
    localStorage.removeItem(`seatai-layout-${selectedClass}`);
    setHasSavedLayout(false);
    setNotification({ message: t.layoutCleared, type: 'info' });
    setTimeout(() => setNotification(null), 3000);
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
    if (!studentId || !selectedClass) return;

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

    const oldPos = newManualSeating[studentId];

    if (studentsAtTarget.length >= 2) {
      const targetStudent = studentsAtTarget.find(s => s.seatIndex === 0) || studentsAtTarget[0];
      
      if (!oldPos) return;

      // Swap Logic
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
      if (!oldPos) return;

      // Move Logic
      const nextIndex = studentsAtTarget.length === 0 ? 0 : (studentsAtTarget[0].seatIndex === 0 ? 1 : 0);
      
      newManualSeating[studentId] = { 
        ...oldPos, 
        row: targetRow, 
        col: targetCol, 
        seatIndex: nextIndex 
      };
    }

    // Update pair status for both target location and old source location
    const updatePairStatus = (layout: Record<string, SeatPos>, row: number, col: number) => {
      const ids = Object.entries(layout)
        .filter(([_, pos]) => pos.row === row && pos.col === col)
        .map(([id]) => id);
      
      const isPair = ids.length === 2;
      
      ids.forEach(id => {
        if (layout[id]) {
          layout[id] = { ...layout[id], isManualPair: isPair };
        }
      });
    };

    updatePairStatus(newManualSeating, targetRow, targetCol);
    if (oldPos) updatePairStatus(newManualSeating, oldPos.row, oldPos.col);

    setManualSeating(newManualSeating);

    // Auto-save logic
    if (selectedClass) {
      localStorage.setItem(`seatai-layout-${selectedClass}`, JSON.stringify(newManualSeating));
      setHasSavedLayout(true);
    }
  };

  const handleResetToAI = () => {
    setSeatingMode('auto');
    setManualSeating(autoSeating);
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="bg-primary-600 p-4 rounded-3xl animate-pulse shadow-2xl shadow-primary-500/50">
            <BrainCircuit size={48} className="text-white" />
          </div>
          <div className="flex gap-2">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
          </div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
        <VideoBackground />
        {showCookieBanner && <CookieBanner onAccept={() => handleSaveCookiePrefs({ analytics: true, marketing: true })} onSettings={() => setShowCookieSettings(true)} lang={lang} />}
        {showCookieSettings && <CookieSettingsModal initialPrefs={cookiePrefs} onSave={handleSaveCookiePrefs} onClose={() => setShowCookieSettings(false)} lang={lang} />}
        {activeInfoPage && <InfoModal pageKey={activeInfoPage} lang={lang} onClose={() => setActiveInfoPage(null)} />}
        
        <div className="relative z-10 flex flex-col min-h-screen">
          <header className="w-full p-6 flex justify-between items-center max-w-6xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="bg-primary-600 p-2 rounded-xl text-white shadow-lg shadow-primary-500/30">
                <BrainCircuit size={24} />
              </div>
              <h1 className="text-xl font-black text-white tracking-tighter uppercase drop-shadow-md">SEATAI</h1>
            </div>
            <LanguageSwitcher current={lang} set={setLang} />
          </header>
          
          <div className="flex-1 flex items-center justify-center p-6 w-full">
            <div className={`glass p-10 rounded-[48px] shadow-2xl w-full max-w-md border border-white/40 relative overflow-hidden animate-in fade-in zoom-in duration-700 ${authError ? 'animate-shake border-rose-500/50' : ''}`}>
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-500 via-purple-500 to-emerald-500" />
              
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
                    type={showPassword ? "text" : "password"} 
                    placeholder={t.teacherCodePlaceholder} 
                    className="w-full px-6 py-6 border border-white/50 rounded-3xl bg-white/60 focus:bg-white transition-all text-center text-4xl font-black shadow-inner outline-none focus:ring-8 ring-primary-500/10 placeholder:text-slate-300 text-slate-900" 
                    value={teacherCode} 
                    onChange={(e) => setTeacherCode(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()} 
                  />
                  <button 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-600 transition-colors p-2"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                  </button>
                </div>

                <button 
                  onClick={handleLogin} 
                  className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-lg uppercase shadow-2xl hover:bg-primary-600 transition-all active:scale-[0.98] transform hover:-translate-y-1 flex items-center justify-center gap-3 group"
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
                  <Lock size={20} className="text-primary-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">AES-256 ENCRYPTED</span>
                </div>
              </div>
            </div>
          </div>
          
          <footer className="w-full p-8 text-center bg-white/10 backdrop-blur-md border-t border-white/20 pb-24 md:pb-8">
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
    <div className="h-screen w-screen bg-slate-50 dark:bg-slate-900 flex flex-col md:flex-row transition-colors duration-500 overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
      {activeSynergyPair && <SynergyModal pair={activeSynergyPair} lang={lang} onClose={() => setActiveSynergyPair(null)} />}
      {showCookieBanner && <CookieBanner onAccept={() => handleSaveCookiePrefs({ analytics: true, marketing: true })} onSettings={() => setShowCookieSettings(true)} lang={lang} />}
      {showCookieSettings && <CookieSettingsModal initialPrefs={cookiePrefs} onSave={handleSaveCookiePrefs} onClose={() => setShowCookieSettings(false)} lang={lang} />}
      {showThemeSettings && <ThemeSettingsModal onClose={() => setShowThemeSettings(false)} theme={theme} setTheme={setTheme} accent={accent} setAccent={setAccent} lang={lang} />}
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
          <div className={`px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${notification.type === 'success' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-800 dark:bg-slate-700 text-white border-slate-700'}`}>
            {notification.type === 'success' ? <CheckCircle2 size={18} /> : <Trash2 size={18} />}
            <span className="text-xs font-black uppercase tracking-widest">{notification.message}</span>
          </div>
        </div>
      )}
      
      {/* Desktop Sidebar - Hidden on mobile */}
      <aside className={`hidden md:flex w-20 lg:w-72 bg-white dark:bg-slate-800 border-${isRtl ? 'l' : 'r'} border-slate-200 dark:border-slate-700 flex-col transition-all shadow-sm shrink-0 relative z-20`}>
        <div className="p-8 border-b border-slate-50 dark:border-slate-700 flex items-center gap-4">
          <div className="bg-primary-600 p-2.5 rounded-2xl text-white shadow-lg shadow-primary-100 dark:shadow-none"><BrainCircuit size={28} /></div>
          <span className="text-xl font-black text-slate-900 dark:text-white hidden lg:block uppercase tracking-tighter">SEATAI</span>
        </div>
        
        <div className="p-6 hidden lg:block">
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-3xl p-5 border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-300 uppercase tracking-widest">Active Session</span>
            </div>
            <p className="text-sm font-black text-slate-900 dark:text-white">{activeTeacher?.name}</p>
            <p className="text-[11px] font-bold text-primary-500 uppercase">{activeTeacher?.role}</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-3">
          <button onClick={() => setView('dashboard')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${view === 'dashboard' ? 'bg-primary-600 text-white shadow-xl shadow-primary-100 dark:shadow-none font-bold' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold'}`}><LayoutDashboard size={20} /><span className="hidden lg:block text-sm uppercase tracking-wide">Dashboard</span></button>
          <button onClick={() => setView('seating')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${view === 'seating' ? 'bg-primary-600 text-white shadow-xl shadow-primary-100 dark:shadow-none font-bold' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold'}`}><LayoutGrid size={20} /><span className="hidden lg:block text-sm uppercase tracking-wide">Smart Seating</span></button>
        </nav>

        <div className="p-6 border-t border-slate-50 dark:border-slate-700">
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-4 p-4 rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all w-full font-black text-xs uppercase tracking-widest group"
          >
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
            <span className="hidden lg:block">{t.logout}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-50 flex justify-around items-center p-3 safe-area-pb">
        <button onClick={() => setView('dashboard')} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${view === 'dashboard' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'}`}>
          <LayoutDashboard size={24} />
          <span className="text-[10px] font-black uppercase">Home</span>
        </button>
        <button onClick={() => setView('seating')} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${view === 'seating' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'}`}>
          <LayoutGrid size={24} />
          <span className="text-[10px] font-black uppercase">Seating</span>
        </button>
        <button onClick={handleLogout} className="flex flex-col items-center gap-1 p-2 rounded-xl text-slate-400 hover:text-rose-500 transition-all">
          <LogOut size={24} />
          <span className="text-[10px] font-black uppercase">Exit</span>
        </button>
      </nav>

      <main className="flex-1 flex flex-col overflow-y-auto pb-24 md:pb-0">
        <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 p-4 md:p-6 lg:px-10 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-4 md:gap-6">
            {selectedClass && <button onClick={() => setSelectedClass(null)} className="p-2 md:p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl text-slate-400 transition-colors shadow-sm"><ArrowLeft size={20} className={isRtl ? 'rotate-180' : ''} /></button>}
            <div>
              <h2 className="text-lg md:text-2xl font-black text-slate-900 dark:text-white leading-none mb-1 uppercase tracking-tight">{selectedClass || 'System Root'}</h2>
              <div className="flex items-center gap-2"><span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{selectedClass ? `${filteredStudents.length} Profiles` : 'Waiting'}</span></div>
            </div>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            <LanguageSwitcher current={lang} set={setLang} />
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-slate-900 dark:bg-slate-800 flex items-center justify-center text-white shadow-lg overflow-hidden ring-2 md:ring-4 ring-white dark:ring-slate-700">
              <UserCircle size={24} className="md:w-7 md:h-7" />
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-8 lg:p-12 max-w-7xl mx-auto w-full">
          {!selectedClass ? (
            <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 mt-10">
              <div className="w-full max-w-3xl text-center">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="w-8 md:w-12 h-1 bg-primary-600 rounded-full" />
                  <span className="text-xs md:text-sm font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest">Pedagogical Access</span>
                  <div className="w-8 md:w-12 h-1 bg-primary-600 rounded-full" />
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-8 md:mb-12 uppercase tracking-tighter">{t.selectClass}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 w-full">
                  {activeTeacher?.classes.map((cls: string) => (
                    <button key={cls} onClick={() => setSelectedClass(cls)} className="bg-white dark:bg-slate-800 p-8 md:p-16 rounded-[32px] md:rounded-[48px] border-2 border-transparent hover:border-primary-500 hover:shadow-2xl hover:-translate-y-2 transition-all group flex flex-col items-center shadow-xl border-slate-100 dark:border-slate-700">
                      <div className="w-16 h-16 md:w-24 md:h-24 bg-slate-50 dark:bg-slate-700 rounded-[24px] md:rounded-[32px] flex items-center justify-center text-primary-600 dark:text-primary-400 mb-6 md:mb-8 group-hover:bg-primary-600 group-hover:text-white group-hover:rotate-6 transition-all duration-500 shadow-inner">
                        <Users size={32} className="md:w-12 md:h-12" />
                      </div>
                      <span className="text-xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">{cls}</span>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Select Workspace</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
              {view === 'dashboard' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
                  {filteredStudents.map(student => (
                    <LazyView key={student.id} placeholderHeight="h-40">
                      <div onClick={() => { setActiveStudent(student); setView('report'); }} className="bento-card bg-white dark:bg-slate-800 p-5 md:p-7 border border-slate-200 dark:border-slate-700 cursor-pointer shadow-md group hover:ring-4 ring-primary-500/10 dark:ring-primary-500/20">
                        <div className="flex items-center justify-between mb-6">
                          <div className="w-12 h-12 bg-primary-600 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg group-hover:rotate-12 transition-transform">{student.code.split('-')[1]}</div>
                          {MOCK_ANSWERS[student.id].q1 <= 2 && <div className="p-2 bg-rose-50 dark:bg-rose-900/30 rounded-xl text-rose-500 animate-pulse"><AlertTriangle size={18} /></div>}
                        </div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white mb-1">{student.code}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">View Analytics</p>
                        <div className="space-y-3 mt-4">
                          <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-primary-500 transition-all duration-1000" style={{width: `${(MOCK_ANSWERS[student.id].q1/5)*100}%`}} /></div>
                          <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 transition-all duration-1000" style={{width: `${(MOCK_ANSWERS[student.id].q3/5)*100}%`}} /></div>
                        </div>
                      </div>
                    </LazyView>
                  ))}
                </div>
              )}

              {view === 'seating' && (
                <div className="space-y-8 md:space-y-12 animate-in fade-in duration-500">
                  <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 md:mb-12 gap-6">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{t.seatingLegend}</h3>
                          {seatingMode === 'manual' && (
                            <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                              <Hand size={12} /> Manual
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-2">AI-Driven Spatial Topology</p>
                      </div>
                      <div className="flex flex-wrap gap-2 md:gap-4 w-full md:w-auto">
                        {hasSavedLayout && (
                          <div className="flex gap-2 w-full md:w-auto">
                             <button 
                              onClick={handleLoadLayout}
                              className="flex-1 md:flex-none px-4 md:px-6 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all shadow-sm"
                            >
                              <Download size={16} /> {t.loadLayout}
                            </button>
                            <button 
                              onClick={handleClearLayout}
                              className="px-4 py-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-all shadow-sm"
                              title={t.clearLayout}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                        
                        <button 
                          onClick={handleSaveLayout}
                          className="flex-1 md:flex-none px-4 md:px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-md"
                        >
                          <Save size={16} /> {t.saveLayout}
                        </button>

                        {seatingMode === 'manual' ? (
                          <button 
                            onClick={handleResetToAI}
                            className="flex-1 md:flex-none px-4 md:px-6 py-3 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-all shadow-sm"
                          >
                            <RefreshCw size={16} /> {lang === 'he' ? 'חזור ל-AI' : 'Reset AI'}
                          </button>
                        ) : (
                          <button className="flex-1 md:flex-none px-4 md:px-6 py-3 bg-primary-600 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg hover:bg-primary-700 transition-all">
                            <RefreshCw size={16} /> Recalculate AI
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-5xl mx-auto py-4 md:py-8">
                      {Array.from({ length: 4 }).map((_, row) => (
                        Array.from({ length: 2 }).map((_, col) => {
                          const deskStudents = filteredStudents.filter(s => {
                            const pos = currentSeatingMap[s.id];
                            return pos && pos.row === row && pos.col === col;
                          }).sort((a, b) => (currentSeatingMap[a.id].seatIndex - currentSeatingMap[b.id].seatIndex));
                          
                          const isOver = dragOverDesk?.row === row && dragOverDesk?.col === col;
                          const isManualPair = deskStudents.length === 2 && 
                                             seatingMode === 'manual' && 
                                             deskStudents.some(s => currentSeatingMap[s.id]?.isManualPair);

                          return (
                            <LazyView key={`${row}-${col}`} placeholderHeight="h-56">
                              <div 
                                onDragOver={(e) => handleDragOver(e, row, col)}
                                onDrop={(e) => handleDrop(e, row, col)}
                                className={`relative p-4 md:p-6 rounded-[32px] border-4 border-dashed flex flex-col items-center justify-center min-h-[180px] md:min-h-[220px] transition-all duration-300 ${
                                  isOver ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/20 scale-[1.02]' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30'
                                } group hover:border-primary-300 dark:hover:border-primary-700`}
                              >
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 px-4 py-1 rounded-full border border-slate-200 dark:border-slate-600 text-[10px] font-black text-slate-400 uppercase tracking-widest">Desk {row + 1}-{col + 1}</div>
                                
                                <div className="flex gap-4 md:gap-6 items-center relative z-10">
                                  {deskStudents.length === 0 && (
                                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl border-2 border-slate-100 dark:border-slate-600 border-dashed flex items-center justify-center text-slate-200 dark:text-slate-600">
                                      <UserPlus size={32} className="md:w-10 md:h-10" />
                                    </div>
                                  )}
                                  {deskStudents.map((s, i) => (
                                    <div 
                                      key={s.id} 
                                      draggable
                                      onDragStart={(e) => handleDragStart(e, s.id)}
                                      onDragEnd={() => setDraggedStudentId(null)}
                                      className={`w-20 h-20 md:w-24 md:h-24 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-600 flex flex-col items-center justify-center relative hover:scale-105 transition-all group/student cursor-grab active:cursor-grabbing ${
                                        draggedStudentId === s.id ? 'opacity-40 grayscale blur-[1px]' : 'opacity-100'
                                      }`}
                                      onMouseEnter={() => setHoveredStudentId(s.id)}
                                      onMouseLeave={() => setHoveredStudentId(null)}
                                      style={{ zIndex: hoveredStudentId === s.id ? 50 : 0 }}
                                    >
                                      {hoveredStudentId === s.id && <StudentInfoPopover student={s} lang={lang} />}
                                      <User size={24} className="text-primary-600 dark:text-primary-400 mb-1 md:mb-2 pointer-events-none md:w-8 md:h-8" />
                                      <span className="text-[10px] md:text-xs font-black text-slate-900 dark:text-white pointer-events-none">{s.code}</span>
                                      
                                      {/* Indicator for manual override on specific card */}
                                      {seatingMode === 'manual' && currentSeatingMap[s.id]?.isManualPair && (
                                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-white shadow-sm border border-white animate-in zoom-in">
                                          <Hand size={10} />
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                  {deskStudents.length === 1 && (
                                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl border-2 border-slate-100 dark:border-slate-600 border-dashed flex items-center justify-center text-slate-100 dark:text-slate-700">
                                      <UserPlus size={32} className="md:w-10 md:h-10" />
                                    </div>
                                  )}

                                  {/* Visual Connector for Pairs */}
                                  {deskStudents.length === 2 && (
                                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160%] h-[120%] -z-10 pointer-events-none transition-all duration-500`}>
                                      <div className={`absolute inset-0 border-2 rounded-[2.5rem] ${
                                        isManualPair
                                        ? 'border-rose-300 dark:border-rose-700 bg-rose-50/40 dark:bg-rose-900/20 ring-4 ring-rose-100/50 dark:ring-rose-900/30' 
                                        : 'border-primary-300 dark:border-primary-700 bg-primary-50/40 dark:bg-primary-900/20 ring-4 ring-primary-100/50 dark:ring-primary-900/30'
                                      } transition-all duration-500`} />
                                      {/* Connecting line */}
                                      <div className={`absolute top-1/2 left-[20%] right-[20%] h-0.5 -translate-y-1/2 ${
                                        isManualPair
                                        ? 'bg-rose-300 dark:bg-rose-700' 
                                        : 'bg-primary-300 dark:bg-primary-700'
                                      }`} />
                                    </div>
                                  )}

                                  {/* Synergy Node - Appears between students when paired */}
                                  {deskStudents.length === 2 && (
                                    <div 
                                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
                                      onMouseEnter={() => setHoveredSynergyId(`${row}-${col}`)}
                                      onMouseLeave={() => setHoveredSynergyId(null)}
                                    >
                                      <div className={`w-8 h-8 bg-white dark:bg-slate-800 rounded-full border shadow-md flex items-center justify-center cursor-help hover:scale-110 transition-all group ${
                                        isManualPair ? 'border-rose-200 dark:border-rose-800 hover:border-rose-400' : 'border-primary-100 dark:border-primary-800 hover:border-primary-400'
                                      }`}>
                                        <Zap size={14} className={`${isManualPair ? 'text-rose-400 group-hover:text-rose-600' : 'text-primary-400 group-hover:text-primary-600'} fill-current transition-colors opacity-80`} />
                                      </div>
                                      
                                      {hoveredSynergyId === `${row}-${col}` && (
                                        <SynergyInfoPopover pair={[deskStudents[0].id, deskStudents[1].id]} lang={lang} />
                                      )}
                                    </div>
                                  )}
                                </div>
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
                  <button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-black text-[10px] uppercase tracking-widest px-4 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm transition-all"><ChevronLeft size={14} className={isRtl ? 'rotate-180' : ''} />{t.backToDashboard}</button>
                  <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[32px] shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-8"><div className="w-16 h-16 md:w-20 md:h-20 bg-primary-600 rounded-3xl flex items-center justify-center text-white font-black text-3xl md:text-4xl shadow-xl">{activeStudent.code.split('-')[1]}</div><div><h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">{activeStudent.code}</h3><div className="flex gap-2"><span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-[10px] font-black uppercase tracking-widest">{t.pedagogicalProfile}</span></div></div></div>
                    <button className="w-full md:w-auto px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest hover:bg-primary-600 dark:hover:bg-primary-200 transition-all shadow-lg flex items-center justify-center gap-2"><Save size={20} /> Save Report</button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8 min-w-0">
                      <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden min-h-[450px]">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                          <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t.profileAnalysis}</h4>
                          <button 
                            onClick={handleGenerateAIAnalysis}
                            disabled={isGeneratingAnalysis}
                            className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-all disabled:opacity-50"
                          >
                            {isGeneratingAnalysis ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                            {isGeneratingAnalysis ? t.generating : t.aiAnalysisBtn}
                          </button>
                        </div>

                        {/* AI Deep Dive Section */}
                        {aiAnalysis && (
                          <div className="mb-8 p-6 bg-primary-50 dark:bg-primary-900/20 rounded-2xl border border-primary-100 dark:border-primary-800 animate-in fade-in slide-in-from-top-2">
                            <h5 className="flex items-center gap-2 text-xs font-black text-primary-700 dark:text-primary-300 uppercase tracking-widest mb-3">
                              <BrainCircuit size={14} /> {t.aiAnalysisTitle}
                            </h5>
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{aiAnalysis}</p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <div className="h-64 md:h-72 w-full relative min-h-[250px] min-w-0 bg-slate-50/50 dark:bg-slate-700/30 rounded-2xl overflow-hidden">
                            <SafeResponsiveContainer>
                              <RadarChart 
                                data={Object.keys(QUESTION_LABELS).map(key => ({ 
                                  subject: QUESTION_LABELS[key][lang], 
                                  value: MOCK_ANSWERS[activeStudent.id][key], 
                                  average: classAverages[key] || 0, // Add Class Average
                                  fullMark: 5 
                                }))}
                              >
                                <PolarGrid stroke="#94a3b8" />
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
                            {analyzeStudentData(MOCK_ANSWERS[activeStudent.id], lang).map((insight, idx) => {
                              const styles = getInsightColor(insight.category);
                              const Icon = getInsightIcon(insight.category);
                              return (
                                <div key={idx} className={`p-6 rounded-2xl border ${styles.bg} ${styles.border} dark:bg-slate-800 dark:border-slate-700 transition-all hover:scale-[1.02] hover:shadow-md`}>
                                  <div className="flex items-center gap-2 mb-3">
                                    <div className={`p-1.5 rounded-lg bg-white/60 dark:bg-slate-700 ${styles.text} dark:text-slate-300`}>
                                      {Icon}
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${styles.text} dark:text-slate-400 opacity-80`}>
                                      {CATEGORY_NAMES[insight.category]?.[lang] || insight.category}
                                    </span>
                                  </div>
                                  <h5 className={`text-sm font-black uppercase mb-2 ${styles.text} dark:text-slate-200`}>{insight.title}</h5>
                                  <p className="text-xs font-bold text-slate-700 dark:text-slate-400 leading-relaxed">{insight.description}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      
                      <LazyView placeholderHeight="h-96">
                        <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-sm">
                          <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8 flex items-center gap-4 border-b dark:border-slate-700 pb-4"><Zap size={24} className="text-amber-500 fill-amber-500" />{t.actionableRecs}</h4>
                          <div className="grid grid-cols-1 gap-6">
                            {analyzeStudentData(MOCK_ANSWERS[activeStudent.id], lang).flatMap(i => i.recommendations).map((rec: Recommendation, idx) => (
                              <div key={idx} className="flex flex-col gap-4 p-6 bg-slate-50 dark:bg-slate-700/30 rounded-2xl border border-slate-200 dark:border-slate-700 group hover:border-primary-300 transition-all">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center font-black text-xs">{idx + 1}</div>
                                  <h5 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide">{rec.action}</h5>
                                </div>
                                <div className="flex gap-4 items-start pl-2">
                                  <div className={`pt-1 ${isRtl ? 'rotate-180' : ''}`}><ArrowRight size={18} className="text-primary-400 shrink-0" /></div>
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest">Practical Step:</p>
                                    <p className="text-sm font-bold text-slate-600 dark:text-slate-300 leading-relaxed italic border-l-2 border-primary-100 dark:border-primary-800 pl-4 bg-primary-50/30 dark:bg-primary-900/10 py-2 rounded-r-lg">{rec.practical}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </LazyView>
                    </div>
                    <div className="space-y-8">
                      <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-sm h-fit flex flex-col min-h-[500px]">
                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                          <FileText size={18} className="text-primary-600 dark:text-primary-400" /> {t.teacherNotes}
                        </h4>

                        {/* Notes List */}
                        <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 max-h-[400px]">
                          {studentNotesList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-300 dark:text-slate-600 gap-2 py-10">
                              <FileText size={40} className="opacity-20" />
                              <p className="text-xs font-bold uppercase tracking-widest">{t.noNotes}</p>
                            </div>
                          ) : (
                            studentNotesList.map(note => (
                              <div key={note.id} className={`p-4 rounded-2xl border transition-all group relative ${note.isTask ? (note.isCompleted ? 'bg-slate-50 dark:bg-slate-700 border-slate-100 dark:border-slate-600' : 'bg-primary-50/50 dark:bg-primary-900/20 border-primary-100 dark:border-primary-800') : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}>
                                <div className="flex justify-between items-start gap-3">
                                  <div className="flex-1">
                                    <p className={`text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap ${note.isCompleted ? 'line-through text-slate-400' : ''}`}>
                                      {note.content}
                                    </p>
                                    <div className="flex items-center gap-3 mt-3">
                                      <span className="text-[10px] font-bold text-slate-400">{new Date(note.createdAt).toLocaleDateString()}</span>
                                      {note.isTask && note.reminderDate && (
                                        <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${new Date(note.reminderDate) < new Date() && !note.isCompleted ? 'text-rose-500' : 'text-primary-400'}`}>
                                          <Bell size={10} /> {new Date(note.reminderDate).toLocaleDateString()}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="flex flex-col gap-2">
                                    {note.isTask && (
                                      <button onClick={() => toggleTask(note.id)} className={`p-1.5 rounded-lg transition-colors ${note.isCompleted ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-300 hover:border-primary-300'}`}>
                                        <CheckCircle2 size={14} />
                                      </button>
                                    )}
                                    <button onClick={() => deleteNote(note.id)} className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Input Area */}
                        <div className="border-t border-slate-100 dark:border-slate-700 pt-6 mt-auto">
                          <textarea
                            value={newNoteContent}
                            onChange={(e) => setNewNoteContent(e.target.value)}
                            placeholder={t.notesPlaceholder}
                            className="w-full h-24 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none resize-none text-xs font-bold text-slate-700 dark:text-slate-300 focus:bg-white dark:focus:bg-slate-800 focus:border-primary-300 transition-all mb-4"
                          />
                          
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <button 
                                  onClick={() => setIsTaskMode(!isTaskMode)}
                                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isTaskMode ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300' : 'bg-slate-50 dark:bg-slate-700 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600'}`}
                                >
                                  {isTaskMode ? <CheckCircle2 size={14} /> : <CheckCircle2 size={14} />} 
                                  {t.asTask}
                                </button>
                                
                                {isTaskMode && (
                                  <input 
                                    type="date" 
                                    value={taskDueDate}
                                    onChange={(e) => setTaskDueDate(e.target.value)}
                                    className="bg-slate-50 dark:bg-slate-700 border-none rounded-xl text-[10px] font-black text-slate-600 dark:text-slate-300 p-2 outline-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                                  />
                                )}
                            </div>
                            
                            <button 
                              onClick={addNote}
                              disabled={!newNoteContent.trim()}
                              className="w-10 h-10 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-slate-900 hover:bg-primary-600 dark:hover:bg-primary-200 transition-all disabled:opacity-50 disabled:hover:bg-slate-900 shadow-lg"
                            >
                              <Plus size={20} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <footer className="mt-auto border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 relative z-10 transition-colors duration-500 pb-24 md:pb-16">
            <div className="max-w-7xl mx-auto p-4 md:p-12 lg:p-16">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                <div className="col-span-1 md:col-span-1">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-primary-600 p-2 rounded-xl text-white shadow-lg shadow-primary-500/30">
                      <BrainCircuit size={24} />
                    </div>
                    <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">SEATAI</h1>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed mb-6">
                    Advanced pedagogical analytics platform powered by AI, designed for privacy-first educational environments.
                  </p>
                  <div className="flex gap-4">
                    <button className="p-2 bg-slate-50 dark:bg-slate-700 rounded-full text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-slate-600 transition-all"><Twitter size={16} /></button>
                    <button className="p-2 bg-slate-50 dark:bg-slate-700 rounded-full text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-slate-600 transition-all"><Linkedin size={16} /></button>
                    <button className="p-2 bg-slate-50 dark:bg-slate-700 rounded-full text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-slate-600 transition-all"><Facebook size={16} /></button>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-widest mb-6">Platform</h4>
                  <ul className="space-y-4 text-xs font-bold text-slate-500 dark:text-slate-400">
                    <li><button onClick={() => setActiveInfoPage('overview')} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Overview</button></li>
                    <li><button onClick={() => setActiveInfoPage('features')} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Features</button></li>
                    <li><button onClick={() => setActiveInfoPage('security')} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Security</button></li>
                    <li><button onClick={() => setActiveInfoPage('roadmap')} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Roadmap</button></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-widest mb-6">Support</h4>
                  <ul className="space-y-4 text-xs font-bold text-slate-500 dark:text-slate-400">
                    <li><button onClick={() => setActiveInfoPage('help')} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Help Center</button></li>
                    <li><button onClick={() => setActiveInfoPage('features')} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Documentation</button></li>
                    <li><button onClick={() => setActiveInfoPage('help')} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Contact Us</button></li>
                    <li><button onClick={() => setActiveInfoPage('overview')} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">System Status</button></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-widest mb-6">Legal</h4>
                  <ul className="space-y-4 text-xs font-bold text-slate-500 dark:text-slate-400">
                    <li><button onClick={() => setActiveInfoPage('privacy')} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Privacy Policy</button></li>
                    <li><button onClick={() => setActiveInfoPage('terms')} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Terms of Service</button></li>
                    <li><button onClick={() => setShowCookieSettings(true)} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Cookie Policy</button></li>
                    <li><button onClick={() => setActiveInfoPage('accessibility')} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Accessibility</button></li>
                  </ul>
                </div>
              </div>
              
              <div className="pt-8 border-t border-slate-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">© 2024 SEATAI INC. All rights reserved.</p>
                <div className="flex gap-4">
                  <button onClick={() => setShowThemeSettings(true)} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    <Palette size={14} /> {lang === 'he' ? 'עיצוב' : 'Appearance'}
                  </button>
                  <button onClick={() => setShowCookieSettings(true)} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    <Cookie size={14} /> Cookie Preferences
                  </button>
                </div>
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

export default App;