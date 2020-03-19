import { Component, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { ObservableDataResolved } from '@app/data/models/observable-data-resolved';
import { DataResolved } from '@app/data/models/data-resolved';
import { ExperimentListItem } from './experiment-list-item';
import { BehaviorSubject, combineLatest, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

type SortTypes = ExperimentListComponent['sortTypes'];

/** Component to display experiments as a list with sortings, paging and filter features. */
@Component({
  selector: 'app-experiment-list',
  templateUrl: './experiment-list.component.html',
  styleUrls: ['./experiment-list.component.scss'],
})
export class ExperimentListComponent implements OnInit {
  /** Error message to display. */
  errorMessage?: string;
  /** The resolved and the observable data. */
  observableDataResolved: ObservableDataResolved<ExperimentListItem[]>;
  /** Supported sorting types for the list. */
  readonly sortTypes = ['Name (A to Z)', 'Name (Z to A)', 'Date (newest first)', 'Date (oldest first)'] as const;
  /** Page size options for the paginator. */
  readonly pageSizeOptions = [10, 25, 50];
  /** The checkbox selected experiment items. */
  readonly selectedExperiments = new SelectionModel<string>(true, []);

  /** Subject of the experiment items. */
  readonly experiments$: BehaviorSubject<Readonly<ExperimentListItem[]>>;
  /** Subject of the filter string. */
  readonly filter$ = new BehaviorSubject<string>('');
  /** Subject of the active sort type. */
  readonly activeSortType$ = new BehaviorSubject<SortTypes[number]>('Name (A to Z)');
  /** The filtered, sorted, paginated data that should be rendered. */
  render$: Observable<Readonly<ExperimentListItem[]>>;

  /** Reference to the paginator component in the view. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  /**
   * Gets the resolved data from ActivatedRoute and sets up class properties with it.
   * @param route Information about the activated route.
   */
  constructor(route: ActivatedRoute) {
    this.observableDataResolved = route.snapshot.data.experimentList;
    this.experiments$ = new BehaviorSubject<Readonly<ExperimentListItem[]>>(this.observableDataResolved.resolved.data);
    this.errorMessage = this.observableDataResolved.resolved.error;
  }

  /** Creates a pipeline that handles data change, filtering, sorting and paging and produces the data to be rendered */
  ngOnInit(): void {
    const filteredData$ = combineLatest([this.experiments$, this.filter$]).pipe(
      map(([data, filter]) => this.filterData(data, filter))
    );
    const sortedData$ = combineLatest([filteredData$, this.activeSortType$]).pipe(
      map(([data, sort]) => this.sortData(data, sort))
    );
    const paginatedData$ = combineLatest([sortedData$, merge(this.paginator.initialized, this.paginator.page)]).pipe(
      map(([data]) => this.pageData(data))
    );
    Promise.resolve().then(() => (this.render$ = paginatedData$));
  }

  /**
   * Filters the data by name.
   * @param data The data to filter.
   * @param filter The substring that should be included in the name.
   */
  filterData(data: Readonly<ExperimentListItem[]>, filter: string): Readonly<ExperimentListItem[]> {
    const filteredData = filter ? data.filter(item => item.name.toLowerCase().includes(filter)) : data;
    this.updatePaginator(filteredData.length);
    return filteredData;
  }

  /**
   * Updates the paginator based on the filtered data length.
   * @param filteredDataLength Filtered data length.
   */
  updatePaginator(filteredDataLength: number): void {
    this.paginator.length = filteredDataLength;

    if (this.paginator.pageIndex > 0) {
      const lastPageIndex = Math.ceil(this.paginator.length / this.paginator.pageSize) - 1 || 0;
      const newPageIndex = Math.min(this.paginator.pageIndex, lastPageIndex);

      if (newPageIndex !== this.paginator.pageIndex) this.paginator.pageIndex = newPageIndex;
    }
  }

  /**
   * Sorts the data based on the sort type.
   * @param data The data to sort.
   * @param sortType The sort type.
   */
  sortData(data: Readonly<ExperimentListItem[]>, sortType: SortTypes[number]): Readonly<ExperimentListItem[]> {
    switch (sortType) {
      case 'Name (A to Z)':
        return data;
      case 'Name (Z to A)':
        return data.slice().reverse();
      case 'Date (newest first)':
        return data.slice().sort((a, b) => a.created.getTime() - b.created.getTime());
      case 'Date (oldest first)':
        return data.slice().sort((a, b) => b.created.getTime() - a.created.getTime());
    }
  }

  /**
   * Paginates the data based on the paginator's state.
   * @param data The data to paginate.
   */
  pageData(data: Readonly<ExperimentListItem[]>): Readonly<ExperimentListItem[]> {
    const start = this.paginator.pageIndex * this.paginator.pageSize;
    const end = start + this.paginator.pageSize;
    return data.slice(start, end);
  }

  /**
   * Handles the event when the {@link RefreshButtonComponent} emits new data.
   * @param newData New data emitted by the {@link RefreshButtonComponent}.
   */
  handleNewData(newData: DataResolved<ExperimentListItem[]>): void {
    this.experiments$.next(newData.data);
    this.errorMessage = newData.error;
  }
}
