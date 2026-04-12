'use client';

import React, { Suspense, useMemo } from 'react';
import { Canvas, useLoader, useFrame } from '@react-three/fiber';
import { useFBX, OrbitControls, Environment, ContactShadows, useAnimations, Html, useProgress } from '@react-three/drei';
import * as THREE from 'three';

interface RiggedCharacterProps {
  modelPath: string;
  isSpeaking?: boolean;
  isLoading?: boolean;
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2 whitespace-nowrap">
        <div className="w-12 h-12 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
        <span className="text-rose-400 text-[10px] font-black tracking-widest uppercase bg-black/80 px-2 py-1 rounded">
          Syncing Core // {Math.round(progress)}%
        </span>
      </div>
    </Html>
  );
}

function Model({ modelPath, isSpeaking }: { modelPath: string; isSpeaking?: boolean }) {
  // useFBX will suspend until loaded
  const fbx = useFBX(modelPath);
  
  const groupRef = React.useRef<THREE.Group>(null);
  const baseScaleRef = React.useRef<number>(1);

  // Initial setup of the original FBX (no cloning for v8 stability test)
  const baseScale = React.useMemo(() => {
    if (!fbx) return 1;
    
    // Auto-scale and center
    const box = new THREE.Box3().setFromObject(fbx);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z, 1);
    const scale = 2 / maxDim;
    fbx.scale.setScalar(scale);
    
    box.setFromObject(fbx);
    const center = new THREE.Vector3();
    box.getCenter(center);
    fbx.position.set(-center.x, -box.min.y - 1, -center.z);
    
    baseScaleRef.current = scale;
    return scale;
  }, [fbx, modelPath]);

  const { names, actions } = useAnimations(fbx.animations, fbx);

  React.useEffect(() => {
    if (names.length > 0 && actions) {
      const action = actions[names[0]];
      if (action) action.reset().fadeIn(0.5).play();
    }
    return () => {
      if (actions) Object.values(actions).forEach(a => a?.stop());
    };
  }, [names, actions, modelPath]);

  useFrame((state) => {
    if (!state || !state.clock || !fbx) return;
    try {
        const time = state.clock.getElapsedTime();
        
        // Constant subtle float/breathe
        const floatY = Math.sin(time * 0.5) * 0.05;
        fbx.position.y = - (new THREE.Box3().setFromObject(fbx).min.y) - 1 + floatY;

        if (isSpeaking) {
            // Pulse scale
            const pulse = 1 + Math.sin(time * 15) * 0.02;
            fbx.scale.setScalar(baseScaleRef.current * pulse);
            
            // Subtle "alive" tilt when talking
            fbx.rotation.z = Math.sin(time * 10) * 0.02;
            fbx.rotation.x = Math.sin(time * 5) * 0.01;
        } else {
            fbx.scale.setScalar(baseScaleRef.current);
            fbx.rotation.z = 0;
            fbx.rotation.x = 0;
        }
    } catch (e) {}
  });

  return <primitive object={fbx} ref={groupRef} />;
}

export default function RiggedCharacter({ modelPath, isSpeaking, isLoading }: RiggedCharacterProps) {
  return (
    <div className="w-full h-full relative bg-transparent">
      <Canvas shadows camera={{ position: [0, 0.5, 3], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <Suspense fallback={<Loader />}>
          {modelPath && <Model modelPath={modelPath} isSpeaking={isSpeaking} />}
          <Environment preset="city" />
          <ContactShadows position={[0, -1, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
        </Suspense>
        <OrbitControls enablePan={false} enableZoom={true} minPolarAngle={Math.PI / 2.5} maxPolarAngle={Math.PI / 1.8} />
      </Canvas>
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-950/20 backdrop-blur-sm z-10 transition-opacity">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
