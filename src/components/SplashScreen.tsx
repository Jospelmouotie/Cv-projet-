import React, { useEffect, useState } from 'react';
import { FileText, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface SplashScreenProps {
  onFinish?: () => void;
  duration?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish, duration = 2400 }) => {
  const [progress, setProgress] = useState(0);
  const [merged, setMerged] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (pct > 65) {
        setMerged(true);
      }

      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          if (onFinish) onFinish();
        }, 200);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [duration, onFinish]);

  return (
    <div className="fixed inset-0 z-100 bg-slate-950 text-white flex flex-col items-center justify-center p-6 select-none overflow-hidden">
      {/* Glow effect */}
      <div className="absolute w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Logo Container */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-6">
        
        {/* Animated Circles Orbiting around Mini CV and Converging to Form B */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          {/* Mini CV Icon in center */}
          <motion.div
            animate={{ scale: merged ? 0.8 : 1, opacity: merged ? 0.3 : 1 }}
            transition={{ duration: 0.5 }}
            className="w-12 h-14 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-lg flex flex-col items-center justify-center shadow-lg border border-white/20 p-1.5 z-10"
          >
            <FileText className="w-6 h-6 text-white" />
            <div className="w-full space-y-0.5 mt-1">
              <div className="w-3/4 h-0.5 bg-white/70 rounded" />
              <div className="w-1/2 h-0.5 bg-white/50 rounded" />
            </div>
          </motion.div>

          {/* Orbiting Circles */}
          {!merged && (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-dashed border-blue-500/40 pointer-events-none"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="absolute inset-2 rounded-full border border-amber-400/30 pointer-events-none"
              />

              {/* 4 Orbiting Particles */}
              {[0, 90, 180, 270].map((angle, idx) => (
                <motion.div
                  key={idx}
                  animate={{
                    x: [Math.cos((angle * Math.PI) / 180) * 45, 0],
                    y: [Math.sin((angle * Math.PI) / 180) * 45, 0],
                    scale: [1, 1.4, 0.8]
                  }}
                  transition={{
                    repeat: Infinity,
                    repeatType: "reverse",
                    duration: 1.2,
                    delay: idx * 0.15
                  }}
                  className={`absolute w-4 h-4 rounded-full shadow-lg ${
                    idx === 0 ? 'bg-blue-500' : idx === 1 ? 'bg-indigo-500' : idx === 2 ? 'bg-amber-400' : 'bg-cyan-400'
                  }`}
                />
              ))}
            </>
          )}

          {/* Converged Big Letter B */}
          {merged && (
            <motion.div
              initial={{ scale: 0, opacity: 0, rotate: -20 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-amber-500 text-white font-black text-6xl rounded-2xl shadow-2xl ring-4 ring-amber-400/30 z-20"
            >
              B
            </motion.div>
          )}
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2 justify-center">
            MYCV BUILDER <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">CVB</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-xs font-medium">
            Générateur de CV Professionnel & Export PDF Haute Définition
          </p>
        </div>

        {/* Loading Bar */}
        <div className="w-64 space-y-2 pt-2">
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden p-0.5 border border-slate-700/80">
            <div
              className="bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-400 h-full rounded-full transition-all duration-75 ease-out shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] font-bold text-slate-400">
            <span>{merged ? 'Fusion en B achevée !' : 'Assemblage des composants CV...'}</span>
            <span className="text-amber-400">{progress}%</span>
          </div>
        </div>

        {/* Feature Pill Tags */}
        <div className="flex flex-wrap justify-center gap-2 pt-2 text-[10px] font-bold text-slate-400">
          <span className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> MYCV BUILDER (CVB)
          </span>
          <span className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
            <CheckCircle2 className="w-3 h-3 text-amber-400" /> Export PDF HD
          </span>
        </div>
      </div>
    </div>
  );
};

