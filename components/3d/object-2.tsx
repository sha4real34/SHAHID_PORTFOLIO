"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Custom Shader for the Holographic/Glassmorphic Torus Knot
const GlassyTorusShader = {
    uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uColor1: { value: new THREE.Color("#8855ff") }, // Electric purple
        uColor2: { value: new THREE.Color("#00ffff") }, // Cyan/Aqua
        uOpacity: { value: 0.25 },
    },
    vertexShader: `
        uniform float uTime;
        uniform vec2 uMouse;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;

        // Simple 3D noise function for vertex deformation
        float hash(vec3 p) {
            p = fract(p * 0.3183099 + vec3(0.1, 0.1, 0.1));
            p *= 17.0;
            return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
        }

        float noise(vec3 x) {
            vec3 i = floor(x);
            vec3 f = fract(x);
            f = f * f * (3.0 - 2.0 * f);
            return mix(
                mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
                    mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
                mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                    mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
        }

        void main() {
            vNormal = normalize(normalMatrix * normal);
            vUv = uv;
            vPosition = position;

            // Apply a subtle wave deformation based on time and position
            vec3 coords = position * 1.5 + vec3(0.0, uTime * 0.5, uTime * 0.2);
            float disp = noise(coords) * 0.15;
            
            vec3 newPosition = position + normal * disp;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
    `,
    fragmentShader: `
        uniform float uTime;
        uniform float uOpacity;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;

        void main() {
            // Calculate Fresnel glow effect
            float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
            
            // Dynamic color shift based on position and time
            float wave = sin(vPosition.y * 2.0 + uTime * 1.5) * 0.5 + 0.5;
            vec3 baseColor = mix(uColor1, uColor2, wave);
            
            // Highlight color
            vec3 glowColor = baseColor + vec3(0.2, 0.3, 0.5) * fresnel;
            
            // Dynamic alpha
            float alpha = (fresnel * uOpacity + 0.02) * (0.8 + 0.2 * sin(uTime * 3.0));
            
            gl_FragColor = vec4(glowColor, alpha);
        }
    `
};

function CustomTorusKnot() {
    const meshRef = useRef<THREE.Mesh>(null);
    const mouseRef = useRef({ x: 0, y: 0 });
    const { viewport } = useThree();

    const geometry = useMemo(() => new THREE.TorusKnotGeometry(1.2, 0.35, 120, 16, 2, 3), []);
    
    const shaderMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            uniforms: THREE.UniformsUtils.clone(GlassyTorusShader.uniforms),
            vertexShader: GlassyTorusShader.vertexShader,
            fragmentShader: GlassyTorusShader.fragmentShader,
        });
    }, []);

    useFrame((state) => {
        if (!meshRef.current) return;
        const time = state.clock.elapsedTime;
        
        // Update uniforms
        shaderMaterial.uniforms.uTime.value = time;
        
        // Auto-rotation
        meshRef.current.rotation.y = time * 0.15;
        meshRef.current.rotation.x = time * 0.08;
        meshRef.current.rotation.z = time * 0.05;

        // Smooth mouse follow (tilt effect)
        const targetX = (state.pointer.x * viewport.width) / 12;
        const targetY = (state.pointer.y * viewport.height) / 12;
        mouseRef.current.x += (targetX - mouseRef.current.x) * 0.05;
        mouseRef.current.y += (targetY - mouseRef.current.y) * 0.05;
        
        meshRef.current.position.x = mouseRef.current.x;
        meshRef.current.position.y = mouseRef.current.y;
    });

    return (
        <mesh ref={meshRef} geometry={geometry} material={shaderMaterial} />
    );
}

// Glowing rings surrounding the Torus
function OrbitRings() {
    const groupRef = useRef<THREE.Group>(null);
    const { count, ringGeometries } = useMemo(() => {
        const list = [];
        const count = 3;
        for (let i = 0; i < count; i++) {
            list.push(new THREE.TorusGeometry(2.0 + i * 0.4, 0.015, 8, 100));
        }
        return { count, ringGeometries: list };
    }, []);

    const ringMaterial = useMemo(() => {
        return new THREE.MeshBasicMaterial({
            color: new THREE.Color("#00ffdd"),
            transparent: true,
            opacity: 0.12,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide
        });
    }, []);

    useFrame((state) => {
        if (!groupRef.current) return;
        const time = state.clock.elapsedTime;
        
        // Rotate rings around different axes
        groupRef.current.rotation.x = Math.PI / 3.5 + Math.sin(time * 0.05) * 0.1;
        groupRef.current.rotation.y = time * 0.04;
        
        // Individual ring micro-movement
        const children = groupRef.current.children;
        for (let i = 0; i < children.length; i++) {
            children[i].rotation.z = time * (0.05 + i * 0.02) * (i % 2 === 0 ? 1 : -1);
            // Pulsing scale
            const scaleVal = 1 + Math.sin(time * 1.5 + i) * 0.03;
            children[i].scale.set(scaleVal, scaleVal, scaleVal);
        }
    });

    return (
        <group ref={groupRef}>
            {ringGeometries.map((geo, index) => (
                <mesh key={index} geometry={geo} material={ringMaterial} />
            ))}
        </group>
    );
}

function SceneContent({ paused }: { paused: boolean }) {
    if (paused) return null;
    return (
        <>
            <ambientLight intensity={0.5} />
            <CustomTorusKnot />
            <OrbitRings />
        </>
    );
}

export default function NewHeroScene() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            { threshold: 0.05 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={containerRef}
            style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                contain: "strict",
            }}
        >
            <Canvas
                camera={{ position: [0, 0, 5.0], fov: 45 }}
                style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                }}
                gl={{
                    antialias: true,
                    alpha: true,
                    powerPreference: "high-performance",
                }}
                dpr={[1, 1.5]}
                frameloop={isVisible ? "always" : "never"}
            >
                <SceneContent paused={!isVisible} />
            </Canvas>
        </div>
    );
}
