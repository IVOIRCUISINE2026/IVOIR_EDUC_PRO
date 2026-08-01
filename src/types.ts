export type UserRole = 'apprenant' | 'administrateur';

export type LearningMode = 
  | 'Quiz'
  | 'Interrogations et devoirs'
  | 'Correction des évaluations'
  | 'Historique des évaluations'
  | 'Fiches de révisions'
  | 'Ressources hors-ligne'
  | 'Cours en vidéos'
  | 'Examens blancs'
  | 'Tableau de bord'
  | 'Mes badges'
  | 'Parler à un Conseiller Pédagogique'
  | 'Historique Conseiller'
  | 'Calcul de moyennes'
  | 'Infos concepteur';

export interface SubjectItem {
  id: string;
  name: string;
  iconName: string;
  flag?: string;
  color: string;
  bgColor: string;
  category: 'litteraire' | 'scientifique' | 'humaine' | 'generale';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  fileName?: string;
  fileDataUrl?: string;
}

export interface VideoCourse {
  id: string;
  title: string;
  subject: string;
  grade: string;
  duration: string;
  youtubeId: string;
  thumbnailUrl: string;
  chapter: string;
}

export interface StudentBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'quiz' | 'subject' | 'excellence';
  unlocked: boolean;
  unlockedAt?: string;
}

export interface GradeSubjectCoefficient {
  subject: string;
  coef: number;
}
