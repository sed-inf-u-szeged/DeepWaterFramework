import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from '@app/shared/shared.module';
import { LinkCell } from '@app/shared/models/link-cell';
import { ValueCell } from '@app/shared/models/value-cell';
import * as FileSaver from 'file-saver';
import { MatTableShellComponent } from './mat-table-shell.component';

describe('MatTableShellComponent', () => {
  let component: MatTableShellComponent;
  let fixture: ComponentFixture<MatTableShellComponent>;
  const testData = [
    { col1: 11, col2: undefined },
    { col1: new ValueCell(undefined, undefined), col2: new LinkCell('link', 'link') },
    { col1: new ValueCell(0.12345, 0.12), col2: null },
  ];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, NoopAnimationsModule],
      declarations: [MatTableShellComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MatTableShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call saveAs when exporting to csv', () => {
    component.dataSource = new MatTableDataSource([...testData]);
    fixture.detectChanges();
    const spiedSaveAs = spyOn(FileSaver, 'saveAs').and.returnValue();
    component.exportToCsv();
    expect(spiedSaveAs).toHaveBeenCalledTimes(1);
  });

  it('should convert data source to csv without sorting when dataSource dont have sort or it is not active', () => {
    component.dataSource = new MatTableDataSource([...testData]);
    fixture.detectChanges();
    expect(component.dataSourceAsCsv()).toBe(
      `\ufeff"col1","col2"\n` +
        `"${testData[0].col1}",${''}\n` +
        `"${testData[1].col1}","${testData[1].col2}"\n` +
        `"${testData[2].col1}",${''}`
    );
  });

  it('should convert data source to csv with sorting when it is active', () => {
    const dataSource = new MatTableDataSource([...testData]);
    dataSource.sortingDataAccessor = (data, header: 'col1' | 'col2'): string | number => {
      const cell = data[header];
      return cell instanceof ValueCell ? cell.value : String(cell);
    };
    component.dataSource = dataSource;
    component.dataSource.sort = new MatSort();
    component.dataSource.sort.active = 'col1';
    component.dataSource.sort.direction = 'asc';
    fixture.detectChanges();
    expect(component.dataSourceAsCsv()).toBe(
      `\ufeff"col1","col2"\n` +
        `"${testData[1].col1}","${testData[1].col2}"\n` +
        `"${testData[2].col1}",${''}\n` +
        `"${testData[0].col1}",${''}`
    );
  });
});
