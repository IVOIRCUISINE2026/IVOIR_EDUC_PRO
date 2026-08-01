export interface StudentProfile {
  fullName: string;
  grade: string;
  school: string;
  updatedAt: string;
}

const STUDENT_PROFILE_KEY = 'ivoireduc_student_profile_v1';

export const getStoredStudentProfile = (): StudentProfile | null => {
  try {
    const raw = localStorage.getItem(STUDENT_PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Erreur lecture profil élève :', err);
    return null;
  }
};

export const saveStudentProfile = (profile: Omit<StudentProfile, 'updatedAt'>): StudentProfile => {
  const fullProfile: StudentProfile = {
    ...profile,
    updatedAt: new Date().toISOString()
  };
  try {
    localStorage.setItem(STUDENT_PROFILE_KEY, JSON.stringify(fullProfile));
  } catch (err) {
    console.error('Erreur sauvegarde profil élève :', err);
  }
  return fullProfile;
};

export const clearStudentProfile = () => {
  try {
    localStorage.removeItem(STUDENT_PROFILE_KEY);
  } catch (err) {
    console.error('Erreur suppression profil :', err);
  }
};
