import type {
  TuringMachineDefinition,
  TMSnapshot,
  TMStatus,
  TMExecutionState,
  ValidationError,
  TMExportBundle,
} from "./tm-types";

const DEFAULT_MAX_STEPS = 1000;

/** Validate a Turing Machine definition */
export function validateTM(tm: TuringMachineDefinition): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!tm.states || tm.states.length === 0) {
    errors.push({ field: "states", message: "At least one state is required." });
  }
  if (!tm.startState) {
    errors.push({ field: "startState", message: "Start state is required." });
  } else if (!tm.states.includes(tm.startState)) {
    errors.push({ field: "startState", message: `Start state "${tm.startState}" is not in the states list.` });
  }
  if (!tm.acceptStates || tm.acceptStates.length === 0) {
    errors.push({ field: "acceptStates", message: "At least one accept state is required." });
  }

  for (const s of tm.acceptStates) {
    if (!tm.states.includes(s)) {
      errors.push({ field: "acceptStates", message: `Accept state "${s}" is not in the states list.` });
    }
  }
  for (const s of tm.rejectStates) {
    if (!tm.states.includes(s)) {
      errors.push({ field: "rejectStates", message: `Reject state "${s}" is not in the states list.` });
    }
  }

  if (!tm.blank) {
    errors.push({ field: "blank", message: "Blank symbol is required." });
  } else if (!tm.tapeAlphabet.includes(tm.blank)) {
    errors.push({ field: "blank", message: `Blank symbol "${tm.blank}" must be in the tape alphabet.` });
  }

  // Input alphabet must be subset of tape alphabet
  for (const s of tm.inputAlphabet) {
    if (!tm.tapeAlphabet.includes(s)) {
      errors.push({ field: "inputAlphabet", message: `Input symbol "${s}" is not in the tape alphabet.` });
    }
  }

  // Check for duplicate states
  const stateSet = new Set(tm.states);
  if (stateSet.size !== tm.states.length) {
    errors.push({ field: "states", message: "Duplicate state names detected." });
  }

  // Check transitions reference valid states/symbols
  for (const [state, symbolMap] of Object.entries(tm.transitions)) {
    if (!tm.states.includes(state)) {
      errors.push({ field: "transitions", message: `Transition from unknown state "${state}".` });
    }
    for (const [symbol, result] of Object.entries(symbolMap)) {
      if (!Array.isArray(result) || result.length !== 3) {
        errors.push({ field: "transitions", message: `Invalid transition format for (${state}, ${symbol}).` });
        continue;
      }
      const [nextState, writeSymbol, direction] = result;
      if (!tm.tapeAlphabet.includes(symbol)) {
        errors.push({ field: "transitions", message: `Read symbol "${symbol}" not in tape alphabet (state "${state}").` });
      }
      if (!tm.states.includes(nextState)) {
        errors.push({ field: "transitions", message: `Next state "${nextState}" not in states list (from "${state}", "${symbol}").` });
      }
      if (!tm.tapeAlphabet.includes(writeSymbol)) {
        errors.push({ field: "transitions", message: `Write symbol "${writeSymbol}" not in tape alphabet (from "${state}", "${symbol}").` });
      }
      if (!["L", "R", "S"].includes(direction)) {
        errors.push({ field: "transitions", message: `Invalid direction "${direction}" (from "${state}", "${symbol}"). Must be L, R, or S.` });
      }
    }
  }

  return errors;
}

/** Validate input string against the machine's input alphabet */
export function validateInput(tm: TuringMachineDefinition, input: string): string | null {
  if (input.length === 0) return null; // empty input is valid
  for (const ch of input) {
    if (!tm.inputAlphabet.includes(ch) && ch !== tm.blank) {
      return `Character "${ch}" is not in the input alphabet [${tm.inputAlphabet.join(", ")}].`;
    }
  }
  return null;
}

/** Validate the structure of an imported JSON to ensure it's a valid TM definition */
export function validateTMStructure(obj: unknown): { valid: boolean; machine?: TuringMachineDefinition; input?: string; errors: string[] } {
  const errors: string[] = [];

  if (typeof obj !== "object" || obj === null) {
    return { valid: false, errors: ["Invalid JSON: expected an object."] };
  }

  const data = obj as Record<string, unknown>;

  // Support both direct TM definition and TMExportBundle format
  let machineDef: Record<string, unknown>;
  let sampleInput: string | undefined;

  if ("machine" in data && typeof data.machine === "object" && data.machine !== null) {
    // TMExportBundle format
    machineDef = data.machine as Record<string, unknown>;
    sampleInput = typeof data.sampleInput === "string" ? data.sampleInput : undefined;
  } else if ("states" in data) {
    // Direct TuringMachineDefinition format
    machineDef = data;
  } else {
    return { valid: false, errors: ["JSON must contain either a 'machine' object or direct TM fields (states, transitions, etc.)."] };
  }

  const requiredFields = ["states", "inputAlphabet", "tapeAlphabet", "blank", "startState", "acceptStates", "transitions"];
  for (const field of requiredFields) {
    if (!(field in machineDef)) {
      errors.push(`Missing required field: "${field}".`);
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Type checks
  if (!Array.isArray(machineDef.states)) errors.push('"states" must be an array.');
  if (!Array.isArray(machineDef.inputAlphabet)) errors.push('"inputAlphabet" must be an array.');
  if (!Array.isArray(machineDef.tapeAlphabet)) errors.push('"tapeAlphabet" must be an array.');
  if (typeof machineDef.blank !== "string") errors.push('"blank" must be a string.');
  if (typeof machineDef.startState !== "string") errors.push('"startState" must be a string.');
  if (!Array.isArray(machineDef.acceptStates)) errors.push('"acceptStates" must be an array.');
  if (typeof machineDef.transitions !== "object") errors.push('"transitions" must be an object.');

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Ensure rejectStates defaults to empty array
  if (!("rejectStates" in machineDef) || !Array.isArray(machineDef.rejectStates)) {
    machineDef.rejectStates = [];
  }

  const machine = machineDef as unknown as TuringMachineDefinition;
  return { valid: true, machine, input: sampleInput, errors: [] };
}

/** Initialize execution state from definition and input */
export function initExecution(tm: TuringMachineDefinition, input: string): TMExecutionState {
  const tape = ["$", ...(input.length > 0 ? input.split("") : []), tm.blank];
  const initial: TMSnapshot = {
    state: tm.startState,
    tape: [...tape],
    headPosition: 1,
    stepCount: 0,
  };
  return {
    status: "running",
    current: initial,
    history: [{ ...initial, tape: [...tape] }],
  };
}

import { getStepExplanation } from "./getStepExplanation";

/** Execute one step, returning new execution state */
export function stepExecution(
  tm: TuringMachineDefinition,
  exec: TMExecutionState,
  maxSteps: number = DEFAULT_MAX_STEPS,
  machineName: string = "Custom Machine"
): TMExecutionState {
  if (exec.status !== "running") return exec;

  const { state, tape, headPosition, stepCount } = exec.current;

  // Check if current state is accept/reject (machine halts upon entering these states)
  if (tm.acceptStates.includes(state)) {
    return { ...exec, status: "accepted" };
  }
  if (tm.rejectStates.includes(state)) {
    return { ...exec, status: "rejected" };
  }
  if (stepCount >= maxSteps) {
    return { ...exec, status: "halted" };
  }

  // Read current symbol
  const readSymbol = tape[headPosition] ?? tm.blank;

  // Look up transition
  const transition = tm.transitions[state]?.[readSymbol];
  if (!transition) {
    // No transition defined = reject (machine has no move)
    return { ...exec, status: "rejected" };
  }

  const [nextState, writeSymbol, direction] = transition;
  const newTape = [...tape];

  // Extend tape if needed
  while (newTape.length <= headPosition) newTape.push(tm.blank);
  newTape[headPosition] = writeSymbol;
  
  const explanation = getStepExplanation({
    machineName,
    previousState: state,
    nextState,
    read: readSymbol,
    write: writeSymbol,
    move: direction,
    tape: newTape.join(""),
    head: headPosition
  });

  // Move head
  let newHead = headPosition;
  if (direction === "L") newHead = headPosition - 1;
  else if (direction === "R") newHead = headPosition + 1;

  if (newHead < 0) {
    newHead = 0; // keep head at index 0
    const errSnapshot: TMSnapshot = {
      state: nextState,
      tape: newTape,
      headPosition: newHead,
      stepCount: stepCount + 1,
      explanation
    };
    return {
      status: "error",
      current: errSnapshot,
      history: [...exec.history, { ...errSnapshot, tape: [...newTape] }],
    };
  }

  // Extend tape right if needed
  while (newTape.length <= newHead) newTape.push(tm.blank);

  const newSnapshot: TMSnapshot = {
    state: nextState,
    tape: newTape,
    headPosition: newHead,
    stepCount: stepCount + 1,
    explanation
  };

  // Detect infinite loop by comparing configurations
  const configStr = `${nextState}:${newHead}:${newTape.join("")}`;
  const isLoop = exec.history.some(
    (snap) => `${snap.state}:${snap.headPosition}:${snap.tape.join("")}` === configStr
  );

  // Check if new state is accept/reject immediately
  let newStatus: TMStatus = "running";
  if (isLoop) newStatus = "infinite-loop";
  else if (tm.acceptStates.includes(nextState)) newStatus = "accepted";
  else if (tm.rejectStates.includes(nextState)) newStatus = "rejected";

  return {
    status: newStatus,
    current: newSnapshot,
    history: [...exec.history, { ...newSnapshot, tape: [...newTape] }],
  };
}
