export interface EvaluationHistoryItem {
  id: string;
  title: string;
  type: 'interrogation' | 'devoir' | 'quiz' | 'examen';
  subject: string;
  grade: string;
  date: string;
  timestamp: number;
  score?: string; // e.g. "16.5 / 20"
  durationMinutes?: number;
  summary: string;
  feedback?: string;
  questionsCount?: number;
}

export interface CounselorHistoryItem {
  id: string;
  topic: string;
  grade: string;
  date: string;
  timestamp: number;
  counselorName: string;
  summary: string;
  recommendations: string[];
}

const STORAGE_KEY_EVALUATIONS = 'ivoireduc_evaluations_archive_v1';
const STORAGE_KEY_COUNSELOR = 'ivoireduc_counselor_archive_v1';

// Initial default seed items if storage is empty
const INITIAL_EVALUATIONS: EvaluationHistoryItem[] = [
  {
    id: 'eval_seed_1',
    title: 'Interrogation Écrite : Équations & Inéquations',
    type: 'interrogation',
    subject: 'Mathématiques',
    grade: '3ème',
    date: '30 Juillet 2026 à 14:30',
    timestamp: 1785421800000,
    score: '17 / 20',
    durationMinutes: 15,
    summary: 'Résolution réussie d\'inéquations du 1er degré avec inversion du sens de l\'inégalité lors de la division par un nombre négatif.',
    feedback: 'Très bonne maîtrise des règles algébriques. Soigner la rédaction de l\'ensemble des solutions S = {...}.',
    questionsCount: 4
  },
  {
    id: 'eval_seed_2',
    title: 'Devoir de Synthèse : Poids, Masse et Loi d\'Ohm',
    type: 'devoir',
    subject: 'Physique-chimie',
    grade: '2nde C',
    date: '28 Juillet 2026 à 10:15',
    timestamp: 1785233700000,
    score: '15.5 / 20',
    durationMinutes: 45,
    summary: 'Calcul du poids P = m × g et application de la Loi d\'Ohm (U = R × I) sur des circuits mixtes.',
    feedback: 'Attention à bien convertir les masses de grammes (g) en kilogrammes (kg) avant tout calcul.',
    questionsCount: 6
  },
  {
    id: 'eval_seed_3',
    title: 'Interrogation de Vocabulaire & Grammaire',
    type: 'interrogation',
    subject: 'Français',
    grade: 'CM2',
    date: '25 Juillet 2026 à 16:00',
    timestamp: 1784995200000,
    score: '18 / 20',
    durationMinutes: 15,
    summary: 'Recherche de synonymes, antonymes et chaînes d\'accords du groupe nominal sujet.',
    feedback: 'Excellente maîtrise des homophones (a/à, est/et).',
    questionsCount: 5
  }
];

const INITIAL_COUNSELOR: CounselorHistoryItem[] = [
  {
    id: 'counselor_seed_1',
    topic: 'Orientation Post-3ème : Choix de Série (2nde A ou 2nde C)',
    grade: '3ème',
    date: '29 Juillet 2026 à 11:00',
    timestamp: 1785322800000,
    counselorName: 'M. Kouassi (Conseiller MENA)',
    summary: 'Analyse du bulletin du 3ème trimestre. Excellents résultats en Mathématiques (16/20) et PC (15/20).',
    recommendations: [
      'Orientation vivement conseillée vers la 2nde C (Scientifique).',
      'Renforcer la pratique quotidienne de la géométrie plane et du calcul littéral.',
      'Maintenir un rythme de lecture régulier pour conserver un bon niveau en Français.'
    ]
  },
  {
    id: 'counselor_seed_2',
    topic: 'Méthodologie de travail & Gestion du stress pour les examens',
    grade: '1ère D',
    date: '22 Juillet 2026 à 15:45',
    timestamp: 1784735100000,
    counselorName: 'Mme Yao (Psychologue de l\'Éducation)',
    summary: 'Conseils pour l\'organisation des révisions hebdomadaires et l\'aménagement des pauses active de 10 min.',
    recommendations: [
      'Utiliser la technique Pomodoro (25 min de travail concentré / 5 min de pause).',
      'Réaliser 2 fiches de révision par semaine en SVT et Physique-Chimie.',
      'Dormir au moins 8 heures par nuit avant les devoirs de synthèse.'
    ]
  }
];

// Helper functions for Evaluation History
export const getEvaluationHistory = (): EvaluationHistoryItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EVALUATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_EVALUATIONS, JSON.stringify(INITIAL_EVALUATIONS));
      return INITIAL_EVALUATIONS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading evaluation history:', err);
    return INITIAL_EVALUATIONS;
  }
};

export const addEvaluationToHistory = (item: Omit<EvaluationHistoryItem, 'id' | 'date' | 'timestamp'>): EvaluationHistoryItem => {
  const current = getEvaluationHistory();
  const now = new Date();
  const formattedDate = now.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }) + ' à ' + now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const newItem: EvaluationHistoryItem = {
    ...item,
    id: 'eval_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    date: formattedDate,
    timestamp: Date.now(),
  };

  const updated = [newItem, ...current];
  try {
    localStorage.setItem(STORAGE_KEY_EVALUATIONS, JSON.stringify(updated));
  } catch (err) {
    console.error('Error saving evaluation history:', err);
  }
  return newItem;
};

export const deleteEvaluationItem = (id: string): EvaluationHistoryItem[] => {
  const current = getEvaluationHistory();
  const updated = current.filter(item => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY_EVALUATIONS, JSON.stringify(updated));
  } catch (err) {
    console.error('Error deleting evaluation history item:', err);
  }
  return updated;
};

export const clearAllEvaluationsHistory = (): EvaluationHistoryItem[] => {
  try {
    localStorage.setItem(STORAGE_KEY_EVALUATIONS, JSON.stringify([]));
  } catch (err) {
    console.error('Error clearing evaluation history:', err);
  }
  return [];
};

// Helper functions for Counselor History
export const getCounselorHistory = (): CounselorHistoryItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COUNSELOR);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_COUNSELOR, JSON.stringify(INITIAL_COUNSELOR));
      return INITIAL_COUNSELOR;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading counselor history:', err);
    return INITIAL_COUNSELOR;
  }
};

export const addCounselorToHistory = (item: Omit<CounselorHistoryItem, 'id' | 'date' | 'timestamp'>): CounselorHistoryItem => {
  const current = getCounselorHistory();
  const now = new Date();
  const formattedDate = now.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }) + ' à ' + now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const newItem: CounselorHistoryItem = {
    ...item,
    id: 'counselor_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    date: formattedDate,
    timestamp: Date.now(),
  };

  const updated = [newItem, ...current];
  try {
    localStorage.setItem(STORAGE_KEY_COUNSELOR, JSON.stringify(updated));
  } catch (err) {
    console.error('Error saving counselor history:', err);
  }
  return newItem;
};

export const deleteCounselorItem = (id: string): CounselorHistoryItem[] => {
  const current = getCounselorHistory();
  const updated = current.filter(item => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY_COUNSELOR, JSON.stringify(updated));
  } catch (err) {
    console.error('Error deleting counselor history item:', err);
  }
  return updated;
};

export const clearAllCounselorHistory = (): CounselorHistoryItem[] => {
  try {
    localStorage.setItem(STORAGE_KEY_COUNSELOR, JSON.stringify([]));
  } catch (err) {
    console.error('Error clearing counselor history:', err);
  }
  return [];
};
