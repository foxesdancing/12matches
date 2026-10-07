export interface AxesValues {
  est: number;
  rep: number;
  pod: number;
  imi: number;
  dip: number;
  int: number;
  eco: number;
  con: number;
  com: number;
  rel: number;
  mor: number;
  tec: number;
}

export interface AxesProfile {
  values: AxesValues;
  religion?: string;
}
