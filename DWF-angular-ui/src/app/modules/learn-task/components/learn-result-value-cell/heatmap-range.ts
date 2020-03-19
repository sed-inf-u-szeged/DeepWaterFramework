/** The worst and best values of a column used to calculate the heatmap color for a {@link LearnResultValueCellComponent}. */
export interface HeatmapRange {
  /** Worst value of the column. */
  readonly worst: number | undefined;
  /** Best value of the column. */
  readonly best: number | undefined;
}
