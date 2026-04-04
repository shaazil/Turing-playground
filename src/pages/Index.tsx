import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import {
  Cpu,
  ChevronDown,
  ChevronUp,
  Menu,
  Wand2,
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
import { generateRandomValidInput } from "@/utils/inputGenerator";
import TapeView from "@/components/TapeView";
import TransitionTable from "@/components/TransitionTable";
import MachineEditor from "@/components/MachineEditor";
import ControlPanel from "@/components/ControlPanel";
import ExecutionHistory from "@/components/ExecutionHistory";
import ThemeToggle from "@/components/ThemeToggle";
import StateGraph from "@/components/StateGraph";
import StepExplanation from "@/components/StepExplanation";
import ExecutionTimeline from "@/components/ExecutionTimeline";
import Sidebar from "@/components/Sidebar";

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
  const [timelineIndex, setTimelineIndex] = useState<number>(-1);

  // New states for Sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("tm-favorites") || "[]"); } catch { return []; }
  });
  const [recent, setRecent] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("tm-recent") || "[]"); } catch { return []; }
  });

  const runIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const advancedSectionRef = useRef<HTMLDivElement>(null);

  const toggleFavorite = useCallback((name: string) => {
    setFavorites((prev) => {
      const next = prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name];
      localStorage.setItem("tm-favorites", JSON.stringify(next));
      return next;
    });
  }, []);

  const addToRecent = useCallback((name: string) => {
    if (name === "Custom Machine" || !TM_EXAMPLES.find(e => e.name === name)) return;
    setRecent((prev) => {
      const next = [name, ...prev.filter((n) => n !== name)].slice(0, 3);
      localStorage.setItem("tm-recent", JSON.stringify(next));
      return next;
    });
  }, []);

  const dynamicDefaultSnapshot = {
    state: machine.startState,
    tape: ["$", ...(inputString ? inputString.split("") : []), machine.blank],
    headPosition: 1,
    stepCount: 0,
  };

  const history = execution?.history ?? [dynamicDefaultSnapshot];
  const activeStepIndex = timelineIndex >= 0 && timelineIndex < history.length ? timelineIndex : history.length - 1;
  const current = history[activeStepIndex];
  const status: TMStatus = (timelineIndex >= 0 && timelineIndex < history.length - 1) ? "running" : (execution?.status ?? "idle");
  const previousSnapshot = activeStepIndex > 0 ? history[activeStepIndex - 1] : undefined;

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
    setExecution(null);
    setIsRunning(false);
    setIsPaused(false);
    setTimelineIndex(-1);
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

  const handleScrub = useCallback((index: number) => {
    setTimelineIndex(index);
    if (isRunning) {
      setIsPaused(true);
      setIsRunning(false);
    }
  }, [isRunning]);

  const handlePrevious = useCallback(() => {
    if (activeStepIndex > 0) handleScrub(activeStepIndex - 1);
  }, [activeStepIndex, handleScrub]);

  const handleNext = useCallback(() => {
    if (activeStepIndex < history.length - 1) handleScrub(activeStepIndex + 1);
  }, [activeStepIndex, history.length, handleScrub]);

  const handleReplay = useCallback(() => {
    if (!execution) return;
    const newHistory = execution.history.slice(0, activeStepIndex + 1);
    const newExec: TMExecutionState = {
      ...execution,
      history: newHistory,
      current: newHistory[newHistory.length - 1],
      status: "running",
    };
    setExecution(newExec);
    setTimelineIndex(-1);
    setIsRunning(true);
    setIsPaused(false);
  }, [execution, activeStepIndex]);

  const getActiveExecution = useCallback((): TMExecutionState | null => {
    if (!execution) return null;
    if (timelineIndex >= 0 && timelineIndex < execution.history.length - 1) {
      const newHistory = execution.history.slice(0, timelineIndex + 1);
      return {
        ...execution,
        history: newHistory,
        current: newHistory[newHistory.length - 1],
        status: "running"
      };
    }
    return execution;
  }, [execution, timelineIndex]);

  const handleStep = useCallback(() => {
    let exec = getActiveExecution();
    const isResume = timelineIndex >= 0 && timelineIndex < (execution?.history.length ?? 0) - 1;
    if (!exec || (exec.status !== "running" && !isResume)) {
      exec = initRun();
      if (!exec) return;
    }
    const next = stepExecution(machine, exec, maxSteps, activeExampleName);
    setExecution(next);
    setTimelineIndex(-1);
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
  }, [execution, getActiveExecution, timelineIndex, initRun, machine, maxSteps, activeExampleName]);

  const handleRun = useCallback(() => {
    if (isPaused) {
      if (timelineIndex >= 0) {
        handleReplay();
        return;
      }
      setIsPaused(false);
      setIsRunning(true);
      return;
    }
    let exec = getActiveExecution();
    const isResume = timelineIndex >= 0 && timelineIndex < (execution?.history.length ?? 0) - 1;
    if (!exec || (exec.status !== "running" && !isResume)) {
      exec = initRun();
      if (!exec) return;
    }
    if (isResume) {
      handleReplay();
      return;
    }
    setIsRunning(true);
    setIsPaused(false);
  }, [execution, getActiveExecution, initRun, isPaused, handleReplay, timelineIndex]);

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
          return stepExecution(machine, prev, maxSteps, activeExampleName);
        });
      }, speed);
    }
    return () => {
      if (runIntervalRef.current) clearInterval(runIntervalRef.current);
    };
  }, [isRunning, isPaused, machine, speed, maxSteps, activeExampleName]);

  const handlePause = useCallback(() => {
    setIsPaused(true);
    setIsRunning(false);
  }, []);

  const handleReset = useCallback(() => {
    setExecution(null);
    setIsRunning(false);
    setIsPaused(false);
    setTimelineIndex(-1);
    setErrors([]);
  }, []);

  const handleClear = useCallback(() => {
    setInputString("");
    setExecution(null);
    setIsRunning(false);
    setIsPaused(false);
    setTimelineIndex(-1);
    setErrors([]);
  }, []);

  const handleSelectMachine = useCallback(
    (example: TMExample | "Custom Machine") => {
      handleReset();
      if (example === "Custom Machine") {
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
        toast.success("Ready for custom machine definition!");
      } else {
        setMachine(example.machine);
        setInputString(example.sampleInput);
        setActiveExampleName(example.name);
        addToRecent(example.name);
        toast.success(`Loaded: ${example.name}`);
      }
    },
    [handleReset, addToRecent]
  );

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
          const importedName = parsed.name || "Custom Imported Machine";
          setActiveExampleName(importedName);
          if (importedName !== "Custom Imported Machine") {
            addToRecent(importedName);
          }
          toast.success("Machine imported successfully!");
        } catch {
          toast.error("Invalid JSON file. Could not parse.");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [handleReset, addToRecent]);

  const handleGenerateInput = () => {
    const string = generateRandomValidInput(activeExampleName);
    setInputString(string);
    setExecution(null);
    setTimelineIndex(-1);
    toast("Generated random input!");
  };

  const handleOpenAdvanced = () => {
    setShowAdvanced(true);
    setTimeout(() => {
      advancedSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden selection:bg-cyan-500/30">
      
      <Sidebar
        activeExampleName={activeExampleName}
        onSelectMachine={handleSelectMachine}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
        recent={recent}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        executionStatus={status}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <header className="lg:hidden border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-4 py-3 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-1.5 rounded-md hover:bg-secondary active:scale-95 transition-all text-muted-foreground mr-1"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-cyan-400" />
            </div>
            <h1 className="text-base font-bold text-foreground">TM Explorer</h1>
          </div>
          <ThemeToggle />
        </header>

        {/* Main Simulator Area */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:p-6 lg:p-8 no-scrollbar scroll-smooth">
          <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-12">
            
            {/* Top Desktop Only controls matching nav */}
            <div className="hidden lg:flex items-center justify-end w-full mb-2">
              <ThemeToggle />
            </div>

            {/* Current Machine Header Card */}
            <div className="p-5 rounded-xl bg-card border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0 border border-cyan-500/20">
                  <Cpu className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="flex flex-col gap-1">
                  <h2 className="text-lg font-bold text-foreground leading-tight">
                    {activeExampleName}
                  </h2>
                  {activeExampleName === "Custom Machine" ? (
                    <p className="text-xs text-muted-foreground">
                      Create and test your own Turing Machine.
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {TM_EXAMPLES.find(e => e.name === activeExampleName)?.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-1 text-[10px] uppercase font-bold tracking-wider text-muted-foreground/70">
                    <span>{machine.states.length} states</span>
                    <span>•</span>
                    <span>{Object.values(machine.transitions).reduce((acc, obj) => acc + Object.keys(obj).length, 0)} transitions</span>
                  </div>
                </div>
              </div>

              {activeExampleName === "Custom Machine" ? (
                <button
                  onClick={handleOpenAdvanced}
                  className="w-full sm:w-auto px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg shadow-md hover:bg-primary/90 active:scale-95 transition-all text-center shrink-0"
                >
                  Open Advanced Editor
                </button>
              ) : (
                <button
                  onClick={handleGenerateInput}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-foreground text-sm font-semibold rounded-lg border border-border shadow-sm hover:bg-secondary/80 hover:border-cyan-500/30 active:scale-95 transition-all shrink-0"
                >
                  <Wand2 className="w-4 h-4 text-cyan-500" />
                  Generate Random Input
                </button>
              )}
            </div>

            {errors.length > 0 && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 animate-slide-in">
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

            {/* Machine State Graph */}
            <div className="p-5 rounded-xl bg-card border border-border shadow-sm overflow-hidden flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Machine State Graph
                </h3>
                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse" /> <span className="text-muted-foreground">Current State</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500" /> <span className="text-green-600 dark:text-green-400">Accept</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500" /> <span className="text-red-600 dark:text-red-400">Reject</span></div>
                </div>
              </div>
              <StateGraph
                machine={machine}
                currentSnapshot={current}
                previousSnapshot={previousSnapshot}
              />
            </div>

            {/* Step Explanation */}
            <StepExplanation
              currentSnapshot={current}
              status={status}
            />

            {/* Tape Visualization */}
            <div className="p-5 rounded-xl bg-card border border-border shadow-sm overflow-hidden flex flex-col gap-4">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">
                Tape
              </h3>
              <TapeView
                tape={current.tape}
                headPosition={current.headPosition}
                status={status}
              />
            </div>

            {/* Controls & Timeline */}
            <div className="flex flex-col gap-6">
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

              <ExecutionTimeline
                totalSteps={history.length}
                currentStepIndex={activeStepIndex}
                onScrub={handleScrub}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onReplay={handleReplay}
                isRunning={isRunning}
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
            <div ref={advancedSectionRef} id="advanced-section" className="border border-border rounded-xl bg-card shadow-sm scroll-mt-6 transition-all duration-500 overflow-visible relative">
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

          {/* Footer */}
          <footer className="mt-8 pb-8 pt-6 border-t border-border w-full flex flex-col items-center gap-2">
            <div className="text-xs font-medium text-muted-foreground shrink-0">
              TM Explorer — Built for Theory of Computation
            </div>
            <a
              href="https://github.com/shaazil/Turing-playground"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-muted-foreground/70 hover:text-cyan-500 transition-colors duration-300 group shrink-0"
            >
              <Github className="w-3.5 h-3.5 group-hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.5)] transition-all" />
              <span className="group-hover:underline underline-offset-2">View Source on GitHub</span>
            </a>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Index;
