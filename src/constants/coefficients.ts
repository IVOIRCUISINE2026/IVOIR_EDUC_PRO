export interface SubjectCoefficient {
  subject: string;
  coefficient: number;
}

export const COEFFICIENTS_BY_GRADE: Record<string, SubjectCoefficient[]> = {
  "CM2": [
    { subject: "Français", coefficient: 1 },
    { subject: "Mathématiques", coefficient: 1 },
    { subject: "EDHC", coefficient: 1 },
    { subject: "Histoire-Géo", coefficient: 1 },
    { subject: "Sciences", coefficient: 1 }
  ],
  "6ème": [
    { subject: "Français", coefficient: 4 },
    { subject: "Mathématiques", coefficient: 4 },
    { subject: "Anglais", coefficient: 3 },
    { subject: "Physique-Chimie", coefficient: 2 },
    { subject: "SVT", coefficient: 2 },
    { subject: "Histoire-Géo", coefficient: 2 },
    { subject: "EDHC", coefficient: 1 },
    { subject: "Arts Plastiques", coefficient: 1 },
    { subject: "Musique", coefficient: 1 },
    { subject: "EPS", coefficient: 1 }
  ],
  "5ème": [
    { subject: "Français", coefficient: 4 },
    { subject: "Mathématiques", coefficient: 4 },
    { subject: "Anglais", coefficient: 3 },
    { subject: "Physique-Chimie", coefficient: 2 },
    { subject: "SVT", coefficient: 2 },
    { subject: "Histoire-Géo", coefficient: 2 },
    { subject: "EDHC", coefficient: 1 },
    { subject: "Arts Plastiques", coefficient: 1 },
    { subject: "Musique", coefficient: 1 },
    { subject: "EPS", coefficient: 1 }
  ],
  "4ème": [
    { subject: "Français", coefficient: 4 },
    { subject: "Mathématiques", coefficient: 4 },
    { subject: "Anglais", coefficient: 3 },
    { subject: "Physique-Chimie", coefficient: 2 },
    { subject: "SVT", coefficient: 2 },
    { subject: "Histoire-Géo", coefficient: 2 },
    { subject: "EDHC", coefficient: 1 },
    { subject: "Arts Plastiques", coefficient: 1 },
    { subject: "Musique", coefficient: 1 },
    { subject: "EPS", coefficient: 1 }
  ],
  "3ème": [
    { subject: "Français", coefficient: 5 },
    { subject: "Mathématiques", coefficient: 5 },
    { subject: "Anglais", coefficient: 3 },
    { subject: "Physique-Chimie", coefficient: 3 },
    { subject: "SVT", coefficient: 2 },
    { subject: "Histoire-Géo", coefficient: 3 },
    { subject: "EDHC", coefficient: 1 },
    { subject: "Arts Plastiques", coefficient: 1 },
    { subject: "Musique", coefficient: 1 },
    { subject: "EPS", coefficient: 1 }
  ],
  "2nde A": [
    { subject: "Français", coefficient: 5 },
    { subject: "Anglais", coefficient: 4 },
    { subject: "Histoire-Géo", coefficient: 4 },
    { subject: "Mathématiques", coefficient: 2 },
    { subject: "Philosophie", coefficient: 2 },
    { subject: "Physique-Chimie", coefficient: 2 },
    { subject: "SVT", coefficient: 2 },
    { subject: "EPS", coefficient: 2 }
  ],
  "2nde C": [
    { subject: "Mathématiques", coefficient: 5 },
    { subject: "Physique-Chimie", coefficient: 5 },
    { subject: "Français", coefficient: 2 },
    { subject: "Anglais", coefficient: 2 },
    { subject: "Histoire-Géo", coefficient: 2 },
    { subject: "SVT", coefficient: 2 },
    { subject: "EPS", coefficient: 2 }
  ],
  "1ère A": [
    { subject: "Français", coefficient: 5 },
    { subject: "Philosophie", coefficient: 4 },
    { subject: "Histoire-Géo", coefficient: 4 },
    { subject: "Anglais", coefficient: 4 },
    { subject: "Mathématiques", coefficient: 2 },
    { subject: "SVT", coefficient: 2 },
    { subject: "EPS", coefficient: 2 }
  ],
  "1ère D": [
    { subject: "Mathématiques", coefficient: 4 },
    { subject: "Physique-Chimie", coefficient: 4 },
    { subject: "SVT", coefficient: 4 },
    { subject: "Français", coefficient: 3 },
    { subject: "Philosophie", coefficient: 2 },
    { subject: "Histoire-Géo", coefficient: 2 },
    { subject: "Anglais", coefficient: 2 },
    { subject: "EPS", coefficient: 2 }
  ],
  "Tle A": [
    { subject: "Philosophie", coefficient: 5 },
    { subject: "Français", coefficient: 5 },
    { subject: "Histoire-Géo", coefficient: 4 },
    { subject: "Anglais", coefficient: 4 },
    { subject: "Mathématiques", coefficient: 2 },
    { subject: "SVT", coefficient: 2 },
    { subject: "EPS", coefficient: 2 }
  ],
  "Tle D": [
    { subject: "SVT", coefficient: 5 },
    { subject: "Mathématiques", coefficient: 4 },
    { subject: "Physique-Chimie", coefficient: 4 },
    { subject: "Français", coefficient: 3 },
    { subject: "Philosophie", coefficient: 2 },
    { subject: "Histoire-Géo", coefficient: 2 },
    { subject: "Anglais", coefficient: 2 },
    { subject: "EPS", coefficient: 2 }
  ],
  "Tle C": [
    { subject: "Mathématiques", coefficient: 5 },
    { subject: "Physique-Chimie", coefficient: 5 },
    { subject: "Français", coefficient: 2 },
    { subject: "Philosophie", coefficient: 2 },
    { subject: "SVT", coefficient: 2 },
    { subject: "Histoire-Géo", coefficient: 2 },
    { subject: "Anglais", coefficient: 2 },
    { subject: "EPS", coefficient: 2 }
  ]
};
