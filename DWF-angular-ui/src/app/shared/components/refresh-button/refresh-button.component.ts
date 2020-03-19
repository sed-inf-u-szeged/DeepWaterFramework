import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ObservableDataResolved } from '@app/data/models/observable-data-resolved';
import { Subscription, interval, defer, Subject } from 'rxjs';
import { exhaustMap, switchMap, startWith, distinctUntilChanged, skip, finalize, tap, take, map } from 'rxjs/operators';
import { isEqual } from 'lodash-es';

/**
 * Component that displays a refresh button and polls its input observable periodically
 * and by clicking the button and emits the data if its changed compared to the last one polled (or the initial input on first run).
 */
@Component({
  selector: 'app-refresh-button',
  templateUrl: './refresh-button.component.html',
  styleUrls: ['./refresh-button.component.scss'],
})
export class RefreshButtonComponent implements OnInit, OnDestroy {
  /** The `ObservableDataResolved` that has the initial data and the query to repeat. */
  @Input() observableDataResolved: ObservableDataResolved<any>;
  /** The polled data that is different from the last one. */
  @Output() newData = new EventEmitter<ObservableDataResolved<any>['resolved']>();
  /** Whether the component waits on a query. */
  isLoading = false;
  /** Whether the component should display the update button. */
  showUpdateButton = false;
  /** The polling interval. */
  readonly REFRESH_INTERVAL = 30000;
  /** Component's subscriptions. */
  readonly subscriptions: Subscription[] = [];
  /** Signal to emit the new data as output */
  readonly emitNewData$ = new Subject<void>();
  /** Signal to refresh. */
  readonly refresh$ = new Subject<void>();
  /** Signal for polling every [REFRESH_INTERVAL]{@link RefreshButtonComponent#REFRESH_INTERVAL} ms, reseted by force refresh. */
  readonly refreshInterval$ = this.refresh$.pipe(
    startWith(undefined as void),
    switchMap(() => interval(this.REFRESH_INTERVAL))
  );
  /** The query that checks the data for difference, shows notifaction if its different than the last one and handles loading animation. */
  readonly query$ = defer(() =>
    this.refresh$.pipe(
      exhaustMap(() => {
        this.isLoading = true;
        return defer(() => this.observableDataResolved.observable).pipe(finalize(() => (this.isLoading = false)));
      }),
      startWith(this.observableDataResolved.resolved),
      distinctUntilChanged<ObservableDataResolved<any>['resolved']>(isEqual),
      skip(1),
      tap(() => this.showUpdateNotifications()),
      switchMap(newData =>
        this.emitNewData$.pipe(
          map(() => newData),
          tap(() => this.dismissUpdateNotifications())
        )
      )
    )
  );

  /**
   * Constructs a new `RefreshButtonComponent`
   * @param snackBar A `MatSnackBar` service.
   */
  constructor(private snackBar: MatSnackBar) {}

  /** Subscribes to the refresh interval and the query. */
  ngOnInit(): void {
    this.subscriptions.push(
      this.refreshInterval$.subscribe(() => this.refresh$.next()),
      this.query$.subscribe(data => this.newData.emit(data))
    );
  }

  /** Shows notifications about the data change. */
  showUpdateNotifications(): void {
    this.showUpdateButton = true;
    this.snackBar
      .open('Data changed!', 'UPDATE', { horizontalPosition: 'start', duration: 3000 })
      .onAction()
      .pipe(take(1))
      .subscribe(() => this.emitNewData$.next());
  }

  /** Dismissed the notifications about the data change. */
  dismissUpdateNotifications(): void {
    this.showUpdateButton = false;
    this.snackBar.dismiss();
  }

  /** Unsubscribes from its subscriptions on destroy. */
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
