"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const perm = new Uint8Array(512);
const grad3 = [
    [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
    [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
    [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1],
];
(() => {
    const p = Array.from({ length: 256 }, (_, i) => i);
    for (let i = 255; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [p[i], p[j]] = [p[j], p[i]];
    }
    for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
})();

function noise3D(x: number, y: number, z: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);
    const u = x * x * x * (x * (x * 6 - 15) + 10);
    const v = y * y * y * (y * (y * 6 - 15) + 10);
    const w = z * z * z * (z * (z * 6 - 15) + 10);
    const A = perm[X] + Y,
        AA = perm[A] + Z,
        AB = perm[A + 1] + Z;
    const B = perm[X + 1] + Y,
        BA = perm[B] + Z,
        BB = perm[B + 1] + Z;
    const dot = (g: number[], a: number, b: number, c: number) =>
        g[0] * a + g[1] * b + g[2] * c;
    const lerp = (t: number, a: number, b: number) => a + t * (b - a);
    return lerp(
        w,
        lerp(
            v,
            lerp(
                u,
                dot(grad3[perm[AA] % 12], x, y, z),
                dot(grad3[perm[BA] % 12], x - 1, y, z)
            ),
            lerp(
                u,
                dot(grad3[perm[AB] % 12], x, y - 1, z),
                dot(grad3[perm[BB] % 12], x - 1, y - 1, z)
            )
        ),
        lerp(
            v,
            lerp(
                u,
                dot(grad3[perm[AA + 1] % 12], x, y, z - 1),
                dot(grad3[perm[BA + 1] % 12], x - 1, y, z - 1)
            ),
            lerp(
                u,
                dot(grad3[perm[AB + 1] % 12], x, y - 1, z - 1),
                dot(grad3[perm[BB + 1] % 12], x - 1, y - 1, z - 1)
            )
        )
    );
}

function MorphBlob() {
    const meshRef = useRef<THREE.Mesh>(null);
    const mouseRef = useRef({ x: 0, y: 0 });
    const { viewport } = useThree();
    const frameCount = useRef(0);

    const geometry = useMemo(() => new THREE.IcosahedronGeometry(1.6, 28), []);
    const originalPositions = useMemo(
        () => new Float32Array(geometry.attributes.position.array),
        [geometry]
    );

    const material = useMemo(
        () =>
            new THREE.ShaderMaterial({
                transparent: true,
                wireframe: false,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
                uniforms: {
                    uTime: { value: 0 },
                    uOpacity: { value: 0.12 },
                    uColor1: { value: new THREE.Color("#ffffff") },
                    uColor2: { value: new THREE.Color("#ffffff") },
                },
                vertexShader: `
                    varying vec3 vNormal;
                    varying vec3 vPosition;
                    void main() {
                        vNormal = normalize(normalMatrix * normal);
                        vPosition = position;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform float uOpacity;
                    uniform vec3 uColor1;
                    uniform vec3 uColor2;
                    varying vec3 vNormal;
                    varying vec3 vPosition;
                    void main() {
                        float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.5);
                        vec3 color = mix(uColor2, uColor1, fresnel);
                        float alpha = fresnel * uOpacity + 0.01;
                        gl_FragColor = vec4(color, alpha);
                    }
                `,
            }),
        []
    );

    useFrame((state) => {
        if (!meshRef.current) return;

        frameCount.current++;
        if (frameCount.current % 3 === 0) {
            const time = state.clock.elapsedTime * 0.3;
            const positions = geometry.attributes.position.array as Float32Array;
            for (let i = 0; i < positions.length; i += 3) {
                const ox = originalPositions[i];
                const oy = originalPositions[i + 1];
                const oz = originalPositions[i + 2];
                const len = Math.sqrt(ox * ox + oy * oy + oz * oz);
                const nx = ox / len;
                const ny = oy / len;
                const nz = oz / len;

                const displacement =
                    noise3D(nx * 1.5 + time, ny * 1.5 + time * 0.7, nz * 1.5) *
                    0.25 +
                    noise3D(nx * 3 + time * 0.5, ny * 3 + time * 0.3, nz * 3) *
                    0.1;

                positions[i] = ox + nx * displacement;
                positions[i + 1] = oy + ny * displacement;
                positions[i + 2] = oz + nz * displacement;
            }
            geometry.attributes.position.needsUpdate = true;
            geometry.computeVertexNormals();
            material.uniforms.uTime.value = time;
        }

        meshRef.current.rotation.y += 0.0012;
        meshRef.current.rotation.x += 0.0005;

        const targetX = (state.pointer.x * viewport.width) / 50;
        const targetY = (state.pointer.y * viewport.height) / 50;
        mouseRef.current.x += (targetX - mouseRef.current.x) * 0.015;
        mouseRef.current.y += (targetY - mouseRef.current.y) * 0.015;
        meshRef.current.position.x = mouseRef.current.x;
        meshRef.current.position.y = mouseRef.current.y;
    });

    return <mesh ref={meshRef} geometry={geometry} material={material} />;
}

function OrbitalParticles() {
    const pointsRef = useRef<THREE.Points>(null);
    const count = 80;

    const { positions, speeds, radii, offsets } = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const speeds = new Float32Array(count);
        const radii = new Float32Array(count);
        const offsets = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            const radius = 2.2 + Math.random() * 2.5;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);

            speeds[i] = 0.05 + Math.random() * 0.15;
            radii[i] = radius;
            offsets[i] = Math.random() * Math.PI * 2;
        }
        return { positions, speeds, radii, offsets };
    }, []);

    const material = useMemo(
        () =>
            new THREE.PointsMaterial({
                color: new THREE.Color("#aaaaaa"),
                size: 0.015,
                transparent: true,
                opacity: 0.4,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                sizeAttenuation: true,
            }),
        []
    );

    useFrame((state) => {
        if (!pointsRef.current) return;
        const time = state.clock.elapsedTime;
        const posArray = pointsRef.current.geometry.attributes.position
            .array as Float32Array;

        for (let i = 0; i < count; i++) {
            const r = radii[i];
            const speed = speeds[i];
            const offset = offsets[i];
            const angle = time * speed + offset;

            posArray[i * 3] = r * Math.cos(angle) * Math.sin(angle * 0.3);
            posArray[i * 3 + 1] =
                r * Math.sin(angle * 0.5) * 0.6 +
                Math.sin(time * 0.2 + offset) * 0.3;
            posArray[i * 3 + 2] = r * Math.sin(angle) * Math.cos(angle * 0.3);
        }

        pointsRef.current.geometry.attributes.position.needsUpdate = true;
        pointsRef.current.rotation.y += 0.0003;
    });

    return (
        <points ref={pointsRef} material={material}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                    count={count}
                />
            </bufferGeometry>
        </points>
    );
}

function GlowRing() {
    const meshRef = useRef<THREE.Mesh>(null);

    const material = useMemo(
        () =>
            new THREE.ShaderMaterial({
                transparent: true,
                depthWrite: false,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending,
                uniforms: {
                    uTime: { value: 0 },
                },
                vertexShader: `
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    varying vec2 vUv;
                    uniform float uTime;
                    void main() {
                        float dist = abs(vUv.y - 0.5) * 2.0;
                        float alpha = smoothstep(1.0, 0.3, dist) * 0.04;
                        alpha *= 0.5 + 0.5 * sin(vUv.x * 20.0 + uTime * 2.0);
                        gl_FragColor = vec4(vec3(0.85), alpha);
                    }
                `,
            }),
        []
    );

    useFrame((state) => {
        if (!meshRef.current) return;
        material.uniforms.uTime.value = state.clock.elapsedTime;
        meshRef.current.rotation.x = Math.PI / 2;
        meshRef.current.rotation.z += 0.001;
    });

    return (
        <mesh ref={meshRef} material={material}>
            <torusGeometry args={[2.8, 0.15, 2, 128]} />
        </mesh>
    );
}

function SceneContent({ paused }: { paused: boolean }) {
    useFrame((_, delta) => {
    }, -1);

    if (paused) return null;

    return (
        <>
            <MorphBlob />
            <OrbitalParticles />
            <GlowRing />
        </>
    );
}

export default function HeroScene() {
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
                camera={{ position: [0, 0, 5.5], fov: 45 }}
                style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                }}
                gl={{
                    antialias: false,
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
