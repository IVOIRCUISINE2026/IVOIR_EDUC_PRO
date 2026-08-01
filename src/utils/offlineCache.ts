export interface CachedResource {
  id: string;
  title: string;
  subtitle?: string;
  type: 'fiche' | 'cours' | 'interrogation' | 'devoir' | 'examen';
  subject: string;
  grade: string;
  content: string; // Course text or JSON representation
  cachedAt: string; // ISO date string
  sizeBytes?: number;
}

const CACHE_STORAGE_KEY = 'ivoireduc_offline_resources_v1';

const INITIAL_SEED_RESOURCES: CachedResource[] = [
  {
    id: 'fiche_math_3eme_equations',
    title: 'Fiche : Équations et Inéquations du 1er Degré',
    subtitle: 'Chapitre 1 — Calcul Algébrique & Résolution',
    type: 'fiche',
    subject: 'Mathématiques',
    grade: '3ème',
    cachedAt: '31 juil. 2026, 14:30',
    sizeBytes: 1240,
    content: `I. SYNTHÈSE DU COURS
Une équation est une égalité comportant une inconnue x. Résoudre ax + b = c revient à isoler x.
Exemple : 3x + 5 = 20 => 3x = 15 => x = 5.

II. NOTIONS ET POINTS CLÉS
• Pour les inéquations, inverser le sens de l'inégalité lors de la multiplication ou division par un nombre négatif.
• Toujours vérifier la solution trouvée en la réinjectant dans l'équation initiale.

III. FORMULES ET RÈGLES D'OR
• (a + b)² = a² + 2ab + b²
• (a - b)² = a² - 2ab + b²
• (a + b)(a - b) = a² - b²

IV. CONSEIL POUR L'ÉPREUVE MENA BEPC
Attention aux signes moins devant les parenthèses lors du développement.

V. QUESTION DE CONTRÔLE
Résoudre dans R l'inéquation : -2x + 4 < 10`
  },
  {
    id: 'cours_pc_terminale_d',
    title: 'Cours Complet : Acides et Bases en Solution Aqueuse',
    subtitle: 'Chimie physique - Préparation BAC',
    type: 'cours',
    subject: 'Physique-chimie',
    grade: 'Terminale D',
    cachedAt: '31 juil. 2026, 16:15',
    sizeBytes: 1890,
    content: `SUPPORT DE COURS — CHIMIE TERMINALE D

1. Définition selon Brönsted
Un acide est une espèce chimique capable de céder au moins un proton H+.
Une base est une espèce chimique capable de capter au moins un proton H+.

2. Le pH et produit ionique de l'eau
pH = -log[H3O+]
Ke = [H3O+][OH-] = 10^-14 à 25°C.

3. Dosage Acido-Basique
À l'équivalence : n(acide) = n(base) => Ca * Va = Cb * Vb.
Indicateur coloré approprié : sa zone de virage doit contenir le pH à l'équivalence.`
  }
];

export const getCachedResources = (): CachedResource[] => {
  try {
    const raw = localStorage.getItem(CACHE_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(INITIAL_SEED_RESOURCES));
      return INITIAL_SEED_RESOURCES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Erreur de lecture du cache hors-ligne :', err);
    return INITIAL_SEED_RESOURCES;
  }
};

export const saveResourceToCache = (resource: Omit<CachedResource, 'id' | 'cachedAt'> & { id?: string }): CachedResource => {
  const current = getCachedResources();
  const resId = resource.id || `${resource.type}_${resource.subject}_${resource.grade}_${Date.now()}`;
  
  const newEntry: CachedResource = {
    ...resource,
    id: resId,
    cachedAt: new Date().toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    sizeBytes: new Blob([resource.content]).size
  };

  // Remove duplicate if exists
  const filtered = current.filter(r => r.id !== resId && r.title !== resource.title);
  const updated = [newEntry, ...filtered];

  try {
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Espace localStorage dépassé lors de la mise en cache :', err);
  }

  return newEntry;
};

export const removeResourceFromCache = (id: string): CachedResource[] => {
  const current = getCachedResources();
  const updated = current.filter(r => r.id !== id);
  try {
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Erreur lors de la suppression du cache :', err);
  }
  return updated;
};

export const clearAllOfflineCache = (): CachedResource[] => {
  try {
    localStorage.removeItem(CACHE_STORAGE_KEY);
  } catch (err) {
    console.error('Erreur d\'effacement du cache :', err);
  }
  return [];
};

export const isResourceCached = (titleOrId: string): boolean => {
  const current = getCachedResources();
  return current.some(r => r.id === titleOrId || r.title === titleOrId);
};
