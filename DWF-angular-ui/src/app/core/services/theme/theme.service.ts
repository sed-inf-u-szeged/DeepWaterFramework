import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/** Service to change and observe the current theme */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  /** Key for localstorage */
  private readonly KEY = 'DWF-isDarkTheme';
  /** Subject whether the current theme is the dark theme */
  private readonly _isDarkTheme$: BehaviorSubject<boolean>;

  /** Observabe whether the current theme is the dark theme */
  get isDarkTheme$(): Observable<boolean> {
    return this._isDarkTheme$.asObservable();
  }

  constructor() {
    this._isDarkTheme$ = new BehaviorSubject<boolean>(localStorage.getItem(this.KEY) === 'true');
  }

  /**
   * Set the current theme
   * @param isDarkTheme Whether the theme is dark
   */
  setDarkTheme(isDarkTheme: boolean) {
    this._isDarkTheme$.next(isDarkTheme);
    localStorage.setItem(this.KEY, this._isDarkTheme$.value.toString());
  }
}
