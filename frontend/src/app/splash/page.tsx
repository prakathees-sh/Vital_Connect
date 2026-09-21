'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Activity } from 'lucide-react';

/* ─── Animated wireframe canvas ─────────────────────────────────────── */
function WireframeGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Node positions for the topographic network
    const NODES = 80;
    type Node = { x: number; y: number; vx: number; vy: number };
    const nodes: Node[] = Array.from({ length: NODES }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
    }));

    const draw = () => {
      t += 0.003;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Move nodes gently
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });

      const maxDist = 160;

      // Draw edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.065;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(229, 9, 20, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      nodes.forEach((n, i) => {
        const pulse = Math.sin(t * 2 + i) * 0.5 + 0.5;
        const r = 1.2 + pulse * 1.2;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(229, 9, 20, ${0.08 + pulse * 0.12})`;
        ctx.fill();
      });

      // Subtle grid overlay
      ctx.strokeStyle = 'rgba(229, 9, 20, 0.025)';
      ctx.lineWidth = 0.5;
      const gridSize = 80;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 1 }}
    />
  );
}

/* ─── Scan-line overlay ──────────────────────────────────────────────── */
function ScanLine() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage:
          'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)',
        zIndex: 2,
      }}
    />
  );
}

/* ─── Corner bracket decorations ───────────────────────────────────── */
function CornerBrackets() {
  const cls = 'absolute w-6 h-6 border-vital-600';
  return (
    <>
      <span className={`${cls} top-0 left-0 border-t-2 border-l-2`} />
      <span className={`${cls} top-0 right-0 border-t-2 border-r-2`} />
      <span className={`${cls} bottom-0 left-0 border-b-2 border-l-2`} />
      <span className={`${cls} bottom-0 right-0 border-b-2 border-r-2`} />
    </>
  );
}

/* ─── Main Splash Page ───────────────────────────────────────────────── */
export default function SplashPage() {
  const router = useRouter();
  const [entering, setEntering] = useState(false);
  const [visible, setVisible] = useState(false);

  // Fade-in on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleEnter = () => {
    setEntering(true);
    setTimeout(() => router.push('/'), 700);
  };

  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden select-none"
      style={{ backgroundColor: '#0b0c10' }}
    >
      {/* Animated wireframe network background */}
      <WireframeGrid />

      {/* CRT scan lines */}
      <ScanLine />

      {/* Radial crimson vignette bloom from centre */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 55% at 50% 50%, rgba(229,9,20,0.07) 0%, transparent 70%)',
          zIndex: 3,
        }}
      />

      {/* Edge vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 50%, rgba(11,12,16,0.85) 100%)',
          zIndex: 3,
        }}
      />

      {/* ── Brand container ── */}
      <div
        className="relative z-10 flex flex-col items-center text-center px-6"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(14px)',
          transition: 'opacity 0.9s cubic-bezier(.22,1,.36,1), transform 0.9s cubic-bezier(.22,1,.36,1)',
        }}
      >
        {/* Status line */}
        <div className="flex items-center gap-2 mb-8">
          <span
            className="w-1.5 h-1.5 rounded-full bg-emerald-400"
            style={{
              boxShadow: '0 0 6px 2px rgba(52,211,153,0.6)',
              animation: 'pulse 1.6s ease-in-out infinite',
            }}
          />
          <span
            className="text-[10px] font-mono tracking-[0.3em] uppercase"
            style={{ color: '#4b5563' }}
          >
            System Online · TN-NET v2.4.1
          </span>
        </div>

        {/* Logo */}
        <div className="relative flex items-start gap-3 mb-4">
          <h1
            className="font-black tracking-[0.18em] uppercase"
            style={{
              fontSize: 'clamp(2.4rem, 6vw, 5.2rem)',
              color: '#f1f5f9',
              letterSpacing: '0.18em',
              fontFamily: '"Inter", "Barlow", system-ui, sans-serif',
              lineHeight: 1,
            }}
          >
            VITAL{' '}
            <span style={{ color: '#e50914', textShadow: '0 0 40px rgba(229,9,20,0.5)' }}>
              CONNECT
            </span>
          </h1>

          {/* Pulsing indicator dot */}
          <span
            className="mt-1 inline-block w-2.5 h-2.5 rounded-full bg-red-600 shrink-0"
            style={{
              boxShadow: '0 0 8px 3px rgba(229,9,20,0.8)',
              animation: 'vcPulse 1.2s ease-in-out infinite',
            }}
          />
        </div>

        {/* Thin divider */}
        <div
          className="w-24 h-px mb-5"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(229,9,20,0.55), transparent)' }}
        />

        {/* Subtitle */}
        <p
          className="text-xs sm:text-sm font-mono tracking-[0.22em] uppercase mb-12"
          style={{ color: '#4b5563', letterSpacing: '0.22em' }}
        >
          Tamil Nadu Emergency &amp; Blood Coordination Network
        </p>

        {/* Telemetry row */}
        <div className="flex items-center gap-6 mb-10">
          {[
            { label: 'Districts', value: '38' },
            { label: 'Blood Banks', value: '214' },
            { label: 'Active Alerts', value: '7' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div
                className="text-lg font-black font-mono"
                style={{ color: '#e50914', textShadow: '0 0 16px rgba(229,9,20,0.4)' }}
              >
                {s.value}
              </div>
              <div className="text-[9px] font-mono uppercase tracking-widest" style={{ color: '#374151' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* ACCESS SYSTEM Button */}
        <div className="relative group">
          {/* Glow bloom behind button */}
          <div
            className="absolute inset-0 rounded-full blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-500"
            style={{ background: 'rgba(229,9,20,0.35)', transform: 'scale(1.3)' }}
          />

          <button
            onClick={handleEnter}
            disabled={entering}
            className="relative flex items-center gap-3 px-10 py-4 rounded-full font-mono font-bold uppercase tracking-[0.25em] text-sm transition-all duration-300 overflow-hidden"
            style={{
              border: '1.5px solid rgba(229,9,20,0.85)',
              color: entering ? 'rgba(241,245,249,0.6)' : '#f1f5f9',
              background: entering
                ? 'rgba(229,9,20,0.18)'
                : 'rgba(11,12,16,0.7)',
              boxShadow: '0 0 20px rgba(229,9,20,0.25), inset 0 0 20px rgba(229,9,20,0.04)',
              backdropFilter: 'blur(8px)',
              letterSpacing: '0.25em',
            }}
          >
            {/* Hover fill sweep */}
            <span
              className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: 'rgba(229,9,20,0.08)' }}
            />

            {/* Corner brackets */}
            <CornerBrackets />

            {entering ? (
              <>
                <Activity className="w-4 h-4 animate-pulse relative z-10" style={{ color: '#e50914' }} />
                <span className="relative z-10">Initializing...</span>
              </>
            ) : (
              <>
                <span className="relative z-10">Access System</span>
                <ArrowRight
                  className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:translate-x-1"
                  style={{ color: '#e50914' }}
                />
              </>
            )}
          </button>
        </div>

        {/* Bottom hint */}
        <p className="mt-8 text-[10px] font-mono tracking-widest uppercase" style={{ color: '#1f2937' }}>
          Authorized personnel only · Emergency Medical Network
        </p>
      </div>

      {/* Keyframe styles */}
      <style jsx global>{`
        @keyframes vcPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px 3px rgba(229,9,20,0.8); transform: scale(1); }
          50%       { opacity: 0.6; box-shadow: 0 0 18px 6px rgba(229,9,20,0.4); transform: scale(1.3); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
