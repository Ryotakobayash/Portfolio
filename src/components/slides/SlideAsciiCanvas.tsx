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

  // Mount the Canvas only when:
  //   (a) the slide is actually on screen — IntersectionObserver filters out
  //       display: none slides so hidden Canvases don't burn WebGL contexts.
  //   (b) the slide system's view transition has finished animating. While
  //       the transition is in flight, drei's AsciiEffect can read transient
  //       sizes from the captured pseudo-element and throw
  //       "Value is not of type 'long'" from getImageData. The slide system
  //       (src/pages/slides/[slug].astro) sets html[data-slide-dir] for the
  //       duration of startViewTransition().finished — watch its removal.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let slideDirObserver: MutationObserver | null = null;

    const cancelPending = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      slideDirObserver?.disconnect();
      slideDirObserver = null;
    };

    const armMount = () => {
      cancelPending();
      const root = document.documentElement;
      const mountNext = () => {
        raf = requestAnimationFrame(() => setVisible(true));
      };

      if (root.dataset.slideDir == null) {
        mountNext();
        return;
      }

      slideDirObserver = new MutationObserver(() => {
        if (root.dataset.slideDir == null) {
          slideDirObserver?.disconnect();
          slideDirObserver = null;
          mountNext();
        }
      });
      slideDirObserver.observe(root, {
        attributes: true,
        attributeFilter: ['data-slide-dir'],
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.boundingClientRect.width > 0) {
          armMount();
        } else {
          cancelPending();
          setVisible(false);
        }
      },
      { threshold: 0 },
    );
    observer.observe(el);

    return () => {
      cancelPending();
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
