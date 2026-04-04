export function generateRandomValidInput(machineName: string): string {
  const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  const randEl = <T>(arr: T[]): T => arr[rand(0, arr.length - 1)];

  switch (machineName) {
    case "Binary Palindrome Checker": {
      const len = rand(1, 4);
      let s = "";
      for (let i = 0; i < len; i++) {
        s += randEl(["0", "1"]);
      }
      return randEl([
        s + s.split("").reverse().join(""), // Even length palindrome
        s + randEl(["0", "1"]) + s.split("").reverse().join(""), // Odd length
      ]);
    }
    case "Binary Incrementer": {
      const len = rand(2, 6);
      let s = "1"; // don't start with 0
      for (let i = 1; i < len; i++) s += randEl(["0", "1"]);
      // Frequently generate numbers ending with 1s to see carries
      if (rand(1, 3) === 1) s += "11";
      return s;
    }
    case "Even Number of 1s": {
      const ones = rand(1, 4) * 2; // guaranteed even
      const zeroes = rand(2, 5);
      const arr = Array(ones).fill("1").concat(Array(zeroes).fill("0"));
      return arr.sort(() => Math.random() - 0.5).join("");
    }
    case "aⁿbⁿ Recognizer": {
      const n = rand(1, 5);
      return "a".repeat(n) + "b".repeat(n);
    }
    case "Unary Incrementer": {
      return "1".repeat(rand(1, 6));
    }
    case "Equal Number of 0s and 1s": {
      const n = rand(1, 4);
      const arr = Array(n).fill("0").concat(Array(n).fill("1"));
      return arr.sort(() => Math.random() - 0.5).join("");
    }
    case "Contains Substring 11": {
      const len = rand(3, 7);
      let s = "";
      for (let i = 0; i < len; i++) s += randEl(["0", "1"]);
      const pos = rand(0, s.length - 2);
      // Ensure "11" is planted
      s = s.substring(0, pos) + "11" + s.substring(pos + 2);
      return s;
    }
    case "Ends With 101": {
      const len = rand(1, 5);
      let s = "";
      for (let i = 0; i < len; i++) s += randEl(["0", "1"]);
      return s + "101";
    }
    case "Replace All 0s with 1s":
    case "Tape Eraser": {
      const len = rand(4, 8);
      let s = "";
      for (let i = 0; i < len; i++) s += randEl(["0", "1"]);
      return s;
    }
    case "Multiples of 3 in Binary": {
      const multiples = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30];
      return randEl(multiples).toString(2);
    }
    default: {
      // Custom / unmapped machines fallback to a short basic 0/1 string
      const len = rand(3, 6);
      let s = "";
      for (let i = 0; i < len; i++) s += randEl(["0", "1"]);
      return s;
    }
  }
}
