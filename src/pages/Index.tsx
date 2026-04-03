import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import {
  Cpu,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowLeftRight,
  PlusSquare,
  Hash,
  Layers,
  Binary,
  Plus,
  Github
} from "lucide-react";
import type {
  TuringMachineDefinition,
  TMExecutionState,
  TMStatus,
} from "@/utils/tm-types";
import {
  validateTM,
  validateInput,
  validateTMStructure,
  initExecution,
  stepExecution,
} from "@/utils/tm-engine";
import { TM_EXAMPLES, type TMExample } from "@/data/examples";
import TapeView from "@/components/TapeView";
import TransitionTable from "@/components/TransitionTable";
import MachineEditor from "@/components/MachineEditor";
import ControlPanel from "@/components/ControlPanel";
import ExecutionHistory from "@/components/ExecutionHistory";
import ThemeToggle from "@/components/ThemeToggle";

const IconMap: Record<string, React.ElementType> = {
  ArrowLeftRight,
  PlusSquare,
  Binary,
  Hash,
  Layers,
};

const topMachines = TM_EXAMPLES.slice(0, 4);
const extraMachines = TM_EXAMPLES.slice(4);

const Index = () => {
  const [activeExampleName, setActiveExampleName] = useState<string>(
    TM_EXAMPLES[0].name
  );
  const [machine, setMachine] = useState<TuringMachineDefinition>(
    TM_EXAMPLES[0].machine
  );
  const [inputString, setInputString] = useState(TM_EXAMPLES[0].sampleInput);
  const [execution, setExecution] = useState<TMExecutionState | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [inputError, setInputError] = useState<string | null>(null);
  const [speed, setSpeed] = useState(100);
  const [maxSteps, setMaxSteps] = useState(1000);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const runIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const simulatorRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Create a dynamic default snapshot that matches the current input
  const dynamicDefaultSnapshot = {
    state: machine.startState,
    tape: ["$", ...(inputString ? inputString.split("") : []), machine.blank],
    headPosition: 1,
    stepCount: 0,
  };

  const status: TMStatus = execution?.status ?? "idle";
  const current = execution?.current ?? dynamicDefaultSnapshot;
  const history = execution?.history ?? [dynamicDefaultSnapshot];

  const currentPlaceholder = `e.g. "${
    activeExampleName === "Custom Machine"
      ? "10101"
      : TM_EXAMPLES.find((e) => e.name === activeExampleName)?.sampleInput || ""
  }"`;

  useEffect(() => {
    return () => {
      if (runIntervalRef.current) clearInterval(runIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    // Reset execution when input or machine changes to keep tape visually in sync
    setExecution(null);
    setIsRunning(false);
    setIsPaused(false);
    if (inputString) {
      const err = validateInput(machine, inputString);
      setInputError(err);
    } else {
      setInputError(null);
    }
  }, [inputString, machine]);

  const initRun = useCallback((): TMExecutionState | null => {
    const errs = validateTM(machine);
    if (errs.length > 0) {
      setErrors(errs.map((e) => `${e.field}: ${e.message}`));
      toast.error("Invalid machine definition. Check errors below.");
      return null;
    }

    const inputErr = validateInput(machine, inputString);
    if (inputErr) {
      setInputError(inputErr);
      toast.error(inputErr);
      return null;
    }

    setErrors([]);
    const exec = initExecution(machine, inputString);
    setExecution(exec);
    return exec;
  }, [machine, inputString]);

  const handleStep = useCallback(() => {
    let exec = execution;
    if (!exec || exec.status !== "running") {
      exec = initRun();
      if (!exec) return;
    }
    const next = stepExecution(machine, exec, maxSteps);
    setExecution(next);
    if (next.status !== "running") {
      toast(
        next.status === "accepted"
          ? "✓ Machine accepted the input!"
          : next.status === "rejected"
            ? "✗ Machine rejected the input."
            : next.status === "error"
              ? "⚠ Error: Machine attempted illegal move (left of $)."
              : next.status === "infinite-loop"
                ? "⚠ Infinite loop detected! Configuration repeated."
                : "⚠ Halted — step limit reached."
      );
    }
  }, [execution, initRun, machine, maxSteps]);

  const handleRun = useCallback(() => {
    if (isPaused) {
      setIsPaused(false);
      setIsRunning(true);
      return;
    }
    let exec = execution;
    if (!exec || exec.status !== "running") {
      exec = initRun();
      if (!exec) return;
    }
    setIsRunning(true);
    setIsPaused(false);
  }, [execution, initRun, isPaused]);

  useEffect(() => {
    if (isRunning && !isPaused) {
      runIntervalRef.current = setInterval(() => {
        setExecution((prev) => {
          if (!prev || prev.status !== "running") {
            setIsRunning(false);
            if (runIntervalRef.current) clearInterval(runIntervalRef.current);
            if (prev && prev.status !== "running") {
              toast(
                prev.status === "accepted"
                  ? "✓ Machine accepted the input!"
                  : prev.status === "rejected"
                    ? "✗ Machine rejected the input."
                    : prev.status === "error"
                      ? "⚠ Error: Machine attempted illegal move (left of $)."
                      : prev.status === "infinite-loop"
                        ? "⚠ Infinite loop detected! Configuration repeated."
                        : "⚠ Halted — step limit reached."
              );
            }
            return prev;
          }
          return stepExecution(machine, prev, maxSteps);
        });
      }, speed);
    }
    return () => {
      if (runIntervalRef.current) clearInterval(runIntervalRef.current);
    };
  }, [isRunning, isPaused, machine, speed, maxSteps]);

  const handlePause = useCallback(() => {
    setIsPaused(true);
    setIsRunning(false);
  }, []);

  const handleReset = useCallback(() => {
    setExecution(null);
    setIsRunning(false);
    setIsPaused(false);
    setErrors([]);
  }, []);

  const handleClear = useCallback(() => {
    setInputString("");
    setExecution(null);
    setIsRunning(false);
    setIsPaused(false);
    setErrors([]);
  }, []);

  const handleLoadExample = useCallback(
    (example: TMExample) => {
      handleReset();
      setMachine(example.machine);
      setInputString(example.sampleInput);
      setActiveExampleName(example.name);
      toast.success(`Loaded: ${example.name}`);
      setTimeout(() => {
        simulatorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    },
    [handleReset]
  );

  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleCustomMachine = useCallback(() => {
    handleReset();
    setActiveExampleName("Custom Machine");
    setMachine({
      states: ["q0", "q_accept", "q_reject"],
      inputAlphabet: ["0", "1"],
      tapeAlphabet: ["0", "1", "$", "_"],
      blank: "_",
      startState: "q0",
      acceptStates: ["q_accept"],
      rejectStates: ["q_reject"],
      transitions: {},
    });
    setInputString("");
    setShowAdvanced(true);
    toast.success("Ready for custom machine definition!");
    setTimeout(() => {
      document.getElementById("advanced-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, [handleReset]);

  const handleExport = useCallback(() => {
    const bundle = {
      name: activeExampleName || "TM Explorer Machine",
      machine,
      sampleInput: inputString,
    };
    const json = JSON.stringify(bundle, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "turing-machine.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Machine exported as JSON!");
  }, [machine, inputString, activeExampleName]);

  const handleImport = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target?.result as string);
          const result = validateTMStructure(parsed);

          if (!result.valid || !result.machine) {
            toast.error(`Import failed: ${result.errors.join("; ")}`);
            return;
          }

          const tmErrors = validateTM(result.machine);
          if (tmErrors.length > 0) {
            setErrors(tmErrors.map((err) => `${err.field}: ${err.message}`));
            toast.warning("Imported with warnings. Check validation errors.");
          } else {
            setErrors([]);
          }

          handleReset();
          setMachine(result.machine);
          if (result.input) setInputString(result.input);
          setActiveExampleName(parsed.name || "Custom Imported Machine");
          toast.success("Machine imported successfully!");
        } catch {
          toast.error("Invalid JSON file. Could not parse.");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [handleReset]);

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">
                TM Explorer
              </h1>
              <p className="text-[11px] text-muted-foreground -mt-0.5">
                Interactive Turing Machine Simulator
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl flex-grow">
        {/* Choose a Machine Section */}
        <section className="mb-10 animate-fade-in w-full max-w-full">
          <h2 className="text-sm font-bold text-foreground tracking-wider mb-4">
            Choose a Machine
          </h2>
          {/* Main 4 machines grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {topMachines.map((ex) => {
              const Icon = ex.iconName ? IconMap[ex.iconName] || Cpu : Cpu;
              const isSelected = activeExampleName === ex.name;

              return (
                <button
                  key={ex.name}
                  onClick={() => handleLoadExample(ex)}
                  className={`
                    flex flex-col text-left p-5 rounded-xl border transition-all duration-300 group relative overflow-hidden
                    ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-[0_0_15px_rgba(var(--primary),0.15)] ring-1 ring-primary"
                        : "border-border bg-card hover:border-primary/50 hover:bg-secondary/40"
                    }
                  `}
                >
                  {isSelected && (
                    <div className="absolute top-4 right-4 flex items-center justify-center" aria-label="Selected">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-2 pr-8">
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground group-hover:text-primary transition-colors"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div
                      className={`font-semibold ${
                        isSelected ? "text-primary" : "text-foreground group-hover:text-primary transition-colors"
                      }`}
                    >
                      {ex.name}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mb-3 flex-grow line-clamp-2">
                    {ex.description}
                  </div>
                  <div className="text-[10px] font-mono text-muted-foreground/80 bg-secondary/70 px-2 py-1 rounded w-fit">
                    Sample: "{ex.sampleInput}"
                  </div>
                </button>
              );
            })}
          </div>

          {/* More Machines Horizontal Carousel */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
              More Machines
            </h3>
            
            <div className="relative group">
              <button 
                onClick={() => scrollCarousel("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 -ml-5 z-10 hidden sm:flex p-2 rounded-full bg-background border border-border shadow-md text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all opacity-0 group-hover:opacity-100"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => scrollCarousel("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 -mr-5 z-10 hidden sm:flex p-2 rounded-full bg-background border border-border shadow-md text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all opacity-0 group-hover:opacity-100"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <div 
                ref={carouselRef}
                className="flex overflow-x-auto snap-x no-scrollbar gap-3 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 pr-8 sm:pr-12"
              >
              {extraMachines.map((ex) => {
                const Icon = ex.iconName ? IconMap[ex.iconName] || Cpu : Cpu;
                const isSelected = activeExampleName === ex.name;

                return (
                  <button
                    key={ex.name}
                    onClick={() => handleLoadExample(ex)}
                    className={`
                      relative snap-start shrink-0 w-64 flex flex-col text-left p-4 rounded-xl border transition-all duration-300 group
                      ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border bg-card hover:border-primary/40 hover:bg-secondary/30"
                      }
                    `}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 flex items-center justify-center">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-2 pr-6">
                      <div className={`p-1.5 rounded-md ${isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className={`font-semibold text-sm truncate ${isSelected ? "text-primary" : "text-foreground"}`}>
                        {ex.name}
                      </div>
                    </div>
                    <div className="text-[11px] text-muted-foreground line-clamp-2 mb-3 h-8">
                      {ex.description}
                    </div>
                    <div className="text-[9px] font-mono text-muted-foreground/80 bg-secondary/70 px-1.5 py-0.5 rounded w-fit mt-auto">
                      Sample: "{ex.sampleInput}"
                    </div>
                  </button>
                );
              })}

              {/* Custom Machine Card */}
              <button
                onClick={handleCustomMachine}
                className={`
                  snap-start shrink-0 w-64 flex flex-col text-left p-4 rounded-xl border border-dashed transition-all duration-300 group
                  ${activeExampleName === "Custom Machine" ? "border-primary bg-primary/5" : "border-border hover:border-primary hover:bg-secondary/20"}
                `}
              >
                <div className="flex items-center justify-center h-full w-full py-4 flex-col gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors text-muted-foreground">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div className="font-semibold text-sm text-center">Custom Machine</div>
                  <div className="text-[11px] text-muted-foreground text-center">
                    Create from scratch
                  </div>
                </div>
              </button>

              {/* Safari scroll padding fix */}
              <div className="shrink-0 w-4 sm:w-8" aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>

        {/* Simulator Section */}
        <section ref={simulatorRef} className="scroll-mt-24">
          <h2 className="text-lg font-bold text-foreground tracking-tight mb-4 flex items-center gap-2">
            Simulator
            <span className="text-sm font-normal text-muted-foreground">
              — Currently Loaded: {activeExampleName || "Custom Machine"}
            </span>
          </h2>

          {errors.length > 0 && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 animate-slide-in">
              <h4 className="text-sm font-semibold text-destructive mb-1">
                Validation Errors
              </h4>
              {errors.map((err, i) => (
                <div key={i} className="text-xs text-destructive/80">
                  • {err}
                </div>
              ))}
            </div>
          )}

          <div className="space-y-4">
            {/* Tape Visualization */}
            <div className="p-5 rounded-xl bg-card border border-border shadow-sm overflow-hidden">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 text-center">
                Tape
              </h3>
              <TapeView
                tape={current.tape}
                headPosition={current.headPosition}
                status={status}
              />
            </div>

            {/* Controls */}
            <div className="p-5 rounded-xl bg-card border border-border shadow-sm">
              <ControlPanel
                onRun={handleRun}
                onStep={handleStep}
                onPause={handlePause}
                onReset={handleReset}
                onClear={handleClear}
                onImport={handleImport}
                onExport={handleExport}
                isRunning={isRunning}
                isPaused={isPaused}
                status={status}
                inputValue={inputString}
                onInputChange={setInputString}
                placeholder={currentPlaceholder}
                speed={speed}
                onSpeedChange={setSpeed}
                maxSteps={maxSteps}
                onMaxStepsChange={setMaxSteps}
                inputError={inputError}
              />
            </div>

            {/* Execution History */}
            <div className="p-5 rounded-xl bg-card border border-border shadow-sm">
              <ExecutionHistory
                current={current}
                history={history}
                status={status}
              />
            </div>

            {/* Advanced Machine Definition */}
            <div id="advanced-section" className="mt-8 border border-border rounded-xl bg-card shadow-sm scroll-mt-24 transition-all duration-500 overflow-visible relative">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full relative z-10 flex items-center justify-between p-4 hover:bg-secondary/40 transition-colors bg-card rounded-xl"
              >
                <div className="font-semibold text-sm">Show Advanced Machine Definition</div>
                {showAdvanced ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </button>

              <div className={`
                transition-all duration-300 ease-in-out border-t border-border bg-background/50 origin-top
                ${showAdvanced ? 'opacity-100 max-h-[5000px] py-5 px-5 block' : 'opacity-0 max-h-0 py-0 px-5 hidden border-none'}
              `}>
                <div className="space-y-6">
                  <MachineEditor machine={machine} onChange={setMachine} />
                  <TransitionTable machine={machine} onChange={setMachine} />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6 bg-card/50">
        <div className="container mx-auto px-4 text-center flex flex-col items-center gap-2">
          <div className="text-sm font-medium text-muted-foreground">
            TM Explorer — Built for Theory of Computation
          </div>
          <a
            href="https://github.com/shaazil/tm-explorer"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-muted-foreground/70 hover:text-primary transition-colors duration-300 group"
          >
            <Github className="w-3.5 h-3.5 group-hover:drop-shadow-[0_0_8px_rgba(var(--primary),0.5)] transition-all" />
            <span className="group-hover:underline underline-offset-2">View Source on GitHub</span>
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Index;
