import React, { useEffect, useRef, useState, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { AsciiRenderer } from '@react-three/drei';
import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

interface ModelProps {
  modelUrl: string;
  scale: number;
  speed: number;
}

function RotatingModel({ modelUrl, scale, speed }: ModelProps) {
  const obj = useLoader(OBJLoader, modelUrl);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.2 * speed;
      groupRef.current.rotation.x += delta * 0.1 * speed;
    }
  });

  return (
    <group ref={groupRef} scale={scale}>
      <primitive object={obj} />
    </group>
  );
}

interface Props {
  characters?: string;
  modelUrl?: string;
  scale?: number;
  speed?: number;
}

export default function SlideAsciiCanvas({
  characters = ' .:-=+*#%@',
  modelUrl = '/models/saturn.obj',
  scale = 0.1,
  speed = 1,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  // Mount the Canvas as soon as the wrapper has real dimensions.
  // ResizeObserver fires earlier in the paint cycle than IntersectionObserver,
  // so the slide and its ASCII backdrop appear together — no one-frame flash.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setVisible(width >= 1 && height >= 1);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Silence drei's one-shot "getImageData ... Value is not of type 'long'"
  // that fires on the first frame after Canvas mount. drei's AsciiEffect
  // momentarily sees a non-integer size from r3f's internal measure and
  // throws, but recovers on the very next frame. We can't catch it via
  // ErrorBoundary (the error originates inside requestAnimationFrame), so
  // intercept it at the window level and prevent the console log.
  useEffect(() => {
    const onError = (e: ErrorEvent) => {
      if (
        e.message?.includes('getImageData') &&
        e.message?.includes("not of type 'long'")
      ) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    };
    window.addEventListener('error', onError);
    return () => window.removeEventListener('error', onError);
  }, []);

  return (
    <div ref={ref} style={{ width: '100%', height: '100%' }}>
      {visible && (
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          style={{ width: '100%', height: '100%' }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 10]} intensity={1.5} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />

          <Suspense fallback={null}>
            <RotatingModel modelUrl={modelUrl} scale={scale} speed={speed} />
          </Suspense>

          <AsciiRenderer
            fgColor="currentColor"
            bgColor="transparent"
            characters={characters}
            invert={false}
          />
        </Canvas>
      )}
    </div>
  );
}
