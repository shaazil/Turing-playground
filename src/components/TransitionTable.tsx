import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { TuringMachineDefinition, Direction } from "@/utils/tm-types";

interface TransitionTableProps {
  machine: TuringMachineDefinition;
  onChange: (machine: TuringMachineDefinition) => void;
}

interface TransitionRow {
  fromState: string;
  readSymbol: string;
  toState: string;
  writeSymbol: string;
  direction: Direction;
}

interface EditableTransitionRow extends TransitionRow {
  id: string;
}

let rowIdCounter = 0;

function createRowId() {
  rowIdCounter += 1;
  return `transition-row-${rowIdCounter}`;
}

function toRows(tm: TuringMachineDefinition): EditableTransitionRow[] {
  const rows: EditableTransitionRow[] = [];
  for (const [fromState, symbolMap] of Object.entries(tm.transitions)) {
    for (const [readSymbol, [toState, writeSymbol, direction]] of Object.entries(
      symbolMap
    )) {
      rows.push({
        id: createRowId(),
        fromState,
        readSymbol,
        toState,
        writeSymbol,
        direction,
      });
    }
  }
  return rows;
}

function fromRows(
  rows: EditableTransitionRow[]
): TuringMachineDefinition["transitions"] {
  const t: TuringMachineDefinition["transitions"] = {};
  for (const { id: _id, ...r } of rows) {
    if (!t[r.fromState]) t[r.fromState] = {};
    t[r.fromState][r.readSymbol] = [r.toState, r.writeSymbol, r.direction];
  }
  return t;
}

function pickDefaultReadSymbol(
  rows: EditableTransitionRow[],
  fromState: string,
  tapeAlphabet: string[],
  blank: string
) {
  const used = new Set(
    rows.filter((row) => row.fromState === fromState).map((row) => row.readSymbol)
  );

  for (const symbol of tapeAlphabet) {
    if (!used.has(symbol)) return symbol;
  }

  if (blank && !used.has(blank)) return blank;

  const base = blank || tapeAlphabet[0] || "_";
  let candidate = base;
  let suffix = 1;
  while (used.has(candidate)) {
    candidate = `${base}${suffix}`;
    suffix += 1;
  }
  return candidate;
}

const TransitionTable = ({ machine, onChange }: TransitionTableProps) => {
  const [rows, setRows] = useState<EditableTransitionRow[]>(() => toRows(machine));
  const transitionsSignature = useMemo(
    () => JSON.stringify(machine.transitions),
    [machine.transitions]
  );
  const lastSerializedTransitionsRef = useRef(transitionsSignature);

  useEffect(() => {
    if (transitionsSignature === lastSerializedTransitionsRef.current) return;
    setRows(toRows(machine));
  }, [machine, transitionsSignature]);

  const commitRows = (nextRows: EditableTransitionRow[]) => {
    const nextTransitions = fromRows(nextRows);
    lastSerializedTransitionsRef.current = JSON.stringify(nextTransitions);
    onChange({ ...machine, transitions: nextTransitions });
  };

  const updateRow = (
    index: number,
    field: keyof TransitionRow,
    value: string
  ) => {
    setRows((prevRows) => {
      const nextRows = [...prevRows];
      nextRows[index] = { ...nextRows[index], [field]: value };
      commitRows(nextRows);
      return nextRows;
    });
  };

  const addRow = () => {
    setRows((prevRows) => {
      const defaultState = machine.startState || machine.states[0] || "q0";
      const defaultRead = pickDefaultReadSymbol(
        prevRows,
        defaultState,
        machine.tapeAlphabet,
        machine.blank
      );
      const defaultWrite = machine.tapeAlphabet[0] || machine.blank || "_";

      const nextRows = [
        ...prevRows,
        {
          id: createRowId(),
          fromState: defaultState,
          readSymbol: defaultRead,
          toState: defaultState,
          writeSymbol: defaultWrite,
          direction: "R",
        },
      ];
      commitRows(nextRows);
      return nextRows;
    });
  };

  const deleteRow = (index: number) => {
    setRows((prevRows) => {
      const nextRows = prevRows.filter((_, i) => i !== index);
      commitRows(nextRows);
      return nextRows;
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Transitions
          <span className="text-muted-foreground/60 ml-1 normal-case">
            ({rows.length})
          </span>
        </h3>
        <button
          onClick={addRow}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200"
        >
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-secondary/50 text-muted-foreground">
              <th className="px-2 py-2 text-left font-medium text-[11px] uppercase tracking-wider">
                State
              </th>
              <th className="px-2 py-2 text-left font-medium text-[11px] uppercase tracking-wider">
                Read
              </th>
              <th className="px-2 py-2 text-left font-medium text-[11px] uppercase tracking-wider">
                Next
              </th>
              <th className="px-2 py-2 text-left font-medium text-[11px] uppercase tracking-wider">
                Write
              </th>
              <th className="px-2 py-2 text-left font-medium text-[11px] uppercase tracking-wider">
                Dir
              </th>
              <th className="px-2 py-2 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-6 text-center text-muted-foreground text-xs"
                >
                  No transitions defined. Click &ldquo;Add&rdquo; to create one.
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr
                  key={row.id}
                  className="border-t border-border hover:bg-secondary/30 transition-colors duration-150"
                >
                  <td className="px-1 py-1">
                    <CellInput
                      value={row.fromState}
                      onChange={(v) => updateRow(i, "fromState", v)}
                    />
                  </td>
                  <td className="px-1 py-1">
                    <CellInput
                      value={row.readSymbol}
                      onChange={(v) => updateRow(i, "readSymbol", v)}
                    />
                  </td>
                  <td className="px-1 py-1">
                    <CellInput
                      value={row.toState}
                      onChange={(v) => updateRow(i, "toState", v)}
                    />
                  </td>
                  <td className="px-1 py-1">
                    <CellInput
                      value={row.writeSymbol}
                      onChange={(v) => updateRow(i, "writeSymbol", v)}
                    />
                  </td>
                  <td className="px-1 py-1">
                    <select
                      value={row.direction}
                      onChange={(e) => updateRow(i, "direction", e.target.value)}
                      className="w-full px-1 py-1 rounded bg-secondary text-secondary-foreground border-0 font-mono text-xs focus:ring-1 focus:ring-ring cursor-pointer"
                    >
                      <option value="L">L</option>
                      <option value="R">R</option>
                      <option value="S">S</option>
                    </select>
                  </td>
                  <td className="px-1 py-1">
                    <button
                      onClick={() => deleteRow(i)}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors duration-200"
                      aria-label="Delete transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

function CellInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-1.5 py-1 rounded bg-secondary text-secondary-foreground border-0 font-mono text-xs focus:ring-1 focus:ring-ring transition-all duration-200"
    />
  );
}

export default TransitionTable;
