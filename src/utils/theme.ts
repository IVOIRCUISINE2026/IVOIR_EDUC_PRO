export type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'ivoireduc_theme_mode';

export const getStoredTheme = (): Theme => {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
  } catch (err) {
    console.error('Erreur lecture thème :', err);
  }
  return 'light';
};

export const applyTheme = (theme: Theme) => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (err) {
    console.error('Erreur sauvegarde thème :', err);
  }

  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};
