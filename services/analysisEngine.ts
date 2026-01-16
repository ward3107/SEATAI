
import { StudentAnswers, Insight, Language, PairSynergy, Recommendation } from '../types';
import { GoogleGenAI } from "@google/genai";

export interface PlacementDriver {
  id: string;
  label: string;
  value: number;
}

export const getInsightColor = (category: string) => {
  switch (category) {
    case 'emotional': return { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-700', icon: 'text-rose-500', fill: '#f43f5e' };
    case 'social': return { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700', icon: 'text-amber-500', fill: '#f59e0b' };
    case 'cognitive': return { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', icon: 'text-emerald-500', fill: '#10b981' };
    case 'needs': return { bg: 'bg-violet-50', border: 'border-violet-100', text: 'text-violet-700', icon: 'text-violet-500', fill: '#8b5cf6' };
    case 'behavioral': return { bg: 'bg-slate-50', border: 'border-slate-100', text: 'text-slate-700', icon: 'text-slate-500', fill: '#64748b' };
    default: return { bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-700', icon: 'text-indigo-500', fill: '#6366f1' };
  }
};

/**
 * Generate a deep AI analysis for a specific student using Gemini.
 */
export const generateAIDeepAnalysis = async (
  ai: GoogleGenAI, 
  studentCode: string, 
  scores: Record<string, number>, 
  lang: Language
): Promise<string> => {
  const prompt = `
    You are an expert Educational Psychologist. 
    Analyze the following student profile based on a 1-5 scale:
    Student: ${studentCode}
    - Resilience: ${scores.q1}
    - Social: ${scores.q2}
    - Focus: ${scores.q3}
    - Visual: ${scores.q4}
    - Auditory: ${scores.q5}
    
    Language: ${lang}
    
    Output a single paragraph (max 60 words). Use emojis.
    Focus on "Superpower" vs "Challenge". 
    Simple language for teachers.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Analysis unavailable.";
  } catch (error) {
    console.error("AI Generation Error:", error);
    return lang === 'he' ? "שגיאה בייצור ניתוח AI." : "Error generating AI analysis.";
  }
};

/**
 * Enhanced getPairSynergy with Academic Rationales
 */
export const getPairSynergy = (student1Id: string, student2Id: string, answers: Record<string, any>, lang: Language = 'he'): PairSynergy => {
  const s1 = answers[student1Id] || { q1: 3, q2: 3, q3: 3, q4: 3, q5: 3 };
  const s2 = answers[student2Id] || { q1: 3, q2: 3, q3: 3, q4: 3, q5: 3 };
  
  // 1. Check for Risks (Priority)
  // Both Low Focus (q3 <= 2)
  if (s1.q3 <= 2 && s2.q3 <= 2) {
    return {
      score: 45,
      label: lang === 'he' ? "אתגר קשב משותף" : "Mutual Attention Deficit",
      description: lang === 'he' ? "שני התלמידים מתקשים בריכוז. ישיבה משותפת עלולה להגביר מוסחות." : "High risk of mutual distraction due to shared executive function challenges.",
      theoryReference: lang === 'he' ? "תיאוריית העומס הקוגניטיבי" : "Cognitive Load Theory",
      academicRationale: lang === 'he' 
        ? "חוסר הדדי בבקרת אימפולסים (Impulse Control) יוצר 'הדבקה התנהגותית'. העומס הקוגניטיבי של שניהם עולה כתוצאה מגירויים חיצוניים."
        : "Both students lack sufficient impulse control mechanisms. Distraction Conflict Theory suggests attentional resources will be split.",
      advantages: lang === 'he' ? ["הבנה הדדית לקושי"] : ["Shared empathy for difficulty"],
      risks: lang === 'he' ? ["הפרעות הדדיות רבות", "קושי בהתחלת משימה"] : ["Task initiation failure", "Reinforced off-task behavior"],
      type: 'warning'
    };
  }

  // Both Low Emotional Resilience (q1 <= 2)
  if (s1.q1 <= 2 && s2.q1 <= 2) {
    return {
      score: 50,
      label: lang === 'he' ? "רגישות רגשית גבוהה" : "High Emotional Sensitivity",
      description: lang === 'he' ? "שני התלמידים זקוקים לתמיכה רגשית. קושי לווסת אחד את השני." : "Both students require external regulation. Risk of anxiety amplification.",
      theoryReference: lang === 'he' ? "הדבקה רגשית" : "Emotional Contagion",
      academicRationale: lang === 'he'
        ? "על פי מודל ההדבקה הרגשית, רגשות שליליים (חרדה/תסכול) נוטים לעבור מאדם לאדם. ללא 'עוגן' יציב, יש סכנה ללולאת משוב שלילית."
        : "Negative affect is likely to transfer and amplify between peers. The lack of a stable regulator creates a risk of escalated stress.",
      advantages: lang === 'he' ? ["אמפתיה גבוהה"] : ["Deep mutual understanding"],
      risks: lang === 'he' ? ["הצפה רגשית משותפת"] : ["Shared emotional escalation"],
      type: 'warning'
    };
  }

  // 2. Check for Synergies
  // Anchoring (Emotional): Low (<=2) paired with High (>=4)
  if ((s1.q1 <= 2 && s2.q1 >= 4) || (s2.q1 <= 2 && s1.q1 >= 4)) {
    return {
      score: 88,
      label: lang === 'he' ? "עגינה רגשית (Anchoring)" : "Emotional Anchoring",
      description: lang === 'he' ? "תלמיד בעל חוסן גבוה מעניק ביטחון ותמיכה לתלמיד הזקוק לו." : "A high-resilience student serves as a stabilizer for a sensitive peer.",
      theoryReference: lang === 'he' ? "תיאוריית ויסות-הדדי" : "Co-regulation Theory",
      academicRationale: lang === 'he'
        ? "התלמיד החסין משמש כ'עוגן' (Secure Base). נוכחותו השקולה מפעילה נוירוני מראה אצל התלמיד השני ומאפשרת ויסות רגשי."
        : "The resilient student acts as an external regulator. Through co-regulation, their calm baseline helps down-regulate the peer's anxiety.",
      advantages: lang === 'he' ? ["הורדת חרדה", "מודלינג להתמודדות"] : ["Anxiety reduction", "Coping modeling"],
      risks: lang === 'he' ? ["עומס על התלמיד החסין"] : ["Potential burden on anchor"],
      type: 'anchoring'
    };
  }

  // Modeling (Cognitive/Focus): Low (<=2) paired with High (>=4)
  if ((s1.q3 <= 2 && s2.q3 >= 4) || (s2.q3 <= 2 && s1.q3 >= 4)) {
    return {
      score: 92,
      label: lang === 'he' ? "מודלינג קוגניטיבי" : "Cognitive Modeling",
      description: lang === 'he' ? "תלמיד ממוקד עוזר לחברו לשמור על רצף למידה והתארגנות." : "A focused student models executive functions for their peer.",
      theoryReference: lang === 'he' ? "איזור ההתפתחות המקורב" : "Vygotsky's ZPD",
      academicRationale: lang === 'he'
        ? "התלמיד הממוקד משמש כ'אחר משמעותי' (MKO) בתחום התפקודים הניהוליים. הוא מספק פיגומים (Scaffolding) להתחלת משימה."
        : "The focused peer acts as a 'More Knowledgeable Other' regarding executive functions, modeling task initiation and sustained attention.",
      advantages: lang === 'he' ? ["שיפור קשב פסיבי", "למידה עקיפה"] : ["Passive focus improvement", "Vicarious learning"],
      risks: lang === 'he' ? ["הסחת דעת לממוקד"] : ["Distraction for the model"],
      type: 'modeling'
    };
  }
  
  // Default Balanced
  return {
    score: 75,
    label: lang === 'he' ? "התאמה פדגוגית" : "Pedagogical Fit",
    description: lang === 'he' ? "פרופילים דומים המאפשרים עבודה שקטה ופורייה." : "Compatible profiles allowing for productive collaboration.",
    theoryReference: lang === 'he' ? "דמיון-משיכה" : "Similarity-Attraction",
    academicRationale: lang === 'he'
      ? "הדמיון ברמות הקשב והמזג הרגשי ממזער חיכוכים קוגניטיביים. זהו מצב של 'הומאוסטזיס כיתתי' המאפשר זרימה (Flow)."
      : "Similarity in cognitive tempo and emotional temperament minimizes friction. This pairing supports a state of 'Classroom Homeostasis'.",
    advantages: lang === 'he' ? ["שיתוף פעולה", "יציבות"] : ["Collaboration", "Stability"],
    risks: lang === 'he' ? ["חוסר אתגר הדדי"] : ["Lack of diverse perspectives"],
    type: 'balancing'
  };
};

export const analyzeStudentData = (answers: any, lang: Language = 'he'): Insight[] => {
  const responses = answers;
  const insights: Insight[] = [];

  // --- COGNITIVE ANALYSIS ---
  // High Visual (q4 >= 4)
  if (responses['q4'] >= 4) {
    insights.push({
      category: 'cognitive',
      level: 'high',
      title: lang === 'he' ? 'חשיבה ויזואלית 🎨' : 'Visual Thinker 🎨',
      description: lang === 'he' ? 'קולט מידע דרך העיניים. גרפים וצבעים עוזרים להבנה.' : 'Processes via sight. Colors & charts spark understanding.',
      recommendations: [{ action: '', practical: lang === 'he' ? 'השתמש בטוש זוהר להדגשת מילות מפתח.' : 'Use highlighters for key concepts.' }]
    });
  } 
  // High Auditory (q5 >= 4)
  else if (responses['q5'] >= 4) {
    insights.push({
      category: 'cognitive',
      level: 'high',
      title: lang === 'he' ? 'לומד שמיעתי 🎧' : 'Auditory Learner 🎧',
      description: lang === 'he' ? 'זקוק להסבר וירבלי. דיונים עוזרים לו לזכור.' : 'Needs verbal explanations. Discussions help retention.',
      recommendations: [{ action: '', practical: lang === 'he' ? 'אפשר לו להקליט את הסיכום או לדבר לעצמו בשקט.' : 'Allow quiet self-talk or recording.' }]
    });
  }
  // Low Focus (q3 <= 2) - This is Cognitive but also Needs
  if (responses['q3'] <= 2) {
    insights.push({
      category: 'cognitive',
      level: 'low',
      title: lang === 'he' ? 'מוסחות גבוהה 🦋' : 'Easily Distracted 🦋',
      description: lang === 'he' ? 'קושי בסינון גירויים. זקוק למיקוד חיצוני.' : 'Difficulty filtering stimuli. Needs external focus anchors.',
      recommendations: [{ action: '', practical: lang === 'he' ? 'פרק משימות גדולות לצעדים קטנים.' : 'Break tasks into micro-steps.' }]
    });
  }

  // --- EMOTIONAL ANALYSIS ---
  // Low Resilience (q1 <= 2)
  if (responses['q1'] <= 2) {
    insights.push({
      category: 'emotional',
      level: 'low',
      title: lang === 'he' ? 'זקוק לביטחון ⚓' : 'Needs Security ⚓',
      description: lang === 'he' ? 'רגיש לשינויים ולביקורת. זקוק לעידוד תכוף.' : 'Sensitive to change/critique. Needs frequent reassurance.',
      recommendations: [{ action: '', practical: lang === 'he' ? 'התחל את היום במילה טובה אישית.' : 'Start day with a personal check-in.' }]
    });
  }
  // High Resilience (q1 >= 4)
  else if (responses['q1'] >= 4) {
    insights.push({
      category: 'emotional',
      level: 'high',
      title: lang === 'he' ? 'עוגן כיתתי 🏔️' : 'Classroom Anchor 🏔️',
      description: lang === 'he' ? 'יציב רגשית. יכול להרגיע חברים לחוצים.' : 'Emotionally stable. Can calm anxious peers.',
      recommendations: [{ action: '', practical: lang === 'he' ? 'חבר אותו לתלמידים שזקוקים לביטחון.' : 'Pair with students needing stability.' }]
    });
  }

  // --- SPECIFIC NEEDS / SOCIAL ---
  // High Social (q2 >= 4)
  if (responses['q2'] >= 4) {
    insights.push({
      category: 'needs', // Using 'needs' category for Social/Behavioral needs
      level: 'high',
      title: lang === 'he' ? 'כוכב חברתי 🌟' : 'Social Star 🌟',
      description: lang === 'he' ? 'מונע מאינטראקציה. עלול לפטפט ללא תעסוקה.' : 'Driven by interaction. Chats if not engaged.',
      recommendations: [{ action: '', practical: lang === 'he' ? 'תן לו תפקיד ניהולי (חלוקת דפים/עזרים).' : 'Give a leadership role (handing out papers).' }]
    });
  }
  // Low Social (q2 <= 2)
  else if (responses['q2'] <= 2) {
    insights.push({
      category: 'needs',
      level: 'low',
      title: lang === 'he' ? 'זקוק לתיווך 🤝' : 'Needs Mediation 🤝',
      description: lang === 'he' ? 'נמנע מיוזמה חברתית. זקוק להזמנה להשתתף.' : 'Avoids social initiative. Needs explicit invitation.',
      recommendations: [{ action: '', practical: lang === 'he' ? 'צוות אותו לזוגות, לא לקבוצות גדולות.' : 'Pair in dyads, avoid large groups.' }]
    });
  }

  return insights;
};

// New Helper for "Best Seat" Logic
export const getSeatingAdvice = (responses: Record<string, number>, lang: Language = 'he'): { zone: string, reason: string, icon: string } => {
  const focus = responses['q3'] || 3;
  const social = responses['q2'] || 3;
  const anxiety = responses['q1'] || 3;

  // Logic Tree for Seating
  if (focus <= 2) {
    return {
      zone: lang === 'he' ? "קדמת הכיתה (מרכז)" : "Front & Center",
      reason: lang === 'he' ? "קרבה למורה למיקוד קשב וצמצום הפרעות." : "Proximity to teacher maximizes focus.",
      icon: "🎯"
    };
  }
  
  if (anxiety <= 2) {
    return {
      zone: lang === 'he' ? "אזור צדדי / היקפי" : "Side / Periphery",
      reason: lang === 'he' ? "תחושת מוגנות, אפשרות יציאה מהירה, פחות 'עיניים בגב'." : "Increases psychological safety, reduces sensory overload.",
      icon: "🛡️"
    };
  }

  if (social >= 4 && focus >= 3) {
    return {
      zone: lang === 'he' ? "מרכז הכיתה (גישור)" : "Central Hub",
      reason: lang === 'he' ? "מיקום המאפשר השפעה חברתית חיובית על הסביבה." : "Leverages positive social influence on peers.",
      icon: "🌟"
    };
  }

  if (social >= 4 && focus < 3) {
    return {
      zone: lang === 'he' ? "קרוב למורה (צד)" : "Near Teacher (Side)",
      reason: lang === 'he' ? "מאפשר קשר עין לפיקוח על פטפוט." : "Allows eye contact to regulate chatting.",
      icon: "eye" 
    };
  }

  return {
    zone: lang === 'he' ? "גמיש / אזור ביניים" : "Flexible Zone",
    reason: lang === 'he' ? "תלמיד סתגלן היכול לתפקד היטב במגוון מיקומים." : "Adaptable student, functions well anywhere.",
    icon: "✨"
  };
};

export const calculateAutomatedLayout = (
  students: any[], 
  answers: Record<string, any>, 
  lang: Language
): Record<string, { row: number, col: number, seatIndex: number, matchReason: string }> => {
  const layout: Record<string, { row: number, col: number, seatIndex: number, matchReason: string }> = {};
  
  const studentData = students.map(s => {
    const res = answers[s.id] || { q1: 3, q2: 3, q3: 3, q4: 3, q5: 3 };
    // We only need simple row/col for the algo here, using simplified logic
    let row = 2;
    let col = 1;
    if (res.q3 <= 2) row = 0; // Focus -> Front
    else if (res.q3 >= 4) row = 3; // High focus -> Back
    
    if (res.q1 <= 2) col = 0; // Anxiety -> Side
    else if (res.q2 >= 4) col = 2; // Social -> Center/Side

    return {
      id: s.id,
      code: s.code,
      res,
      advice: { row, col },
      isAssigned: false
    };
  });

  studentData.sort((a, b) => {
    // Prioritize low focus or low resilience for seating
    const scoreA = (5 - a.res.q1) + (5 - a.res.q3);
    const scoreB = (5 - b.res.q1) + (5 - b.res.q3);
    return scoreB - scoreA;
  });

  const desks: { row: number, col: number, seats: string[] }[] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 2; c++) {
      desks.push({ row: r, col: c, seats: [] });
    }
  }

  const findBuddy = (primary: any, pool: any[]) => {
    if (primary.res.q1 <= 2) {
      const buddy = pool.find(s => !s.isAssigned && s.res.q1 >= 4);
      if (buddy) return { buddy, reason: lang === 'he' ? "עגינה רגשית: חיבור לתלמיד בעל חוסן גבוה." : "Emotional Anchoring: Pairing with a resilient peer." };
    }

    if (primary.res.q3 <= 2) {
      const buddy = pool.find(s => !s.isAssigned && s.res.q3 >= 4);
      if (buddy) return { buddy, reason: lang === 'he' ? "מודלינג קוגניטיבי: הושבה ליד תלמיד ממוקד." : "Cognitive Modeling: Pairing with a focused student." };
    }

    if (primary.res.q2 <= 2) {
      const buddy = pool.find(s => !s.isAssigned && s.res.q2 >= 4);
      if (buddy) return { buddy, reason: lang === 'he' ? "תיווך חברתי: חיבור לתלמיד דומיננטי." : "Social Integration: Pairing with a social leader." };
    }

    const buddy = pool.find(s => !s.isAssigned);
    return buddy ? { buddy, reason: lang === 'he' ? "התאמה פדגוגית מאוזנת." : "Balanced pedagogical match." } : null;
  };

  studentData.forEach(student => {
    if (student.isAssigned) return;

    let desk = desks.find(d => d.row === student.advice.row && d.seats.length === 0);
    if (!desk) desk = desks.find(d => d.seats.length === 0);
    if (!desk) desk = desks.find(d => d.seats.length < 2);

    if (desk) {
      student.isAssigned = true;
      desk.seats.push(student.id);

      const match = findBuddy(student, studentData);
      if (match && desk.seats.length < 2) {
        match.buddy.isAssigned = true;
        desk.seats.push(match.buddy.id);

        layout[student.id] = { row: desk.row, col: desk.col, seatIndex: 0, matchReason: match.reason };
        layout[match.buddy.id] = { row: desk.row, col: desk.col, seatIndex: 1, matchReason: match.reason };
      } else {
        layout[student.id] = { row: desk.row, col: desk.col, seatIndex: desk.seats.length - 1, matchReason: lang === 'he' ? "הושבה אינדיבידואלית מותאמת." : "Individual adapted seating." };
      }
    }
  });

  return layout;
};
