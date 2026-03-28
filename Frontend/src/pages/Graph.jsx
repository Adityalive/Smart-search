import React, { useState, useEffect, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { useGraph } from '../features/graph/hook/useGraph';
import { Activity, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Graph = () => {
  const { graphData, loading, error, fetchGraph } = useGraph();
  const fgRef = useRef();
  const navigate = useNavigate();
  const [windowSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);

  // Handle window resize dynamically to adjust D3 canvas
  useEffect(() => {
    const handleResize = () => setWindowSize([window.innerWidth, window.innerHeight]);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading && (!graphData || graphData.nodes.length === 0)) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center h-full">
        <div className="animate-pulse flex flex-col items-center">
          <Activity size={48} className="text-blue-500 mb-4 animate-spin-slow" />
          <p className="text-zinc-400 font-medium">Computing spatial geometry & clustering graphs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-red-400">
          <h3 className="font-bold mb-2">Knowledge Graph Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const handleNodeClick = (node) => {
    // Navigate to a cluster or a search detail. 
    // Wait, the user might want a panel. The request said "Related items panel when viewing any item". This is in Clusters.
    // However, when clicking a node here, we can route to Search to view its details or keep it simple.
    // For now, let's open prompt or just center the graph
    fgRef.current.centerAt(node.x, node.y, 1000);
    fgRef.current.zoom(8, 2000);
  };

  // Color mapper based on semantic tags
  const getNodeColor = (node) => {
      const g = node.group.toLowerCase();
      if(g === "youtube") return "#ff0000";
      if(g === "google") return "#4285F4";
      if(g.includes("x (tw")) return "#1DA1F2";
      if(g.includes("ai")) return "#a855f7";
      if(g.includes("react")) return "#61dafb";
      if(g === "miscellaneous") return "#6b7280";
      return "#3b82f6"; // Default blue
  };

  return (
    <div className="flex flex-col h-full bg-[#111113] relative overflow-hidden">
      <div className="absolute top-8 left-8 z-10 pointer-events-none">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent mb-2">
           Knowledge Graph
        </h2>
        <p className="text-zinc-500 text-sm max-w-sm">
           A semantic visual representation of your dataset. Nodes are geometrically closer based on exactly how AI perceives their contextual relationship.
        </p>
      </div>

      <div className="absolute top-8 right-8 z-10">
         <button onClick={() => navigate('/search')} className="flex items-center gap-2 bg-[#18181b] border border-white/[0.08] px-4 py-2 hover:bg-white/[0.05] transition-colors rounded-xl text-zinc-300">
            <Search size={16} /> Semantic Search
         </button>
      </div>

      <div className="flex-1 w-full h-full cursor-crosshair">
        {graphData && graphData.nodes.length > 0 ? (
            <ForceGraph2D
                ref={fgRef}
                width={windowSize[0] - 256} // Approximate minus sidebar
                height={windowSize[1]}
                graphData={JSON.parse(JSON.stringify(graphData))} // Deep clone to allow D3 mutations on frozen Redux state
                nodeAutoColorBy="group"
                nodeRelSize={6}
                nodeColor={getNodeColor}
                linkColor={() => 'rgba(255, 255, 255, 0.1)'}
                linkWidth={link => link.value * 2} // visually thicker for stronger connections
                onNodeClick={handleNodeClick}
                nodeCanvasObjectMode={() => 'after'}
                nodeCanvasObject={(node, ctx, globalScale) => {
                    const label = node.name;
                    const fontSize = 12/globalScale;
                    ctx.font = `${fontSize}px Sans-Serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                    ctx.fillText(label, node.x, node.y + 8 + (8 / globalScale));
                }}
                d3VelocityDecay={0.1}
                d3AlphaDecay={0.02}
                cooldownTicks={100}
                backgroundColor="#111113"
                warmupTicks={50}
            />
        ) : (
             <div className="flex items-center justify-center w-full h-full text-zinc-500">
                 Not enough semantic vectors to build a graph yet. Add more links!
             </div>
        )}
      </div>
    </div>
  );
};

export default Graph;
