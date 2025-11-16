import React, { useEffect, useState, useRef } from 'react';

const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorVariant, setCursorVariant] = useState('default');
  const rafRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Use requestAnimationFrame to throttle updates to monitor refresh rate
    const updateMousePosition = () => {
      setMousePosition({ x: mouseRef.current.x, y: mouseRef.current.y });
      rafRef.current = requestAnimationFrame(updateMousePosition);
    };

    const mouseMove = (e: MouseEvent) => {
      // Store position in ref, update via RAF
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseEnter = () => setCursorVariant('hover');
    const handleMouseLeave = () => setCursorVariant('default');

    // Add event listeners to interactive elements
    const interactiveElements = document.querySelectorAll('button, a, .card-3d, .hexagon-card');

    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    window.addEventListener('mousemove', mouseMove, { passive: true });

    // Start RAF loop
    rafRef.current = requestAnimationFrame(updateMousePosition);

    return () => {
      window.removeEventListener('mousemove', mouseMove);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  const variants = {
    default: {
      x: mousePosition.x - 4,
      y: mousePosition.y - 4,
      scale: 1,
    },
    hover: {
      x: mousePosition.x - 20,
      y: mousePosition.y - 20,
      scale: 2,
    },
  };

  return (
    <>
      <div
        className="cursor-dot"
        style={{
          left: `${variants[cursorVariant as keyof typeof variants].x}px`,
          top: `${variants[cursorVariant as keyof typeof variants].y}px`,
          transform: `scale(${variants[cursorVariant as keyof typeof variants].scale})`,
        }}
      />
      <div
        className="cursor-outline"
        style={{
          left: `${mousePosition.x - 20}px`,
          top: `${mousePosition.y - 20}px`,
        }}
      />
    </>
  );
};

export default CustomCursor;
