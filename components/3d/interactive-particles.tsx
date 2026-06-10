"use client";

import { useEffect, useRef } from "react";

export function InteractiveParticles() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: -1000, y: -1000, radius: 150 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];

        class Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            baseVx: number;
            baseVy: number;
            radius: number;
            alpha: number;

            constructor(w: number, h: number, dpr: number) {
                this.x = Math.random() * w;
                this.y = Math.random() * h;
                this.baseVx = (Math.random() - 0.5) * 0.6 * dpr;
                this.baseVy = (Math.random() - 0.5) * 0.6 * dpr;
                this.vx = this.baseVx;
                this.vy = this.baseVy;
                this.radius = (Math.random() * 1.5 + 0.5) * dpr;
                this.alpha = Math.random() * 0.5 + 0.15;
            }

            update(w: number, h: number, mouse: { x: number, y: number, radius: number }, dpr: number) {
                if (this.x < 0 || this.x > w) {
                    this.baseVx *= -1;
                    this.vx *= -1;
                    this.x = Math.max(0, Math.min(this.x, w));
                }
                if (this.y < 0 || this.y > h) {
                    this.baseVy *= -1;
                    this.vy *= -1;
                    this.y = Math.max(0, Math.min(this.y, h));
                }

                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < mouse.radius) {
                    let forceDirectionX = dx / dist;
                    let forceDirectionY = dy / dist;
                    let force = (mouse.radius - dist) / mouse.radius;

                    let pushX = -forceDirectionX * force * 3 * dpr;
                    let pushY = -forceDirectionY * force * 3 * dpr;

                    this.vx += pushX;
                    this.vy += pushY;
                }

                this.vx += (this.baseVx - this.vx) * 0.04;
                this.vy += (this.baseVy - this.vy) * 0.04;

                let currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                let maxSpeed = 4 * dpr;
                if (currentSpeed > maxSpeed) {
                    this.vx = (this.vx / currentSpeed) * maxSpeed;
                    this.vy = (this.vy / currentSpeed) * maxSpeed;
                }

                this.x += this.vx;
                this.y += this.vy;
            }

            draw(ctx: CanvasRenderingContext2D, isDark: boolean) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = isDark
                    ? `rgba(255, 255, 255, ${this.alpha})`
                    : `rgba(0, 0, 0, ${this.alpha})`;
                ctx.fill();
            }
        }

        const resizeCanvas = () => {
            const rect = canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;

            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;

            mouseRef.current.radius = 140 * dpr;

            initParticles(rect.width, rect.height, dpr);
        };

        const initParticles = (logicalWidth: number, logicalHeight: number, dpr: number) => {
            particles = [];
            const canvasWidth = logicalWidth * dpr;
            const canvasHeight = logicalHeight * dpr;

            const logicalArea = logicalWidth * logicalHeight;
            let count = Math.floor(logicalArea / 12000);
            count = Math.max(20, Math.min(count, 150));

            for (let i = 0; i < count; i++) {
                particles.push(new Particle(canvasWidth, canvasHeight, dpr));
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const isDark = document.documentElement.classList.contains('dark');
            const dpr = window.devicePixelRatio || 1;

            const mouse = mouseRef.current;

            for (let i = 0; i < particles.length; i++) {
                particles[i].update(canvas.width, canvas.height, mouse, dpr);
                particles[i].draw(ctx, isDark);
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            mouseRef.current.x = (e.clientX - rect.left) * dpr;
            mouseRef.current.y = (e.clientY - rect.top) * dpr;
        };

        const handleMouseLeave = () => {
            mouseRef.current.x = -1000;
            mouseRef.current.y = -1000;
        };

        window.addEventListener("resize", resizeCanvas);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseleave", handleMouseLeave);

        resizeCanvas();
        animate();

        return () => {
            window.removeEventListener("resize", resizeCanvas);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseleave", handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />
    );
}
