export interface AppUpdate {
  id: string;
  version: string;
  date: string;
  title: string;
  description: string;
  tag: string;
  isNew?: boolean;
  features: string[];
}

export const APP_UPDATES: AppUpdate[] = [
  {
    id: 'update_reading_mode_v1.2.0',
    version: 'v1.2.0',
    date: '31 juillet 2026',
    title: '📖 Mode Lecture Immersif pour les Fiches',
    description: 'Une nouvelle expérience de lecture concentrée sans distraction pour réviser vos cours avec un confort visuel maximal.',
    tag: 'Mise à jour v1.2',
    isNew: true,
    features: [
      'Affichage plein écran sans barres de navigation perturbatrices',
      'Réglage personnalisé de la taille du texte (A- / A+)',
      'Thèmes de lecture confortables (Sépia 📜, Sombre 🌙, Nuit 🌌, Clair ☀️)',
      'Synthèse vocale intégrée pour écouter vos fiches de cours',
      'Accès rapide aux tests de connaissances guidés par l\'IA'
    ]
  },
  {
    id: 'update_offline_cache_v1.1.0',
    version: 'v1.1.0',
    date: '28 juillet 2026',
    title: '📶 Cache & Révisions Hors-Ligne',
    description: 'Accédez à vos fiches et résumés de cours enregistrés même sans aucune connexion Internet.',
    tag: 'Mise à jour v1.1',
    isNew: true,
    features: [
      'Téléchargement en 1 clic des fiches de révision sur votre appareil',
      'Gestionnaire de stockage hors-ligne accessible depuis le tableau de bord',
      'Accès garanti aux cours enregistrés même en zone à faible débit ou sans réseau'
    ]
  }
];

const READ_UPDATES_STORAGE_KEY = 'ivoireduc_read_update_ids';

export const getReadUpdateIds = (): string[] => {
  try {
    const raw = localStorage.getItem(READ_UPDATES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Erreur lecture statut mises à jour :', err);
    return [];
  }
};

export const markUpdateAsRead = (updateId: string): string[] => {
  try {
    const current = getReadUpdateIds();
    if (!current.includes(updateId)) {
      const updated = [...current, updateId];
      localStorage.setItem(READ_UPDATES_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    }
    return current;
  } catch (err) {
    console.error('Erreur sauvegarde statut mise à jour :', err);
    return getReadUpdateIds();
  }
};

export const markAllUpdatesAsRead = (): string[] => {
  try {
    const allIds = APP_UPDATES.map(u => u.id);
    localStorage.setItem(READ_UPDATES_STORAGE_KEY, JSON.stringify(allIds));
    return allIds;
  } catch (err) {
    console.error('Erreur sauvegarde statut toutes mises à jour :', err);
    return APP_UPDATES.map(u => u.id);
  }
};

export const getUnreadUpdatesCount = (): number => {
  const readIds = getReadUpdateIds();
  return APP_UPDATES.filter(u => !readIds.includes(u.id)).length;
};
