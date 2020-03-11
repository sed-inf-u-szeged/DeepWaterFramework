import { Component, OnInit, OnDestroy } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import {
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
  Router,
  RouterEvent,
} from '@angular/router';
import { ThemeService } from '@app/core/services/theme/theme.service';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

/** Top level component */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  /** Whether the app is navigating */
  isLoading = true;
  /** Whether the current theme is the dark theme */
  isDarkTheme: boolean;
  /** CSS class name of the current theme */
  theme: string;
  /** Component's subscriptions  */
  readonly subscriptions: Subscription[] = [];

  constructor(private router: Router, public themeService: ThemeService, private overlayContainer: OverlayContainer) {}

  /** Subscribe to router events and current theme on init */
  ngOnInit(): void {
    this.subscriptions.push(
      this.router.events
        .pipe(filter((event): event is RouterEvent => event instanceof RouterEvent))
        .subscribe(routerEvent => this.checkRouterEvent(routerEvent)),

      this.themeService.isDarkTheme$.subscribe(isDarkTheme => {
        this.isDarkTheme = isDarkTheme;
        this.theme = `${isDarkTheme ? 'dark' : 'default'}-theme`;
        this.updateOverlayClassList();
      })
    );
  }

  /**
   * Set isLoading property based on RouterEvent navigation
   * @param routerEvent The router event
   */
  checkRouterEvent(routerEvent: RouterEvent): void {
    if (routerEvent instanceof NavigationStart) {
      this.isLoading = true;
    } else if (
      routerEvent instanceof NavigationEnd ||
      routerEvent instanceof NavigationCancel ||
      routerEvent instanceof NavigationError
    ) {
      this.isLoading = false;
    }
  }

  /** Update OverlayContainer classlist with current theme's classname */
  updateOverlayClassList(): void {
    const classList = this.overlayContainer.getContainerElement().classList;
    const themeClasses = Array.from(classList).filter((item: string) => item.includes('-theme'));
    if (themeClasses.length) {
      classList.remove(...themeClasses);
    }
    classList.add(this.theme);
  }

  /** Unsubscribe from subscriptions on destroy */
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
