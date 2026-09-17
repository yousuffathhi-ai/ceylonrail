import { AppTheme } from '../types';

const THEME_STORAGE_KEY = 'ceylon_rail_theme';

export function getStoredTheme(): AppTheme {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'night' || saved === 'parchment') {
      return saved;
    }
  } catch {
    // fallback
  }
  return 'parchment';
}

export function saveTheme(theme: AppTheme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // fallback
  }
  applyThemeToDOM(theme);
}

export function applyThemeToDOM(theme: AppTheme) {
  const root = document.documentElement;
  if (theme === 'night') {
    root.classList.add('dark');
    root.classList.add('night-rail');
    root.setAttribute('data-theme', 'night');
  } else {
    root.classList.remove('dark');
    root.classList.remove('night-rail');
    root.setAttribute('data-theme', 'parchment');
  }
}
