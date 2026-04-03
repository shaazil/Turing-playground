import type { TMSnapshot, TMStatus } from "@/utils/tm-types";
import { useRef, useEffect } from "react";

interface ExecutionHistoryProps {
  current: TMSnapshot;
  history: TMSnapshot[];
  status: TMStatus;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  idle: { label: "IDLE", className: "bg-muted text-muted-foreground" },
  running: { label: "RUNNING", className: "bg-primary/20 text-primary animate-pulse" },
  accepted: { label: "ACCEPTED", className: "bg-success/20 text-success" },
  rejected: { label: "REJECTED", className: "bg-destructive/20 text-destructive" },
  halted: { label: "HALTED", className: "bg-warning/20 text-warning" },
  error: { label: "ERROR", className: "bg-destructive/10 text-destructive border border-destructive/30" },
  "infinite-loop": { label: "INFINITE LOOP", className: "bg-destructive/10 text-destructive border border-destructive/30" },
};

const ExecutionHistory = ({ current, history, status }: ExecutionHistoryProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll history to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history.length]);

  const { label, className } = statusConfig[status] || statusConfig.idle;

  return (
    <div className="space-y-4">
      {/* Status badge */}
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold font-mono tracking-wide ${className}`}>
          {label}
        </span>
        <span className="text-xs text-muted-foreground">
          Step {current.stepCount}
        </span>
      </div>

      {/* Current state info */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <InfoCell label="Current State" value={current.state} highlight />
        <InfoCell label="Head Position" value={String(current.headPosition)} />
        <InfoCell label="Step Count" value={String(current.stepCount)} />
        <InfoCell label="Tape Length" value={String(current.tape.length)} />
      </div>

      {/* Instantaneous Description */}
      <div>
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
          Instantaneous Description
        </h4>
        <div className="font-mono text-xs bg-secondary/50 rounded-lg px-3 py-2.5 text-secondary-foreground break-all border border-border/50">
          ({current.state}, &quot;{current.tape.join("")}&quot;, {current.headPosition})
        </div>
      </div>

      {/* Tape contents */}
      <div>
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
          Tape Contents
        </h4>
        <div className="font-mono text-xs bg-secondary/50 rounded-lg px-3 py-2.5 text-secondary-foreground break-all border border-border/50">
          {current.tape.map((s, i) => (
            <span
              key={i}
              className={
                i === current.headPosition
                  ? "text-primary font-bold bg-primary/10 rounded px-0.5"
                  : ""
              }
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* History */}
      <div>
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
          Execution History
          <span className="text-muted-foreground/60 ml-1 normal-case">
            ({history.length} {history.length === 1 ? "entry" : "entries"})
          </span>
        </h4>
        <div
          ref={scrollRef}
          className="h-52 overflow-y-auto rounded-lg border border-border bg-secondary/30"
        >
          <div className="p-1.5 space-y-px">
            {history.map((snap, i) => (
              <div
                key={i}
                className={`
                  font-mono text-[11px] px-2 py-1 rounded
                  transition-colors duration-150
                  ${i === history.length - 1
                    ? "bg-primary/10 text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }
                `}
              >
                <span className="text-primary/60 mr-1">{i}.</span>
                <span className="text-primary font-semibold">{snap.state}</span>
                <span className="mx-1 opacity-40">→</span>
                <span>pos={snap.headPosition}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

function InfoCell({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-secondary/50 rounded-lg px-3 py-2 border border-border/50">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
        {label}
      </div>
      <div
        className={`font-mono text-sm font-semibold mt-0.5 ${
          highlight ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

export default ExecutionHistory;
