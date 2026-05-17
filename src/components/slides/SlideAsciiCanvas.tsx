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

  // Only mount the Canvas when the slide is actually on screen.
  // Hidden slides are display: none, so IntersectionObserver reports them
  // as not intersecting — preventing wasted WebGL contexts and the frame-loop
  // errors that result when a Canvas keeps ticking on a zero-sized parent.
  //
  // When transitioning to visible, defer one rAF before mounting so layout
  // settles. Mounting on the same frame as display: none → flex triggers
  // drei's AsciiEffect to call getImageData on a still-zero-sized canvas,
  // throwing "Value is not of type 'long'".
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        cancelAnimationFrame(raf);
        if (entry.isIntersecting && entry.boundingClientRect.width > 0) {
          raf = requestAnimationFrame(() => setVisible(true));
        } else {
          setVisible(false);
        }
      },
      { threshold: 0 },
    );
    observer.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
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
