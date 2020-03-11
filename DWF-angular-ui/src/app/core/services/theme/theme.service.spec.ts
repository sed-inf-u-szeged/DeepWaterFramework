import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    const store: { [key: string]: string | null } = {};
    spyOn(localStorage, 'getItem').and.callFake((key: string): string | null => store[key] || null);
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string): void => void (store[key] = value));
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should not have dark theme by default (no local storage key)', () => {
    expect(localStorage.getItem('DWF-isDarkTheme')).toBeNull();
    service.isDarkTheme$.subscribe(isDarkTheme => expect(isDarkTheme).toBeFalse());
  });

  it('should set dark theme', () => {
    service.setDarkTheme(true);
    service.isDarkTheme$.subscribe(isDarkTheme => expect(isDarkTheme).toBeTrue());
    expect(localStorage.getItem('DWF-isDarkTheme')).toBe('true');
  });

  it('should read theme from local storage', () => {
    localStorage.setItem('DWF-isDarkTheme', 'true');
    service = new ThemeService();
    service.isDarkTheme$.subscribe(isDarkTheme => expect(isDarkTheme).toBeTrue());

    localStorage.setItem('DWF-isDarkTheme', 'false');
    service = new ThemeService();
    service.isDarkTheme$.subscribe(isDarkTheme => expect(isDarkTheme).toBeFalse());
  });
});
