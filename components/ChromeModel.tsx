'use client'

import { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, useGLTF, Preload, AdaptiveDpr, AdaptiveEvents, PerformanceMonitor } from '@react-three/drei'
import { Group } from 'three'
import * as THREE from 'three'

const textures = [
  '00.jpg', '01.jpg', '02.jpg', '03.jpg', '04.jpg', 
  '05.jpg', '06.jpg', '07.jpg', '08.jpg', '09.jpg', '10.jpg'
]

// Image preloader with progressive loading
function useProgressiveTexture(texturePath: string | null) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!texturePath) {
      setTexture(null)
      return
    }

    setIsLoading(true)
    const loader = new THREE.TextureLoader()
    
    // Try to load optimized version first
    const optimizedPath = `/optimized/${texturePath.replace('.jpg', '-large.webp')}`
    const fallbackPath = `/optimized/${texturePath.replace('.jpg', '-large.jpg')}`
    const originalPath = `/${texturePath}`

    // Load lower quality first for preview
    const previewPath = `/optimized/${texturePath.replace('.jpg', '-thumb.jpg')}`
    
    // Load preview immediately
    loader.load(
      previewPath,
      (previewTexture) => {
        previewTexture.flipY = false
        previewTexture.minFilter = THREE.LinearFilter
        previewTexture.magFilter = THREE.LinearFilter
        setTexture(previewTexture)
      },
      undefined,
      () => {
        // If preview fails, try original
        loader.load(originalPath, (tex) => {
          tex.flipY = false
          tex.minFilter = THREE.LinearMipmapLinearFilter
          tex.magFilter = THREE.LinearFilter
          setTexture(tex)
          setIsLoading(false)
        })
      }
    )

    // Then load high quality
    loader.load(
      optimizedPath,
      (highQualityTexture) => {
        highQualityTexture.flipY = false
        highQualityTexture.wrapS = THREE.RepeatWrapping
        highQualityTexture.wrapT = THREE.RepeatWrapping
        highQualityTexture.minFilter = THREE.LinearMipmapLinearFilter
        highQualityTexture.magFilter = THREE.LinearFilter
        highQualityTexture.generateMipmaps = true
        highQualityTexture.anisotropy = 4
        setTexture(highQualityTexture)
        setIsLoading(false)
      },
      undefined,
      () => {
        // Fallback to JPEG if WebP fails
        loader.load(
          fallbackPath,
          (fallbackTexture) => {
            fallbackTexture.flipY = false
            fallbackTexture.wrapS = THREE.RepeatWrapping
            fallbackTexture.wrapT = THREE.RepeatWrapping
            fallbackTexture.minFilter = THREE.LinearMipmapLinearFilter
            fallbackTexture.magFilter = THREE.LinearFilter
            fallbackTexture.generateMipmaps = true
            fallbackTexture.anisotropy = 4
            setTexture(fallbackTexture)
            setIsLoading(false)
          },
          undefined,
          () => {
            // Final fallback to original
            loader.load(originalPath, (tex) => {
              tex.flipY = false
              tex.minFilter = THREE.LinearMipmapLinearFilter
              tex.magFilter = THREE.LinearFilter
              tex.generateMipmaps = true
              tex.anisotropy = 4
              setTexture(tex)
              setIsLoading(false)
            })
          }
        )
      }
    )
  }, [texturePath])

  return { texture, isLoading }
}

function CocoModel({ currentTexture }: { currentTexture: string | null }) {
  const groupRef = useRef<Group>(null!)
  const [isDragging, setIsDragging] = useState(false)
  const { scene } = useGLTF('/CocoAdWrap.glb')
  const { texture, isLoading } = useProgressiveTexture(currentTexture)
  
  // Store original materials to avoid recreating them
  const originalMaterials = useRef<Map<THREE.Mesh, THREE.Material | THREE.Material[]>>(new Map())

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
            // Reduce geometry complexity if needed
            if (child.geometry.attributes.position.count > 10000) {
              child.castShadow = false
              child.receiveShadow = false
            }
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
      position={[0, -1, 0]}
    >
      <primitive object={scene} />
      {isLoading && (
        <mesh position={[0, 3, 0]}>
          <boxGeometry args={[0.5, 0.1, 0.5]} />
          <meshBasicMaterial color="blue" />
        </mesh>
      )}
    </group>
  )
}

// Preload model
useGLTF.preload('/CocoAdWrap.glb')

export default function ChromeModel() {
  const [currentTexture, setCurrentTexture] = useState<string | null>(null)
  const [dpr, setDpr] = useState(1)
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set())

  // Preload adjacent textures when one is selected
  useEffect(() => {
    if (currentTexture) {
      const currentIndex = textures.indexOf(currentTexture)
      const adjacentIndices = [
        (currentIndex - 1 + textures.length) % textures.length,
        (currentIndex + 1) % textures.length
      ]

      adjacentIndices.forEach(idx => {
        const textureName = textures[idx]
        if (!preloadedImages.has(textureName)) {
          const img = new Image()
          img.src = `/optimized/${textureName.replace('.jpg', '-thumb.jpg')}`
          img.onload = () => {
            setPreloadedImages(prev => new Set(prev).add(textureName))
          }
        }
      })
    }
  }, [currentTexture, preloadedImages])

  return (
    <div className="w-full h-full flex canvas-container">
      {/* 3D Viewer */}
      <div className="flex-1 relative">
        <Canvas 
          camera={{ position: [0, 0, 5], fov: 45 }}
          dpr={dpr}
          gl={{ 
            antialias: false,
            powerPreference: "high-performance",
            alpha: false,
            stencil: false,
            depth: true,
            failIfMajorPerformanceCaveat: false
          }}
        >
          <PerformanceMonitor
            onIncline={() => setDpr(2)}
            onDecline={() => setDpr(1)}
            flipflops={3}
            onFallback={() => setDpr(1)}
          />
          
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
          
          <Preload all />
        </Canvas>
        
        {/* FPS Counter */}
        <div className="absolute top-4 left-4 px-2 py-1 bg-black/50 text-white rounded text-xs">
          DPR: {dpr}
        </div>
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
          {textures.map((texture) => {
            const isPreloaded = preloadedImages.has(texture)
            return (
              <button
                key={texture}
                onClick={() => setCurrentTexture(texture)}
                className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                  currentTexture === texture 
                    ? 'border-blue-500 shadow-lg shadow-blue-500/30' 
                    : 'border-gray-600 hover:border-gray-400'
                }`}
              >
                <picture>
                  <source 
                    srcSet={`/optimized/${texture.replace('.jpg', '-thumb.webp')}`} 
                    type="image/webp"
                  />
                  <img
                    src={`/optimized/${texture.replace('.jpg', '-thumb.jpg')}`}
                    alt={`Texture ${texture}`}
                    className="w-full h-20 object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 text-center">
                  {texture.replace('.jpg', '')}
                  {isPreloaded && <span className="ml-1 text-green-400">✓</span>}
                </div>
              </button>
            )
          })}
        </div>
        <div className="mt-4 text-xs text-gray-400">
          <p>Tips:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Images are progressively loaded</li>
            <li>Adjacent textures are preloaded</li>
            <li>DPR adjusts based on performance</li>
          </ul>
        </div>
      </div>
    </div>
  )
}