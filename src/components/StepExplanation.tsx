import { BookOpen } from "lucide-react";
import { TMSnapshot, TMStatus } from "@/utils/tm-types";

interface StepExplanationProps {
  currentSnapshot: TMSnapshot;
  status: TMStatus;
}

export default function StepExplanation({ currentSnapshot, status }: StepExplanationProps) {
  let explanation = currentSnapshot.explanation;

  if (!explanation) {
    if (status === "idle") {
      explanation = "Press Step or Run to begin tracing the machine.";
    } else if (status === "accepted") {
      explanation = "Machine halted and Accepted the input!";
    } else if (status === "rejected") {
      explanation = "Machine halted and Rejected the input (no valid transition found, or reached a reject state).";
    } else if (status === "error") {
      explanation = "Machine encountered an error (e.g. attempted to move left off the tape).";
    } else if (status === "infinite-loop") {
      explanation = "Machine entered an infinite loop (repeated a previous configuration).";
    } else if (status === "halted") {
      explanation = "Machine stopped due to reaching the maximum step limit.";
    } else {
      explanation = "Ready for the next step.";
    }
  }

  return (
    <div className="p-4 sm:p-5 rounded-xl bg-card border border-border shadow-sm flex items-start gap-3">
      <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
        <BookOpen className="w-5 h-5" />
      </div>
      <div>
        <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 pt-1">
          Why did this step happen?
        </h3>
        <p className="text-sm font-medium text-foreground leading-relaxed">
          {explanation}
        </p>
      </div>
    </div>
  );
}
