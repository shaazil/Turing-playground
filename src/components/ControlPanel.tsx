import {
  Play,
  SkipForward,
  Pause,
  RotateCcw,
  Upload,
  Download,
  Gauge,
  AlertCircle,
  Eraser,
} from "lucide-react";

interface ControlPanelProps {
  onRun: () => void;
  onStep: () => void;
  onPause: () => void;
  onReset: () => void;
  onClear: () => void;
  onImport: () => void;
  onExport: () => void;
  isRunning: boolean;
  isPaused: boolean;
  status: string;
  inputValue: string;
  onInputChange: (v: string) => void;
  placeholder?: string;
  speed: number;
  onSpeedChange: (v: number) => void;
  maxSteps: number;
  onMaxStepsChange: (v: number) => void;
  inputError: string | null;
  alwaysHalts?: boolean;
}

const ControlPanel = ({
  onRun,
  onStep,
  onPause,
  onReset,
  onClear,
  onImport,
  onExport,
  isRunning,
  isPaused,
  status,
  inputValue,
  onInputChange,
  placeholder,
  speed,
  onSpeedChange,
  maxSteps,
  onMaxStepsChange,
  inputError,
  alwaysHalts = true,
}: ControlPanelProps) => {
  const isDone =
    status === "accepted" || status === "rejected" || status === "halted";

  return (
    <div className="space-y-4">
      {/* Input string */}
      <div>
        <label
          htmlFor="tm-input"
          className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
        >
          Input String
        </label>
        <input
          id="tm-input"
          type="text"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={placeholder || 'e.g. "1001"'}
          disabled={isRunning}
          className={`
            mt-1 w-full px-3 py-2.5 rounded-lg bg-secondary text-secondary-foreground
            border font-mono text-sm
            focus:outline-none focus:ring-2 focus:ring-ring
            disabled:opacity-50 transition-all duration-200
            placeholder:text-muted-foreground/50
            ${inputError ? "border-destructive focus:ring-destructive" : "border-border"}
          `}
        />
        {inputError && (
          <div className="flex items-center gap-1.5 mt-1.5 text-destructive animate-fade-in">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
            <span className="text-xs">{inputError}</span>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onRun}
          disabled={isRunning && !isPaused}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <Play className="w-4 h-4" />
          {isPaused ? "Resume" : isDone ? "Re-run" : "Run"}
        </button>

        <button
          onClick={onStep}
          disabled={isRunning}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
        >
          <SkipForward className="w-4 h-4" />
          Step
        </button>

        <button
          onClick={onPause}
          disabled={!isRunning}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
        >
          <Pause className="w-4 h-4" />
          Pause
        </button>

        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-all duration-200"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>

        <button
          onClick={onClear}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
        >
          <Eraser className="w-4 h-4" />
          Clear
        </button>

        <div className="flex-1" />

        <button
          onClick={onImport}
          className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg border border-border text-muted-foreground text-xs font-medium hover:text-foreground hover:bg-secondary/50 transition-all duration-200"
        >
          <Upload className="w-3.5 h-3.5" />
          Import
        </button>
        <button
          onClick={onExport}
          className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg border border-border text-muted-foreground text-xs font-medium hover:text-foreground hover:bg-secondary/50 transition-all duration-200"
        >
          <Download className="w-3.5 h-3.5" />
          Export
        </button>
      </div>

      {/* Speed + Max Steps */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="speed-slider"
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium uppercase tracking-wider mb-1"
          >
            <Gauge className="w-3 h-3" />
            Speed: {speed}ms
          </label>
          <input
            id="speed-slider"
            type="range"
            min="10"
            max="500"
            step="10"
            value={speed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none bg-secondary cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-[9px] text-muted-foreground/60 mt-0.5">
            <span>Fast</span>
            <span>Slow</span>
          </div>
        </div>
        <div>
          <label
            htmlFor="max-steps"
            className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider block mb-1"
          >
            Max Steps
          </label>
          <input
            id="max-steps"
            type="number"
            min="10"
            max="100000"
            value={maxSteps}
            onChange={(e) =>
              onMaxStepsChange(Math.max(10, Number(e.target.value) || 1000))
            }
            className="w-full px-2.5 py-1.5 rounded-md bg-secondary text-secondary-foreground border border-border font-mono text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {/* Status indicator */}
      {status !== "idle" && (
        <div className="space-y-2 animate-scale-in">
          <div
            className={`
            text-sm font-mono px-4 py-2.5 rounded-lg text-center font-semibold
            ${status === "accepted" ? "bg-success/15 text-success border border-success/30" : ""}
            ${status === "rejected" ? "bg-destructive/15 text-destructive border border-destructive/30" : ""}
            ${status === "halted" ? "bg-warning/15 text-warning border border-warning/30" : ""}
            ${status === "error" || status === "infinite-loop" ? "bg-destructive/15 text-destructive border border-destructive/30" : ""}
            ${status === "running" ? "bg-primary/15 text-primary border border-primary/30 animate-pulse-glow" : ""}
          `}
          >
            {status === "accepted" && "✓ ACCEPTED"}
            {status === "rejected" && "✗ REJECTED"}
            {status === "halted" && "⚠ HALTED — step limit reached"}
            {status === "error" && "⚠ ERROR — illegal move (left of $)"}
            {status === "infinite-loop" && "⚠ Non-halting Loop Detected"}
            {status === "running" && "● RUNNING..."}
          </div>

          <div className="flex justify-center flex-wrap gap-2">
            {alwaysHalts ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                Always Halts → Recursive Language
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                May Not Halt → Recursively Enumerable Language
              </span>
            )}
            
            {status === "infinite-loop" && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                May Not Halt → Recursively Enumerable Language
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlPanel;
