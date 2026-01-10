
export type Language = 'he' | 'en' | 'ar' | 'ru';

export interface Teacher {
  id: string;
  code: string;
  name: string;
  classes: string[];
}

export interface Student {
  id: string;
  code: string; // The anonymous identifier
  classId: string;
}

export interface StudentAnswers {
  studentId: string;
  responses: Record<string, number>;
  timestamp: string;
}

export interface Recommendation {
  action: string;
  practical: string;
}

export interface Insight {
  category: 'emotional' | 'cognitive' | 'social' | 'behavioral';
  level: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  recommendations: Recommendation[];
}

export interface PairSynergy {
  score: number;
  label: string;
  description: string;
  academicRationale: string; // New field for deep explanation
  theoryReference: string;   // New field for the theory name
  advantages: string[];
  risks: string[];
  type: 'anchoring' | 'modeling' | 'balancing' | 'warning';
}

// Seat position interface used for seating logic in App.tsx
export interface SeatPos {
  row: number;
  col: number;
  seatIndex: number;
  matchReason?: string;
  isManualPair?: boolean;
}

export interface LayoutHistoryItem {
  id: string;
  timestamp: string;
  layout: Record<string, SeatPos>;
  name?: string;
}

export interface Note {
  id: string;
  studentId: string;
  content: string;
  createdAt: string;
  isTask: boolean;
  reminderDate?: string;
  isCompleted: boolean;
}

export interface Translation {
  appTitle: string;
  loginTitle: string;
  loginSubtitle: string;
  teacherCodePlaceholder: string;
  loginButton: string;
  selectClass: string;
  studentList: string;
  reports: string;
  seating: string;
  emotionalReport: string;
  cognitiveReport: string;
  actionableRecs: string;
  studentCode: string;
  insights: string;
  recommendations: string;
  seatingLegend: string;
  backToDashboard: string;
  logout: string;
  analysisInTitle: string;
  analysisInSubtitle: string;
  teacherNotes: string;
  notesPlaceholder: string;
  saveNotes: string;
  notesSaved: string;
  synergyDetails: string;
  synergyScore: string;
  advantages: string;
  risks: string;
  close: string;
  backToClasses: string;
  saveLayout: string;
  loadLayout: string;
  layoutSaved: string;
  layoutLoaded: string;
  layoutCleared: string;
  historyTitle: string;
  historyEmpty: string;
  restore: string;
  delete: string;
  layoutRestored: string;
  aiAnalysisBtn: string;
  aiAnalysisTitle: string;
  classAverage: string;
  studentScore: string;
  generating: string;
  pedagogicalProfile: string;
  profileAnalysis: string;
  cookies: {
    title: string;
    intro: string;
    essentialTitle: string;
    essentialDesc: string;
    analyticsTitle: string;
    analyticsDesc: string;
    marketingTitle: string;
    marketingDesc: string;
    acceptAll: string;
    saveSelection: string;
    policyLink: string;
  };
  // New Note Keys
  noNotes: string;
  asTask: string;
}