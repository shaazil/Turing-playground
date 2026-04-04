import { Node, Edge, MarkerType } from "reactflow";
import { TuringMachineDefinition } from "./tm-types";

// Helper to calculate circular layout positions
export function buildStateGraph(machine: TuringMachineDefinition): {
  nodes: Node[];
  edges: Edge[];
} {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const { states, startState, acceptStates, rejectStates, transitions } = machine;

  // Group states for layout
  const topState = startState;
  const bottomStates = [
    ...acceptStates,
    ...rejectStates.filter((s) => !acceptStates.includes(s)),
  ].filter((s) => s !== topState); // In case start == accept/reject, unlikely but possible.
  const otherStates = states.filter(
    (s) => s !== topState && !bottomStates.includes(s)
  );

  // We want to arrange `topState` at top (-pi/2), `bottomStates` at bottom (pi/2) spread out,
  // and `otherStates` along the sides to form a circle.
  
  // Total states
  const n = states.length;
  // Increase radius for better visibility
  const radius = Math.max(160, 100 + n * 20);
  const centerX = radius + 60;
  const centerY = radius + 40;

  const positions: Record<string, { x: number; y: number }> = {};

  // 1. Top state
  positions[topState] = {
    x: centerX,
    y: centerY - radius,
  };

  // 2. Bottom Accept/Reject Anchors
  // We place Accept states in bottom-right (angle ~ pi/4 down from right)
  // We place Reject states in bottom-left (angle ~ 3pi/4 down from left)
  
  let acceptAnchorIdx = 0;
  let rejectAnchorIdx = 0;
  
  bottomStates.forEach((state) => {
    if (acceptStates.includes(state)) {
      // Bottom Right
      const angle = (Math.PI / 4) + (acceptAnchorIdx * 0.2); 
      positions[state] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
      acceptAnchorIdx++;
    } else {
      // Bottom Left
      const angle = (3 * Math.PI / 4) - (rejectAnchorIdx * 0.2); 
      positions[state] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
      rejectAnchorIdx++;
    }
  });

  // 3. Other states (distributed on the left and right arcs)
  if (otherStates.length > 0) {
    const leftStates = otherStates.filter((_, i) => i % 2 !== 0);
    const rightStates = otherStates.filter((_, i) => i % 2 === 0);

    // Right Arc (-pi/2 to 0ish)
    const rightAngleStep = (Math.PI / 2) / (rightStates.length + 1);
    rightStates.forEach((state, i) => {
      const angle = -Math.PI / 2 + rightAngleStep * (i + 1);
      positions[state] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });

    // Left Arc (-pi/2 to -piish)
    const leftAngleStep = (Math.PI / 2) / (leftStates.length + 1);
    leftStates.forEach((state, i) => {
      const angle = -Math.PI / 2 - leftAngleStep * (i + 1);
      positions[state] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });
  }

  // Create Node objects
  states.forEach((state) => {
    const isStart = state === startState;
    const isAccept = acceptStates.includes(state);
    const isReject = rejectStates.includes(state);
    
    // Pass properties via data for styling inside custom node later, or just use inline styles in the components.
    nodes.push({
      id: state,
      position: positions[state] || { x: 0, y: 0 },
      data: {
        label: state,
        isStart,
        isAccept,
        isReject,
      },
      // Using a custom node type "tmState" that we'll define in StateGraph.tsx
      type: "tmState",
      sourcePosition: "bottom" as any,
      targetPosition: "top" as any,
    });
  });

  // Create Edge objects by aggregating transitions between the same source and target
  // e.g. multiple reads transitioning to the same state should be shown on one edge.
  const edgeMap: Record<string, string[]> = {};

  Object.entries(transitions).forEach(([source, symbolMap]) => {
    Object.entries(symbolMap).forEach(([read, [target, write, move]]) => {
      const edgeKey = `${source}->${target}`;
      if (!edgeMap[edgeKey]) edgeMap[edgeKey] = [];
      edgeMap[edgeKey].push(`${read}→${write},${move}`);
    });
  });

  Object.entries(edgeMap).forEach(([edgeKey, labels]) => {
    const [source, target] = edgeKey.split("->");
    const id = `e-${source}-${target}`;

    // Simple heuristic to curve edges if there is a bidirectional connection
    const reverseKey = `${target}->${source}`;
    const isSelf = source === target;
    const hasReverse = !!edgeMap[reverseKey] && !isSelf;

    edges.push({
      id,
      source,
      target,
      label: labels.join(" | "),
      type: isSelf ? "step" : hasReverse ? "smoothstep" : "default",
      labelStyle: { fill: "currentColor", fontWeight: 700, fontSize: 13 },
      labelBgStyle: { fill: "transparent" },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 15,
        height: 15,
      },
    });
  });

  return { nodes, edges };
}
