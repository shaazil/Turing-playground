import { memo, useRef, useEffect } from "react";

interface TapeViewProps {
  tape: string[];
  headPosition: number;
  status: string;
}

const TapeView = memo(({ tape, headPosition, status }: TapeViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const headCellRef = useRef<HTMLDivElement>(null);

  // Hide the $ marker at index 0 if it exists
  const isLeftBound = tape[0] === "$";
  const virtualTape = isLeftBound ? tape.slice(1) : tape;
  const virtualHead = isLeftBound ? Math.max(0, headPosition - 1) : headPosition;

  // Pad tape so there are visible blank cells around
  const displayTape = [...virtualTape];
  const padRight = Math.max(3, virtualHead + 4 - displayTape.length);
  for (let i = 0; i < padRight; i++) displayTape.push("_");
  // Ensure at least 2 cells before head position exist
  const padLeft = Math.max(0, 2 - virtualHead);
  for (let i = 0; i < padLeft; i++) displayTape.unshift("_");
  const adjustedHead = virtualHead + padLeft;

  // Auto-scroll to keep head visible
  useEffect(() => {
    if (headCellRef.current && containerRef.current) {
      const cell = headCellRef.current;
      const container = containerRef.current;
      const cellLeft = cell.offsetLeft;
      const cellWidth = cell.offsetWidth;
      const containerWidth = container.clientWidth;
      const scrollTarget = cellLeft - containerWidth / 2 + cellWidth / 2;
      container.scrollTo({ left: scrollTarget, behavior: "smooth" });
    }
  }, [headPosition, tape]);

  const glowClass =
    status === "accepted"
      ? "glow-success"
      : status === "rejected"
        ? "glow-destructive"
        : status === "halted"
          ? "glow-warning"
          : status === "running"
            ? "glow-primary"
            : "";

  const headBorderClass =
    status === "accepted"
      ? "ring-2 ring-success"
      : status === "rejected"
        ? "ring-2 ring-destructive"
        : status === "halted"
          ? "ring-2 ring-warning"
          : "ring-2 ring-primary";

  return (
    <div ref={containerRef} className="w-full overflow-x-auto pb-2 scroll-smooth">
      <div className="flex items-end gap-px min-w-fit mx-auto justify-center py-2">
        {displayTape.map((symbol, i) => {
          const isHead = i === adjustedHead;
          return (
            <div
              key={`${i}-${symbol}`}
              ref={isHead ? headCellRef : undefined}
              className="flex flex-col items-center"
            >
              {/* Head indicator */}
              {isHead && (
                <div className="mb-1.5 animate-head-bounce">
                  <svg width="14" height="8" viewBox="0 0 14 8" className="text-primary drop-shadow-lg">
                    <polygon points="7,8 0,0 14,0" fill="currentColor" />
                  </svg>
                </div>
              )}
              {/* Cell */}
              <div
                className={`
                  w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center
                  font-mono text-sm sm:text-base font-semibold
                  transition-all duration-300 ease-out select-none
                  ${isHead
                    ? `bg-primary text-primary-foreground ${glowClass} ${headBorderClass} scale-110 z-10 rounded-lg shadow-lg`
                    : "bg-tape-cell text-foreground border border-tape-border rounded-md hover:bg-secondary/60"
                  }
                `}
              >
                {symbol === "_" ? (
                  <span className={isHead ? "opacity-70" : "opacity-30"}>␣</span>
                ) : (
                  symbol
                )}
              </div>
              {/* Index label */}
              <span className={`text-[9px] mt-1 font-mono ${isHead ? "text-primary font-bold" : "text-muted-foreground/60"}`}>
                {i - padLeft}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

TapeView.displayName = "TapeView";
export default TapeView;
