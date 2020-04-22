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

  it('should be default-theme by default (no local storage key)', () => {
    expect(localStorage.getItem('DWF-theme')).toBeNull();
    service.theme$.subscribe(theme => expect(theme).toBe('default-theme'));
  });

  it('should set dark-theme', () => {
    service.setTheme('dark-theme');
    service.theme$.subscribe(theme => expect(theme).toBe('dark-theme'));
    expect(localStorage.getItem('DWF-theme')).toBe('dark-theme');
  });

  it('should read theme from local storage', () => {
    localStorage.setItem('DWF-theme', 'dark-theme');
    service = new ThemeService();
    service.theme$.subscribe(theme => expect(theme).toBe('dark-theme'));

    localStorage.setItem('DWF-theme', 'default-theme');
    service = new ThemeService();
    service.theme$.subscribe(isDarkTheme => expect(isDarkTheme).toBe('default-theme'));
  });
});
