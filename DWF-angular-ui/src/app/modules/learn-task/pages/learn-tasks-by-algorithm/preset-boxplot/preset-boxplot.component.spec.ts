import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from '@app/shared/shared.module';
import { NgxEchartsCoreModule } from 'ngx-echarts/core';
import { PresetBoxplotComponent } from './preset-boxplot.component';

describe('PresetBoxplotComponent', () => {
  let component: PresetBoxplotComponent;
  let fixture: ComponentFixture<PresetBoxplotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, NoopAnimationsModule, NgxEchartsCoreModule],
      declarations: [PresetBoxplotComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PresetBoxplotComponent);
    component = fixture.componentInstance;
    component.hashWithTasks = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
