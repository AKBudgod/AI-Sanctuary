'use client';

import React, { Suspense, useMemo } from 'react';
import { Canvas, useLoader, useFrame } from '@react-three/fiber';
import { useFBX, OrbitControls, Environment, ContactShadows, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

interface RiggedCharacterProps {
  modelPath: string;
  isSpeaking?: boolean;
  isLoading?: boolean;
}

function Model({ modelPath, isSpeaking }: { modelPath: string; isSpeaking?: boolean }) {
  const fbx = useFBX(modelPath);
  const { names, actions } = useAnimations(fbx.animations, fbx);

  // Auto-scale and center the model
  const scaledModel = useMemo(() => {
    const clone = fbx.clone();
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 2 / maxDim; // Aim for ~2 units height/width
    clone.scale.setScalar(scale);
    
    // Recalculate box after scaling for centering
    box.setFromObject(clone);
    const center = new THREE.Vector3();
    box.getCenter(center);
    clone.position.set(-center.x, -box.min.y - 1, -center.z); // Align bottom to y=-1
    
    return clone;
  }, [fbx]);

  // Auto-play the first animation (usually Idle) if it exists
  React.useEffect(() => {
    if (names.length > 0) {
      const action = actions[names[0]];
      if (action) {
        action.reset().fadeIn(0.5).play();
      }
    }
  }, [names, actions]);

  // Handle "Speaking" state with a simple scale pulsing
  useFrame((state) => {
    if (isSpeaking) {
      const time = state.clock.getElapsedTime();
      scaledModel.scale.setScalar((2 / Math.max(new THREE.Box3().setFromObject(fbx).getSize(new THREE.Vector3()).x, 1)) * (1 + Math.sin(time * 15) * 0.02));
    }
  });

  return <primitive object={scaledModel} />;
}

export default function RiggedCharacter({ modelPath, isSpeaking, isLoading }: RiggedCharacterProps) {
  return (
    <div className="w-full h-full relative bg-transparent">
      <Canvas shadows camera={{ position: [0, 0.5, 3], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <Suspense fallback={null}>
          <Model modelPath={modelPath} isSpeaking={isSpeaking} />
          <Environment preset="city" />
          <ContactShadows position={[0, -1, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
        </Suspense>
        {/* <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={Math.PI / 2.2} maxPolarAngle={Math.PI / 2.2} /> */}
      </Canvas>
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-950/20 backdrop-blur-sm z-10 transition-opacity">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
