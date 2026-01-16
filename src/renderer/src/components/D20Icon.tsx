import React, { useRef, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Icosahedron, MeshDistortMaterial, Float, Text, Center } from '@react-three/drei'
import * as THREE from 'three'
import { AnimatePresence, motion } from 'framer-motion'
import confetti from 'canvas-confetti'

// 3D 骰子组件
function DiceMesh({ isRolling, onRollComplete }: { isRolling: boolean; onRollComplete: () => void }) {
    const meshRef = useRef<THREE.Mesh>(null!)
    const [targetRotation, setTargetRotation] = useState(new THREE.Euler(0, 0, 0))

    // 滚动逻辑
    useFrame((state, delta) => {
        if (!meshRef.current) return

        if (isRolling) {
            // 疯狂旋转
            meshRef.current.rotation.x += delta * 15
            meshRef.current.rotation.y += delta * 10
            meshRef.current.rotation.z += delta * 5
        } else {
            // 缓慢自旋 (Idle)
            meshRef.current.rotation.y += delta * 0.5
            meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetRotation.x, 0.1)
            meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, targetRotation.z, 0.1)
        }
    })

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <group>
                {/* 内部实体 */}
                <Icosahedron args={[1.2, 0]} ref={meshRef}>
                    <MeshDistortMaterial
                        color={isRolling ? "#60a5fa" : "#818cf8"} // 滚动时变色
                        attach="material"
                        distort={isRolling ? 0.3 : 0} // 滚动时扭曲变形
                        speed={5}
                        roughness={0.2}
                        metalness={0.8}
                    />
                </Icosahedron>

                {/* 外部线框 - 增加科技感 */}
                <Icosahedron args={[1.25, 0]}>
                    <meshBasicMaterial color="#a5b4fc" wireframe transparent opacity={0.3} />
                </Icosahedron>
            </group>
        </Float>
    )
}

export function D20Icon() {
    const [result, setResult] = useState<number | null>(null)
    const [isRolling, setIsRolling] = useState(false)
    const [canRoll, setCanRoll] = useState(true)

    const rollDice = () => {
        if (isRolling || !canRoll) return

        setIsRolling(true)
        setCanRoll(false)
        setResult(null)

        // 滚动时间
        setTimeout(() => {
            const roll = Math.floor(Math.random() * 20) + 1
            setResult(roll)
            setIsRolling(false)

            // 特效
            if (roll === 20) {
                confetti({
                    particleCount: 150,
                    spread: 100,
                    origin: { y: 0.6 },
                    colors: ['#FFD700', '#FCD34D', '#FFFFFF'],
                    scalar: 1.2
                })
            } else if (roll === 1) {
                // 大失败特效
            }

            // 冷却
            setTimeout(() => setCanRoll(true), 2500)
        }, 1000)
    }

    // 结果颜色
    const getResultColor = () => {
        if (result === 20) return "text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]"
        if (result === 1) return "text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.7)]"
        return "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
    }

    return (
        <div className="relative w-full h-full group" style={{ minHeight: '120px' }}> {/* 确保容器高度 */}

            {/* 3D 场景 */}
            <div
                className={`w-full h-full cursor-pointer transition-transform duration-300 ${canRoll ? 'hover:scale-110 active:scale-95' : ''}`}
                onClick={rollDice}
            >
                <Canvas camera={{ position: [0, 0, 4] }}>
                    <ambientLight intensity={0.7} />
                    <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
                    <pointLight position={[-10, -5, -10]} intensity={1} color="#818cf8" />
                    <pointLight position={[0, 5, 0]} intensity={0.5} color="#fbbf24" />
                    <DiceMesh isRolling={isRolling} onRollComplete={() => { }} />
                </Canvas>
            </div>

            {/* 提示文本 */}
            <AnimatePresence>
                {canRoll && !isRolling && !result && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-bold bg-slate-800/90 text-white px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap pointer-events-none backdrop-blur-sm"
                    >
                        点击掷骰 / Click to Roll
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 结果展示 - 覆盖在最上层 */}
            <AnimatePresence>
                {result !== null && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, rotateX: -90 }}
                        animate={{
                            opacity: 1,
                            scale: result === 20 ? 1.5 : 1.2,
                            rotateX: 0,
                            y: -20 // 上浮一点
                        }}
                        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                        transition={{ type: "spring", bounce: 0.5 }}
                        className="absolute inset-0 flex flex-col items-center justify-center z-50 pointer-events-none"
                    >
                        {/* 结果背景光晕 */}
                        <div className={`absolute inset-0 bg-black/20 backdrop-blur-[2px] rounded-full scale-0 animate-ping opacity-50 ${result === 20 ? 'bg-yellow-500/30' : ''}`} />

                        <span className={`text-6xl font-black font-mono tracking-tighter ${getResultColor()}`}>
                            {result}
                        </span>

                        {result === 20 && (
                            <motion.span
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-sm font-bold text-yellow-300 mt-2 uppercase tracking-widest drop-shadow-md"
                            >
                                Critical Hit!
                            </motion.span>
                        )}
                        {result === 1 && (
                            <motion.span
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-sm font-bold text-red-400 mt-2 uppercase tracking-widest drop-shadow-md"
                            >
                                Critical Miss!
                            </motion.span>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
