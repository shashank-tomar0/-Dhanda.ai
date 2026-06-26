import React, { useEffect, useRef, useState } from 'react';

const ObsidianCore = ({ activeAgent, logs }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [threeLoaded, setThreeLoaded] = useState(false);
  const threeRef = useRef(null); // holds Three.js instances

  // Load Three.js dynamically from CDN for 100% compile stability
  useEffect(() => {
    if (window.THREE) {
      setThreeLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.async = true;
    script.onload = () => setThreeLoaded(true);
    document.body.appendChild(script);

    return () => {
      // clean up script if unmounted before loading
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // WebGL Particle Morpher Engine
  useEffect(() => {
    if (!threeLoaded || !canvasRef.current) return;

    const THREE = window.THREE;
    const width = containerRef.current.clientWidth;
    const height = 360;

    // Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Particle Configuration
    const particleCount = 800;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    // Initial state: Octahedron (Obsidian Crystal shape)
    const initialPositions = new Float32Array(particleCount * 3);
    const targetPositions = new Float32Array(particleCount * 3);

    const generateOctahedron = (array) => {
      for (let i = 0; i < particleCount; i++) {
        // Randomly assign to one of the 8 faces of an octahedron
        const r = 2.5;
        const u = Math.random();
        const v = Math.random();
        
        let x = 0, y = 0, z = 0;
        
        // Choose facet quadrant
        const qX = Math.random() > 0.5 ? 1 : -1;
        const qY = Math.random() > 0.5 ? 1 : -1;
        const qZ = Math.random() > 0.5 ? 1 : -1;

        if (u + v <= 1) {
          x = u * r * qX;
          y = v * r * qY;
          z = (1 - u - v) * r * qZ;
        } else {
          x = (1 - v) * r * qX;
          y = (1 - u) * r * qY;
          z = (u + v - 1) * r * qZ;
        }

        array[i * 3] = x;
        array[i * 3 + 1] = y;
        array[i * 3 + 2] = z;
      }
    };

    generateOctahedron(initialPositions);
    positions.set(initialPositions);
    targetPositions.set(initialPositions);

    // Set colors to default obsidian black/charcoal
    const baseColor = new THREE.Color('#1A1A1A');
    for (let i = 0; i < particleCount; i++) {
      colors[i * 3] = baseColor.r;
      colors[i * 3 + 1] = baseColor.g;
      colors[i * 3 + 2] = baseColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle Shader Material - NormalBlending for light background
    const material = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.NormalBlending,
      depthWrite: false
    });

    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    threeRef.current = { scene, camera, renderer, particleSystem, positions, targetPositions, colors, count: particleCount, THREE };

    // Animation Loop
    let animationFrameId;
    let transitionProgress = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Rotate particle core slowly
      particleSystem.rotation.y += 0.005;
      particleSystem.rotation.x += 0.002;

      // Morph positions towards targets
      const posAttr = geometry.attributes.position;
      const posArray = posAttr.array;
      const targetArray = targetPositions;

      let lerpSpeed = 0.05;
      // Faster morphing when voice is active to match frequency
      if (activeAgent === 'voice') lerpSpeed = 0.15;

      for (let i = 0; i < particleCount * 3; i++) {
        posArray[i] += (targetArray[i] - posArray[i]) * lerpSpeed;
      }
      posAttr.needsUpdate = true;

      // Render
      renderer.render(scene, camera);
    };

    animate();

    // Handle Resize
    const handleResize = () => {
      const w = containerRef.current.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [threeLoaded]);

  // Morph targets based on activeAgent
  useEffect(() => {
    if (!threeRef.current) return;

    const { targetPositions, colors, count, THREE, particleSystem } = threeRef.current;
    let targetColor = new THREE.Color('#1A1A1A'); // default obsidian black

    // Target Shapes:
    // none -> Octahedron (Crystalline)
    // cfo -> Double Sine wave
    // procurement -> Tight sphere
    // marketing -> Network node clusters
    // voice -> Oscillating soundwave grid

    if (activeAgent === 'cfo') {
      targetColor = new THREE.Color('#2ECC71'); // Green
      for (let i = 0; i < count; i++) {
        const theta = (i / count) * Math.PI * 4;
        targetPositions[i * 3] = (i / count) * 6 - 3;
        targetPositions[i * 3 + 1] = Math.sin(theta) * 1.5;
        targetPositions[i * 3 + 2] = Math.cos(theta) * 1.5;
      }
    } 
    else if (activeAgent === 'procurement') {
      targetColor = new THREE.Color('#E67E22'); // Orange
      // Tight spherical cluster
      for (let i = 0; i < count; i++) {
        const phi = Math.acos(-1 + (2 * i) / count);
        const theta = Math.sqrt(count * Math.PI) * phi;
        const r = 1.6;
        targetPositions[i * 3] = r * Math.cos(theta) * Math.sin(phi);
        targetPositions[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
        targetPositions[i * 3 + 2] = r * Math.cos(phi);
      }
    } 
    else if (activeAgent === 'marketing') {
      targetColor = new THREE.Color('#00B9F1'); // Paytm Blue
      // 3 localized cluster nodes
      const clusters = [
        { x: -1.8, y: -1, z: 0 },
        { x: 1.8, y: -1, z: 0 },
        { x: 0, y: 1.8, z: 0 }
      ];
      for (let i = 0; i < count; i++) {
        const cluster = clusters[i % 3];
        const r = 0.6 * Math.random();
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        targetPositions[i * 3] = cluster.x + r * Math.cos(theta) * Math.sin(phi);
        targetPositions[i * 3 + 1] = cluster.y + r * Math.sin(theta) * Math.sin(phi);
        targetPositions[i * 3 + 2] = cluster.z + r * Math.cos(phi);
      }
    } 
    else if (activeAgent === 'voice') {
      targetColor = new THREE.Color('#9B59B6'); // Purple
      // Soundwave frequency bar grid
      for (let i = 0; i < count; i++) {
        const u = (i % 20) / 20 * 6 - 3;
        const v = Math.floor(i / 20) / 40 * 4 - 2;
        const freq = Math.sin(u * 3) * Math.cos(v * 2) * 1.8;
        
        targetPositions[i * 3] = u;
        targetPositions[i * 3 + 1] = freq + (Math.random() - 0.5) * 0.2;
        targetPositions[i * 3 + 2] = v;
      }
    } 
    else {
      // Default: Octahedron (Obsidian Crystal)
      targetColor = new THREE.Color('#1A1A1A');
      const r = 2.4;
      for (let i = 0; i < count; i++) {
        const qX = Math.random() > 0.5 ? 1 : -1;
        const qY = Math.random() > 0.5 ? 1 : -1;
        const qZ = Math.random() > 0.5 ? 1 : -1;
        const u = Math.random();
        const v = Math.random();

        if (u + v <= 1) {
          targetPositions[i * 3] = u * r * qX;
          targetPositions[i * 3 + 1] = v * r * qY;
          targetPositions[i * 3 + 2] = (1 - u - v) * r * qZ;
        } else {
          targetPositions[i * 3] = (1 - v) * r * qX;
          targetPositions[i * 3 + 1] = (1 - u) * r * qY;
          targetPositions[i * 3 + 2] = (u + v - 1) * r * qZ;
        }
      }
    }

    // Update vertex colors
    const colorAttr = particleSystem.geometry.attributes.color;
    for (let i = 0; i < count; i++) {
      colors[i * 3] = targetColor.r;
      colors[i * 3 + 1] = targetColor.g;
      colors[i * 3 + 2] = targetColor.b;
    }
    colorAttr.needsUpdate = true;
  }, [activeAgent]);

  // Fallback indicator checking if a log relates to an agent
  const isAgentActive = (agentId) => {
    if (activeAgent === agentId) return true;
    if (logs && logs.length > 0) {
      const lastLog = logs[0];
      if (agentId === 'cfo' && lastLog.agent.includes('CFO')) return true;
      if (agentId === 'procurement' && lastLog.agent.includes('Procure')) return true;
      if (agentId === 'marketing' && lastLog.agent.includes('Marketing')) return true;
      if (agentId === 'voice' && lastLog.agent.includes('Voice')) return true;
    }
    return false;
  };

  return (
    <div ref={containerRef} className="relative w-full h-[360px] flex items-center justify-center border-glass bg-glass rounded-2xl overflow-hidden shadow-glow">
      <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
      
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[size:30px_30px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* SVG Connecting Cables */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
        <line 
          x1="28%" y1="28%" x2="50%" y2="50%" 
          stroke={isAgentActive('cfo') ? '#2ECC71' : 'rgba(0,0,0,0.06)'} 
          strokeWidth={isAgentActive('cfo') ? '2' : '1'} 
          className={isAgentActive('cfo') ? 'animate-pulse' : ''}
        />
        <line 
          x1="72%" y1="28%" x2="50%" y2="50%" 
          stroke={isAgentActive('procurement') ? '#E67E22' : 'rgba(0,0,0,0.06)'} 
          strokeWidth={isAgentActive('procurement') ? '2' : '1'} 
          className={isAgentActive('procurement') ? 'animate-pulse' : ''}
        />
        <line 
          x1="28%" y1="72%" x2="50%" y2="50%" 
          stroke={isAgentActive('marketing') ? '#00B9F1' : 'rgba(0,0,0,0.06)'} 
          strokeWidth={isAgentActive('marketing') ? '2' : '1'} 
          className={isAgentActive('marketing') ? 'animate-pulse' : ''}
        />
        <line 
          x1="72%" y1="72%" x2="50%" y2="50%" 
          stroke={isAgentActive('voice') ? '#9B59B6' : 'rgba(0,0,0,0.06)'} 
          strokeWidth={isAgentActive('voice') ? '2' : '1'} 
          className={isAgentActive('voice') ? 'animate-pulse' : ''}
        />
      </svg>

      {/* 4 Corner Nodes */}
      <div 
        className={`absolute top-[18%] left-[12%] md:left-[18%] flex flex-col items-center justify-center p-3.5 rounded-xl border-glass bg-white w-[140px] md:w-[170px] z-10 transition-all duration-300 ${
          isAgentActive('cfo') ? 'border-[#2ECC71] shadow-glow-emerald scale-105' : 'opacity-75'
        }`}
      >
        <span className="text-[#2ECC71] font-bold text-xs md:text-sm tracking-wider uppercase">Chanakya (CFO)</span>
        <span className="text-[10px] text-gray-500 text-center mt-1">Financials & Credit</span>
      </div>

      <div 
        className={`absolute top-[18%] right-[12%] md:right-[18%] flex flex-col items-center justify-center p-3.5 rounded-xl border-glass bg-white w-[140px] md:w-[170px] z-10 transition-all duration-300 ${
          isAgentActive('procurement') ? 'border-[#E67E22] shadow-glow scale-105' : 'opacity-75'
        }`}
      >
        <span className="text-[#E67E22] font-bold text-xs md:text-sm tracking-wider uppercase">Kuber (Procure)</span>
        <span className="text-[10px] text-gray-500 text-center mt-1 font-outfit">Inventory & Cartel</span>
      </div>

      <div 
        className={`absolute bottom-[18%] left-[12%] md:left-[18%] flex flex-col items-center justify-center p-3.5 rounded-xl border-glass bg-white w-[140px] md:w-[170px] z-10 transition-all duration-300 ${
          isAgentActive('marketing') ? 'border-[#00B9F1] shadow-glow-blue scale-105' : 'opacity-75'
        }`}
      >
        <span className="text-[#00B9F1] font-bold text-xs md:text-sm tracking-wider uppercase">Vyas (Marketing)</span>
        <span className="text-[10px] text-gray-500 text-center mt-1 font-outfit">WhatsApp & Campaigns</span>
      </div>

      <div 
        className={`absolute bottom-[18%] right-[12%] md:right-[18%] flex flex-col items-center justify-center p-3.5 rounded-xl border-glass bg-white w-[140px] md:w-[170px] z-10 transition-all duration-300 ${
          isAgentActive('voice') ? 'border-[#9B59B6] shadow-glow scale-105' : 'opacity-75'
        }`}
      >
        <span className="text-[#9B59B6] font-bold text-xs md:text-sm tracking-wider uppercase">Vani (Voice)</span>
        <span className="text-[10px] text-gray-500 text-center mt-1 font-outfit">Bilingual Soundbox</span>
      </div>

      {/* WebGL Canvas in Center */}
      {threeLoaded ? (
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block z-20 pointer-events-none" />
      ) : (
        /* Fallback animated SVG crystal if CDN is offline */
        <div className="crystal-container flex items-center justify-center z-20">
          <div className="w-12 h-20 bg-gradient-to-b from-[#EEEEEE] to-[#CCCCCC] border border-black/10 animate-pulse"></div>
        </div>
      )}

      {/* Pulsing Core Ring */}
      <div className="absolute w-[180px] h-[180px] rounded-full border border-black/5 animate-ping opacity-25 pointer-events-none" />
      <div className="absolute w-[220px] h-[220px] rounded-full border border-black/5 pointer-events-none" />
    </div>
  );
};

export default ObsidianCore;
