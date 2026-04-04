/** Direction the tape head can move */
export type Direction = "L" | "R" | "S";

/** A single transition: [nextState, writeSymbol, moveDirection] */
export type TransitionResult = [string, string, Direction];

/** Transitions map: state -> symbol -> result */
export type TransitionMap = Record<string, Record<string, TransitionResult>>;

/** Complete Turing Machine definition */
export interface TuringMachineDefinition {
  states: string[];
  inputAlphabet: string[];
  tapeAlphabet: string[];
  blank: string;
  startState: string;
  acceptStates: string[];
  rejectStates: string[];
  transitions: TransitionMap;
}

/** Snapshot of a single step of execution */
export interface TMSnapshot {
  state: string;
  tape: string[];
  headPosition: number;
  stepCount: number;
  explanation?: string;
}

/** Result status of the machine */
export type TMStatus = "running" | "accepted" | "rejected" | "halted" | "idle" | "infinite-loop" | "error";

/** Full execution state */
export interface TMExecutionState {
  status: TMStatus;
  current: TMSnapshot;
  history: TMSnapshot[];
}

/** Validation error */
export interface ValidationError {
  field: string;
  message: string;
}

/** Exportable machine bundle (includes input) */
export interface TMExportBundle {
  name?: string;
  description?: string;
  icon?: string;
  machine: TuringMachineDefinition;
  sampleInput?: string;
}
