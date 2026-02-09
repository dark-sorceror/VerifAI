import { useEffect, useRef } from "react";

export function useDraggable(initialX: number = 0, initialY: number = 0) {
    const elementRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const offset = useRef({ x: 0, y: 0 });

    useEffect(() => {
        if (elementRef.current) {
            elementRef.current.style.left = `${initialX}px`;
            elementRef.current.style.top = `${initialY}px`;
        }

        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging.current || !elementRef.current) return;

            const newX = e.clientX - offset.current.x;
            const newY = e.clientY - offset.current.y;

            elementRef.current.style.left = `${newX}px`;
            elementRef.current.style.top = `${newY}px`;
        };

        const handleMouseUp = () => {
            isDragging.current = false;
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [initialX, initialY]);

    const startDrag = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest("button")) return;

        if (elementRef.current) {
            isDragging.current = true;

            const rect = elementRef.current.getBoundingClientRect();

            offset.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };
        }
    };

    return { elementRef, startDrag };
}
