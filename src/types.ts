export type UserRole = "apprenant" | "administrateur";

export type LearningMode = 
  | "Questions Quiz"
  | "Interrogations et devoirs" 
  | "Corrections des Évaluations"
  | "Historique des évaluations" 
  | "Fiches de révisions" 
  | "Calcule des moyennes"
  | "Examens Blancs"
  | "Cours en vidéo"
  | "Tableau de Bord"
  | "Mes Badges"
  | "Parler à un Conseiller" 
  | "Historique Conseiller"
  | "Infos £ Créateur";

export interface ChatMessage {
  role: "user" | "model";
  text: string;
  timestamp: number;
}

export interface EvaluationRecord {
  id: string;
  deviceId: string;
  mode: LearningMode;
  grade: string;
  subject: string;
  content: string;
  timestamp: number;
}

export type MobileMoneyOperator = "orange" | "wave" | "mtn" | "moov";

export interface AccessCode {
  id: string;
  code: string;
  createdAt: number;
  expiresAt: number;
  usedByDeviceId?: string;
  isUsed: boolean;
  paymentMethod?: MobileMoneyOperator;
  phoneNumber?: string;
  amount?: number;
  transactionRef?: string;
}
