"use client";

import { AnimatePresence, motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { createContext, type MouseEvent, type PropsWithChildren, useContext, useEffect, useState } from "react";
import { MOTION_PRIMITIVE_CATALOG, type MotionPrimitiveName } from "@/src/lib/component-catalog";
import { tenantProfile } from "@/src/generated/tenant-profile";
import { cn } from "@/src/lib/utils";

export function Reveal({ children, className, delay = 0 }: PropsWithChildren<{ className?: string; delay?: number }>) {
  const reduced = useReducedMotion();
  return (
    <motion.div className={className} initial={reduced ? false : { opacity: 0, y: 24 }} whileInView={reduced ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, margin: "-8%" }} transition={{ duration: .65, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

const MotionRegistryContext = createContext({ enabled: new Set<MotionPrimitiveName>(MOTION_PRIMITIVE_CATALOG), catalog: MOTION_PRIMITIVE_CATALOG });
export function MotionPrimitiveProvider({ children }: PropsWithChildren) {
  return <MotionRegistryContext.Provider value={{ enabled: new Set(tenantProfile.experience.motionPrimitives), catalog: MOTION_PRIMITIVE_CATALOG }}>{children}</MotionRegistryContext.Provider>;
}
export function useMotionPrimitiveRegistry() { return useContext(MotionRegistryContext); }

export function AnimatedBackground({ children, className }: PropsWithChildren<{ className?: string }>) {
  const reduced = useReducedMotion();
  return <motion.div className={cn("relative overflow-hidden", className)} animate={reduced ? undefined : { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }}>{children}</motion.div>;
}

export function AnimatedGroup({ children, className }: PropsWithChildren<{ className?: string }>) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial="hidden" whileInView="show" viewport={{ once: true }} variants={{ hidden: {}, show: { transition: { staggerChildren: reduced ? 0 : .08 } } }}>{children}</motion.div>;
}

export function AnimatedGroupItem({ children, className }: PropsWithChildren<{ className?: string }>) {
  const reduced = useReducedMotion();
  return <motion.div className={className} variants={reduced ? undefined : { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}>{children}</motion.div>;
}

export function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const reduced = useReducedMotion();
  const spring = useSpring(0, { stiffness: 70, damping: 18 });
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const unsubscribe = spring.on("change", (current) => setDisplay(Math.round(current)));
    if (reduced) spring.jump(value); else spring.set(value);
    return unsubscribe;
  }, [reduced, spring, value]);
  return <span className={className}>{display.toLocaleString()}</span>;
}

export function BorderTrail({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  return <motion.span aria-hidden="true" className={cn("pointer-events-none absolute inset-0 rounded-[inherit] border-2 border-transparent [background:linear-gradient(90deg,transparent,var(--brand-accent),transparent)_border-box] [mask:linear-gradient(#000_0_0)_padding-box,linear-gradient(#000_0_0)] [mask-composite:exclude]", className)} animate={reduced ? undefined : { rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}/>
}

export function Carousel({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn("flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&>*]:min-w-[82%] [&>*]:snap-center md:[&>*]:min-w-[42%]", className)}>{children}</div>;
}

export function CursorGlow() {
  const reduced = useReducedMotion(); const x = useMotionValue(-200); const y = useMotionValue(-200);
  useEffect(() => {
    if (reduced) return;
    const move = (event: PointerEvent) => { x.set(event.clientX); y.set(event.clientY); };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [reduced, x, y]);
  if (reduced) return null;
  return <motion.div className="pointer-events-none fixed z-[80] size-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--brand-accent)]/12 blur-3xl" style={{ x, y }}/>
}

export function Dock({ children }: PropsWithChildren) { return <div className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white/75 p-1.5 shadow-2xl backdrop-blur-xl">{children}</div>; }
export function GlowEffect({ className }: { className?: string }) { return <span aria-hidden="true" className={cn("pointer-events-none absolute -inset-20 -z-10 bg-[radial-gradient(circle,var(--brand-accent)_0%,transparent_62%)] opacity-20 blur-3xl", className)}/>; }
export const InView = Reveal;

export function Magnetic({ children, className }: PropsWithChildren<{ className?: string }>) {
  const reduced = useReducedMotion();
  const x = useMotionValue(0); const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 180, damping: 18 });
  const springY = useSpring(y, { stiffness: 180, damping: 18 });
  function move(event: MouseEvent<HTMLDivElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - box.left - box.width / 2) * .14);
    y.set((event.clientY - box.top - box.height / 2) * .14);
  }
  return <motion.div className={cn("inline-flex", className)} style={reduced ? undefined : { x: springX, y: springY }} onMouseMove={reduced ? undefined : move} onMouseLeave={() => { x.set(0); y.set(0); }}>{children}</motion.div>;
}

export function TiltCard({ children, className }: PropsWithChildren<{ className?: string }>) {
  const reduced = useReducedMotion();
  const pointerX = useMotionValue(.5); const pointerY = useMotionValue(.5);
  const rotateX = useTransform(pointerY, [0, 1], [3, -3]);
  const rotateY = useTransform(pointerX, [0, 1], [-3, 3]);
  return <motion.div className={className} style={reduced ? undefined : { rotateX, rotateY, transformPerspective: 900 }} onPointerMove={reduced ? undefined : (event) => {
    const box = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - box.left) / box.width); pointerY.set((event.clientY - box.top) / box.height);
  }} onPointerLeave={() => { pointerX.set(.5); pointerY.set(.5); }}>{children}</motion.div>;
}

export function Marquee({ children }: PropsWithChildren) {
  const reduced = useReducedMotion();
  return <div className="overflow-hidden"><motion.div className="flex min-w-max" animate={reduced ? undefined : { x: ["0%", "-50%"] }} transition={reduced ? undefined : { duration: 22, ease: "linear", repeat: Infinity }}>{children}{children}</motion.div></div>;
}

export function MorphingDialog({ trigger, children }: PropsWithChildren<{ trigger: React.ReactNode }>) {
  const [open, setOpen] = useState(false);
  return <><span onClick={() => setOpen(true)}>{trigger}</span><AnimatePresence>{open && <motion.div className="fixed inset-0 z-[110] grid place-items-center bg-slate-950/70 p-4 backdrop-blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}><motion.div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-3xl bg-white p-6 text-slate-950" layoutId="morph-dialog" onClick={(event) => event.stopPropagation()}>{children}</motion.div></motion.div>}</AnimatePresence></>;
}

export function MorphingPopover({ trigger, children }: PropsWithChildren<{ trigger: React.ReactNode }>) {
  const [open, setOpen] = useState(false);
  return <span className="relative inline-flex"><span onClick={() => setOpen(!open)}>{trigger}</span><AnimatePresence>{open && <motion.span className="absolute left-1/2 top-full z-30 mt-3 min-w-64 -translate-x-1/2 rounded-2xl border border-black/10 bg-white p-4 text-slate-950 shadow-2xl" initial={{ opacity: 0, scale: .92, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .92, y: -8 }}>{children}</motion.span>}</AnimatePresence></span>;
}

export function ProgressiveBlur({ className }: { className?: string }) { return <div aria-hidden="true" className={cn("pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[var(--surface)] to-transparent backdrop-blur-[1px] [mask-image:linear-gradient(to_top,black,transparent)]", className)}/>; }

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: .2 });
  return <motion.div className="fixed inset-x-0 top-0 z-[120] h-0.5 origin-left bg-[var(--brand-accent)]" style={{ scaleX }} aria-hidden="true"/>;
}

export function SlidingNumber({ value, className }: { value: string | number; className?: string }) { return <motion.span className={cn("inline-block tabular-nums", className)} key={value} initial={{ y: "70%", opacity: 0 }} animate={{ y: 0, opacity: 1 }}>{value}</motion.span>; }
export function Spotlight({ className }: { className?: string }) { return <motion.span aria-hidden="true" className={cn("pointer-events-none absolute size-80 rounded-full bg-[var(--brand-accent)]/16 blur-3xl", className)} animate={{ x: [0, 70, -30, 0], y: [0, -40, 50, 0] }} transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}/>; }
export function TextEffect({ children, className }: PropsWithChildren<{ className?: string }>) { const reduced = useReducedMotion(); return <motion.span className={cn("inline-block", className)} initial={reduced ? false : { opacity: 0, filter: "blur(12px)", y: 24 }} animate={reduced ? undefined : { opacity: 1, filter: "blur(0px)", y: 0 }} transition={{ duration: .8 }}>{children}</motion.span>; }
export function TextMorph({ values, className }: { values: string[]; className?: string }) { const [index, setIndex] = useState(0); useEffect(() => { const timer = setInterval(() => setIndex((current) => (current + 1) % values.length), 2600); return () => clearInterval(timer); }, [values.length]); return <span className={className}><AnimatePresence mode="wait"><motion.span className="inline-block" key={values[index]} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }}>{values[index]}</motion.span></AnimatePresence></span>; }
export function TextRoll({ children, className }: PropsWithChildren<{ className?: string }>) { return <motion.span className={cn("inline-block", className)} whileHover={{ rotateX: 360 }} transition={{ duration: .5 }}>{children}</motion.span>; }
export function TextScramble({ text, className }: { text: string; className?: string }) { return <motion.span className={className} initial={{ opacity: .25, letterSpacing: ".18em" }} whileInView={{ opacity: 1, letterSpacing: "0em" }} viewport={{ once: true }}>{text}</motion.span>; }
export const Tilt = TiltCard;
export function Toolbar({ children }: PropsWithChildren) { return <div className="inline-flex flex-wrap items-center gap-2 rounded-2xl border border-black/10 bg-white/75 p-2 shadow-xl backdrop-blur">{children}</div>; }
export function TransitionPanel({ panelKey, children, className }: PropsWithChildren<{ panelKey: string; className?: string }>) { return <AnimatePresence mode="wait"><motion.div className={className} key={panelKey} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>{children}</motion.div></AnimatePresence>; }
