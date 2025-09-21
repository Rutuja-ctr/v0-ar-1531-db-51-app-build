"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Html } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import type * as THREE from "three"

interface ChemistryLabSceneProps {
  experiment: {
    id: string
    equipment: string[]
    steps: Array<{
      id: number
      title: string
      equipment: string
      action: string
    }>
  }
  currentStep: number
  onStepComplete: (stepId: number) => void
  completedSteps: number[]
  testSolutionColor?: string
  standardSolutionColor?: string
  onChemicalAdd?: (chemical: string) => void
}

function Beaker({ position, label, isSelected, onClick, solutionColor, volume, size = "medium" }: any) {
  const meshRef = useRef<THREE.Mesh>(null)
  const labelRef = useRef<THREE.Mesh>(null)

  const dimensions = {
    small: { radius: 0.8, height: 1.8, rimRadius: 0.85 },
    medium: { radius: 1.0, height: 2.2, rimRadius: 1.05 },
    large: { radius: 1.3, height: 2.8, rimRadius: 1.35 },
  }
  const dim = dimensions[size] || dimensions.medium

  useFrame((state) => {
    if (meshRef.current && isSelected) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1
    }
  })

  return (
    <group position={position} onClick={onClick}>
      <mesh ref={meshRef} position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[dim.radius, dim.radius * 0.85, dim.height, 32]} />
        <meshPhysicalMaterial
          color={isSelected ? "#e3f2fd" : "#ffffff"}
          transparent
          opacity={0.15}
          roughness={0.1}
          metalness={0.0}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          transmission={0.9}
          thickness={0.1}
        />
      </mesh>

      <mesh position={[0, dim.height / 2 + 0.05, 0]} castShadow>
        <cylinderGeometry args={[dim.rimRadius, dim.radius, 0.1, 32]} />
        <meshPhongMaterial color="#f5f5f5" shininess={100} />
      </mesh>

      <mesh position={[dim.radius * 0.8, dim.height / 2 - 0.2, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <cylinderGeometry args={[0.15, 0.1, 0.3, 16]} />
        <meshPhongMaterial color="#f5f5f5" />
      </mesh>

      {/* Solution inside */}
      {solutionColor && solutionColor !== "transparent" && (
        <mesh position={[0, -dim.height / 4, 0]}>
          <cylinderGeometry args={[dim.radius * 0.9, dim.radius * 0.8, volume || dim.height / 2, 32]} />
          <meshPhongMaterial color={solutionColor} transparent opacity={0.8} shininess={50} />
        </mesh>
      )}

      {size === "large" &&
        [25, 50, 75, 100].map((mark, i) => (
          <group key={i} position={[-dim.radius * 1.1, -dim.height / 2 + 0.4 + i * 0.5, 0]}>
            <mesh>
              <boxGeometry args={[0.15, 0.03, 0.03]} />
              <meshBasicMaterial color="#333" />
            </mesh>
            <Html position={[-0.3, 0, 0]} style={{ fontSize: "10px", color: "#333", fontWeight: "bold" }}>
              {mark}ml
            </Html>
          </group>
        ))}

      <Html position={[0, dim.height / 2 + 0.4, 0]} center>
        <div className="bg-white border-2 border-gray-300 px-3 py-2 rounded-lg shadow-lg">
          <div className="text-center text-sm font-bold text-gray-800 whitespace-pre-line">{label}</div>
        </div>
      </Html>
    </group>
  )
}

function TestTubeRack({ position, onTubeClick, testSolutionColor, standardSolutionColor, completedSteps }: any) {
  return (
    <group position={position}>
      <mesh position={[0, -0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.5, 0.8, 1.8]} />
        <meshPhongMaterial color="#1976d2" shininess={30} />
      </mesh>

      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[4.3, 0.2, 1.6]} />
        <meshPhongMaterial color="#1565c0" />
      </mesh>

      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position={[-1.8 + i * 0.5, -0.05, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.25, 16]} />
          <meshPhongMaterial color="#0d47a1" />
        </mesh>
      ))}

      {[-1.8, 1.8].map((x, i) => (
        <mesh key={i} position={[x, -0.9, 0.7]}>
          <cylinderGeometry args={[0.1, 0.1, 0.8, 8]} />
          <meshPhongMaterial color="#1565c0" />
        </mesh>
      ))}

      {/* Standard solution test tube */}
      <TestTube
        position={[-0.5, 1.2, 0]}
        label="Standard\nsolution"
        solutionColor={standardSolutionColor}
        onClick={() => onTubeClick("standard-tube")}
        isVisible={completedSteps.includes(1)}
      />

      {/* Test solution test tube */}
      <TestTube
        position={[0, 1.2, 0]}
        label="Test\nsolution"
        solutionColor={testSolutionColor}
        onClick={() => onTubeClick("test-tube")}
        isVisible={completedSteps.includes(2)}
      />
    </group>
  )
}

function TestTube({ position, label, solutionColor, onClick, isVisible }: any) {
  if (!isVisible) return null

  return (
    <group position={position} onClick={onClick}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.18, 2.5, 16]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.12}
          roughness={0.05}
          metalness={0.0}
          clearcoat={1.0}
          transmission={0.95}
          thickness={0.05}
        />
      </mesh>

      <mesh position={[0, -1.35, 0]}>
        <sphereGeometry args={[0.18, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.12} roughness={0.05} transmission={0.95} />
      </mesh>

      <mesh position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.24, 0.22, 0.1, 16]} />
        <meshPhongMaterial color="#f5f5f5" />
      </mesh>

      {/* Solution inside */}
      {solutionColor && solutionColor !== "transparent" && (
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.2, 0.16, 1.8, 16]} />
          <meshPhongMaterial color={solutionColor} transparent opacity={0.85} shininess={40} />
        </mesh>
      )}

      <Html position={[0, 0.5, 0]} center>
        <div className="bg-white border border-red-300 px-2 py-1 rounded shadow-md">
          <div className="text-center text-xs font-semibold text-red-700 whitespace-pre-line">{label}</div>
        </div>
      </Html>
    </group>
  )
}

function LabBench() {
  return (
    <group>
      <mesh position={[0, -2, 0]} receiveShadow>
        <boxGeometry args={[14, 0.3, 8]} />
        <meshPhongMaterial color="#f8f9fa" shininess={20} />
      </mesh>

      <mesh position={[0, -1.85, 4]} receiveShadow>
        <boxGeometry args={[14, 0.1, 0.2]} />
        <meshPhongMaterial color="#dee2e6" />
      </mesh>

      {/* Lab bench legs */}
      {[
        [-6, -3.2, -3.5],
        [6, -3.2, -3.5],
        [-6, -3.2, 3.5],
        [6, -3.2, 3.5],
      ].map((pos, i) => (
        <mesh key={i} position={pos} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 2.5, 8]} />
          <meshPhongMaterial color="#adb5bd" />
        </mesh>
      ))}
    </group>
  )
}

function Scene({
  experiment,
  currentStep,
  onStepComplete,
  completedSteps,
  testSolutionColor,
  standardSolutionColor,
  onChemicalAdd,
}: ChemistryLabSceneProps) {
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null)
  const { camera } = useThree()

  useEffect(() => {
    camera.position.set(0, 3, 10)
    camera.lookAt(0, 0, 0)
  }, [camera])

  const currentStepData = experiment.steps[currentStep]

  const handleEquipmentClick = (equipment: string) => {
    if (currentStepData?.equipment === equipment || equipment === "chemical-add") {
      setSelectedEquipment(equipment)

      // Handle chemical addition
      if (equipment === "agno3-beaker" && onChemicalAdd) {
        onChemicalAdd("AgNO3")
      }

      // Simulate step completion after animation
      setTimeout(() => {
        if (currentStepData) {
          onStepComplete(currentStepData.id)
        }
        setSelectedEquipment(null)
      }, 2000)
    }
  }

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 15, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-8, 8, -5]} intensity={0.4} />
      <pointLight position={[8, 8, 5]} intensity={0.4} />

      {/* Lab bench */}
      <LabBench />

      {/* Equipment for chloride limit test */}
      {experiment.id === "1" && (
        <>
          <Beaker
            position={[-4, 0, 0]}
            label="KCl\nSolution"
            isSelected={selectedEquipment === "kcl-beaker"}
            onClick={() => handleEquipmentClick("kcl-beaker")}
            solutionColor={completedSteps.includes(1) ? "#e1f5fe" : "transparent"}
            volume={1.8}
            size="medium"
          />

          <TestTubeRack
            position={[0, 0, 0]}
            onTubeClick={handleEquipmentClick}
            testSolutionColor={testSolutionColor}
            standardSolutionColor={standardSolutionColor}
            completedSteps={completedSteps}
          />

          <Beaker
            position={[4.5, 0, 0]}
            label="AgNO₃\n100ml"
            isSelected={selectedEquipment === "agno3-beaker"}
            onClick={() => handleEquipmentClick("agno3-beaker")}
            solutionColor="#f3e5f5"
            volume={2.2}
            size="large"
          />
        </>
      )}

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={Math.PI / 6}
        minDistance={6}
        maxDistance={18}
        autoRotate={false}
        autoRotateSpeed={0.5}
      />
    </>
  )
}

export function ChemistryLabScene(props: ChemistryLabSceneProps) {
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null)
  const [animationState, setAnimationState] = useState<string>("")

  const currentStepData = props.experiment.steps[props.currentStep]

  const handleEquipmentClick = (equipment: string) => {
    if (currentStepData?.equipment === equipment || equipment === "chemical-add") {
      setSelectedEquipment(equipment)
      setAnimationState(currentStepData?.action || "add")

      // Handle chemical addition
      if (equipment === "agno3-beaker" && props.onChemicalAdd) {
        props.onChemicalAdd("AgNO3")
      }

      // Simulate step completion after animation
      setTimeout(() => {
        if (currentStepData) {
          props.onStepComplete(currentStepData.id)
        }
        setAnimationState("")
        setSelectedEquipment(null)
      }, 2000)
    }
  }

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-gray-800 to-gray-900">
      <Canvas
        camera={{ position: [0, 3, 10], fov: 60 }}
        shadows
        className="w-full h-full"
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <Scene {...props} />
        </Suspense>
      </Canvas>

      {/* Equipment Controls - Mobile optimized */}
      <div className="absolute top-2 left-2 lg:top-4 lg:left-4 space-y-1 lg:space-y-2">
        <Button
          variant={selectedEquipment === "kcl-beaker" ? "default" : "outline"}
          size="sm"
          className="bg-white/10 backdrop-blur-sm text-xs lg:text-sm w-full"
          onClick={() => handleEquipmentClick("kcl-beaker")}
          disabled={currentStepData?.equipment !== "kcl-beaker"}
        >
          KCl Solution
        </Button>
        <Button
          variant={selectedEquipment === "standard-tube" ? "default" : "outline"}
          size="sm"
          className="bg-white/10 backdrop-blur-sm text-xs lg:text-sm w-full"
          onClick={() => handleEquipmentClick("standard-tube")}
          disabled={currentStepData?.equipment !== "standard-tube"}
        >
          Standard Solution
        </Button>
        <Button
          variant={selectedEquipment === "test-tube" ? "default" : "outline"}
          size="sm"
          className="bg-white/10 backdrop-blur-sm text-xs lg:text-sm w-full"
          onClick={() => handleEquipmentClick("test-tube")}
          disabled={currentStepData?.equipment !== "test-tube"}
        >
          Test Solution
        </Button>
        <Button
          variant={selectedEquipment === "agno3-beaker" ? "default" : "outline"}
          size="sm"
          className="bg-white/10 backdrop-blur-sm text-xs lg:text-sm w-full"
          onClick={() => handleEquipmentClick("agno3-beaker")}
          disabled={currentStepData?.equipment !== "agno3-beaker"}
        >
          AgNO₃ Solution
        </Button>
      </div>

      {/* Animation Overlay */}
      {animationState && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-lab-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-white text-sm lg:text-base">
                {animationState === "prepare" && "Preparing solution..."}
                {animationState === "add" && "Adding AgNO₃ dropwise..."}
                {animationState === "mix" && "Mixing solution gently..."}
                {animationState === "compare" && "Comparing turbidity levels..."}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
