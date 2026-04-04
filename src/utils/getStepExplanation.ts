import { Direction } from "./tm-types";

interface ExplanationParams {
  machineName: string;
  previousState: string;
  nextState: string;
  read: string;
  write: string;
  move: Direction;
  tape: string; // The whole tape or just the context? Actually, usually the machine name and transition is enough.
  head: number;
}

export function getStepExplanation({
  machineName,
  previousState,
  nextState,
  read,
  write,
  move,
}: ExplanationParams): string {
  const moveStr = move === "R" ? "Right" : move === "L" ? "Left" : "Stay";

  // Support custom explanations for built-in machines
  if (machineName === "Binary Palindrome Checker") {
    if (previousState === "q0" && read === "0" && nextState === "q_find_0_right") {
      return "Read 0 at the start. Marked it as X, then moved Right to search for a matching 0 at the end.";
    }
    if (previousState === "q0" && read === "1" && nextState === "q_find_1_right") {
      return "Read 1 at the start. Marked it as X, then moved Right to search for a matching 1 at the end.";
    }
    if ((previousState === "q_find_0_right" || previousState === "q_find_1_right") && (read === "0" || read === "1")) {
      return `Skipped over '${read}' while moving right to find the end of the string.`;
    }
    if (previousState === "q_find_0_right" && (read === "X" || read === "$") && nextState === "q_check_0") {
      return "Reached the end or a marked symbol. Moving backwards to check if the last unmarked symbol is a 0.";
    }
    if (previousState === "q_find_1_right" && (read === "X" || read === "$") && nextState === "q_check_1") {
      return "Reached the end or a marked symbol. Moving backwards to check if the last unmarked symbol is a 1.";
    }
    if (previousState === "q_check_0" && read === "0" && nextState === "q_return_left") {
      return "Found the matching 0 at the end! Marked it as X and now returning left for the next pass.";
    }
    if (previousState === "q_check_1" && read === "1" && nextState === "q_return_left") {
      return "Found the matching 1 at the end! Marked it as X and now returning left for the next pass.";
    }
    if (previousState === "q0" && (read === "X" || read === "$")) {
      return "All symbols matched. The string is a palindrome!";
    }
  }

  if (machineName === "Binary Incrementer") {
    if (previousState === "q0" && (read === "0" || read === "1")) {
      return "Moving right to find the end of the binary number.";
    }
    if (previousState === "q0" && (read === "$" || read === "_") && nextState === "q1") {
      return "Reached the end of the number. Moving left to start adding 1.";
    }
    if (previousState === "q1" && read === "1" && nextState === "q1") {
      return "Found a trailing 1, changed it to 0, and continued moving left because the carry is still active.";
    }
    if (previousState === "q1" && read === "0" && nextState === "q_accept") {
      return "Found a 0, changed it to 1. No more carry, so we can stop!";
    }
    if (previousState === "q1" && read === "$" && nextState === "q_accept") {
      return "Carried over past the start, so prepended a 1 to expand the number.";
    }
  }

  if (machineName === "Even Number of 1s") {
    if (previousState === "q_even" && read === "1" && nextState === "q_odd") {
      return "Read a 1, so the machine switched from even parity to odd parity.";
    }
    if (previousState === "q_odd" && read === "1" && nextState === "q_even") {
      return "Read a 1, so the machine switched from odd parity back to even parity.";
    }
    if ((previousState === "q_even" || previousState === "q_odd") && read === "0") {
      return "Read a 0, parity remains unchanged.";
    }
  }

  if (machineName === "Unary Incrementer") {
    if (previousState === "q0" && read === "1") {
      return "Moving right across existing 1s.";
    }
    if (previousState === "q0" && (read === "$" || read === "_")) {
      return "Reached the end, adding a new 1.";
    }
  }

  if (machineName === "aⁿbⁿ Recognizer") {
    if (previousState === "q0" && read === "A" && nextState === "q1") {
      return "Found an 'A', marked it as 'X', now looking for a matching 'B'.";
    }
    if (previousState === "q1" && read === "A") {
      return "Skipping over 'A's while searching for a 'B'.";
    }
    if (previousState === "q1" && read === "Y") {
      return "Skipping over previously matched 'Y's.";
    }
    if (previousState === "q1" && read === "B" && nextState === "q2") {
      return "Found a matching 'B'! Marked it as 'Y', returning to start to look for more 'A's.";
    }
    if (previousState === "q2" && (read === "A" || read === "Y")) {
      return "Moving back to the left side.";
    }
    if (previousState === "q0" && read === "Y" && nextState === "q3") {
      return "No more 'A's left. Verifying there are no unmatched 'B's remaining.";
    }
    if (previousState === "q3" && read === "Y") {
      return "Skipping over 'Y's...";
    }
  }

  // General fallback
  if (previousState === nextState) {
    if (read === write) {
      return `Read '${read}' and simply moved ${moveStr} in state ${previousState}.`;
    }
    return `Read '${read}', replaced with '${write}', and moved ${moveStr} in state ${previousState}.`;
  } else {
    return `The machine read '${read}', wrote '${write}', moved ${moveStr}, and transitioned from ${previousState} to ${nextState}.`;
  }
}
