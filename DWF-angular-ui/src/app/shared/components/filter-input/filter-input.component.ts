import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter, OnDestroy, Input } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime, pluck, distinctUntilChanged, map } from 'rxjs/operators';

/**
 * A component that displays an input field, and outputs it's value on each keyup event debounced by 300ms,
 * only if its different from the last value, plus trims and lowercases it.
 */
@Component({
  selector: 'app-filter-input',
  templateUrl: './filter-input.component.html',
  styleUrls: ['./filter-input.component.scss'],
})
export class FilterInputComponent implements OnInit, OnDestroy {
  /** Component's subscription. */
  subscription: Subscription;
  /** Reference to the html input field. */
  @ViewChild('filterInput', { static: true }) filterInput: ElementRef<HTMLInputElement>;

  /** Label text for the input field. */
  @Input() label = 'Filter';
  /** Outputs the value of the input field */
  @Output() filter = new EventEmitter<string>();

  /**
   * Creates an `Observable` from the input field's keyup event, debounces it by 300ms, gets it's value,
   * only emits it if its different from the last value, trims and lowercase it. Then subscribes to it and emits it's emissions as output.
   */
  ngOnInit(): void {
    this.subscription = fromEvent<KeyboardEvent>(this.filterInput.nativeElement, 'keyup')
      .pipe(
        debounceTime(300),
        pluck<KeyboardEvent, string>('target', 'value'),
        distinctUntilChanged(),
        map(filter => filter.trim().toLowerCase())
      )
      .subscribe(filter => this.filter.emit(filter));
  }

  /** Unsubscribes from subscription on destroy */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
