import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

type ThemeClass = ThemeService['themes'][number]['class'];

/** Service to change and observe the current theme. */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  /** Key for localstorage. */
  private readonly KEY = 'DWF-theme';
  /** List of the implemented themes. */
  readonly themes = [
    { name: 'Light theme', class: 'default-theme' },
    { name: 'Dark theme', class: 'dark-theme' },
  ] as const;
  /** Subject of the current theme's class name. */
  private readonly _theme$: BehaviorSubject<ThemeClass>;

  /** Observabe of the current theme's class name. */
  get theme$(): Observable<ThemeClass> {
    return this._theme$.asObservable();
  }

  /** Gets the current theme from localstorage and sets up [_theme$]{@link ThemeService#_theme$} with it. */
  constructor() {
    this._theme$ = new BehaviorSubject<ThemeClass>(
      (localStorage.getItem(this.KEY) as ThemeClass | null) ?? 'default-theme'
    );
  }

  /**
   * Sets the current theme.
   * @param theme Theme's class name.
   */
  setTheme(theme: ThemeClass) {
    this._theme$.next(theme);
    localStorage.setItem(this.KEY, this._theme$.value);
  }
}
