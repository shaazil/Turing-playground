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

function toRows(tm: TuringMachineDefinition): TransitionRow[] {
  const rows: TransitionRow[] = [];
  for (const [fromState, symbolMap] of Object.entries(tm.transitions)) {
    for (const [readSymbol, [toState, writeSymbol, direction]] of Object.entries(
      symbolMap
    )) {
      rows.push({ fromState, readSymbol, toState, writeSymbol, direction });
    }
  }
  return rows;
}

function fromRows(
  rows: TransitionRow[]
): TuringMachineDefinition["transitions"] {
  const t: TuringMachineDefinition["transitions"] = {};
  for (const r of rows) {
    if (!t[r.fromState]) t[r.fromState] = {};
    t[r.fromState][r.readSymbol] = [r.toState, r.writeSymbol, r.direction];
  }
  return t;
}

const TransitionTable = ({ machine, onChange }: TransitionTableProps) => {
  const rows = toRows(machine);

  const updateRow = (
    index: number,
    field: keyof TransitionRow,
    value: string
  ) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: value };
    onChange({ ...machine, transitions: fromRows(newRows) });
  };

  const addRow = () => {
    const newRows = [
      ...rows,
      {
        fromState: machine.states[0] || "q0",
        readSymbol: machine.tapeAlphabet[0] || "_",
        toState: machine.states[0] || "q0",
        writeSymbol: machine.tapeAlphabet[0] || "_",
        direction: "R" as Direction,
      },
    ];
    onChange({ ...machine, transitions: fromRows(newRows) });
  };

  const deleteRow = (index: number) => {
    const newRows = rows.filter((_, i) => i !== index);
    onChange({ ...machine, transitions: fromRows(newRows) });
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
                  key={i}
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
