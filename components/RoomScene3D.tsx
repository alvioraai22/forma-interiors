// @ts-nocheck
"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles, Environment, OrbitControls } from "@react-three/drei";

function RoomElements() {
  const groupRef = useRef(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.06;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Floor plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.8, 0]}>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#E8E0D0" roughness={0.9} metalness={0} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 0.5, -3]}>
        <planeGeometry args={[8, 5]} />
        <meshStandardMaterial color="#F5F0E8" roughness={1} />
      </mesh>

      {/* Sofa silhouette */}
      <Float speed={0.8} rotationIntensity={0.05} floatIntensity={0.3}>
        <mesh position={[0, -1, 0]}>
          <boxGeometry args={[3.2, 0.5, 1.1]} />
          <meshStandardMaterial color="#8B7355" roughness={0.85} />
        </mesh>
        {/* Back cushions */}
        <mesh position={[0, -0.55, -0.4]}>
          <boxGeometry args={[3.2, 0.9, 0.3]} />
          <meshStandardMaterial color="#7A6348" roughness={0.85} />
        </mesh>
        {/* Sofa legs */}
        {[[-1.4, -1.45, 0.4], [1.4, -1.45, 0.4], [-1.4, -1.45, -0.4], [1.4, -1.45, -0.4]].map((pos, i) => (
          <mesh key={i} position={pos}>
            <boxGeometry args={[0.08, 0.35, 0.08]} />
            <meshStandardMaterial color="#2C1810" roughness={0.6} metalness={0.1} />
          </mesh>
        ))}
      </Float>

      {/* Coffee table */}
      <Float speed={0.6} rotationIntensity={0.03} floatIntensity={0.2}>
        <mesh position={[0, -1.55, 1.4]}>
          <boxGeometry args={[1.4, 0.06, 0.7]} />
          <meshStandardMaterial color="#D4C4A8" roughness={0.7} metalness={0.05} />
        </mesh>
        {[[-0.55, -1.75, 1.1], [0.55, -1.75, 1.1], [-0.55, -1.75, 1.7], [0.55, -1.75, 1.7]].map((pos, i) => (
          <mesh key={i} position={pos}>
            <boxGeometry args={[0.05, 0.38, 0.05]} />
            <meshStandardMaterial color="#2C1810" roughness={0.5} metalness={0.2} />
          </mesh>
        ))}
      </Float>

      {/* Floor lamp */}
      <Float speed={1} rotationIntensity={0.08} floatIntensity={0.4}>
        <mesh position={[2.2, -0.8, 0.2]}>
          <cylinderGeometry args={[0.02, 0.02, 2.1, 8]} />
          <meshStandardMaterial color="#2C1810" roughness={0.4} metalness={0.4} />
        </mesh>
        <mesh position={[2.2, 0.3, 0.2]}>
          <coneGeometry args={[0.3, 0.45, 12]} />
          <meshStandardMaterial color="#C4714A" roughness={0.7} emissive="#C4714A" emissiveIntensity={0.3} />
        </mesh>
      </Float>

      {/* Abstract floating sphere — art piece */}
      <Float speed={1.4} rotationIntensity={0.2} floatIntensity={0.6}>
        <mesh position={[-2.5, -0.3, 0.5]}>
          <sphereGeometry args={[0.38, 32, 32]} />
          <meshStandardMaterial color="#C4714A" roughness={0.3} metalness={0.5} />
        </mesh>
      </Float>

      {/* Side table */}
      <mesh position={[-1.9, -1.4, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.06, 16]} />
        <meshStandardMaterial color="#D4C4A8" roughness={0.7} />
      </mesh>
      <mesh position={[-1.9, -1.6, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.35, 8]} />
        <meshStandardMaterial color="#8B7355" roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Floating decorative plane — wall art */}
      <Float speed={0.5} rotationIntensity={0.04} floatIntensity={0.15}>
        <mesh position={[-0.5, 0.4, -2.95]}>
          <planeGeometry args={[1.8, 1.2]} />
          <meshStandardMaterial color="#E8D5C0" roughness={0.95} />
        </mesh>
      </Float>

      {/* Rug */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.79, 0.6]}>
        <planeGeometry args={[3.8, 2.2]} />
        <meshStandardMaterial color="#C4A882" roughness={1} />
      </mesh>
    </group>
  );
}

export default function RoomScene3D() {
  return (
    <Canvas
      camera={{ position: [0, 1.2, 5.5], fov: 42 }}
      style={{ background: "transparent" }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => { gl.setClearColor(0x000000, 0); }}
    >
      <ambientLight intensity={1.4} color="#FFF8F0" />
      <directionalLight position={[3, 5, 3]} intensity={1.8} color="#FFF0E0" castShadow />
      <pointLight position={[2.2, 0.5, 0.2]} intensity={2.5} color="#C4714A" distance={4} />
      <pointLight position={[-3, 2, -1]} intensity={0.8} color="#FFE0CC" />

      <Environment preset="apartment" />

      <RoomElements />

      <Sparkles
        count={30}
        scale={6}
        size={1.2}
        speed={0.2}
        color="#C4714A"
        opacity={0.5}
      />

      <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
    </Canvas>
  );
}
