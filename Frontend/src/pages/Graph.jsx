import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';
import { useGraph } from '../features/graph/hook/useGraph';
import { Activity, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Graph = () => {
  const { graphData, loading, error, fetchGraph } = useGraph();
  const fgRef = useRef();
  const navigate = useNavigate();
  const [windowSize, setWindowSize] = useState([window.innerWidth, window.innerHeight]);

  // ── ALL hooks must be defined before any early returns ──────────────────────
  const handleNodeClick = useCallback((node) => {
    if (!fgRef.current) return;
    const distance = 100;
    const distRatio = 1 + distance / Math.hypot(node.x || 0, node.y || 0, node.z || 0);
    fgRef.current.cameraPosition(
      { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
      node,
      3000
    );
  }, [fgRef]);

  // Color mapper based on semantic tags
  const getNodeColor = useCallback((node) => {
      const g = (node.group || '').toLowerCase();
      if (g === "youtube") return "#ff0000";
      if (g === "google") return "#4285F4";
      if (g.includes("x (tw")) return "#1DA1F2";
      if (g.includes("ai")) return "#a855f7";
      if (g.includes("react")) return "#61dafb";
      if (g === "miscellaneous") return "#6b7280";
      return "#3b82f6";
  }, []);

  // ── Early returns AFTER all hooks ────────────────────────────────────────────
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
            <ForceGraph3D
                ref={fgRef}
                width={windowSize[0] - 256} // Approximate minus sidebar
                height={windowSize[1]}
                graphData={JSON.parse(JSON.stringify(graphData))} // Deep clone to allow D3 mutations on frozen Redux state
                nodeAutoColorBy="group"
                nodeColor={getNodeColor}
                nodeRelSize={6}
                nodeResolution={24}
                
                // --- 3D Aesthetic Styling ---
                nodeThreeObject={node => {
                  const group = new THREE.Group();
                  
                  // Main Sphere (The Node)
                  const geometry = new THREE.SphereGeometry(6, 24, 24);
                  const material = new THREE.MeshPhongMaterial({ 
                    color: getNodeColor(node),
                    emissive: getNodeColor(node),
                    emissiveIntensity: 0.4,
                    shininess: 100
                  });
                  const sphere = new THREE.Mesh(geometry, material);
                  group.add(sphere);

                  // Outer Glow Sprite
                  const canvas = document.createElement('canvas');
                  canvas.width = 64;
                  canvas.height = 64;
                  const ctx = canvas.getContext('2d');
                  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
                  gradient.addColorStop(0, `${getNodeColor(node)}FF`);
                  gradient.addColorStop(0.5, `${getNodeColor(node)}33`);
                  gradient.addColorStop(1, 'transparent');
                  ctx.fillStyle = gradient;
                  ctx.fillRect(0, 0, 64, 64);
                  
                  const spriteMaterial = new THREE.SpriteMaterial({ 
                    map: new THREE.CanvasTexture(canvas),
                    transparent: true,
                    blending: THREE.AdditiveBlending
                  });
                  const glow = new THREE.Sprite(spriteMaterial);
                  glow.scale.set(30, 30, 1);
                  group.add(glow);

                  // Label Sprite
                  const labelCanvas = document.createElement('canvas');
                  const context = labelCanvas.getContext('2d');
                  const labelText = node.name;
                  context.font = 'Bold 40px Inter, Sans-Serif';
                  const textWidth = context.measureText(labelText).width;
                  labelCanvas.width = textWidth + 40;
                  labelCanvas.height = 80;
                  
                  context.font = 'Bold 40px Inter, Sans-Serif';
                  context.fillStyle = 'white';
                  context.textAlign = 'center';
                  context.textBaseline = 'middle';
                  // Subtle text shadow for depth
                  context.shadowColor = 'rgba(0,0,0,0.5)';
                  context.shadowBlur = 10;
                  context.fillText(labelText, labelCanvas.width / 2, labelCanvas.height / 2);
                  
                  const labelTexture = new THREE.CanvasTexture(labelCanvas);
                  const labelMaterial = new THREE.SpriteMaterial({ map: labelTexture, transparent: true });
                  const labelSprite = new THREE.Sprite(labelMaterial);
                  labelSprite.scale.set(labelCanvas.width / 5, labelCanvas.height / 5, 1);
                  labelSprite.position.set(0, 15, 0); // Position above node
                  group.add(labelSprite);

                  return group;
                }}
                
                // --- Link Styling ---
                linkColor={() => 'rgba(255, 255, 255, 0.15)'}
                linkWidth={link => link.value * 0.5}
                linkResolution={8}
                linkDirectionalParticles={2}
                linkDirectionalParticleSpeed={0.01}
                linkDirectionalParticleWidth={2}
                linkDirectionalParticleColor={() => '#ffffff77'}

                // --- Interactions & Controls ---
                onNodeClick={handleNodeClick}
                backgroundColor="#09090b"
                showNavInfo={false}
                rootSpinSpeed={0.5}

                // --- Physics & Warmup ---
                d3VelocityDecay={0.4}
                warmupTicks={50}
                cooldownTicks={100}
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
