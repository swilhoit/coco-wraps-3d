'use client'

import { useEffect, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

function ModelInspector() {
  const [materials, setMaterials] = useState<string[]>([])
  const [meshes, setMeshes] = useState<any[]>([])
  const { scene } = useGLTF('/CocoAdWrap.glb')

  useEffect(() => {
    if (scene) {
      const foundMaterials = new Set<string>()
      const foundMeshes: any[] = []

      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const meshInfo = {
            name: child.name || 'unnamed',
            materialName: '',
            materialType: ''
          }

          if (child.material) {
            if (Array.isArray(child.material)) {
              const matNames = child.material.map(m => m.name || 'unnamed')
              meshInfo.materialName = matNames.join(', ')
              meshInfo.materialType = 'Multi-Material'
              child.material.forEach(mat => foundMaterials.add(mat.name || 'unnamed'))
            } else {
              meshInfo.materialName = child.material.name || 'unnamed'
              meshInfo.materialType = child.material.type
              foundMaterials.add(child.material.name || 'unnamed')
            }
          }
          
          foundMeshes.push(meshInfo)
        }
      })

      setMaterials(Array.from(foundMaterials))
      setMeshes(foundMeshes)
    }
  }, [scene])

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen overflow-y-auto">
      <h1 className="text-2xl font-bold mb-6">GLB Model Inspector</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Meshes and Materials:</h2>
        <div className="space-y-2">
          {meshes.map((mesh, i) => (
            <div key={i} className="bg-gray-800 p-3 rounded">
              <div>Mesh #{i + 1}: <span className="text-blue-400">{mesh.name}</span></div>
              <div className="text-sm text-gray-400">
                Material: <span className="text-yellow-400">{mesh.materialName}</span> ({mesh.materialType})
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">All Unique Materials:</h2>
        <div className="flex flex-wrap gap-2">
          {materials.map((mat, i) => (
            <div key={i} className="bg-gray-700 px-3 py-1 rounded">
              {mat}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-800 rounded">
        <h3 className="font-semibold mb-2">Looking for "Coco Wrap":</h3>
        {materials.includes('Coco Wrap') ? (
          <div className="text-green-400">✓ Found "Coco Wrap" material!</div>
        ) : (
          <div>
            <div className="text-red-400">✗ "Coco Wrap" not found</div>
            <div className="text-sm text-gray-400 mt-2">
              Materials found: {materials.join(', ') || 'none'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function InspectPage() {
  return (
    <div className="h-screen overflow-y-auto">
      <ModelInspector />
    </div>
  )
}