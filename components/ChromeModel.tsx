'use client'

import { useRef, useState, useEffect, useMemo, Suspense } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, useGLTF, Preload, BakeShadows, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { Group } from 'three'
import * as THREE from 'three'

const textures = [
  '00.jpg', '01.jpg', '02.jpg', '03.jpg', '04.jpg', 
  '05.jpg', '06.jpg', '07.jpg', '08.jpg', '09.jpg', '10.jpg'
]

function CocoModel({ currentTexture }: { currentTexture: string | null }) {
  const groupRef = useRef<Group>(null!)
  const [isDragging, setIsDragging] = useState(false)
  const { scene } = useGLTF('/CocoAdWrap.glb')
  const texture = currentTexture ? useLoader(THREE.TextureLoader, `/${currentTexture}`) : null
  
  // Store original materials to avoid recreating them
  const originalMaterials = useRef<Map<THREE.Mesh, THREE.Material | THREE.Material[]>>(new Map())

  useEffect(() => {
    if (texture) {
      // Fix UV mapping
      texture.flipY = false // This is often needed for GLB models
      texture.wrapS = THREE.RepeatWrapping
      texture.wrapT = THREE.RepeatWrapping
      
      // Optimize texture settings
      texture.minFilter = THREE.LinearMipmapLinearFilter
      texture.magFilter = THREE.LinearFilter
      texture.generateMipmaps = true
      texture.anisotropy = 4 // Reduced from default 16
      texture.needsUpdate = true
    }
  }, [texture])

  useEffect(() => {
    if (scene) {
      // First pass: store original materials and optimize geometry
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // Store original material if not already stored
          if (!originalMaterials.current.has(child)) {
            originalMaterials.current.set(child, child.material)
          }
          
          // Optimize geometry
          if (child.geometry) {
            child.geometry.computeBoundingSphere()
            // Enable frustum culling
            child.frustumCulled = true
          }
          
          const material = child.material as THREE.Material
          
          // Only update materials that are named exactly "Coco Wrap"
          if (material && material.name === 'Coco Wrap') {
            if (texture) {
              // Reuse material if possible, just update the map
              if (child.material instanceof THREE.MeshStandardMaterial) {
                child.material.map = texture
                child.material.needsUpdate = true
              } else {
                child.material = new THREE.MeshStandardMaterial({
                  map: texture,
                  metalness: 0.1,
                  roughness: 0.5,
                })
              }
            } else {
              // Restore original material
              const original = originalMaterials.current.get(child)
              if (original) {
                child.material = original
              }
            }
          }
        }
      })
    }
  }, [scene, texture])

  useFrame((state, delta) => {
    if (!isDragging && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3
    }
  })

  return (
    <group
      ref={groupRef}
      onPointerDown={() => setIsDragging(true)}
      onPointerUp={() => setIsDragging(false)}
      onPointerLeave={() => setIsDragging(false)}
      scale={[2, 2, 2]}
    >
      <primitive object={scene} />
    </group>
  )
}

// Preload model
useGLTF.preload('/CocoAdWrap.glb')

export default function ChromeModel() {
  const [currentTexture, setCurrentTexture] = useState<string | null>(null)
  const [enableEffects, setEnableEffects] = useState(false)

  return (
    <div className="w-full h-full flex canvas-container">
      {/* 3D Viewer */}
      <div className="flex-1 relative">
        <Canvas 
          camera={{ position: [0, 0, 5], fov: 45 }}
          dpr={[1, 2]} // Limit pixel ratio
          performance={{ min: 0.5 }} // Allow frame drops for performance
          gl={{ 
            antialias: false, // Disable for better performance
            powerPreference: "high-performance",
            alpha: false,
            stencil: false,
            depth: true
          }}
        >
          <AdaptiveDpr pixelated />
          <AdaptiveEvents />
          
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow={false} />
          
          <Suspense fallback={null}>
            <CocoModel currentTexture={currentTexture} />
            <Environment preset="city" resolution={256} />
          </Suspense>
          
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI - Math.PI / 6}
            enableDamping={true}
            dampingFactor={0.05}
          />
          
          {enableEffects && (
            <EffectComposer>
              <Bloom
                intensity={0.1}
                luminanceThreshold={0.95}
                luminanceSmoothing={0.99}
                height={300}
                radius={0.8}
                mipmapBlur={false}
              />
            </EffectComposer>
          )}
          
          <Preload all />
        </Canvas>
        
        {/* Performance toggle */}
        <button
          onClick={() => setEnableEffects(!enableEffects)}
          className="absolute top-4 left-4 px-3 py-1 bg-gray-800 text-white rounded text-sm hover:bg-gray-700"
        >
          Effects: {enableEffects ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Texture Selection Panel */}
      <div className="w-64 bg-gray-900 p-4 overflow-y-auto">
        <h3 className="text-white text-lg font-semibold mb-4">Texture Gallery</h3>
        <div className="grid grid-cols-2 gap-2">
          {/* Clear/None button */}
          <button
            onClick={() => setCurrentTexture(null)}
            className={`relative overflow-hidden rounded-lg border-2 transition-all col-span-2 ${
              currentTexture === null 
                ? 'border-blue-500 shadow-lg shadow-blue-500/30' 
                : 'border-gray-600 hover:border-gray-400'
            }`}
          >
            <div className="w-full h-20 bg-gray-800 flex items-center justify-center">
              <span className="text-white text-sm">No Texture</span>
            </div>
          </button>
          {textures.map((texture) => (
            <button
              key={texture}
              onClick={() => setCurrentTexture(texture)}
              className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                currentTexture === texture 
                  ? 'border-blue-500 shadow-lg shadow-blue-500/30' 
                  : 'border-gray-600 hover:border-gray-400'
              }`}
            >
              <img
                src={`/${texture}`}
                alt={`Texture ${texture}`}
                className="w-full h-20 object-cover"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 text-center">
                {texture.replace('.jpg', '')}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}