import { SubjectItem, LearningMode, VideoCourse, StudentBadge, GradeSubjectCoefficient } from '../types';

export const GRADES_LIST = [
  "CM1",
  "CM2",
  "6ème",
  "5ème",
  "4ème",
  "3ème",
  "2nde A",
  "2nde C",
  "2nde D",
  "1ère A1",
  "1ère A2",
  "1ère C",
  "1ère D",
  "Terminale A1",
  "Terminale A2",
  "Terminale C",
  "Terminale D"
];

export const LEARNING_MODES: { title: LearningMode; icon: string; description: string; badge?: string }[] = [
  { title: 'Quiz', icon: '🧩', description: 'Testez vos connaissances rapidement' },
  { title: 'Interrogations et devoirs', icon: '📝', description: 'Sujets et exercices types MENA' },
  { title: 'Correction des évaluations', icon: '✏️', description: 'Corrigés détaillés pas à pas' },
  { title: 'Historique des évaluations', icon: '🕒', description: 'Vos anciennes épreuves révisées' },
  { title: 'Fiches de révisions', icon: '📑', description: 'Synthèses de cours et formules clés' },
  { title: 'Cours en vidéos', icon: '🎥', description: 'Explications vidéo par des enseignants' },
  { title: 'Examens blancs', icon: '📋', description: 'Sujets officiels CEPE, BEPC et BAC' },
  { title: 'Tableau de bord', icon: '📊', description: 'Suivi de vos progrès et statistiques' },
  { title: 'Mes badges', icon: '🏅', description: 'Récompenses et niveau d\'assiduité' },
  { title: 'Parler à un Conseiller Pédagogique', icon: '👨‍🏫', description: 'Conseils d\'orientation et méthodes' },
  { title: 'Historique Conseiller', icon: '📜', description: 'Vos échanges avec le conseiller' },
  { title: 'Calcul de moyennes', icon: '🧮', description: 'Calculateur selon le barème MENA' },
  { title: 'Infos concepteur', icon: 'ℹ️', description: 'Contact & Présentation de l\'auteur' }
];

export const isPhiloGrade = (grade: string): boolean => {
  if (!grade) return false;
  return grade.startsWith('1ère') || grade.startsWith('Terminale');
};

export const isPrimaryFrenchGrade = (grade: string): boolean => {
  return grade === 'CM1' || grade === 'CM2';
};

export const PRIMARY_FRENCH_LESSONS = [
  {
    id: 'exploitation_1',
    title: 'Exploitation de texte 1',
    subtitle: 'Vocabulaire et Orthographe',
    fullName: 'Exploitation de texte 1 (Vocabulaire et Orthographe)',
    description: 'Vocabulaire, mots de la même famille, synonymes, antonymes, règles d\'orthographe et dictée.',
    icon: '📖',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-800'
  },
  {
    id: 'exploitation_2',
    title: 'Exploitation de texte 2',
    subtitle: 'Grammaire et Conjugaison',
    fullName: 'Exploitation de texte 2 (Grammaire et Conjugaison)',
    description: 'Analyse grammaticale, types et formes de phrases, accord du sujet-verbe et conjugaison des temps.',
    icon: '✍️',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800'
  }
];

export const getSubjectsForGrade = (grade: string): SubjectItem[] => {
  if (isPhiloGrade(grade)) {
    return SUBJECTS_LIST;
  }
  return SUBJECTS_LIST.filter((subject) => subject.id !== 'philo' && subject.name !== 'Philosophie');
};

export const SUBJECTS_LIST: SubjectItem[] = [
  { id: 'philo', name: 'Philosophie', iconName: 'Brain', color: '#D97706', bgColor: '#FEF3C7', category: 'litteraire' },
  { id: 'francais', name: 'Français', iconName: 'BookOpen', color: '#059669', bgColor: '#D1FAE5', category: 'litteraire' },
  { id: 'histgeo', name: 'Histoire-géographie', iconName: 'Globe', color: '#EA580C', bgColor: '#FFEDD5', category: 'humaine' },
  { id: 'anglais', name: 'Anglais', iconName: 'Languages', flag: '🇬🇧', color: '#2563EB', bgColor: '#DBEAFE', category: 'litteraire' },
  { id: 'espagnol', name: 'Espagnol', iconName: 'Languages', flag: '🇪🇸', color: '#DC2626', bgColor: '#FEE2E2', category: 'litteraire' },
  { id: 'allemand', name: 'Allemand', iconName: 'Languages', flag: '🇩🇪', color: '#475569', bgColor: '#F1F5F9', category: 'litteraire' },
  { id: 'edhc', name: 'EDHC', iconName: 'Users', color: '#16A34A', bgColor: '#DCFCE7', category: 'generale' },
  { id: 'maths', name: 'Mathématiques', iconName: 'Calculator', color: '#EA580C', bgColor: '#FFEDD5', category: 'scientifique' },
  { id: 'pc', name: 'Physique-chimie', iconName: 'FlaskConical', color: '#0284C7', bgColor: '#E0F2FE', category: 'scientifique' },
  { id: 'svt', name: 'SVT', iconName: 'Leaf', color: '#15803D', bgColor: '#DCFCE7', category: 'scientifique' }
];

export const SAMPLE_VIDEOS: VideoCourse[] = [
  {
    id: 'v1',
    title: 'Mathématiques - Les Équations du 2nd Degré',
    subject: 'Mathématiques',
    grade: '3ème',
    duration: '14 min',
    youtubeId: 'dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
    chapter: 'Algèbre'
  },
  {
    id: 'v2',
    title: 'Physique-Chimie - Réactions d\'Oxydoréduction',
    subject: 'Physique-chimie',
    grade: 'Terminale D',
    duration: '18 min',
    youtubeId: 'dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=80',
    chapter: 'Chimie Organique'
  },
  {
    id: 'v3',
    title: 'Français - La Méthodologie de la Dissertation',
    subject: 'Français',
    grade: '1ère A1',
    duration: '22 min',
    youtubeId: 'dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80',
    chapter: 'Littérature'
  },
  {
    id: 'v4',
    title: 'SVT - La Génétique Humaine & Hérédité',
    subject: 'SVT',
    grade: 'Terminale C',
    duration: '16 min',
    youtubeId: 'dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600&auto=format&fit=crop&q=80',
    chapter: 'Génétique'
  }
];

export const INITIAL_BADGES: StudentBadge[] = [
  {
    id: 'b1',
    title: 'Assidu de Côte d\'Ivoire',
    description: 'A connecté 5 jours consécutifs sur Ivoir\'Educ PRO',
    icon: '🔥',
    category: 'streak',
    unlocked: true,
    unlockedAt: 'Aujourd\'hui'
  },
  {
    id: 'b2',
    title: 'Génie des Maths',
    description: 'A réussi 10 quiz de Mathématiques avec plus de 80%',
    icon: '📐',
    category: 'quiz',
    unlocked: true,
    unlockedAt: 'Hier'
  },
  {
    id: 'b3',
    title: 'Futur Bachelier',
    description: 'A complété un examen blanc en conditions réelles',
    icon: '🎓',
    category: 'excellence',
    unlocked: false
  },
  {
    id: 'b4',
    title: 'Polyglotte',
    description: 'A révisé Anglais, Espagnol et Allemand la même semaine',
    icon: '🌍',
    category: 'subject',
    unlocked: false
  }
];

export const MENA_COEFFICIENTS: Record<string, GradeSubjectCoefficient[]> = {
  "3ème": [
    { subject: "Mathématiques", coef: 3 },
    { subject: "Français", coef: 3 },
    { subject: "Physique-chimie", coef: 2 },
    { subject: "SVT", coef: 2 },
    { subject: "Histoire-géographie", coef: 2 },
    { subject: "Anglais", coef: 2 },
    { subject: "EDHC", coef: 1 },
    { subject: "Espagnol / Allemand", coef: 1 }
  ],
  "2nde C": [
    { subject: "Mathématiques", coef: 4 },
    { subject: "Physique-chimie", coef: 4 },
    { subject: "SVT", coef: 3 },
    { subject: "Français", coef: 3 },
    { subject: "Histoire-géographie", coef: 2 },
    { subject: "Anglais", coef: 2 }
  ],
  "1ère D": [
    { subject: "SVT", coef: 4 },
    { subject: "Mathématiques", coef: 4 },
    { subject: "Physique-chimie", coef: 4 },
    { subject: "Français", coef: 3 },
    { subject: "Histoire-géographie", coef: 2 },
    { subject: "Anglais", coef: 2 },
    { subject: "Philosophie", coef: 2 }
  ],
  "Terminale D": [
    { subject: "SVT", coef: 5 },
    { subject: "Mathématiques", coef: 4 },
    { subject: "Physique-chimie", coef: 4 },
    { subject: "Philosophie", coef: 3 },
    { subject: "Français", coef: 3 },
    { subject: "Histoire-géographie", coef: 2 },
    { subject: "Anglais", coef: 2 }
  ],
  "Terminale C": [
    { subject: "Mathématiques", coef: 5 },
    { subject: "Physique-chimie", coef: 5 },
    { subject: "SVT", coef: 3 },
    { subject: "Philosophie", coef: 3 },
    { subject: "Français", coef: 3 },
    { subject: "Histoire-géographie", coef: 2 },
    { subject: "Anglais", coef: 2 }
  ],
  "Terminale A1": [
    { subject: "Français", coef: 5 },
    { subject: "Philosophie", coef: 5 },
    { subject: "Histoire-géographie", coef: 4 },
    { subject: "Anglais", coef: 4 },
    { subject: "Mathématiques", coef: 2 }
  ]
};
