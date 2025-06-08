'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';

// Trendy 3D shape: animated floating torus knot with stars background
function TorusKnot() {
  // Remove <Float> for compatibility, animate via mesh rotation in useFrame if needed
  return (
    <mesh castShadow receiveShadow rotation={[Math.PI / 4, Math.PI / 4, 0]}>
      <torusKnotGeometry args={[2, 0.5, 128, 32]} />
      <meshStandardMaterial color="#6366F1" roughness={0.3} metalness={0.8} />
    </mesh>
  );
}

const AnimatedBG = () => (
  <div style={{
    position: 'fixed',
    inset: 0,
    zIndex: 0,
    width: '100vw',
    height: '100vh',
    background: 'linear-gradient(135deg, #e0e7ff 0%, #f0fdfa 100%)',
    overflow: 'hidden',
  }}>
    <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 10, 10]} intensity={1} />
      <TorusKnot />
      <Stars radius={30} depth={60} count={1200} factor={4} saturation={0.8} fade speed={2} />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1.5} />
    </Canvas>
  </div>
);

export default AnimatedBG;
