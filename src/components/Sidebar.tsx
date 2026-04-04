import { useState } from "react";
import {
  Search,
  Star,
  Clock,
  Menu,
  X,
  ChevronDown,
  Cpu,
} from "lucide-react";
import { TM_EXAMPLES, TMExample } from "@/data/examples";

// Define categories based on implementation plan
const CATEGORIES: Record<string, string[]> = {
  "Binary Machines": [
    "Binary Palindrome Checker",
    "Binary Incrementer",
    "Even Number of 1s",
    "Contains Substring 11",
    "Ends With 101",
    "Multiples of 3 in Binary",
  ],
  "Language Recognizers": [
    "aⁿbⁿ Recognizer",
    "Equal Number of 0s and 1s",
    "0ⁿ1ⁿ2ⁿ Recognizer",
  ],
  "Transformers": [
    "Unary Incrementer",
    "Replace All 0s with 1s",
    "Tape Eraser",
  ],
  "Recursively Enumerable / Non-halting": [
    "Infinite 1s Generator",
  ],
  // Custom Machine goes into its own group or standalone button
};

interface SidebarProps {
  activeExampleName: string;
  onSelectMachine: (example: TMExample | "Custom Machine") => void;
  favorites: string[];
  toggleFavorite: (name: string) => void;
  recent: string[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  executionStatus: string | null; // e.g. "idle", "running", "accepted", "rejected"
}

export default function Sidebar({
  activeExampleName,
  onSelectMachine,
  favorites,
  toggleFavorite,
  recent,
  isOpen,
  setIsOpen,
  executionStatus,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({
    "Binary Machines": true,
    "Language Recognizers": true,
    "Transformers": true,
  });

  const handleToggleCat = (cat: string) => {
    setExpandedCats((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const getMachineDef = (name: string) => TM_EXAMPLES.find((ex) => ex.name === name);

  // Filter based on search
  const matchesSearch = (ex?: TMExample) => {
    if (!ex) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return ex.name.toLowerCase().includes(q) || ex.description.toLowerCase().includes(q);
  };

  const renderMachineItem = (ex: TMExample) => {
    const isSelected = activeExampleName === ex.name;
    const isFav = favorites.includes(ex.name);

    let statusColor = "bg-muted";
    if (isSelected && executionStatus) {
      if (executionStatus === "running") statusColor = "bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]";
      else if (executionStatus === "accepted") statusColor = "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]";
      else if (executionStatus === "rejected" || executionStatus === "error") statusColor = "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]";
      else statusColor = "bg-muted-foreground/50";
    }

    return (
      <div
        key={ex.name}
        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200 group ${
          isSelected
            ? "border-cyan-500/50 bg-cyan-500/5 ring-1 ring-cyan-500/50"
            : "border-border/50 bg-card hover:bg-secondary/40 hover:border-border"
        }`}
        onClick={() => {
          onSelectMachine(ex);
          setIsOpen(false);
        }}
      >
        <div className="flex flex-col gap-1 pr-2 overflow-hidden flex-grow">
          <div className="flex items-center gap-2">
            {isSelected && (
              <div className={`w-2 h-2 rounded-full shrink-0 ${statusColor}`} />
            )}
            <span className={`text-sm font-semibold truncate ${isSelected ? "text-cyan-400" : "text-foreground"}`}>
              {ex.name}
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground truncate">
            {ex.machine.states.length} states • {Object.values(ex.machine.transitions).reduce((acc, obj) => acc + Object.keys(obj).length, 0)} transitions
          </span>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(ex.name);
          }}
          className="p-1.5 rounded-md hover:bg-background transition-colors text-muted-foreground shrink-0"
        >
          <Star className={`w-4 h-4 ${isFav ? "fill-yellow-500 text-yellow-500 drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]" : "group-hover:text-foreground"}`} />
        </button>
      </div>
    );
  };

  const hasSearch = searchQuery.trim().length > 0;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-card border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border bg-background/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-foreground leading-tight tracking-tight">TM Explorer</h1>
            <p className="text-[10px] text-muted-foreground">Interactive Simulator</p>
          </div>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search machines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border rounded-md pl-9 pr-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-medium text-foreground placeholder:font-normal"
          />
        </div>
      </div>

      {/* Lists */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-2">
        {/* Favorites */}
        {!hasSearch && favorites.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 px-2 py-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              <Star className="w-3 h-3" />
              Favorites
            </div>
            <div className="flex flex-col gap-1.5 px-1">
              {favorites.map((name) => {
                const machine = getMachineDef(name);
                return machine ? renderMachineItem(machine) : null;
              })}
            </div>
          </div>
        )}

        {/* Recently Used */}
        {!hasSearch && recent.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 px-2 py-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              <Clock className="w-3 h-3" />
              Recently Used
            </div>
            <div className="flex flex-col gap-1.5 px-1">
              {recent.map((name) => {
                const machine = getMachineDef(name);
                return machine ? renderMachineItem(machine) : null;
              })}
            </div>
          </div>
        )}

        {/* Categories */}
        {Object.entries(CATEGORIES).map(([catName, machineNames]) => {
          const machines = machineNames
            .map((n) => getMachineDef(n))
            .filter((m) => m && matchesSearch(m)) as TMExample[];

          if (machines.length === 0) return null;

          return (
            <div key={catName} className="mb-2">
              <button
                onClick={() => handleToggleCat(catName)}
                className="w-full flex items-center justify-between px-2 py-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors group"
              >
                <span>{catName}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedCats[catName] ? "" : "-rotate-90"}`} />
              </button>
              
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedCats[catName] ? "max-h-[1000px] opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
                <div className="flex flex-col gap-1.5 px-1 pb-2">
                  {machines.map(renderMachineItem)}
                </div>
              </div>
            </div>
          );
        })}

        {/* Custom Machine */}
        {(!hasSearch || "custom machine".includes(searchQuery.toLowerCase())) && (
          <div className="mt-4 px-1 pb-4">
            <div
              className={`flex items-center justify-between p-3 rounded-lg border border-dashed cursor-pointer transition-all duration-200 ${
                activeExampleName === "Custom Machine"
                  ? "border-cyan-500 bg-cyan-500/5 ring-1 ring-cyan-500/50"
                  : "border-border/50 hover:border-cyan-500/50 hover:bg-secondary/40"
              }`}
              onClick={() => {
                onSelectMachine("Custom Machine");
                setIsOpen(false);
              }}
            >
              <div className="flex flex-col gap-0.5">
                <span className={`text-sm font-semibold ${activeExampleName === "Custom Machine" ? "text-cyan-400" : "text-foreground"}`}>
                  Custom Machine
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Build and test from scratch
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity duration-300 opacity-100"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar Drawer / Fixed Layout */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[280px] bg-card transform transition-transform duration-300 ease-in-out lg:transform-none shadow-2xl lg:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
