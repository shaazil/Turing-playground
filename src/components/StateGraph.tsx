import { useCallback, useEffect, useState, useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  Edge,
  Node,
  NodeProps,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import { TuringMachineDefinition, TMSnapshot } from "@/utils/tm-types";
import { buildStateGraph } from "@/utils/buildStateGraph";

const TMStateNode = ({ data }: NodeProps) => {
  const { label, isStart, isAccept, isReject, isActive } = data;

  const baseStyle = "flex items-center justify-center w-16 h-16 rounded-full border-2 text-sm font-bold transition-all duration-300";
  
  let typeStyle = "border-muted-foreground/30 bg-card text-foreground";
  if (isAccept) typeStyle = "border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400";
  else if (isReject) typeStyle = "border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400";
  else if (isStart) typeStyle = "border-primary/50 bg-primary/10 text-primary";

  const activeStyle = isActive 
    ? "border-cyan-400 bg-cyan-400/20 shadow-[0_0_15px_rgba(34,211,238,0.5)] scale-110 z-10"
    : "";

  return (
    <div className={`${baseStyle} ${typeStyle} ${activeStyle}`}>
      <Handle type="target" position={Position.Top} className="opacity-0" />
      {label}
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
};

const nodeTypes = {
  tmState: TMStateNode,
};

interface StateGraphProps {
  machine: TuringMachineDefinition;
  currentSnapshot: TMSnapshot;
  previousSnapshot?: TMSnapshot;
}

function GraphContent({ machine, currentSnapshot, previousSnapshot }: StateGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView } = useReactFlow();

  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = buildStateGraph(machine);
    setNodes(newNodes);
    setEdges(newEdges);
    
    // Defer fitView briefly so ReactFlow can measure the DOM first
    setTimeout(() => {
      fitView({ padding: 0.2, duration: 400 });
    }, 50);
  }, [machine, setNodes, setEdges, fitView]);

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        const isActive = node.id === currentSnapshot.state;
        return {
          ...node,
          data: {
            ...node.data,
            isActive,
          },
        };
      })
    );

    setEdges((eds) =>
      eds.map((edge) => {
        let isActiveTransition = false;
        if (previousSnapshot) {
          const from = previousSnapshot.state;
          const to = currentSnapshot.state;
          if (edge.source === from && edge.target === to) {
            isActiveTransition = true;
          }
        }

        return {
          ...edge,
          animated: isActiveTransition,
          style: {
            stroke: isActiveTransition ? "rgb(34, 211, 238)" : "currentColor",
            strokeWidth: isActiveTransition ? 3 : 1.5,
            opacity: isActiveTransition ? 1 : 0.4,
          },
        };
      })
    );
  }, [currentSnapshot, previousSnapshot, setNodes, setEdges]);

  if (nodes.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground italic">
        No graph available for this machine.
      </div>
    );
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      className="tm-react-flow"
      proOptions={{ hideAttribution: true }}
      preventScrolling={false}
      zoomOnScroll={false}
      panOnDrag={false}
    >
      <Background gap={16} size={1} color="rgba(150, 150, 150, 0.1)" />
    </ReactFlow>
  );
}

export default function StateGraph(props: StateGraphProps) {
  // Use explicit tailwind heights rather than dynamic minHeight to prevent collapse race conditions.
  return (
    <div className="w-full h-[420px] sm:h-[480px] relative">
      <ReactFlowProvider>
        <GraphContent {...props} />
      </ReactFlowProvider>
    </div>
  );
}
