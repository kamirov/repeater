export type Move = {
  id: string;
  name: string;
  referenceUrl: string;
  description: string;
  isCombo: boolean;
};

export type DanceStyle = {
  id: string;
  name: string;
  moves: Move[];
};

export type RepeaterDataV1 = {
  version: 1;
  styles: DanceStyle[];
  activeStyleId: string | null;
  delaySeconds: number;
  comboDelaySeconds: number;
};
