import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Float, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function FloatingCores() {
  const group = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    group.current.rotation.z = t * 0.05;
    group.current.rotation.y = Math.sin(t * 0.1) * 0.2;
  });

  return (
    <group ref={group}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <Sphere args={[0.05, 32, 32]} position={[0.5, 0.2, 0.2]}>
          <meshStandardMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={2} toneMapped={false} />
        </Sphere>
      </Float>
      <Float speed={3} rotationIntensity={0.8} floatIntensity={0.8}>
        <Sphere args={[0.03, 32, 32]} position={[-0.4, -0.3, 0.4]}>
          <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={2} toneMapped={false} />
        </Sphere>
      </Float>
    </group>
  );
}

function NeuralParticles() {
  const points = useRef();
  
  const particlesCount = 2500;
  const positions = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 5;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 5;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 5;
    }
    return pos;
  }, []);

  useFrame((state, delta) => {
    points.current.rotation.y += delta * 0.03;
    points.current.rotation.x += delta * 0.02;
  });

  return (
    <Points ref={points} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#818cf8"
        size={0.008}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.4}
      />
    </Points>
  );
}

const Scene3D = () => {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      <Canvas camera={{ position: [0, 0, 2], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#6366f1" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
        
        <NeuralParticles />
        <FloatingCores />
        
        <fog attach="fog" args={['#030712', 1, 5]} />
      </Canvas>
    </div>
  );
};

export default Scene3D;
