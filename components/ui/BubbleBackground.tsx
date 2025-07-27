'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

type Bubble = {
  id: number;
  size: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
};

const generateBubbles = (count: number): Bubble[] => {
  return Array.from({ length: count }, (_, id) => ({
    id,
    size: Math.random() * 60 + 30,
    left: Math.random() * 100,
    delay: Math.random() * 5,
    duration: Math.random() * 10 + 5,
    color: id < count / 2 ? 'bg-purple-400' : 'bg-cyan-400',
  }));
};

export default function BubbleBackground() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    setBubbles(generateBubbles(40)); // 20 purple + 20 cyan
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden z-0 pointer-events-none">
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          initial={{ y: '100vh', opacity: 0 }}
          animate={{ y: `-20vh`, opacity: 0.5 }}
          transition={{
            delay: bubble.delay,
            duration: bubble.duration,
            repeat: Infinity,
            repeatType: 'loop',
          }}
          className={`absolute rounded-full mix-blend-screen blur-2xl opacity-20 ${bubble.color}`}
          style={{
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            left: `${bubble.left}%`,
          }}
        />
      ))}
    </div>
  );
}
