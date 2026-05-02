import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { AsciiRenderer } from '@react-three/drei';
import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

// 回転するカスタム3Dモデル（saturn.obj）
function CustomModel() {
  // OBJファイルを読み込む
  const obj = useLoader(OBJLoader, '/models/saturn.obj');
  const groupRef = useRef<THREE.Group>(null);

  // 毎フレーム回転させる
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.2;
      groupRef.current.rotation.x += delta * 0.1;
    }
  });

  return (
    <group ref={groupRef} scale={0.1} position={[0, 0, 0]}>
      {/* 読み込んだオブジェクトをそのまま配置 */}
      <primitive object={obj} />
    </group>
  );
}

export default function AsciiBackground() {
  return (
    <div style={{ width: '100%', height: '100vh', position: 'absolute', top: 0, left: 0, zIndex: -1, overflow: 'hidden' }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        {/* ライティング（ASCIIエフェクトの陰影に影響します） */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        <Suspense fallback={null}>
          <CustomModel />
        </Suspense>

        {/* ASCIIレンダラー：画面全体をASCIIアート化 */}
        <AsciiRenderer
          fgColor="currentColor" // CSSのカレントカラーに追従
          bgColor="transparent"  // 背景は透過
          characters=" .:-+*=%@#"
          invert={false}
        />
      </Canvas>
    </div>
  );
}
