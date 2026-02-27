"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MAJOR_ARCANA, type TarotCard } from "@/data/cards";

type SpreadMode = "single" | "three";
type Phase = "home" | "drawing" | "result";

interface DrawnResult {
  card: TarotCard;
  reversed: boolean;
  label?: string;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function CardBack({ className = "" }: { className?: string }) {
  return (
    <div
      className={`w-[180px] h-[277px] md:w-[220px] md:h-[340px] rounded-lg overflow-hidden border border-amber-400/70 flex-shrink-0 ${className}`}
      style={{ boxShadow: "0 0 25px rgba(212, 175, 55, 0.15)" }}
    >
      <img src="/cards/back.webp" alt="Card back" className="w-full h-full object-cover" />
    </div>
  );
}

function CardFront({ card, size = "normal" }: { card: TarotCard; size?: "normal" | "small" }) {
  const sizeClass = size === "small"
    ? "w-[160px] h-[246px] md:w-[200px] md:h-[308px]"
    : "w-[200px] h-[308px] md:w-[260px] md:h-[400px]";
  return (
    <div
      className={`${sizeClass} rounded-lg overflow-hidden border-2 border-amber-400/70 flex-shrink-0`}
      style={{ boxShadow: "0 0 40px rgba(212, 175, 55, 0.25)" }}
    >
      <img
        src={`/cards/${card.id}.webp`}
        alt={`${card.name} - ${card.nameEn}`}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

function SpreadButton({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center gap-3 p-6 rounded-xl border border-amber-400/30 hover:border-amber-400/60 transition-all duration-300 hover:bg-amber-400/5 w-full max-w-[280px]"
    >
      <span className="text-primary font-serif text-lg tracking-wide group-hover:text-glow transition-all">
        {title}
      </span>
      <span className="text-foreground/60 text-sm font-light">{description}</span>
    </button>
  );
}

const THREE_LABELS = ["过去", "现在", "未来"];

export default function TarotPage() {
  const deck = useMemo(() => shuffleArray(MAJOR_ARCANA), []);
  const [phase, setPhase] = useState<Phase>("home");
  const [mode, setMode] = useState<SpreadMode>("single");
  const [results, setResults] = useState<DrawnResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const [stars, setStars] = useState<
    { id: number; left: string; top: string; delay: number; duration: number }[]
  >([]);

  useEffect(() => {
    setStars(
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: Math.random() * 3,
        duration: 2 + Math.random() * 3,
      }))
    );
  }, []);

  const drawCards = useCallback(
    (spreadMode: SpreadMode) => {
      setMode(spreadMode);
      setPhase("drawing");
      setSelectedIndex(null);

      const count = spreadMode === "three" ? 3 : 1;
      const shuffled = shuffleArray(deck);

      setTimeout(() => {
        const drawn: DrawnResult[] = shuffled.slice(0, count).map((card, i) => ({
          card,
          reversed: Math.random() > 0.5,
          label: spreadMode === "three" ? THREE_LABELS[i] : undefined,
        }));
        setResults(drawn);
        setPhase("result");
        if (spreadMode === "single") setSelectedIndex(0);
      }, 800);
    },
    [deck]
  );

  const goHome = useCallback(() => {
    setPhase("home");
    setResults([]);
    setSelectedIndex(null);
  }, []);

  const selected = selectedIndex !== null ? results[selectedIndex] : null;

  return (
    <div
      className="min-h-screen overflow-hidden relative"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, #1a1a3e 0%, #0a0a12 50%), linear-gradient(180deg, #0a0a12 0%, #12101f 100%)",
      }}
    >
      <div className="absolute inset-0 bg-background/80 z-0" />

      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {stars.map((s) => (
          <motion.div
            key={s.id}
            className="absolute w-1 h-1 bg-amber-200/40 rounded-full"
            style={{ left: s.left, top: s.top }}
            animate={{ opacity: [0.2, 0.7, 0.2] }}
            transition={{
              duration: s.duration,
              repeat: Infinity,
              delay: s.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="z-10 w-full max-w-5xl px-4 md:px-8 py-10 flex flex-col items-center mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center mb-10"
        >
          <h1
            className="text-4xl md:text-6xl font-serif text-primary text-glow mb-4 tracking-widest uppercase cursor-pointer"
            onClick={goHome}
          >
            Fate&apos;s Whisper
          </h1>
          <p className="text-foreground/80 font-light tracking-wider">
            聆听来自以太的低语，揭示未知的命运
          </p>
        </motion.div>

        {/* Main content */}
        <AnimatePresence mode="wait">
          {phase === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-10"
            >
              {/* Card back preview */}
              <div className="flex items-center justify-center gap-4">
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <CardBack />
                </motion.div>
              </div>

              {/* Spread selection */}
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                <SpreadButton
                  title="单牌占卜"
                  description="抽取一张牌，获取当下的指引"
                  onClick={() => drawCards("single")}
                />
                <SpreadButton
                  title="三牌阵"
                  description="过去·现在·未来，三张牌揭示命运之线"
                  onClick={() => drawCards("three")}
                />
              </div>

              <p className="text-foreground/50 text-xs font-light max-w-sm text-center">
                静心冥想，将你的问题交托给宇宙，然后选择一种牌阵
              </p>
            </motion.div>
          )}

          {phase === "drawing" && (
            <motion.div
              key="drawing"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-8 min-h-[400px] justify-center"
            >
              <div className="flex gap-4">
                {Array.from({ length: mode === "three" ? 3 : 1 }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      rotateY: [0, 180, 360],
                      scale: [1, 0.9, 1],
                    }}
                    transition={{
                      duration: 0.8,
                      delay: i * 0.15,
                      ease: "easeInOut",
                    }}
                  >
                    <CardBack className={mode === "three" ? "!w-[140px] !h-[216px] md:!w-[180px] md:!h-[277px]" : ""} />
                  </motion.div>
                ))}
              </div>
              <p className="text-foreground/60 font-light tracking-wider text-sm">
                命运正在回应...
              </p>
            </motion.div>
          )}

          {phase === "result" && mode === "single" && selected && (
            <motion.div
              key="single-result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full flex flex-col md:flex-row gap-8 md:gap-12 items-center justify-center"
            >
              <motion.div
                initial={{ rotateY: 180, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={selected.reversed ? "rotate-180" : ""}
              >
                <CardFront card={selected.card} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex-1 max-w-md space-y-5 rounded-lg p-6 md:p-8"
                style={{
                  background: "rgba(15, 15, 35, 0.6)",
                  border: "1px solid rgba(212, 175, 55, 0.25)",
                  boxShadow: "0 0 40px rgba(212, 175, 55, 0.06)",
                }}
              >
                <h2 className="text-xl md:text-2xl font-serif text-primary text-glow tracking-wide">
                  {selected.card.name} ({selected.card.nameEn.toUpperCase()})
                </h2>
                <p className="text-sm text-foreground/70 font-light">
                  {selected.card.keywords.join("、")}。
                </p>
                <p className="text-sm text-foreground/80 font-light leading-relaxed">
                  {selected.reversed ? selected.card.reversedMeaning : selected.card.meaning}
                </p>
                {selected.reversed && (
                  <p className="text-xs italic text-foreground/50">逆位</p>
                )}
                <button
                  onClick={goHome}
                  className="flex items-center gap-2 px-5 py-2.5 rounded border border-amber-400/40 text-primary text-sm hover:bg-amber-400/10 transition-colors duration-200"
                >
                  再次寻求指引
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </motion.div>
            </motion.div>
          )}

          {phase === "result" && mode === "three" && (
            <motion.div
              key="three-result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full flex flex-col items-center gap-8"
            >
              {/* Three cards row */}
              <div className="flex gap-4 md:gap-6 items-end justify-center flex-wrap">
                {results.map((r, i) => (
                  <motion.div
                    key={i}
                    initial={{ rotateY: 180, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    transition={{ duration: 0.7, delay: i * 0.2, ease: "easeOut" }}
                    className="flex flex-col items-center gap-3 cursor-pointer"
                    onClick={() => setSelectedIndex(i)}
                  >
                    <p className="text-primary/80 font-serif text-sm tracking-wider">{r.label}</p>
                    <div
                      className={`transition-all duration-300 ${
                        selectedIndex === i
                          ? "scale-105 ring-2 ring-amber-400/60 rounded-lg"
                          : "opacity-70 hover:opacity-100"
                      } ${r.reversed ? "rotate-180" : ""}`}
                    >
                      <CardFront card={r.card} size="small" />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Interpretation panel */}
              <AnimatePresence mode="wait">
                {selected ? (
                  <motion.div
                    key={`interp-${selectedIndex}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-2xl rounded-lg p-6 md:p-8 space-y-4"
                    style={{
                      background: "rgba(15, 15, 35, 0.6)",
                      border: "1px solid rgba(212, 175, 55, 0.25)",
                      boxShadow: "0 0 40px rgba(212, 175, 55, 0.06)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-primary/60 text-xs tracking-wider font-light uppercase">
                        {selected.label}
                      </span>
                      {selected.reversed && (
                        <span className="text-xs italic text-foreground/50">逆位</span>
                      )}
                    </div>
                    <h2 className="text-xl font-serif text-primary text-glow tracking-wide">
                      {selected.card.name} ({selected.card.nameEn.toUpperCase()})
                    </h2>
                    <p className="text-sm text-foreground/70 font-light">
                      {selected.card.keywords.join("、")}。
                    </p>
                    <p className="text-sm text-foreground/80 font-light leading-relaxed">
                      {selected.reversed ? selected.card.reversedMeaning : selected.card.meaning}
                    </p>
                  </motion.div>
                ) : (
                  <motion.p
                    key="hint"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-foreground/50 text-sm font-light"
                  >
                    点击卡牌查看解读
                  </motion.p>
                )}
              </AnimatePresence>

              <button
                onClick={goHome}
                className="flex items-center gap-2 px-5 py-2.5 rounded border border-amber-400/40 text-primary text-sm hover:bg-amber-400/10 transition-colors duration-200 mt-2"
              >
                再次寻求指引
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
