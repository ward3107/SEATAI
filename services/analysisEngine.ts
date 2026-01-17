
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
    
    Output a single paragraph (max 80 words). Use emojis.
    Include a specific pedagogical "Pro-Tip" for the teacher based on their seating and learning style.
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
 * Enhanced getPairSynergy with deep Academic Rationales for the Popover
 */
export const getPairSynergy = (student1Id: string, student2Id: string, answers: Record<string, any>, lang: Language = 'he'): PairSynergy => {
  const s1 = answers[student1Id] || { q1: 3, q2: 3, q3: 3, q4: 3, q5: 3 };
  const s2 = answers[student2Id] || { q1: 3, q2: 3, q3: 3, q4: 3, q5: 3 };
  
  // 1. HIGH RISK: Both struggle with focus
  if (s1.q3 <= 2 && s2.q3 <= 2) {
    return {
      score: 42,
      label: lang === 'he' ? "אתגר קשב משותף" : "Mutual Attention Deficit",
      description: lang === 'he' ? "שני התלמידים מתקשים בריכוז. ישיבה משותפת עלולה להגביר מוסחות." : "Both students have low focus scores, leading to high distraction risk.",
      theoryReference: lang === 'he' ? "תיאוריית העומס הקוגניטיבי" : "Cognitive Load Theory",
      academicRationale: lang === 'he' 
        ? "חוסר הדדי בבקרת אימפולסים (Executive Functions) יוצר 'הדבקה התנהגותית'. העומס הקוגניטיבי של שניהם עולה כתוצאה מגירויים חיצוניים ללא 'עוגן' מרסן."
        : "Pairing two students with limited impulse control creates a 'behavioral contagion' effect. Without an external regulator, the shared cognitive load increases exponentially.",
      advantages: lang === 'he' ? ["הבנה הדדית"] : ["Shared empathy"],
      risks: lang === 'he' ? ["הפרעות הדדיות רבות", "קושי בהתחלת משימה"] : ["Mutual distraction", "Task initiation failure"],
      type: 'warning'
    };
  }

  // 2. SYNERGY: Anchor Pairing (High Resilience + Low Resilience)
  if ((s1.q1 <= 2 && s2.q1 >= 4) || (s2.q1 <= 2 && s1.q1 >= 4)) {
    return {
      score: 92,
      label: lang === 'he' ? "עגינה רגשית (Anchoring)" : "Emotional Anchoring",
      description: lang === 'he' ? "חיבור בין תלמיד חסין לתלמיד הזקוק לביטחון." : "Pairing a resilient 'anchor' with a student needing emotional stability.",
      theoryReference: lang === 'he' ? "תיאוריית ויסות-הדדי" : "Co-regulation Theory",
      academicRationale: lang === 'he'
        ? "התלמיד החסין משמש כ'בסיס בטוח'. נוכחותו השקולה מפעילה נוירוני מראה אצל התלמיד השני, המאפשרים ויסות רגשי פסיבי והורדת רמות חרדה לימודית."
        : "The resilient peer acts as a 'Secure Base'. Through co-regulation, their calm baseline helps the sensitive peer manage performance anxiety and frustration.",
      advantages: lang === 'he' ? ["הורדת חרדה", "מודלינג להתמודדות"] : ["Anxiety reduction", "Coping modeling"],
      risks: lang === 'he' ? ["עומס רגשי על ה'עוגן'"] : ["Emotional burden on the anchor"],
      type: 'anchoring'
    };
  }

  // 3. SYNERGY: Cognitive Modeling (High Focus + Low Focus)
  if ((s1.q3 <= 2 && s2.q3 >= 4) || (s2.q3 <= 2 && s1.q3 >= 4)) {
    return {
      score: 88,
      label: lang === 'he' ? "מודלינג קוגניטיבי" : "Cognitive Modeling",
      description: lang === 'he' ? "תלמיד ממוקד עוזר לחברו לשמור על רצף למידה." : "A focused student models executive function for an easily distracted peer.",
      theoryReference: lang === 'he' ? "איזור ההתפתחות המקורב" : "Vygotsky's ZPD",
      academicRationale: lang === 'he'
        ? "התלמיד הממוקד משמש כ'אחר משמעותי' (MKO). הוא מספק 'פיגומים' (Scaffolding) להתחלת משימה ולשימור קשב דרך חיקוי התנהגותי."
        : "The focused peer serves as a 'More Knowledgeable Other' regarding study habits. They provide scaffolding for task initiation and sustained attention through behavioral modeling.",
      advantages: lang === 'he' ? ["שיפור קשב", "למידה עקיפה"] : ["Passive focus improvement", "Vicarious learning"],
      risks: lang === 'he' ? ["הסחת דעת לממוקד"] : ["Potential distraction for the model"],
      type: 'modeling'
    };
  }
  
  // 4. BALANCED: Pedagogical Fit
  return {
    score: 75,
    label: lang === 'he' ? "התאמה פדגוגית" : "Pedagogical Fit",
    description: lang === 'he' ? "פרופילים משלימים המאפשרים עבודה שקטה." : "Compatible profiles facilitating quiet and productive collaborative work.",
    theoryReference: lang === 'he' ? "תיאוריית הדמיון-משיכה" : "Similarity-Attraction Theory",
    academicRationale: lang === 'he'
      ? "הדמיון בטמפו הקוגניטיבי ובמזג הרגשי ממזער חיכוכים. זהו מצב של 'הומאוסטזיס כיתתי' המאפשר זרימה (Flow) ללא צורך בתיווך מתמיד."
      : "Similarity in cognitive tempo and emotional temperament minimizes friction. This pairing creates 'classroom homeostasis', allowing for student flow with minimal teacher intervention.",
    advantages: lang === 'he' ? ["שיתוף פעולה", "יציבות"] : ["Collaboration", "Stability"],
    risks: lang === 'he' ? ["חוסר אתגר הדדי"] : ["Lack of diverse perspectives"],
    type: 'balancing'
  };
};

export const analyzeStudentData = (answers: any, lang: Language = 'he'): Insight[] => {
  const responses = answers;
  const insights: Insight[] = [];

  // --- COGNITIVE ANALYSIS ---
  if (responses['q4'] >= 4) {
    insights.push({
      category: 'cognitive',
      level: 'high',
      title: lang === 'he' ? 'עיבוד ויזואלי דומיננטי 🎨' : 'Visual Dominance 🎨',
      description: lang === 'he' ? 'התלמיד חושב בתמונות. מידע מופשט הופך למובן יותר כשהוא מוצג בתרשימים, צבעים ומפות מושגים.' : 'The student thinks in images. Abstract information becomes clearer when presented through charts, colors, and concept maps.',
      recommendations: [{ action: '', practical: lang === 'he' ? 'השתמש במארגנים גרפיים ובצבעים שונים להבחנה בין נושאים.' : 'Use graphic organizers and distinct colors to differentiate topics.' }]
    });
  } 
  if (responses['q5'] >= 4) {
    insights.push({
      category: 'cognitive',
      level: 'high',
      title: lang === 'he' ? 'נטייה ללמידה שמיעתית 🎧' : 'Auditory Learning Preference 🎧',
      description: lang === 'he' ? 'התלמיד קולט מידע בצורה המיטבית דרך הקשבה ודיון. הוא נוטה לזכור הוראות בעל פה וסיפורים.' : 'The student processes information best through listening and discussion. Tends to remember oral instructions and narratives.',
      recommendations: [{ action: '', practical: lang === 'he' ? 'עודד את התלמיד להסביר את החומר לחבר או להקליט סיכומים.' : 'Encourage the student to explain material to a peer or record summaries.' }]
    });
  }
  if (responses['q3'] <= 2) {
    insights.push({
      category: 'cognitive',
      level: 'low',
      title: lang === 'he' ? 'ניהול קשב ומוסחות 🦋' : 'Attention & Distractibility 🦋',
      description: lang === 'he' ? 'קושי בסינון גירויי רקע. התלמיד זקוק לסביבה שקטה יחסית ולמיקוד חיצוני תכוף כדי להישאר במשימה.' : 'Difficulty filtering background stimuli. Needs a relatively quiet environment and frequent external refocusing to stay on task.',
      recommendations: [{ action: '', practical: lang === 'he' ? 'חלק משימות ארוכות לתת-משימות קצרות עם משוב מיידי.' : 'Break long assignments into short sub-tasks with immediate feedback.' }]
    });
  } else if (responses['q3'] >= 4) {
    insights.push({
      category: 'cognitive',
      level: 'high',
      title: lang === 'he' ? 'ריכוז עמוק ומיקוד 🎯' : 'Deep Focus & Concentration 🎯',
      description: lang === 'he' ? 'יכולת גבוהה להתעלם מהסחות דעת ולהתמיד במשימות מורכבות לאורך זמן.' : 'High ability to ignore distractions and persevere in complex tasks over time.',
      recommendations: [{ action: '', practical: lang === 'he' ? 'ספק אתגרי העמקה או תפקיד של "חונך קשב" לחבר.' : 'Provide enrichment challenges or a "focus mentor" role for a peer.' }]
    });
  }

  // --- EMOTIONAL ANALYSIS ---
  if (responses['q1'] <= 2) {
    insights.push({
      category: 'emotional',
      level: 'low',
      title: lang === 'he' ? 'רגישות רגשית וצורך בביטחון ⚓' : 'Emotional Sensitivity & Security ⚓',
      description: lang === 'he' ? 'התלמיד חווה שינויים וביקורת בעוצמה גבוהה. הוא זקוק לסביבת למידה צפויה ותומכת כדי להפחית חרדה.' : 'The student experiences changes and criticism intensely. Requires a predictable and supportive environment to reduce anxiety.',
      recommendations: [{ action: '', practical: lang === 'he' ? 'הקדש דקה לשיחה אישית בבוקר ("איך עבר עליך הבוקר?").' : 'Dedicate a minute to a personal check-in ("How was your morning?").' }]
    });
  } else if (responses['q1'] >= 4) {
    insights.push({
      category: 'emotional',
      level: 'high',
      title: lang === 'he' ? 'חוסן רגשי גבוה 🏔️' : 'High Emotional Resilience 🏔️',
      description: lang === 'he' ? 'התלמיד מפגין יציבות רגשית ויכולת להתאושש מהר מתקלות או כישלונות לימודיים.' : 'Displays emotional stability and the ability to recover quickly from academic setbacks.',
      recommendations: [{ action: '', practical: lang === 'he' ? 'חבר אותו כ"עוגן" לתלמיד שזקוק לביטחון רגשי.' : 'Pair as an "anchor" for a student needing emotional security.' }]
    });
  }

  // --- NEEDS / SOCIAL ---
  if (responses['q2'] >= 4) {
    insights.push({
      category: 'needs',
      level: 'high',
      title: lang === 'he' ? 'דחף חברתי דומיננטי 🌟' : 'Dominant Social Drive 🌟',
      description: lang === 'he' ? 'התלמיד שואב אנרגיה מאינטראקציה. הוא עלול "ללכת לאיבוד" בעבודה עצמאית ללא היבט חברתי.' : 'The student draws energy from interaction. May "get lost" in independent work without a social component.',
      recommendations: [{ action: '', practical: lang === 'he' ? 'תן לו תפקידי הנהגה בכיתה (אחראי ציוד, מגשר חברתי).' : 'Give leadership roles (equipment manager, social mediator).' }]
    });
  } else if (responses['q2'] <= 2) {
    insights.push({
      category: 'needs',
      level: 'low',
      title: lang === 'he' ? 'מופנמות וצורך במרחב אישי 👤' : 'Introversion & Personal Space 👤',
      description: lang === 'he' ? 'התלמיד מעדיף עבודה אינדיבידואלית או בקבוצה קטנה ומוכרת. אינטראקציה המונית עלולה להתיש אותו.' : 'Prefers individual work or small, familiar groups. Large-scale interaction may be exhausting.',
      recommendations: [{ action: '', practical: lang === 'he' ? 'אפשר לו לבחור פינה שקטה לעבודה עצמאית מדי פעם.' : 'Allow choosing a quiet corner for independent work occasionally.' }]
    });
  }

  return insights;
};

export const getSeatingAdvice = (responses: Record<string, number>, lang: Language = 'he'): { zone: string, reason: string, icon: string } => {
  const focus = responses['q3'] || 3;
  const social = responses['q2'] || 3;
  const resilience = responses['q1'] || 3;

  if (focus <= 2) {
    return {
      zone: lang === 'he' ? "קדמת הכיתה (מרכז)" : "Front & Center",
      reason: lang === 'he' ? "צמצום הסחות דעת ויזואליות וקרבה פיזית למורה לשיפור המיקוד." : "Minimizes visual distractions and provides proximity to the teacher for better focus.",
      icon: "🎯"
    };
  }
  
  if (resilience <= 2) {
    return {
      zone: lang === 'he' ? "אזור היקפי / פינתי" : "Periphery / Corner",
      reason: lang === 'he' ? "תחושת מוגנות, 'גב לקיר', והפחתת הגירויים מהמרכז הרועש של הכיתה." : "Provides a sense of security (back to the wall) and reduces stimuli from the noisy center.",
      icon: "🛡️"
    };
  }

  if (social >= 4 && focus >= 3) {
    return {
      zone: lang === 'he' ? "מרכז הכיתה (ליבת הלמידה)" : "Central Learning Hub",
      reason: lang === 'he' ? "מיקום אסטרטגי המאפשר לתלמיד להשפיע חיובית ולתקשר עם מגוון חברים." : "Strategic location allowing the student to influence positively and interact with many peers.",
      icon: "🌟"
    };
  }

  if (social >= 4 && focus < 3) {
    return {
      zone: lang === 'he' ? "קרוב למורה (צד)" : "Near Teacher (Side)",
      reason: lang === 'he' ? "מאפשר קשר עין תכוף לוויסות פטפוט מבלי לבודד את התלמיד חברתית." : "Allows frequent eye contact to regulate chatting without isolating the student socially.",
      icon: "👁️" 
    };
  }

  return {
    zone: lang === 'he' ? "מרחב גמיש / אחורי" : "Flexible / Back Zone",
    reason: lang === 'he' ? "תלמיד עצמאי וממוקד שיכול לתפקד היטב גם עם רמה גבוהה של אוטונומיה." : "An independent, focused student who functions well even with high autonomy.",
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
    let row = 2;
    let col = 1;
    if (res.q3 <= 2) row = 0;
    else if (res.q3 >= 4) row = 3;
    
    if (res.q1 <= 2) col = 0;
    else if (res.q2 >= 4) col = 2;

    return {
      id: s.id,
      code: s.code,
      res,
      advice: { row, col },
      isAssigned: false
    };
  });

  studentData.sort((a, b) => {
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
