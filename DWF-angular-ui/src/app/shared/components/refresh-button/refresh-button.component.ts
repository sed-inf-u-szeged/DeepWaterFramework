import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ObservableDataResolved } from '@app/data/models/observable-data-resolved';
import { Subscription, interval, defer, Subject } from 'rxjs';
import { exhaustMap, switchMap, startWith, distinctUntilChanged, skip, finalize, tap, take, map } from 'rxjs/operators';
import { isEqual } from 'lodash-es';

@Component({
  selector: 'app-refresh-button',
  templateUrl: './refresh-button.component.html',
  styleUrls: ['./refresh-button.component.scss'],
})
export class RefreshButtonComponent implements OnInit, OnDestroy {
  @Input() observableDataResolved: ObservableDataResolved<any>;
  @Output() newData = new EventEmitter<ObservableDataResolved<any>['resolved']>();
  isLoading = false;
  showUpdateButton = false;
  readonly REFRESH_INTERVAL = 30000;
  readonly subscriptions: Subscription[] = [];
  readonly emitNewData$ = new Subject<void>();
  readonly forceRefresh$ = new Subject<void>();
  readonly refreshInterval$ = this.forceRefresh$.pipe(
    startWith(undefined as void),
    switchMap(() => interval(this.REFRESH_INTERVAL))
  );
  readonly query$ = defer(() =>
    this.forceRefresh$.pipe(
      exhaustMap(() => {
        this.isLoading = true;
        return defer(() => this.observableDataResolved.observable).pipe(finalize(() => (this.isLoading = false)));
      }),
      startWith(this.observableDataResolved.resolved),
      distinctUntilChanged(isEqual),
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

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.subscriptions.push(
      this.refreshInterval$.subscribe(() => this.forceRefresh$.next()),
      this.query$.subscribe(data => this.newData.emit(data))
    );
  }

  showUpdateNotifications() {
    this.showUpdateButton = true;
    this.snackBar
      .open('Data changed!', 'UPDATE', { horizontalPosition: 'start', duration: 3000 })
      .onAction()
      .pipe(take(1))
      .subscribe(() => this.emitNewData$.next());
  }

  dismissUpdateNotifications() {
    this.showUpdateButton = false;
    this.snackBar.dismiss();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
