import { Component, ViewChild, Input, ChangeDetectionStrategy, ContentChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import json2csv, { Parser } from 'json2csv';
import { saveAs } from 'file-saver';

/** A shell component for wrapping mat-table, adds csv export, filter, sort and pagination features to it. */
@Component({
  selector: 'app-mat-table-shell',
  templateUrl: './mat-table-shell.component.html',
  styleUrls: ['./mat-table-shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatTableShellComponent {
  /** The wrapped mat-table's data source. */
  get dataSource(): MatTableDataSource<object> {
    return this._dataSource;
  }
  /** Input and Setter for the wrapped mat-table's data source, sets up pagination and sort. */
  @Input() set dataSource(dataSource: MatTableDataSource<object>) {
    this._dataSource = dataSource;
    this._dataSource.paginator = this.paginator;
    this._dataSource.sort = this.sort;
  }
  /** The wrapped mat-table's data source. */
  private _dataSource: MatTableDataSource<object>;

  /** The name of the columns to export when exporting to csv (exports all by default). */
  @Input() columnsToExport?: string[];
  /** Reference to the paginator component in the view. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Reference to the sort directive in the wrapped mat-table. */
  @ContentChild(MatSort, { static: true }) sort: MatSort;
  /** Page size options for the paginator. */
  readonly pageSizeOptions = [10, 25, 50];

  /**
   * Converts the [dataSource]{@link MatTableShellComponent#dataSource} with the active sorting and filtering kept
   * and if [columnsToExport]{@link MatTableShellComponent#columnsToExport} given then only those columns to csv.
   * @returns The [columnsToExport]{@link MatTableShellComponent#columnsToExport} or all columns from [dataSource]{@link MatTableShellComponent#dataSource} as csv.
   */
  dataSourceAsCsv(): string {
    const data =
      this.dataSource.sort && this.dataSource.sort.active
        ? this.dataSource.sortData(this.dataSource.filteredData, this.dataSource.sort)
        : this.dataSource.filteredData;
    const fields = (this.columnsToExport || Object.keys(data[0])).map<json2csv.FieldInfo<any>>(column => ({
      label: column,
      value: (row: { [column: string]: any }) => row[column] && row[column].toString(),
    }));
    return new Parser({ fields, withBOM: true }).parse(data);
  }

  /** Creates a csv file using [dataSourceAsCsv]{@link MatTableShellComponent#dataSourceAsCsv} and downloads it. */
  exportToCsv(): void {
    const csvData = this.dataSourceAsCsv();
    const file = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
    saveAs(file, 'export.csv', { autoBom: true });
  }

  /**
   * Jumps to the given page index.
   * @param pageIndex The page index to jump to.
   */
  jumpToPage(pageIndex: number): void {
    const paginator = this.dataSource.paginator!;
    paginator.pageIndex = pageIndex;
    paginator.page.next({
      pageIndex,
      pageSize: paginator.pageSize,
      length: paginator.length,
    });
  }

  /**
   * Jumps to the page that has the given row index.
   * @param rowIndex The row index to jump to its page.
   */
  jumpToRow(rowIndex: number): void {
    const paginator = this.dataSource.paginator!;
    const pageIndexOfRow = Math.floor(rowIndex / paginator.pageSize);
    this.jumpToPage(pageIndexOfRow);
  }
}
