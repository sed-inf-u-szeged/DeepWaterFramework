export interface AssembleConfig {
  readonly strategy_id: string;
  readonly strategy_name: string;
  readonly strategy_parameters: {
    readonly [key: string]: number | string;
  };
  readonly shared_parameters: {
    readonly [key: string]: number | string;
  };
}
