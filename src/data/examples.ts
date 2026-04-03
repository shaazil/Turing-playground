import type { TuringMachineDefinition } from "@/utils/tm-types";

export interface TMExample {
  name: string;
  description: string;
  iconName?: string;
  machine: TuringMachineDefinition;
  sampleInput: string;
}

// ================= PRIMARY 4 MACHINES =================

/** Palindrome checker for binary strings */
const palindromeChecker: TMExample = {
  name: "Binary Palindrome Checker",
  description: "Checks if a binary string is a palindrome by comparing first and last characters.",
  iconName: "ArrowLeftRight",
  sampleInput: "1001",
  machine: {
    states: ["q0", "q1", "q2", "q3", "q4", "q5", "q_accept", "q_reject"],
    inputAlphabet: ["0", "1"],
    tapeAlphabet: ["0", "1", "X", "$", "_"],
    blank: "_",
    startState: "q0",
    acceptStates: ["q_accept"],
    rejectStates: ["q_reject"],
    transitions: {
      q0: {
        "0": ["q1", "X", "R"],
        "1": ["q2", "X", "R"],
        "X": ["q0", "X", "R"],
        "_": ["q_accept", "_", "S"],
        "$": ["q_accept", "$", "S"],
      },
      q1: {
        "0": ["q1", "0", "R"],
        "1": ["q1", "1", "R"],
        "X": ["q1", "X", "R"],
        "_": ["q3", "_", "L"],
      },
      q2: {
        "0": ["q2", "0", "R"],
        "1": ["q2", "1", "R"],
        "X": ["q2", "X", "R"],
        "_": ["q4", "_", "L"],
      },
      q3: {
        "0": ["q5", "X", "L"],
        "1": ["q_reject", "1", "S"],
        "X": ["q3", "X", "L"],
        "$": ["q_accept", "$", "S"],
        "_": ["q_accept", "_", "S"],
      },
      q4: {
        "1": ["q5", "X", "L"],
        "0": ["q_reject", "0", "S"],
        "X": ["q4", "X", "L"],
        "$": ["q_accept", "$", "S"],
        "_": ["q_accept", "_", "S"],
      },
      q5: {
        "0": ["q5", "0", "L"],
        "1": ["q5", "1", "L"],
        "X": ["q0", "X", "R"],
        "$": ["q0", "$", "R"],
        "_": ["q0", "_", "R"],
      },
    },
  },
};

/** Binary incrementer */
const binaryIncrementer: TMExample = {
  name: "Binary Incrementer",
  description: "Adds 1 to a binary number. Result is left on the tape when accepted.",
  iconName: "Binary",
  sampleInput: "1011",
  machine: {
    states: ["q0", "q1", "q2", "q_shift_1", "q_shift_0", "q_accept"],
    inputAlphabet: ["0", "1"],
    tapeAlphabet: ["0", "1", "$", "_"],
    blank: "_",
    startState: "q0",
    acceptStates: ["q_accept"],
    rejectStates: [],
    transitions: {
      q0: {
        "0": ["q0", "0", "R"],
        "1": ["q0", "1", "R"],
        "_": ["q1", "_", "L"],
      },
      q1: {
        "0": ["q2", "1", "L"],
        "1": ["q1", "0", "L"],
        "_": ["q_accept", "1", "S"],
        "$": ["q_shift_1", "$", "R"],
      },
      q2: {
        "0": ["q2", "0", "L"],
        "1": ["q2", "1", "L"],
        "$": ["q_accept", "$", "R"],
        "_": ["q_accept", "_", "R"],
      },
      q_shift_1: {
        "0": ["q_shift_0", "1", "R"],
        "1": ["q_shift_1", "1", "R"],
        "_": ["q_accept", "1", "S"],
      },
      q_shift_0: {
        "0": ["q_shift_0", "0", "R"],
        "1": ["q_shift_1", "0", "R"],
        "_": ["q_accept", "0", "S"],
      },
    },
  },
};

/** Even number of 1s checker */
const evenOnes: TMExample = {
  name: "Even Number of 1s",
  description: "Accepts binary strings with an even number of 1s (including zero 1s).",
  iconName: "Hash",
  sampleInput: "1100",
  machine: {
    states: ["q_even", "q_odd", "q_accept", "q_reject"],
    inputAlphabet: ["0", "1"],
    tapeAlphabet: ["0", "1", "$", "_"],
    blank: "_",
    startState: "q_even",
    acceptStates: ["q_accept"],
    rejectStates: ["q_reject"],
    transitions: {
      q_even: {
        "0": ["q_even", "0", "R"],
        "1": ["q_odd", "1", "R"],
        "_": ["q_accept", "_", "S"],
      },
      q_odd: {
        "0": ["q_odd", "0", "R"],
        "1": ["q_even", "1", "R"],
        "_": ["q_reject", "_", "S"],
      },
    },
  },
};

/** a^n b^n recognizer */
const anbn: TMExample = {
  name: "aⁿbⁿ Recognizer",
  description: "Accepts strings of the form aⁿbⁿ (equal number of a's followed by b's).",
  iconName: "Layers",
  sampleInput: "aaabbb",
  machine: {
    states: ["q0", "q1", "q2", "q3", "q_accept", "q_reject"],
    inputAlphabet: ["a", "b"],
    tapeAlphabet: ["a", "b", "X", "Y", "$", "_"],
    blank: "_",
    startState: "q0",
    acceptStates: ["q_accept"],
    rejectStates: ["q_reject"],
    transitions: {
      q0: {
        "a": ["q1", "X", "R"],
        "Y": ["q3", "Y", "R"],
        "b": ["q_reject", "b", "S"],
        "_": ["q_accept", "_", "S"],
      },
      q1: {
        "a": ["q1", "a", "R"],
        "Y": ["q1", "Y", "R"],
        "b": ["q2", "Y", "L"],
        "_": ["q_reject", "_", "S"],
      },
      q2: {
        "a": ["q2", "a", "L"],
        "Y": ["q2", "Y", "L"],
        "X": ["q0", "X", "R"],
      },
      q3: {
        "Y": ["q3", "Y", "R"],
        "_": ["q_accept", "_", "S"],
        "b": ["q_reject", "b", "S"],
        "a": ["q_reject", "a", "S"],
      },
    },
  },
};

// ================= EXTRA MACHINES =================

const unaryIncrementer: TMExample = {
  name: "Unary Incrementer",
  description: "Appends an additional '1' to a sequence of 1s.",
  iconName: "PlusSquare",
  sampleInput: "111",
  machine: {
    states: ["q0", "q_accept"],
    inputAlphabet: ["1"],
    tapeAlphabet: ["1", "$", "_"],
    blank: "_",
    startState: "q0",
    acceptStates: ["q_accept"],
    rejectStates: [],
    transitions: {
      q0: {
        "1": ["q0", "1", "R"],
        "_": ["q_accept", "1", "S"],
      },
    },
  },
};

const equalZeroesOnes: TMExample = {
  name: "Equal Number of 0s and 1s",
  description: "Accepts strings containing an equal number of 0s and 1s regardless of order.",
  iconName: "ArrowLeftRight",
  sampleInput: "110010",
  machine: {
    states: ["q0", "q1", "q2", "q3", "q_accept", "q_reject"],
    inputAlphabet: ["0", "1"],
    tapeAlphabet: ["0", "1", "X", "$", "_"],
    blank: "_",
    startState: "q0",
    acceptStates: ["q_accept"],
    rejectStates: ["q_reject"],
    transitions: {
      q0: {
        "0": ["q1", "X", "R"],
        "1": ["q2", "X", "R"],
        "X": ["q0", "X", "R"],
        "_": ["q_accept", "_", "S"],
      },
      q1: {
        "0": ["q1", "0", "R"],
        "1": ["q3", "X", "L"],
        "X": ["q1", "X", "R"],
        "_": ["q_reject", "_", "S"],
      },
      q2: {
        "1": ["q2", "1", "R"],
        "0": ["q3", "X", "L"],
        "X": ["q2", "X", "R"],
        "_": ["q_reject", "_", "S"],
      },
      q3: {
        "0": ["q3", "0", "L"],
        "1": ["q3", "1", "L"],
        "X": ["q3", "X", "L"],
        "$": ["q0", "$", "R"],
        "_": ["q0", "_", "R"],
      },
    },
  },
};

const containsSubstring11: TMExample = {
  name: "Contains Substring 11",
  description: "Scans strings hunting for any instance of '11'.",
  iconName: "Hash",
  sampleInput: "0100110",
  machine: {
    states: ["q0", "q1", "q_accept", "q_reject"],
    inputAlphabet: ["0", "1"],
    tapeAlphabet: ["0", "1", "$", "_"],
    blank: "_",
    startState: "q0",
    acceptStates: ["q_accept"],
    rejectStates: ["q_reject"],
    transitions: {
      q0: {
        "0": ["q0", "0", "R"],
        "1": ["q1", "1", "R"],
        "_": ["q_reject", "_", "S"],
      },
      q1: {
        "0": ["q0", "0", "R"],
        "1": ["q_accept", "1", "S"],
        "_": ["q_reject", "_", "S"],
      },
    },
  },
};

const endsWith101: TMExample = {
  name: "Ends With 101",
  description: "Runs to the very end of the string and validates that it terminates exactly in '101'.",
  iconName: "Binary",
  sampleInput: "1101101",
  machine: {
    states: ["q0", "q1", "q2", "q3", "q_accept", "q_reject"],
    inputAlphabet: ["0", "1"],
    tapeAlphabet: ["0", "1", "$", "_"],
    blank: "_",
    startState: "q0",
    acceptStates: ["q_accept"],
    rejectStates: ["q_reject"],
    transitions: {
      q0: {
        "0": ["q0", "0", "R"],
        "1": ["q0", "1", "R"],
        "_": ["q1", "_", "L"],
      },
      q1: {
        "1": ["q2", "1", "L"],
        "0": ["q_reject", "0", "S"],
        "$": ["q_reject", "$", "S"],
      },
      q2: {
        "0": ["q3", "0", "L"],
        "1": ["q_reject", "1", "S"],
        "$": ["q_reject", "$", "S"],
      },
      q3: {
        "1": ["q_accept", "1", "S"],
        "0": ["q_reject", "0", "S"],
        "$": ["q_reject", "$", "S"],
      },
    },
  },
};

const replaceZeroes: TMExample = {
  name: "Replace All 0s with 1s",
  description: "Sweeps the tape sequentially converting any 0s directly into 1s.",
  iconName: "ArrowLeftRight",
  sampleInput: "0100101",
  machine: {
    states: ["q0", "q_accept"],
    inputAlphabet: ["0", "1"],
    tapeAlphabet: ["0", "1", "$", "_"],
    blank: "_",
    startState: "q0",
    acceptStates: ["q_accept"],
    rejectStates: [],
    transitions: {
      q0: {
        "0": ["q0", "1", "R"],
        "1": ["q0", "1", "R"],
        "_": ["q_accept", "_", "S"],
      },
    },
  },
};

const tapeEraser: TMExample = {
  name: "Tape Eraser",
  description: "Iterates across the string overwriting every character with a blank.",
  iconName: "PlusSquare", // or another generic icon
  sampleInput: "1101001",
  machine: {
    states: ["q0", "q_accept"],
    inputAlphabet: ["0", "1"],
    tapeAlphabet: ["0", "1", "$", "_"],
    blank: "_",
    startState: "q0",
    acceptStates: ["q_accept"],
    rejectStates: [],
    transitions: {
      q0: {
        "0": ["q0", "_", "R"],
        "1": ["q0", "_", "R"],
        "_": ["q_accept", "_", "S"],
      },
    },
  },
};

const multiplesOf3: TMExample = {
  name: "Multiples of 3 in Binary",
  description: "Checks if the binary value represented is a multiple of 3 using modulo arithmetic states.",
  iconName: "Binary",
  sampleInput: "1100", // 12
  machine: {
    states: ["mod_0", "mod_1", "mod_2", "q_accept", "q_reject"],
    inputAlphabet: ["0", "1"],
    tapeAlphabet: ["0", "1", "$", "_"],
    blank: "_",
    startState: "mod_0",
    acceptStates: ["q_accept"],
    rejectStates: ["q_reject"],
    transitions: {
      mod_0: {
        "0": ["mod_0", "0", "R"],
        "1": ["mod_1", "1", "R"],
        "_": ["q_accept", "_", "S"],
      },
      mod_1: {
        "0": ["mod_2", "0", "R"],
        "1": ["mod_0", "1", "R"],
        "_": ["q_reject", "_", "S"],
      },
      mod_2: {
        "0": ["mod_1", "0", "R"],
        "1": ["mod_2", "1", "R"],
        "_": ["q_reject", "_", "S"],
      },
    },
  },
};

export const TM_EXAMPLES: TMExample[] = [
  palindromeChecker,
  binaryIncrementer,
  evenOnes,
  anbn,
  unaryIncrementer,
  equalZeroesOnes,
  containsSubstring11,
  endsWith101,
  replaceZeroes,
  tapeEraser,
  multiplesOf3,
];
