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

  // Hold the Canvas mount until the View Transition that brings the slide
  // on screen has fully finished. While the transition's pseudo-elements
  // are animating, r3f's measure can read transient/zero dimensions and
  // drei's AsciiEffect throws "getImageData ... Value is not of type 'long'".
  //
  // Strategy:
  //  - ResizeObserver detects when the wrapper actually has size (catches
  //    both initial load on an active slide and direct navigation).
  //  - If a transition is in flight (html[data-slide-dir] is set by the
  //    slide system in [slug].astro), wait for its `transitionend` before
  //    mounting — by then the new slide is settled and visible together
  //    with the canvas.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let cancelled = false;
    let raf = 0;

    const tryMount = () => {
      if (cancelled) return;
      const rect = el.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      // [slug].astro sets html[data-slide-dir] for the duration of the
      // startViewTransition call and removes it in .finished.finally().
      // Wait until it's gone so the canvas mounts on a fully-settled slide.
      if (document.documentElement.dataset.slideDir) {
        raf = requestAnimationFrame(tryMount);
        return;
      }
      setVisible(true);
    };

    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      cancelAnimationFrame(raf);
      if (width >= 1 && height >= 1) {
        tryMount();
      } else {
        setVisible(false);
      }
    });
    ro.observe(el);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
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
