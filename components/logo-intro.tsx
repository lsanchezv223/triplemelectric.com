"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

type Point = { x: number; y: number };

type Bolt = {
  points: Point[];
  ttl: number;
  maxTtl: number;
  width: number;
};

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function buildBolt(start: Point, end: Point, steps: number, jitter: number): Point[] {
  const pts: Point[] = [start];
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const x = start.x + (end.x - start.x) * t + rand(-jitter, jitter);
    const y = start.y + (end.y - start.y) * t + rand(-jitter, jitter);
    pts.push({ x, y });
  }
  pts.push(end);
  return pts;
}

export function LogoIntro() {
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setMounted(true);
    setShow(true);
    const timer = window.setTimeout(() => setShow(false), 3000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!show) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let lastSpawn = 0;
    let flash = 0;
    const bolts: Bolt[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const spawnBolt = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const spreadX = Math.min(340, w * 0.34);
      const spreadY = Math.min(170, h * 0.24);

      const side = Math.floor(rand(0, 4));
      let start: Point;
      let end: Point;

      if (side === 0) {
        start = { x: cx - spreadX - rand(120, 220), y: cy + rand(-spreadY, spreadY) };
        end = { x: cx - rand(80, 160), y: cy + rand(-spreadY * 0.7, spreadY * 0.7) };
      } else if (side === 1) {
        start = { x: cx + spreadX + rand(120, 220), y: cy + rand(-spreadY, spreadY) };
        end = { x: cx + rand(80, 160), y: cy + rand(-spreadY * 0.7, spreadY * 0.7) };
      } else if (side === 2) {
        start = { x: cx + rand(-spreadX * 0.45, spreadX * 0.45), y: cy - spreadY - rand(90, 160) };
        end = { x: cx + rand(-spreadX * 0.35, spreadX * 0.35), y: cy - rand(110, 170) };
      } else {
        start = { x: cx + rand(-spreadX * 0.45, spreadX * 0.45), y: cy + spreadY + rand(90, 160) };
        end = { x: cx + rand(-spreadX * 0.35, spreadX * 0.35), y: cy + rand(110, 170) };
      }

      const points = buildBolt(start, end, Math.floor(rand(9, 15)), rand(6, 16));
      bolts.push({
        points,
        ttl: Math.floor(rand(12, 18)),
        maxTtl: 18,
        width: rand(1.4, 2.8)
      });

      if (Math.random() > 0.65) {
        flash = Math.min(0.18, flash + rand(0.06, 0.14));
      }
    };

    const drawBolt = (bolt: Bolt) => {
      const alpha = Math.max(0, bolt.ttl / bolt.maxTtl);

      ctx.beginPath();
      ctx.moveTo(bolt.points[0].x, bolt.points[0].y);
      for (let i = 1; i < bolt.points.length; i++) {
        ctx.lineTo(bolt.points[i].x, bolt.points[i].y);
      }

      ctx.strokeStyle = `rgba(70, 196, 255, ${0.15 + alpha * 0.8})`;
      ctx.lineWidth = bolt.width;
      ctx.shadowColor = "rgba(70, 196, 255, 0.95)";
      ctx.shadowBlur = 16;
      ctx.stroke();

      ctx.strokeStyle = `rgba(228, 247, 255, ${0.2 + alpha * 0.85})`;
      ctx.lineWidth = Math.max(0.8, bolt.width * 0.45);
      ctx.shadowBlur = 0;
      ctx.stroke();
    };

    const loop = (time: number) => {
      ctx.fillStyle = "rgba(2, 10, 22, 0.24)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (time - lastSpawn > rand(85, 170)) {
        spawnBolt();
        lastSpawn = time;
      }

      for (let i = bolts.length - 1; i >= 0; i--) {
        drawBolt(bolts[i]);
        bolts[i].ttl -= 1;
        if (bolts[i].ttl <= 0) bolts.splice(i, 1);
      }

      if (flash > 0.001) {
        ctx.fillStyle = `rgba(180, 235, 255, ${flash})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        flash *= 0.74;
      }

      raf = window.requestAnimationFrame(loop);
    };

    resize();
    ctx.fillStyle = "rgba(2, 10, 22, 1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    window.addEventListener("resize", resize);
    raf = window.requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(raf);
    };
  }, [show]);

  if (!mounted || !show) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="pointer-events-none fixed inset-0 z-[80] flex items-center justify-center overflow-hidden bg-midnight"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.45, ease: "easeOut" } }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />

        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(86,202,255,0.30)_0%,_transparent_56%)]"
          animate={{ opacity: [0.25, 1, 0.72, 0.15, 0] }}
          transition={{ duration: 2.8, times: [0, 0.2, 0.55, 0.82, 1], ease: "easeInOut" }}
        />

        <motion.div
          className="logo-intro-wrap relative"
          initial={{ scale: 0.9, opacity: 0.15 }}
          animate={{ scale: [0.9, 1.02, 1], opacity: [0.15, 1, 1] }}
          transition={{ duration: 0.95, ease: "easeOut" }}
        >
          <motion.div
            className="absolute inset-0 rounded-full border border-slateBlue/25"
            animate={{ opacity: [0, 0.55, 0.35, 0], scale: [0.9, 1, 1.08, 1.14] }}
            transition={{ duration: 2.7, times: [0, 0.2, 0.58, 1], ease: "easeOut" }}
          />

          <Image
            src="/TME-Logo.svg"
            alt="Triple M Electric logo intro"
            width={360}
            height={210}
            priority
            className="relative z-10 h-auto w-[230px] drop-shadow-[0_0_42px_rgba(93,204,255,0.82)] md:w-[330px]"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
