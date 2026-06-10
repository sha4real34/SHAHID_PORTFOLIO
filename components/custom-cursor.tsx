"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

export function CustomCursor() {
    const [isVisible, setIsVisible] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    useEffect(() => {
        setIsMounted(true);
        if (window.matchMedia("(pointer: coarse)").matches) return;

        const moveCursor = (e: MouseEvent) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
            if (!isVisible) setIsVisible(true);
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (
                target.tagName.toLowerCase() === "button" ||
                target.tagName.toLowerCase() === "a" ||
                target.closest("button") ||
                target.closest("a") ||
                window.getComputedStyle(target).cursor === "pointer"
            ) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        const handleMouseLeave = () => setIsVisible(false);
        const handleMouseEnter = () => setIsVisible(true);

        window.addEventListener("mousemove", moveCursor);
        window.addEventListener("mouseover", handleMouseOver);
        document.addEventListener("mouseleave", handleMouseLeave);
        document.addEventListener("mouseenter", handleMouseEnter);

        return () => {
            window.removeEventListener("mousemove", moveCursor);
            window.removeEventListener("mouseover", handleMouseOver);
            document.removeEventListener("mouseleave", handleMouseLeave);
            document.removeEventListener("mouseenter", handleMouseEnter);
        };
    }, [cursorX, cursorY, isVisible]);

    if (!isMounted) return null;

    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
        return null;
    }

    return (
        <motion.div
            className="fixed top-0 left-0 pointer-events-none hidden md:flex items-center justify-center mix-blend-difference"
            style={{
                x: cursorXSpring,
                y: cursorYSpring,
                translateX: "-50%",
                translateY: "-50%",
                opacity: isVisible ? 1 : 0,
                zIndex: 9999,
            }}
        >
            <motion.div
                className={cn(
                    "rounded-full flex items-center justify-center transition-colors duration-300",
                    isHovering ? "bg-white" : "bg-transparent border border-white/50"
                )}
                animate={{
                    width: isHovering ? 64 : 32,
                    height: isHovering ? 64 : 32,
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
            >
                <motion.div
                    className="w-1.5 h-1.5 rounded-full bg-white"
                    animate={{
                        scale: isHovering ? 0 : 1,
                        opacity: isHovering ? 0 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                />
            </motion.div>
        </motion.div>
    );
}
