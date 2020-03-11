import { Component, Input, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ThemeService } from '@app/core/services/theme/theme.service';
import { Task } from '@app/data/models/experiment';
import { EChartOption } from 'echarts';
import { round } from 'lodash-es';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LearnResultChartData } from './learn-result-chart-data';

@Component({
  selector: 'app-learn-result-chart',
  templateUrl: './learn-result-chart.component.html',
  styleUrls: ['./learn-result-chart.component.scss'],
})
export class LearnResultChartComponent {
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
        formatter: (params: EChartOption.Tooltip.Format) => this.chartTooltipData[params.name!],
      },
    },
    toolbox: {
      show: true,
      feature: { saveAsImage: { show: true, title: 'Save' } },
    },
    xAxis: { type: 'category' },
    yAxis: {},
  };
  readonly theme$: Observable<string>;
  chartTooltipData: { [key: string]: string };
  chartDataUpdate: EChartOption;

  @Input()
  set data(data: LearnResultChartData) {
    if (data) {
      this.updateChart(data);
    }
  }

  constructor(themeService: ThemeService, private domSanitizer: DomSanitizer) {
    this.theme$ = themeService.isDarkTheme$.pipe(map(isDarkTheme => (isDarkTheme ? 'dark' : 'light')));
  }

  paramsToHtml(lt: Task): string {
    const joinParams = (params: { [param: string]: string | number }) =>
      Object.entries(params)
        .map(([key, value]) => this.domSanitizer.sanitize(SecurityContext.HTML, `<dd>${key}: ${value}</dd>`))
        .join('');
    return `
      <dl>
        <dt>Features:</dt>
        ${joinParams(lt.assemble_config.strategy_parameters)}
        ${joinParams(lt.assemble_config.shared_parameters)}
        <dt>Learning:</dt>
        ${joinParams(lt.learn_config.strategy_parameters)}
        ${joinParams(lt.learn_config.shared_parameters)}
      </dl>
    `;
  }

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
          ...data.resultParams.map(key => [
            key,
            ...data.taskEntries.map(([_, task]) => this.roundValue(task.learn_result?.[data.resultType]?.[key])),
          ]),
        ],
      },
      series: data.taskEntries.map(_ => ({ type: 'bar' })),
      grid: {
        top: 10 * Math.ceil(data.taskEntries.length / 7) + '%',
      },
    };
  }

  roundValue(value: number | undefined): number | undefined {
    return value != null ? round(value, 3) : undefined;
  }

  taskName(hash: string, task: Task): string {
    return `${task.assemble_config.strategy_name} +\n${task.learn_config.strategy_name} (${hash.substr(0, 5)})`;
  }
}
