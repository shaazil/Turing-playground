import { Play, SkipBack, SkipForward, Rewind } from "lucide-react";

interface ExecutionTimelineProps {
  totalSteps: number;
  currentStepIndex: number;
  onScrub: (index: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  onReplay: () => void;
  isRunning: boolean;
}

export default function ExecutionTimeline({
  totalSteps,
  currentStepIndex,
  onScrub,
  onPrevious,
  onNext,
  onReplay,
  isRunning,
}: ExecutionTimelineProps) {
  // If there's no history to scrub yet, don't interact
  const isDisabled = isRunning || totalSteps === 0;

  return (
    <div className="p-4 sm:p-5 rounded-xl bg-card border border-border shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
          Execution Timeline
        </h3>
        <div className="text-xs font-mono font-medium text-foreground bg-secondary/50 px-2 py-1 rounded">
          Step {totalSteps > 0 ? currentStepIndex : 0} / {totalSteps > 0 ? totalSteps - 1 : 0}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            title="Replay from here"
            onClick={onReplay}
            disabled={isDisabled}
            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Rewind className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-border mx-1" />
          <button
            title="Previous Step"
            onClick={onPrevious}
            disabled={isDisabled || currentStepIndex <= 0}
            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            title="Next Step"
            onClick={onNext}
            disabled={isDisabled || currentStepIndex >= totalSteps - 1}
            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        <input
          type="range"
          min={0}
          max={totalSteps > 0 ? totalSteps - 1 : 0}
          value={currentStepIndex}
          onChange={(e) => onScrub(Number(e.target.value))}
          disabled={isDisabled}
          className="w-full accent-primary h-2 bg-secondary rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
}
