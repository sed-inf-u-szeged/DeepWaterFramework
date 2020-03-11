import { Component, ViewChild, Input, ChangeDetectionStrategy, ContentChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { debounce } from 'lodash-es';
import json2csv, { Parser } from 'json2csv';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-mat-table-shell',
  templateUrl: './mat-table-shell.component.html',
  styleUrls: ['./mat-table-shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatTableShellComponent {
  private _dataSorurce: MatTableDataSource<object>;
  @Input() set dataSource(dataSource: MatTableDataSource<object>) {
    this._dataSorurce = dataSource;
    this._dataSorurce.paginator = this.paginator;
    this._dataSorurce.sort = this.sort;
  }
  get dataSource(): MatTableDataSource<object> {
    return this._dataSorurce;
  }

  @Input() columnsToExport?: string[];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ContentChild(MatSort, { static: true }) sort: MatSort;

  readonly pageSizeOptions = [10, 25, 50];
  readonly applyFilter = debounce((keyupEvent: KeyboardEvent) => {
    this.dataSource.filter = (keyupEvent.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.paginator!.firstPage();
  }, 250);

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

  exportToCsv(): void {
    const csvData = this.dataSourceAsCsv();
    const file = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
    saveAs(file, 'export.csv', { autoBom: true });
  }

  jumpToPage(pageIndex: number): void {
    const paginator = this.dataSource.paginator!;
    paginator.pageIndex = pageIndex;
    paginator.page.next({
      pageIndex,
      pageSize: paginator.pageSize,
      length: paginator.length,
    });
  }

  jumpToRow(rowIndex: number): void {
    const paginator = this.dataSource.paginator!;
    const pageIndexOfRow = Math.floor(rowIndex / paginator.pageSize);
    this.jumpToPage(pageIndexOfRow);
  }
}
