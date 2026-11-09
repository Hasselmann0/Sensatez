import { Injectable, signal } from '@angular/core';

const THEME_STORAGE_KEY = 'sensatez_theme_mode';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly isDark = signal<boolean>(this.resolveInitialTheme());

  constructor() {
    this.applyTheme(this.isDark());
  }

  toggleTheme(): void {
    const next = !this.isDark();
    this.isDark.set(next);
    localStorage.setItem(THEME_STORAGE_KEY, next ? 'dark' : 'light');
    this.applyTheme(next);
  }

  private resolveInitialTheme(): boolean {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light') return false;
    return true; // Padrão Dark Mode Premium (Anexos 1 e 2)
  }

  private applyTheme(dark: boolean): void {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
}

