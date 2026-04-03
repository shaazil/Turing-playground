import type { TuringMachineDefinition } from "@/utils/tm-types";

interface MachineEditorProps {
  machine: TuringMachineDefinition;
  onChange: (machine: TuringMachineDefinition) => void;
}

const MachineEditor = ({ machine, onChange }: MachineEditorProps) => {
  const update = (field: keyof TuringMachineDefinition, value: unknown) => {
    onChange({ ...machine, [field]: value });
  };

  const parseList = (s: string) =>
    s
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Machine Definition
      </h3>

      <Field
        label="States"
        id="tm-states"
        value={machine.states.join(", ")}
        onChange={(v) => update("states", parseList(v))}
        placeholder="q0, q1, q_accept, q_reject"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Field
          label="Input Alphabet"
          id="tm-input-alpha"
          value={machine.inputAlphabet.join(", ")}
          onChange={(v) => update("inputAlphabet", parseList(v))}
          placeholder="0, 1"
        />
        <Field
          label="Tape Alphabet"
          id="tm-tape-alpha"
          value={machine.tapeAlphabet.join(", ")}
          onChange={(v) => update("tapeAlphabet", parseList(v))}
          placeholder="0, 1, X, _"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Field
          label="Start State"
          id="tm-start-state"
          value={machine.startState}
          onChange={(v) => update("startState", v)}
          placeholder="q0"
        />
        <Field
          label="Blank Symbol"
          id="tm-blank"
          value={machine.blank}
          onChange={(v) => update("blank", v)}
          placeholder="_"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Field
          label="Accept States"
          id="tm-accept"
          value={machine.acceptStates.join(", ")}
          onChange={(v) => update("acceptStates", parseList(v))}
          placeholder="q_accept"
        />
        <Field
          label="Reject States"
          id="tm-reject"
          value={machine.rejectStates.join(", ")}
          onChange={(v) => update("rejectStates", parseList(v))}
          placeholder="q_reject"
        />
      </div>
    </div>
  );
};

function Field({
  label,
  id,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-[11px] text-muted-foreground font-medium">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-0.5 w-full px-2.5 py-1.5 rounded-md bg-secondary text-secondary-foreground border border-border font-mono text-xs focus:outline-none focus:ring-1 focus:ring-ring transition-all duration-200"
      />
    </div>
  );
}

export default MachineEditor;
