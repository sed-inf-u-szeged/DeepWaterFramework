import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { ThemeService } from '@app/core/services/theme/theme.service';
import { HashWithTask } from '@app/data/models/experiment';
import { Result } from '@app/data/models/result';
import { EChartOption } from 'echarts';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LearnTaskConfig } from '../learn-task-config';

/** Data for the boxplot chart. */
interface BoxplotData {
  /** x axis category names. */
  axisNames: string[];
  /** Boxplot series data in [lower,  q1,  median,  q3,  upper] format. */
  boxValues: [number, number, number, number, number][];
  /** Scatter series data for outliers with name and value in [xAxis, yAxis] format. */
  outliers: { name: string; value: [number, number] }[];
}

/** Boxplot component to select and display test parameter results. */
@Component({
  selector: 'app-strategy-boxplot',
  templateUrl: './strategy-boxplot.component.html',
  styleUrls: ['./strategy-boxplot.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StrategyBoxplotComponent implements OnInit {
  /** Chart's base setup. */
  readonly baseChartOption: EChartOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', axisPointer: { type: 'shadow' }, extraCssText: 'font: unset;' },
    toolbox: { show: true, feature: { saveAsImage: { show: true, title: 'Save' } } },
    xAxis: {},
    yAxis: { type: 'value', scale: true },
    grid: { containLabel: true, top: 50, right: 0, left: 0 },
  };
  /** The chart options object passed to the chart as input. */
  chartOption: EChartOption;

  /** Current application theme. */
  readonly theme$: Observable<string>;
  /** Array of test result parameters to select from. */
  readonly paramOptions: Exclude<keyof Result['test'], 'std_dev'>[] = [
    'tp',
    'tn',
    'fp',
    'fn',
    'accuracy',
    'precision',
    'recall',
    'fmes',
    'mcc',
    'completeness',
    'covered_issues',
    'missed_issues',
  ];

  /** The task config to use the strategy from. */
  config: LearnTaskConfig;
  /** An array of tuples of the tasks and their hash in a [hash, task] format. */
  private hashWithTasks: HashWithTask[];
  /** Input data that updates the chart on change. */
  @Input() set data({ hashWithTasks, config }: { hashWithTasks: HashWithTask[]; config: LearnTaskConfig }) {
    this.hashWithTasks = hashWithTasks;
    this.config = config;
    this.updateChartData();
  }

  /** The currently selected test result parameter. */
  private _selectedParam: Exclude<keyof Result['test'], 'std_dev'>;
  /** Accessor for {@link StrategyBoxplotComponent#_selectedParam} that updates the chart on change. */
  set selectedParam(param: Exclude<keyof Result['test'], 'std_dev'>) {
    this._selectedParam = param;
    this.updateChartData();
  }
  get selectedParam() {
    return this._selectedParam;
  }

  /**
   * Constructs a new `StrategyBoxplotComponent` and maps the application's theme into the correct chart theme name.
   * @param themeService Theme service for observing the current app theme.
   */
  constructor(themeService: ThemeService) {
    this.theme$ = themeService.theme$.pipe(map(theme => (theme === 'dark-theme' ? 'dark' : 'light')));
  }

  /** Selects `fmes` as selected parameter on component init. */
  ngOnInit(): void {
    this.selectedParam = 'fmes';
  }

  /** Updates the chart's input object's data. */
  updateChartData(): void {
    const { axisNames, boxValues, outliers } = this.createBoxplotData();
    this.chartOption = {
      ...this.baseChartOption,
      xAxis: { type: 'category', data: axisNames },
      series: [
        { type: 'boxplot', data: boxValues, tooltip: { formatter: this.boxplotTooltipFormatter } },
        { type: 'scatter', data: outliers, tooltip: { formatter: this.scatterTooltipFormatter } },
      ],
    };
  }

  /**
   * Gives the hash and the selected parameter's value of every task by the current config's strategy.
   * @returns The hash and value of every task by the config's strategy.
   */
  getConfigStrategyData(): { [strategy: string]: { hash: string; value: number }[] } {
    const strategyData: { [strategy: string]: { hash: string; value: number }[] } = {};
    for (const [hash, task] of this.hashWithTasks) {
      const value = task.learn_result?.test[this.selectedParam];
      const strategy = task[this.config].strategy_name;
      if (value != null) {
        const item = { hash: hash.substr(0, 5), value };
        if (strategyData[strategy] != null) {
          strategyData[strategy].push(item);
        } else {
          strategyData[strategy] = [item];
        }
      }
    }
    return strategyData;
  }

  /**
   * Produces the data for the boxplot chart.
   * @returns The boxplot data.
   */
  createBoxplotData(): BoxplotData {
    const boxValues: BoxplotData['boxValues'] = [];
    const outliers: BoxplotData['outliers'] = [];
    const axisNames: BoxplotData['axisNames'] = [];

    for (const [config, arr] of Object.entries(this.getConfigStrategyData())) {
      axisNames.push(config);

      const ascArray = arr.slice().sort((a, b) => a.value - b.value);
      const q1 = this.quantile(ascArray, 0.25);
      const median = this.quantile(ascArray, 0.5);
      const q3 = this.quantile(ascArray, 0.75);

      const step = 1.5 * (q3 - q1);
      const lower = Math.max(ascArray[0].value, q1 - step);
      const upper = Math.min(ascArray[ascArray.length - 1].value, q3 + step);

      boxValues.push([lower, q1, median, q3, upper]);
      for (const { hash, value } of ascArray) {
        if (value < lower || value > upper) {
          outliers.push({ name: hash, value: [boxValues.length - 1, value] });
        }
      }
    }
    return { boxValues, outliers, axisNames };
  }

  /**
   * Compute the qth quantile of the given array.
   * @param ascArray Array sorted in ascending order by the values.
   * @param q The quantile to compute.
   * @returns The qth quantile of the array.
   */
  quantile(ascArray: { hash: string; value: number }[], q: number): number {
    const n = ascArray.length;
    if (n === 0) return NaN;
    if (q <= 0 || n === 1) return ascArray[0].value;
    if (q >= 1) return ascArray[n - 1].value;

    const i = (n - 1) * q;
    const i0 = Math.floor(i);
    const value0 = ascArray[i0].value;
    const value1 = ascArray[i0 + 1].value;

    return value0 + (value1 - value0) * (i - i0);
  }

  /**
   * Tooltip formatter for the boxplot box.
   * @param param Data the tooltip formatter gets.
   * @param param.name Category name.
   * @param param.value Value of data.
   * @param param.marker HTML marker dot.
   * @returns Boxplot tooltip HTML.
   */
  boxplotTooltipFormatter({ name, value, marker }: { name: string; value: number[]; marker: string }): string {
    const [, lower, q1, median, q3, upper] = value.map(val => val.toFixed(val % 1 && 3));
    return `${marker}${name}</br>upper: ${upper}</br>q3: ${q3}</br>median: ${median}</br>q1: ${q1}</br>lower: ${lower}`;
  }

  /**
   * Tooltip formatter for the scatter dot.
   * @param param Data the tooltip formatter gets.
   * @param param.name Category name.
   * @param param.value Value of data.
   * @param param.marker HTML marker dot.
   * @returns Scatter tooltip HTML.
   */
  scatterTooltipFormatter({ name, value: [, val], marker }: { name: string; value: number[]; marker: string }): string {
    return `${marker}${name}: ${val.toFixed(val % 1 && 3)}`;
  }
}
