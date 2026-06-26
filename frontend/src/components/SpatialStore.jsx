import React, { useEffect, useRef, useState } from 'react';

const SpatialStore = ({ inventory, onRefresh }) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [threeLoaded, setThreeLoaded] = useState(false);
  const [cctvLogs, setCctvLogs] = useState([]);
  const [showCCTVOverlay, setShowCCTVOverlay] = useState(true);
  const [triggering, setTriggering] = useState(false);
  
  const threeRef = useRef(null);

  // Fetch CCTV detection logs
  const fetchCCTVLogs = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/cctv');
      const data = await response.json();
      setCctvLogs(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCCTVLogs();
    const interval = setInterval(fetchCCTVLogs, 3000);
    return () => clearInterval(interval);
  }, []);

  const [fallbackActive, setFallbackActive] = useState(false);

  // Load Three.js dynamically
  useEffect(() => {
    if (window.THREE) {
      setThreeLoaded(true);
      return;
    }

    const timer = setTimeout(() => {
      if (!window.THREE) {
        setFallbackActive(true);
      }
    }, 4500);

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.async = true;
    script.onload = () => {
      setThreeLoaded(true);
      clearTimeout(timer);
    };
    script.onerror = () => {
      setFallbackActive(true);
      clearTimeout(timer);
    };
    document.body.appendChild(script);

    return () => {
      clearTimeout(timer);
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  // WebGL 3D Room Generator
  useEffect(() => {
    if (!threeLoaded || !canvasRef.current) return;

    const THREE = window.THREE;
    const width = containerRef.current.clientWidth - 300; // account for log sidebar
    const height = 340;

    const scene = new THREE.Scene();
    
    // Isometric Camera setup
    const camera = new THREE.OrthographicCamera(
      width / -100, width / 100,
      height / 100, height / -100,
      1, 1000
    );
    // Position for isometric perspective view
    camera.position.set(10, 10, 10);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffb9f1, 0.8);
    dirLight1.position.set(5, 10, 2);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x00b9f1, 0.5);
    dirLight2.position.set(-5, 5, -2);
    scene.add(dirLight2);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(10, 20, 0xff5c22, 0x444444);
    gridHelper.position.y = -0.5;
    scene.add(gridHelper);

    // Create Shop Rack Meshes
    // Racks: Basmati Rice, Atta, Mustard Oil, Sugar, Surf Excel
    const rackItems = [
      { name: "Basmati Rice", color: 0x2ecc71, x: -3, z: -3 },
      { name: "Ashirvaad Atta", color: 0xe74c3c, x: -3, z: 0 },
      { name: "Fortune Mustard Oil", color: 0xf1c40f, x: 0, z: -3 },
      { name: "Sugar", color: 0x00b9f1, x: 3, z: -3 },
      { name: "Surf Excel", color: 0x9b59b6, x: 3, z: 0 }
    ];

    const rackGeometries = {};
    const rackMeshes = [];

    rackItems.forEach((item, idx) => {
      // Base stand
      const baseGeo = new THREE.BoxGeometry(1.2, 0.1, 1.2);
      const baseMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.set(item.x, -0.4, item.z);
      scene.add(baseMesh);

      // Inventory stack block (height updates dynamically based on stock)
      const stackGeo = new THREE.BoxGeometry(1.0, 1.0, 1.0);
      const stackMat = new THREE.MeshLambertMaterial({
        color: item.color,
        transparent: true,
        opacity: 0.8
      });
      const stackMesh = new THREE.Mesh(stackGeo, stackMat);
      stackMesh.position.set(item.x, 0.1, item.z);
      scene.add(stackMesh);

      rackMeshes.push({
        name: item.name,
        mesh: stackMesh,
        originalColor: item.color
      });
    });

    // Simulated Customer Node (moving sphere)
    const customerGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const customerMat = new THREE.MeshBasicMaterial({ color: 0xff00ff });
    const customerMesh = new THREE.Mesh(customerGeo, customerMat);
    customerMesh.position.set(0, 0, 0);
    scene.add(customerMesh);

    threeRef.current = { scene, camera, renderer, rackMeshes, customerMesh, THREE };

    // Animation loop
    let animationId;
    let t = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      t += 0.02;

      // Move customer sphere in a smooth figure-eight path around the racks
      if (customerMesh) {
        customerMesh.position.x = Math.sin(t) * 2.5;
        customerMesh.position.z = Math.sin(t * 2) * 1.5;
        customerMesh.position.y = Math.abs(Math.sin(t * 3)) * 0.15 - 0.2;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const w = containerRef.current.clientWidth - 300;
      camera.left = w / -100;
      camera.right = w / 100;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [threeLoaded]);

  // Update 3D Rack heights dynamically when inventory updates!
  useEffect(() => {
    if (!threeRef.current || !inventory || inventory.length === 0) return;

    const { rackMeshes, THREE } = threeRef.current;

    rackMeshes.forEach(rack => {
      const invItem = inventory.find(i => i.item_name === rack.name);
      if (invItem) {
        const stockPct = invItem.current_stock / 100; // max stock mock 100
        const isLow = invItem.current_stock < invItem.safety_limit;

        // Morph rack height
        const targetScaleY = Math.max(stockPct * 2, 0.1); // min scale
        rack.mesh.scale.set(1, targetScaleY, 1);
        rack.mesh.position.y = (targetScaleY / 2) - 0.4; // offset bottom position

        // Change color to bright neon red if stock runs below limit
        if (isLow) {
          rack.mesh.material.color.setHex(0xff3333);
          rack.mesh.material.opacity = 0.95;
        } else {
          rack.mesh.material.color.setHex(rack.originalColor);
          rack.mesh.material.opacity = 0.8;
        }
      }
    });
  }, [inventory]);

  // Simulate empty shelf detection (YOLOv8 hook)
  const triggerEmptyShelf = async () => {
    setTriggering(true);
    try {
      const response = await fetch('http://localhost:5000/api/cctv/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemName: 'Sugar' })
      });
      if (response.ok) {
        onRefresh(); // refresh main state
        setTimeout(() => fetchCCTVLogs(), 1000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div ref={containerRef} className="bg-glass border-glass rounded-2xl shadow-glow overflow-hidden h-[340px] flex">
      
      {/* 3D WebGL Canvas panel */}
      <div className="flex-1 relative flex items-center justify-center bg-[#0E0B0A]">
        {threeLoaded && !fallbackActive ? (
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
        ) : (
          <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-[#0E0B0A] p-4">
            {fallbackActive ? (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="text-[10px] text-orange-500/80 uppercase font-mono tracking-wider mb-2 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                  WebGL Offline - 2D Schematic Fallback
                </div>
                {/* Beautiful Schematic SVG */}
                <svg viewBox="0 0 400 200" className="w-full max-w-[320px] h-[180px] drop-shadow-lg">
                  {/* Isometric floor */}
                  <polygon points="200,30 360,110 200,190 40,110" fill="#151210" stroke="#ff5c22" strokeWidth="1" strokeOpacity="0.3" />
                  
                  {/* Isometric grid lines */}
                  <line x1="120" y1="70" x2="280" y2="150" stroke="#ff5c22" strokeWidth="0.5" strokeOpacity="0.15" />
                  <line x1="280" y1="70" x2="120" y2="150" stroke="#ff5c22" strokeWidth="0.5" strokeOpacity="0.15" />
                  
                  {/* Draw Racks as isometric boxes */}
                  {inventory && inventory.map((item, idx) => {
                    const positions = {
                      "Basmati Rice": { x: 130, y: 80, color: "rgba(46, 204, 113, 0.7)" },
                      "Ashirvaad Atta": { x: 155, y: 115, color: "rgba(231, 76, 60, 0.7)" },
                      "Fortune Mustard Oil": { x: 200, y: 90, color: "rgba(241, 196, 15, 0.7)" },
                      "Sugar": { x: 245, y: 115, color: "rgba(0, 185, 241, 0.7)" },
                      "Surf Excel": { x: 270, y: 80, color: "rgba(155, 89, 182, 0.7)" }
                    };
                    const pos = positions[item.item_name] || { x: 200, y: 100, color: "rgba(255,255,255,0.5)" };
                    const isLow = item.current_stock < item.safety_limit;
                    const fillColor = isLow ? "rgba(239, 68, 68, 0.95)" : pos.color;
                    const stockHeight = Math.max((item.current_stock / 100) * 35, 5);

                    return (
                      <g key={item.item_name}>
                        {/* Rack Stand */}
                        <polygon points={`${pos.x-15},${pos.y} ${pos.x},${pos.y-7} ${pos.x+15},${pos.y} ${pos.x},${pos.y+7}`} fill="#2D2825" stroke="#444" strokeWidth="0.5" />
                        
                        {/* Stack Box */}
                        {/* Front Right face */}
                        <polygon points={`${pos.x},${pos.y} ${pos.x+12},${pos.y-6} ${pos.x+12},${pos.y-6-stockHeight} ${pos.x},${pos.y-stockHeight}`} fill={fillColor} opacity="0.85" />
                        {/* Front Left face */}
                        <polygon points={`${pos.x-12},${pos.y-6} ${pos.x},${pos.y} ${pos.x},${pos.y-stockHeight} ${pos.x-12},${pos.y-6-stockHeight}`} fill={fillColor} filter="brightness(0.85)" opacity="0.85" />
                        {/* Top face */}
                        <polygon points={`${pos.x},${pos.y-stockHeight} ${pos.x+12},${pos.y-6-stockHeight} ${pos.x},${pos.y-12-stockHeight} ${pos.x-12},${pos.y-6-stockHeight}`} fill={fillColor} filter="brightness(1.15)" opacity="0.85" />
                        
                        {/* Label or Low Indicator */}
                        {isLow && (
                          <g>
                            <circle cx={pos.x} cy={pos.y-stockHeight-18} r="5" fill="#ef4444" className="animate-ping" />
                            <circle cx={pos.x} cy={pos.y-stockHeight-18} r="3" fill="#ef4444" />
                            <line x1={pos.x} y1={pos.y-stockHeight-18} x2={pos.x} y2={pos.y-stockHeight-2} stroke="#ef4444" strokeWidth="0.5" strokeDasharray="1,1" />
                          </g>
                        )}
                        
                        {/* Tiny Label text */}
                        <text x={pos.x} y={pos.y + 16} fill="#888" fontSize="6" textAnchor="middle" fontFamily="monospace">
                          {item.item_name.split(" ").slice(-1)[0]} ({item.current_stock}%)
                        </text>
                      </g>
                    );
                  })}

                  {/* Customer dot fallback */}
                  <circle cx="205" cy="110" r="4" fill="#ff00ff" opacity="0.8" className="animate-pulse" />
                </svg>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-[10px] text-gray-500 font-mono tracking-wider">Loading Spatial Canvas...</div>
              </div>
            )}
          </div>
        )}

        {/* CCTV Camera Bounding Box HUD Overlay */}
        {showCCTVOverlay && (
          <div className="absolute inset-0 border-[3px] border-red-500/20 pointer-events-none p-4 flex flex-col justify-between font-mono text-[9px] text-red-500 select-none">
            {/* Top hud */}
            <div className="flex justify-between items-start">
              <span className="flex items-center gap-1 bg-red-500/20 px-1.5 py-0.5 rounded border border-red-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                LIVE FEED: CAM_04
              </span>
              <span>YOLOv8 MODEL ACTIVE (98.7% Conf)</span>
            </div>
            
            {/* Bounding box graphics over visual space */}
            <div className="absolute top-[48%] left-[28%] border border-green-500/80 bg-green-500/5 px-1 py-0.5 text-green-500 text-[8px] rounded">
              [Rice: OK]
            </div>

            <div className="absolute top-[35%] right-[22%] border-2 border-red-500/80 bg-red-500/10 px-1 py-0.5 text-red-500 text-[8px] rounded animate-pulse">
              ⚠️ [ALERT: Sugar Depleted]
            </div>

            {/* Bottom hud */}
            <div className="flex justify-between items-end">
              <span>FPS: 30.0</span>
              <span>NOIDA_SECTOR_98_KIRANA</span>
            </div>
          </div>
        )}

        {/* View togglers */}
        <div className="absolute bottom-3 left-3 flex gap-2 z-30">
          <button
            onClick={() => setShowCCTVOverlay(!showCCTVOverlay)}
            className={`px-2 py-0.5 border rounded text-[9px] font-mono transition-all duration-300 ${
              showCCTVOverlay 
                ? 'bg-red-500/10 border-red-500 text-red-500' 
                : 'bg-glass border-glass text-gray-400'
            }`}
          >
            CCTV HUD: {showCCTVOverlay ? 'VISIBLE' : 'HIDDEN'}
          </button>
        </div>
      </div>

      {/* CCTV model detection log sidebar */}
      <div className="w-[300px] border-l border-white/5 bg-[#120F0D] flex flex-col justify-between p-4">
        <div className="h-[75%] overflow-y-auto pr-1">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] uppercase font-bold text-gray-300 font-mono tracking-wider">CCTV Vision Logs</span>
            <span className="text-[8px] bg-red-500/20 text-red-400 px-1.5 py-0.2 rounded border border-red-500/30 font-mono uppercase font-bold animate-pulse">Object Detection</span>
          </div>

          <div className="space-y-2 font-mono text-[9px]">
            {cctvLogs.map(log => (
              <div key={log.id} className="p-2 bg-[#1A1614] border-glass rounded-lg">
                <div className="flex justify-between font-bold text-gray-200">
                  <span>{log.label}</span>
                  <span className="text-gray-500">[{log.time}]</span>
                </div>
                <div className="flex justify-between mt-1 text-gray-400">
                  <span className="text-red-400 italic font-semibold">{log.event.replace(/_/g, ' ')}</span>
                  <span>Conf: {Math.round(log.confidence * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Simulation trigger */}
        <button
          onClick={triggerEmptyShelf}
          disabled={triggering}
          className="w-full py-2 bg-red-500 hover:bg-red-600 text-black font-extrabold text-[10px] rounded-lg transition-colors uppercase font-mono shadow-glow"
        >
          {triggering ? 'Triggering CCTV Alert...' : '🚨 Simulate Empty Shelf'}
        </button>
      </div>

    </div>
  );
};

export default SpatialStore;
