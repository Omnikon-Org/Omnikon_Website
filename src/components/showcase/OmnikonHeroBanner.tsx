'use client';

import React, { useEffect, useRef } from 'react';

export function OmnikonHeroBanner() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = 300);

    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = 300;
      }
    };

    window.addEventListener('resize', handleResize);

    // Particle setup - reduced count and fixed 80% opacity
    const particlesCount = 20;
    const particles: { x: number; y: number; vx: number; vy: number; radius: number; color: string; alpha: number }[] = [];
    const colors = ['#FF3131', '#38BDF8', '#22C55E', '#EAB308'];

    for (let i = 0; i < particlesCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 0.8,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw particle dots and faint connection lines
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 90) {
            ctx.save();
            ctx.globalAlpha = (1 - dist / 90) * 0.25;
            ctx.strokeStyle = '#FF3131';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative w-full rounded-2xl border border-[#FF3131]/40 bg-[#070707] overflow-hidden my-12 shadow-[0_0_30px_rgba(255,49,49,0.15)] group">
      {/* Particle Canvas Background */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

      {/* Cyberpunk Grid Backdrop */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20 z-0" 
        style={{
          backgroundImage: 'linear-gradient(to right, #27272A 1px, transparent 1px), linear-gradient(to bottom, #27272A 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Decorative Corner Framing Crosshairs / Brackets */}
      <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#FF3131] z-10" />
      <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#FF3131] z-10" />
      <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[#FF3131] z-10" />
      <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#FF3131] z-10" />

      {/* Central Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[260px] sm:min-h-[300px] px-6 py-10 text-center">
        {/* Solid Glowing Title without gradient */}
        <div className="relative">
          <h1 className="font-mono-terminal text-5xl sm:text-7xl lg:text-8xl font-black tracking-widest text-[#FF3131] opacity-90 drop-shadow-[0_0_25px_rgba(255,49,49,0.8)] select-none">
            OMNIKON
          </h1>
          {/* Subtle Glitch / Glow Underline */}
          <div className="mx-auto mt-2 h-1 w-3/4 bg-[#FF3131] opacity-80 rounded-full shadow-[0_0_15px_#FF3131]" />
        </div>

        <p className="mt-4 font-mono-terminal text-xs sm:text-sm text-[#A1A1AA] tracking-widest uppercase">
          SYS.V2.0 &bull; STUDENT-POWERED OPEN-SOURCE ECOSYSTEM
        </p>
      </div>
    </div>
  );
}
