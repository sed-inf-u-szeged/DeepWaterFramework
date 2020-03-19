import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/** Service to change and observe the current theme. */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  /** Key for localstorage. */
  private readonly KEY = 'DWF-isDarkTheme';
  /** Subject of whether the current theme is the dark theme. */
  private readonly _isDarkTheme$: BehaviorSubject<boolean>;

  /** Observabe of whether the current theme is the dark theme. */
  get isDarkTheme$(): Observable<boolean> {
    return this._isDarkTheme$.asObservable();
  }

  /** Gets from localstorage whether the current theme is the dark theme and sets up [_isDarkTheme$]{@link ThemeService#_isDarkTheme$} with the result. */
  constructor() {
    this._isDarkTheme$ = new BehaviorSubject<boolean>(localStorage.getItem(this.KEY) === 'true');
  }

  /**
   * Set the current theme.
   * @param isDarkTheme Whether the theme is dark.
   */
  setDarkTheme(isDarkTheme: boolean) {
    this._isDarkTheme$.next(isDarkTheme);
    localStorage.setItem(this.KEY, this._isDarkTheme$.value.toString());
  }
}
