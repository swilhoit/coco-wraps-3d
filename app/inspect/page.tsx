'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

interface MeshInfo {
  name: string
  materialName: string
  materialType: string
}

function ModelInspector() {
  const [materials, setMaterials] = useState<string[]>([])
  const [meshes, setMeshes] = useState<MeshInfo[]>([])
  const { scene } = useGLTF('/CocoAdWrap.glb')

  useEffect(() => {
    if (scene) {
      const foundMaterials = new Set<string>()
      const foundMeshes: MeshInfo[] = []

      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const meshInfo: MeshInfo = {
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
          {materials.map((material, i) => (
            <div key={i} className="bg-gray-700 px-3 py-1 rounded">
              <span className={material === 'Coco Wrap' ? 'text-green-400 font-semibold' : 'text-gray-300'}>
                {material}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-800 rounded">
        <h3 className="font-semibold mb-2">Looking for &quot;Coco Wrap&quot;:</h3>
        {materials.includes('Coco Wrap') ? (
          <div className="text-green-400">✓ Found &quot;Coco Wrap&quot; material!</div>
        ) : (
          <div>
            <div className="text-red-400">✗ &quot;Coco Wrap&quot; not found</div>
            <div className="text-sm text-gray-400 mt-2">
              <p>Available materials: {materials.join(', ')}</p>
              <p className="mt-2">
                If you want to apply textures to a specific material, update the ChromeModel.tsx 
                component to target the correct material name from the list above.
              </p>
            </div>
          </div>
        )}
        <div className="text-sm text-gray-500 mt-4">
          <p>
            You have access to all Coco Wrap material maps (textures) for viewing.
          </p>
        </div>
      </div>
    </div>
  )
}

const ModelInspectorClient = dynamic(() => Promise.resolve(ModelInspector), {
  ssr: false,
  loading: () => (
    <div className="p-8 bg-gray-900 text-white min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
        <p>Loading Model Inspector...</p>
      </div>
    </div>
  )
})

export default function InspectPage() {
  return (
    <div className="h-screen overflow-y-auto">
      <ModelInspectorClient />
    </div>
  )
}