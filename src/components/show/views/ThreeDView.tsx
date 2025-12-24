import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, ContactShadows, Text, Html } from '@react-three/drei';
import { useStore } from '../../../utils/store';

function DroneTooltip({ name, status, battery }: { name: string, status: string, battery: number }) {
    return (
        <Html position={[0, 1.5, 0]} center distanceFactor={10} zIndexRange={[100, 0]}>
            <div className="bg-black/80 text-white p-2 rounded text-xs whitespace-nowrap pointer-events-none backdrop-blur-sm border border-white/20 shadow-lg">
                <div className="font-bold text-sm mb-1 border-b border-white/20 pb-1">{name}</div>
                <div className="flex flex-col gap-0.5">
                    <div className="flex justify-between gap-4">
                        <span className="text-gray-400">Status:</span>
                        <span className={status === 'Offline' ? 'text-red-400' : 'text-green-400'}>{status}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-gray-400">Battery:</span>
                        <span className={battery < 20 ? 'text-red-400' : 'text-white'}>{battery.toFixed(1)}%</span>
                    </div>
                </div>
            </div>
        </Html>
    );
}

function Drone({ position, color, name, status, battery }: { position: [number, number, number], color: string, name: string, status: string, battery: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <group
        position={position}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.2, 0.5]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Simple arms */}
      <mesh position={[0.3, 0, 0.3]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.4]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[-0.3, 0, 0.3]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.4]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0.3, 0, -0.3]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.4]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[-0.3, 0, -0.3]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.4]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      {/*<Text position={[0, 0.5, 0]} fontSize={0.3} color="black" anchorX="center" anchorY="middle">*/}
      {/*  {name}*/}
      {/*</Text>*/}

      {hovered && <DroneTooltip name={name} status={status} battery={battery} />}
    </group>
  );
}

export default function ThreeDView() {
  const { copters } = useStore();

  return (
    <div className="w-full h-full bg-gray-100">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[5, 5, 5]} fov={50} />
        <OrbitControls makeDefault />

        <ambientLight intensity={0.5} />
        <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize={[1024, 1024]}
        />

        <gridHelper args={[20, 20]} position={[0, -0.01, 0]} />
        <axesHelper args={[2]} />

        <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.5} far={10} color="#000000" />

        {copters.map((copter) => (
            <Drone
                key={copter.addr}
                // Assuming x, y are ground coordinates and z is altitude.
                // In Three.js Y is up. So we map z -> y.
                position={[copter.x || 0, copter.z || 0, copter.y || 0]}
                color={`rgb(${copter.color[0]}, ${copter.color[1]}, ${copter.color[2]})`}
                name={copter.name}
                status={copter.flight_mode}
                battery={copter.battery || 0}
            />
        ))}
      </Canvas>
    </div>
  );
}
