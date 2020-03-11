export interface AssembleConfig {
  strategy_id: string;
  strategy_name: string;
  strategy_parameters: {
    [key: string]: number | string;
  };
  shared_parameters: {
    [key: string]: number | string;
  };
}
