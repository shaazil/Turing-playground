# TM Explorer

TM Explorer is an advanced, highly visual, fully interactive **Turing Machine Simulator** explicitly designed for Theory of Computation education.

Unlike simple algorithmic parsers, TM Explorer provides strict mathematical boundary integrity, deterministic infinite loop protections, and comprehensive step-by-step physical tape visualizations making computational abstractions instantly intuitive.

## ✨ Features

- **Strict Simulation Modeling:**
  - Mandatory `$`-bounded left margins eliminating unbounded memory crashes.
  - Snapshot history hashing to mathematically detect and safely halt **Infinite Loops** during cycles.
  - Explicit simulation statuses natively displaying acceptances, rejections, halts, and logic breaks.
- **Physical Tape Visualization:** Real-time fluid rendering of a virtual tape scanning frame natively updating character reads and transitions.
- **Interactive Control Dashboard:**
  - Auto-run slider tuning speed limits up and down during live execution.
  - Step-by-step manual execution.
  - Input injection resetting tape structures responsively.
- **Robust Built-in Examples Carousel:** Includes over 11 distinctly built, highly documented state machines:
  - Binary Palindrome Checker
  - Binary Incrementer & Unary Incrementer
  - *aⁿbⁿ* Recognizer
  - Parity Detectors (Even Number of 1s, Equal 0s and 1s)
  - String Modulo Mathematics (Multiples of 3 in Binary)
- **JSON Import / Export:** Define algorithms via custom blank matrices, and export your `.json` configurations inherently directly onto your file system.

## 🚀 Getting Started

Ensure you have Node.js installed, then clone the repository:

```bash
git clone https://github.com/shaazil/Turing-playground.git
cd Turing-playground
```

### Installation
Install all required package dependencies:

```bash
npm install
```

### Running Locally
To launch the Vite development server:
```bash
npm run dev
```

This will run the application locally (typically at `http://localhost:5173`).

## 🛠️ Tech Stack
- **Framework:** React + TypeScript
- **Tooling:** Vite
- **Styling:** Tailwind CSS + class-variance-authority (`cn` merging)
- **Icons:** Lucide-React
- **Notifications:** Sonner

## 📖 Architecture & Theory

This simulator adheres to the traditional standard Turing configuration utilizing explicit states $Q$, an input alphabet $\Sigma$, a strict tape alphabet $\Gamma$, transition functions $\delta$, and distinct terminating states (accept/reject axes). The tape is mathematically forced to bind at index $0$ explicitly using `$`. Any logical attempts written by developers instructing the head leftwards over the $0$ boundary triggers a protective `error` halt logic preserving browser thread pools seamlessly.
