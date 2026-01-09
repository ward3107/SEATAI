
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
    You are an expert Educational Psychologist and Pedagogical Consultant. 
    Analyze the following student profile based on a 1-5 scale (1=Low, 5=High):
    
    Student: ${studentCode}
    - Emotional Resilience: ${scores.q1}
    - Social Need: ${scores.q2}
    - Focus & Attention: ${scores.q3}
    - Visual Learning: ${scores.q4}
    - Auditory Learning: ${scores.q5}
    
    Language: ${lang}
    
    Provide a deep, nuanced analysis (max 100 words) that identifies the interaction between these traits. 
    Focus on specific classroom strategies. 
    Do not just list the scores. Explain what the combination means for the teacher.
    For example, High Social + Low Focus might mean "Leadership potential but distraction risk".
    
    Format the output as a concise, professional paragraph for a teacher.
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
 * Fix: Exporting getPairSynergy to satisfy requirements in App.tsx
 */
export const getPairSynergy = (student1Id: string, student2Id: string, answers: Record<string, any>, lang: Language = 'he'): PairSynergy => {
  const s1 = answers[student1Id] || { q1: 3, q2: 3, q3: 3, q4: 3, q5: 3 };
  const s2 = answers[student2Id] || { q1: 3, q2: 3, q3: 3, q4: 3, q5: 3 };
  
  // 1. Check for Risks (Priority)
  // Both Low Focus (q3 <= 2)
  if (s1.q3 <= 2 && s2.q3 <= 2) {
    return {
      score: 45,
      label: lang === 'he' ? "אתגר קשב משותף" : "Focus Challenge",
      description: lang === 'he' ? "שני התלמידים מתקשים בריכוז. ישיבה משותפת עלולה להגביר מוסחות." : "Both students struggle with focus. Sitting together might increase distractions.",
      advantages: lang === 'he' ? ["הבנה הדדית לקושי"] : ["Shared understanding of difficulty"],
      risks: lang === 'he' ? ["הפרעות הדדיות רבות", "קושי בהתחלת משימה"] : ["Frequent mutual distractions", "Difficulty starting tasks"],
      type: 'warning'
    };
  }

  // Both Low Emotional Resilience (q1 <= 2)
  if (s1.q1 <= 2 && s2.q1 <= 2) {
    return {
      score: 50,
      label: lang === 'he' ? "רגישות רגשית גבוהה" : "High Emotional Sensitivity",
      description: lang === 'he' ? "שני התלמידים זקוקים לתמיכה רגשית. קושי לווסת אחד את השני." : "Both students need emotional support. Difficult to regulate each other.",
      advantages: lang === 'he' ? ["אמפתיה גבוהה"] : ["High empathy"],
      risks: lang === 'he' ? ["הצפה רגשית משותפת"] : ["Shared emotional escalation"],
      type: 'warning'
    };
  }

  // 2. Check for Synergies
  // Anchoring (Emotional): Low (<=2) paired with High (>=4)
  if ((s1.q1 <= 2 && s2.q1 >= 4) || (s2.q1 <= 2 && s1.q1 >= 4)) {
    return {
      score: 88,
      label: lang === 'he' ? "תמיכה רגשית" : "Emotional Support",
      description: lang === 'he' ? "תלמיד בעל חוסן גבוה מעניק ביטחון לתלמיד הזקוק לו." : "A resilient student provides stability/confidence to a peer.",
      advantages: lang === 'he' ? ["אווירה רגועה", "ביטחון עצמי"] : ["Calm atmosphere", "Self-confidence"],
      risks: lang === 'he' ? ["תלות"] : ["Dependency"],
      type: 'anchoring'
    };
  }

  // Modeling (Cognitive/Focus): Low (<=2) paired with High (>=4)
  if ((s1.q3 <= 2 && s2.q3 >= 4) || (s2.q3 <= 2 && s1.q3 >= 4)) {
    return {
      score: 92,
      label: lang === 'he' ? "חיזוק למידה" : "Focus Boost",
      description: lang === 'he' ? "תלמיד ממוקד עוזר לחברו לשמור על רצף למידה." : "A focused student helps their peer stay on task.",
      advantages: lang === 'he' ? ["שיפור הקשב", "למידת עמיתים"] : ["Improved focus", "Peer learning"],
      risks: lang === 'he' ? ["הסחת דעת לממוקד"] : ["Distraction for the focused student"],
      type: 'modeling'
    };
  }
  
  // Default Balanced
  return {
    score: 75,
    label: lang === 'he' ? "שילוב טוב" : "Good Match",
    description: lang === 'he' ? "זיווג למידה סטנדרטי המאפשר עבודה משותפת." : "Standard pair allowing for effective collaboration.",
    advantages: lang === 'he' ? ["שיתוף פעולה"] : ["Collaboration"],
    risks: lang === 'he' ? ["אין יתרון מיוחד"] : ["No specific advantage"],
    type: 'balancing'
  };
};

export const analyzeStudentData = (answers: any, lang: Language = 'he'): Insight[] => {
  const responses = answers;
  const insights: Insight[] = [];

  // 1. Emotional Resilience Rules
  if (responses['q1'] <= 2) {
    insights.push({
      category: 'emotional',
      level: 'high',
      title: lang === 'he' ? 'צורך בוויסות רגשי' : 'Emotional Regulation Need',
      description: lang === 'he' ? 'התלמיד מדווח על רמת חוסן נמוכה הדורשת תמיכה וסביבה עוטפת.' : 'Student reports low resilience requiring support and a protective environment.',
      recommendations: lang === 'he' ? [
        { 
          action: 'יצירת "עוגן" רגשי במפגש בוקר', 
          practical: 'גש לתלמיד ב-5 הדקות הראשונות של השיעור ונהל איתו שיחת חולין קצרה (Casual check-in). שאל "איך התחיל היום שלך?" כדי להוריד את רמת החרדה.' 
        },
        { 
          action: 'מתן תפקיד אחראי אך לא מלחיץ', 
          practical: 'בקש מהתלמיד להיות אחראי על חלוקת דפים או איסוף ציוד. העיסוק הפיזי והתחושה שהוא תורם עוזרים לווסת חרדה וליצור תחושת שייכות.' 
        },
        { 
          action: 'שימוש בכרטיס "זמן הפוגה"', 
          practical: 'תן לתלמיד כרטיס שמאפשר לו לצאת ל-2 דקות התרעננות מחוץ לכיתה ללא צורך בהסבר, במקרה של הצפה רגשית.' 
        }
      ] : [
        { 
          action: 'Establish a Morning Anchor', 
          practical: 'Approach the student during the first 5 minutes of class for a casual check-in. Ask "How did your day start?" to lower initial anxiety.' 
        },
        { 
          action: 'Assign Low-Pressure Responsibility', 
          practical: 'Ask the student to manage materials. Physical task-oriented contribution builds belonging and helps regulate stress.' 
        }
      ]
    });
  }

  // 2. Social Driver Rules
  if (responses['q2'] >= 4) {
    insights.push({
      category: 'social',
      level: 'high',
      title: lang === 'he' ? 'מנוע חברתי דומיננטי' : 'Dominant Social Driver',
      description: lang === 'he' ? 'התלמיד שואב אנרגיה מאינטראקציה וזקוק לבמה חברתית חיובית.' : 'Student derives energy from interaction and needs a positive social platform.',
      recommendations: lang === 'he' ? [
        { 
          action: 'תיעול אנרגיה להובלת עמיתים', 
          practical: 'במהלך עבודה קבוצתית, מנה את התלמיד כ"מתווך קבוצה". תפקידו לוודא שכולם משמיעים את דעתם. זה הופך צורך בתשומת לב למנהיגות חיובית.' 
        },
        { 
          action: 'מתן במה להצגה חזותית', 
          practical: 'בקש מהתלמיד להציג את תוצרי הקבוצה מול הכיתה. הצורך שלו בנראות יקדם את המוטיבציה הלימודית של כל הקבוצה.' 
        }
      ] : [
        { 
          action: 'Channel Energy to Peer Leadership', 
          practical: 'Appoint the student as a "Group Facilitator". Their job is to ensure everyone participates, turning social energy into constructive leadership.' 
        }
      ]
    });
  }

  // 3. Cognitive / Attention Rules
  if (responses['q3'] <= 2) {
    insights.push({
      category: 'cognitive',
      level: 'high',
      title: lang === 'he' ? 'מיקוד וקשב מאתגר' : 'Attention Focus Support',
      description: lang === 'he' ? 'קושי משמעותי בשמירה על ריכוז לאורך זמן, זקוק להוראה מתווכת.' : 'Significant difficulty maintaining focus, requires mediated instruction.',
      recommendations: lang === 'he' ? [
        { 
          /**
           * Fix: Using double quotes for the outer string to prevent the Hebrew geresh/apostrophe 
           * from being parsed as a string delimiter and breaking the code block.
           */
          action: "שיטת 'הצ'ק-ליסט' הויזואלי", 
          practical: 'כתוב על לוח קטן בפינת השולחן של התלמיד את 3 השלבים של המשימה. הנחה אותו לסמן V בסיום כל שלב כדי ליצור תחושת הצלחה ורצף.' 
        },
        { 
          action: 'צמצום גירויים ויזואליים', 
          practical: 'ודא ששולחן התלמיד נקי מציוד שאינו נדרש למשימה הנוכחית. הסתר קלמר או ספרים שאינם בשימוש ברגע זה.' 
        },
        { 
          action: 'הוראות קצרות (Chunking)', 
          practical: 'אל תיתן הוראה מורכבת של 3 שלבים בבת אחת. תן שלב אחד, וודא ביצוע, ורק אז תן את השלב הבא.' 
        }
      ] : [
        { 
          action: 'Visual Checklist Method', 
          practical: 'Write 3 clear steps of the task on a small sticky note for the student. Instruct them to check off each step to maintain a sense of sequence.' 
        }
      ]
    });
  }

  if (insights.length === 0) {
    insights.push({
      category: 'behavioral',
      level: 'medium',
      title: lang === 'he' ? 'פרופיל למידה יציב' : 'Balanced Learning Profile',
      description: lang === 'he' ? 'התלמיד מציג הסתגלות טובה ואיזון במיומנויות הלמידה.' : 'Student shows good adaptation and balance in learning skills.',
      recommendations: lang === 'he' ? [
        { 
          action: 'אתגור באמצעות "שאלת חקר"', 
          practical: 'תן לתלמיד משימת העמקה נוספת בסיום המטלה הכיתתית, המצריכה חיפוש מידע עצמאי או חשיבה ביקורתית.' 
        },
        { 
          action: 'חניכת עמיתים (Peer Mentoring)', 
          practical: 'בקש מהתלמיד לעזור לתלמיד אחר שמתקשה בשלב ספציפי. זה יחזק את הביטחון העצמי שלו ואת השליטה בחומר.' 
        }
      ] : [
        { 
          action: 'Challenge with Inquiry', 
          practical: 'Provide an additional "deep-dive" question once the main task is done to keep them intellectually engaged.' 
        }
      ]
    });
  }

  return insights;
};

export const getSeatingAdvice = (responses: Record<string, number>, lang: Language = 'he'): { row: number, col: number, reason: string } => {
  const focus = responses['q3'] || 3;
  const social = responses['q2'] || 3;
  const anxiety = responses['q1'] || 3;

  let row = 0;
  let col = 0;

  if (focus <= 2) row = 0;
  else if (focus >= 4) row = 3;
  else row = 2;

  if (anxiety <= 2) col = 0;
  else if (social >= 4) col = 2;
  else col = 1;

  const reason = lang === 'he' ? 
    (focus <= 2 ? "הושבה קדמית לשיפור המיקוד הקשבי." : anxiety <= 2 ? "מיקום צדדי להפחתת עומס רגשי." : "מיקום מאוזן מותאם לפרופיל.") :
    (focus <= 2 ? "Front seating to improve attention focus." : anxiety <= 2 ? "Side seating to reduce emotional overload." : "Balanced position adapted to profile.");

  return { row, col, reason };
};

export const calculateAutomatedLayout = (
  students: any[], 
  answers: Record<string, any>, 
  lang: Language
): Record<string, { row: number, col: number, seatIndex: number, matchReason: string }> => {
  const layout: Record<string, { row: number, col: number, seatIndex: number, matchReason: string }> = {};
  
  const studentData = students.map(s => {
    const res = answers[s.id] || { q1: 3, q2: 3, q3: 3, q4: 3, q5: 3 };
    const advice = getSeatingAdvice(res, lang);
    return {
      id: s.id,
      code: s.code,
      res,
      advice,
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
