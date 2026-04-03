import { describe, it, expect } from "vitest";
import {
  validateTM,
  validateInput,
  validateTMStructure,
  initExecution,
  stepExecution,
} from "../utils/tm-engine";
import { TM_EXAMPLES } from "../data/examples";
import type { TuringMachineDefinition, TMExecutionState } from "../utils/tm-types";

function runToCompletion(
  tm: TuringMachineDefinition,
  input: string,
  maxSteps = 1000
): TMExecutionState {
  let exec = initExecution(tm, input);
  while (exec.status === "running") {
    exec = stepExecution(tm, exec, maxSteps);
  }
  return exec;
}

describe("TM Engine — Palindrome Checker", () => {
  const tm = TM_EXAMPLES[0].machine;

  it('accepts "10101" (palindrome length 5)', () => {
    const result = runToCompletion(tm, "10101");
    expect(result.status).toBe("accepted");
  });

  it('accepts "1001" (palindrome length 4)', () => {
    const result = runToCompletion(tm, "1001");
    expect(result.status).toBe("accepted");
  });

  it('accepts "0110" (palindrome)', () => {
    const result = runToCompletion(tm, "0110");
    expect(result.status).toBe("accepted");
  });

  it('accepts "1" (single char)', () => {
    const result = runToCompletion(tm, "1");
    expect(result.status).toBe("accepted");
  });

  it('accepts "" (empty string)', () => {
    const result = runToCompletion(tm, "");
    expect(result.status).toBe("accepted");
  });

  it('rejects "1010" (not a palindrome)', () => {
    const result = runToCompletion(tm, "1010");
    expect(result.status).toBe("rejected");
  });

  it('rejects "10" (not a palindrome)', () => {
    const result = runToCompletion(tm, "10");
    expect(result.status).toBe("rejected");
  });
});

describe("TM Engine — Binary Incrementer", () => {
  const tm = TM_EXAMPLES[1].machine;

  it('increments "1011" to "1100"', () => {
    const result = runToCompletion(tm, "1011");
    expect(result.status).toBe("accepted");
    const tapeStr = result.current.tape.join("").replace(/_+$/, "");
    expect(tapeStr).toBe("$1100");
  });

  it('increments "111" to "1000"', () => {
    const result = runToCompletion(tm, "111");
    expect(result.status).toBe("accepted");
    const tapeStr = result.current.tape.join("").replace(/_+$/, "");
    expect(tapeStr).toBe("$1000");
  });

  it('increments "0" to "1"', () => {
    const result = runToCompletion(tm, "0");
    expect(result.status).toBe("accepted");
    const tapeStr = result.current.tape.join("").replace(/_+$/, "");
    expect(tapeStr).toBe("$1");
  });

  it('increments "1" to "10"', () => {
    const result = runToCompletion(tm, "1");
    expect(result.status).toBe("accepted");
    const tapeStr = result.current.tape.join("").replace(/_+$/, "");
    expect(tapeStr).toBe("$10");
  });
});

describe("TM Engine — Even Number of 1s", () => {
  const tm = TM_EXAMPLES[2].machine;

  it('accepts "1100" (2 ones = even)', () => {
    const result = runToCompletion(tm, "1100");
    expect(result.status).toBe("accepted");
  });

  it('accepts "" (empty = 0 ones = even)', () => {
    const result = runToCompletion(tm, "");
    expect(result.status).toBe("accepted");
  });

  it('rejects "10110" (3 ones = odd)', () => {
    const result = runToCompletion(tm, "10110");
    expect(result.status).toBe("rejected");
  });
});

describe("TM Engine — aⁿbⁿ Recognizer", () => {
  const tm = TM_EXAMPLES[3].machine;

  it('accepts "aaabbb" (3a3b)', () => {
    const result = runToCompletion(tm, "aaabbb");
    expect(result.status).toBe("accepted");
  });

  it('accepts "" (empty = 0a0b)', () => {
    const result = runToCompletion(tm, "");
    expect(result.status).toBe("accepted");
  });

  it('rejects "aab" (2a1b)', () => {
    const result = runToCompletion(tm, "aab");
    expect(result.status).toBe("rejected");
  });

  it('rejects "ba" (wrong order)', () => {
    const result = runToCompletion(tm, "ba");
    expect(result.status).toBe("rejected");
  });
});

describe("TM Engine — Boundaries and Infinite Loops", () => {
  it("detects infinite loop", () => {
    const tm: TuringMachineDefinition = {
      states: ["q0"],
      inputAlphabet: ["0"],
      tapeAlphabet: ["0", "$", "_"],
      blank: "_",
      startState: "q0",
      acceptStates: ["q_accept"],
      rejectStates: [],
      transitions: {
        q0: { "0": ["q0", "0", "R"], "_": ["q0", "_", "L"] }, // loop 0 -> R -> _ -> L -> 0 -> R
      },
    };
    const result = runToCompletion(tm, "0", 100);
    expect(result.status).toBe("infinite-loop");
  });

  it("halts with error when moving left of $", () => {
    const tm: TuringMachineDefinition = {
      states: ["q0", "q1", "q_accept"],
      inputAlphabet: ["0"],
      tapeAlphabet: ["0", "$", "_"],
      blank: "_",
      startState: "q0",
      acceptStates: ["q_accept"],
      rejectStates: [],
      transitions: {
        q0: { "0": ["q0", "0", "L"], "$": ["q1", "$", "L"] }, 
      },
    };
    const result = runToCompletion(tm, "0", 50);
    expect(result.status).toBe("error");
    expect(result.current.headPosition).toBe(0);
  });
});

describe("TM Engine — Validation", () => {
  it("validates input string against alphabet", () => {
    const tm: TuringMachineDefinition = {
      states: ["q0", "q_accept"],
      inputAlphabet: ["0", "1"],
      tapeAlphabet: ["0", "1", "_"],
      blank: "_",
      startState: "q0",
      acceptStates: ["q_accept"],
      rejectStates: [],
      transitions: {},
    };
    expect(validateInput(tm, "010")).toBeNull();
    expect(validateInput(tm, "abc")).not.toBeNull();
  });
});
