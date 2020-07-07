import { Component, Input, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ThemeService } from '@app/core/services/theme.service';
import { Task } from '@app/data/models/experiment';
import { EChartOption } from 'echarts';
import { round } from 'lodash-es';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LearnResultChartData } from './learn-result-chart-data';

/** Stacked bar chart for displaying result parameters. */
@Component({
  selector: 'app-learn-result-chart',
  templateUrl: './learn-result-chart.component.html',
  styleUrls: ['./learn-result-chart.component.scss'],
})
export class LearnResultChartComponent {
  /** Chart's base setup. */
  readonly baseOption: EChartOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      extraCssText: 'font: unset;',
    },
    legend: {
      tooltip: {
        show: true,
        formatter: ({ name }: { name: string }) => this.chartTooltipData[name],
      },
    },
    toolbox: {
      show: true,
      feature: { saveAsImage: { show: true, title: 'Save' } },
    },
    xAxis: { type: 'category' },
    yAxis: {},
    grid: { containLabel: true, right: 0, bottom: 0, left: 0 },
  };
  /** Current application theme. */
  readonly theme$: Observable<string>;
  /** Tooltip text for the chart's legends. */
  chartTooltipData: { [key: string]: string };
  /** The chart options object passed to the chart as input. */
  chartDataUpdate: EChartOption;

  /** Updates the chart on data input change. */
  @Input() set data(data: LearnResultChartData) {
    if (data) {
      this.updateChart(data);
    }
  }

  /**
   * Constructs a new `LearnResultChartComponent` and maps the application's theme into the correct chart theme name.
   * @param themeService Theme service for observing the current app theme.
   * @param domSanitizer Dom sanitizer for sanitizing the custom tooltip's html.
   */
  constructor(themeService: ThemeService, private domSanitizer: DomSanitizer) {
    this.theme$ = themeService.theme$.pipe(map(theme => (theme === 'dark-theme' ? 'dark' : 'light')));
  }

  /**
   * Makes html description list from the `Task`'s config parameters.
   * @param task A task to make html from its config parameters.
   * @returns HTML description list of config parameters as string.
   */
  paramsToHtml(task: Task): string {
    const joinParams = (params: { [param: string]: string | number }) =>
      Object.entries(params)
        .map(([key, value]) => this.domSanitizer.sanitize(SecurityContext.HTML, `<dd>${key}: ${value}</dd>`))
        .join('');
    return `
      <dl>
        <dt>Features:</dt>
        ${joinParams(task.assemble_config.strategy_parameters)}
        ${joinParams(task.assemble_config.shared_parameters)}
        <dt>Learning:</dt>
        ${joinParams(task.learn_config.strategy_parameters)}
        ${joinParams(task.learn_config.shared_parameters)}
      </dl>
    `;
  }

  /**
   * Shapes it's input into the chart's data format and creates the custom tooltip's data.
   * @param data The data to be shown on the chart.
   */
  updateChart(data: LearnResultChartData): void {
    this.chartTooltipData = data.taskEntries.reduce((obj, [hash, task]) => {
      obj[this.taskName(hash, task)] = this.paramsToHtml(task);
      return obj;
    }, {} as { [key: string]: string });

    this.chartDataUpdate = {
      ...this.baseOption,
      dataset: {
        source: [
          ['name', ...data.taskEntries.map(([hash, task]) => this.taskName(hash, task))],
          ...data.resultSetParams.map(key => [
            key,
            ...data.taskEntries.map(([_, task]) => this.roundValue(task.learn_result?.[data.resultSet]?.[key])),
          ]),
        ],
      },
      series: data.taskEntries.map(_ => ({ type: 'bar' })),
      grid: {
        ...this.baseOption.grid,
        top: 10 * Math.ceil(data.taskEntries.length / 7) + '%',
      },
    };
  }

  /**
   * Roundes number to 3 decimals if its not undefined.
   * @param value The number to round or undefined.
   * @returns The rounded number or undefined if the value was undefined.
   */
  roundValue(value: number | undefined): number | undefined {
    return value != null ? round(value, 3) : undefined;
  }

  /**
   * Creates a name for a task from its algorithm, preset and hash.
   * @param hash Hash of the task.
   * @param task The task.
   * @returns The name for the task.
   */
  taskName(hash: string, task: Task): string {
    return `${task.assemble_config.strategy_name} +\n${task.learn_config.strategy_name} (${hash.substr(0, 5)})`;
  }
}
