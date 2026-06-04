"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useSpring, useMotionValue } from "framer-motion";
import { Plus, Minus, ArrowRight, ArrowUpRight, Menu, X, Star } from "lucide-react";
import dynamic from "next/dynamic";

const RoomScene3D = dynamic(() => import("../components/RoomScene3D"), { ssr: false });

/* ── Custom Cursor ─────────────────────────────────────── */
function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.left = `${e.clientX}px`;
        dotRef.current.style.top = `${e.clientY}px`;
      }
    };
    window.addEventListener("mousemove", move);
    let raf: number;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const animate = () => {
      ring.current.x = lerp(ring.current.x, pos.current.x, 0.1);
      ring.current.y = lerp(ring.current.y, pos.current.y, 0.1);
      if (ringRef.current) {
        ringRef.current.style.left = `${ring.current.x}px`;
        ringRef.current.style.top = `${ring.current.y}px`;
      }
      raf = requestAnimationFrame(animate);
    };
    animate();
    return () => { window.removeEventListener("mousemove", move); cancelAnimationFrame(raf); };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
}

/* ── Lenis ─────────────────────────────────────────────── */
function useLenis() {
  useEffect(() => {
    let lenis: any;
    import("lenis").then(({ default: Lenis }) => {
      lenis = new Lenis({ lerp: 0.08, wheelMultiplier: 0.9 });
      const raf = (time: number) => { lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    });
    return () => lenis?.destroy();
  }, []);
}

/* ── Reveal ────────────────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .line-reveal");
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible")),
      { threshold: 0.1 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

/* ── Magnetic Wrap ─────────────────────────────────────── */
function MagneticWrap({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 20 });
  const sy = useSpring(y, { stiffness: 200, damping: 20 });

  const onMove = (e: React.MouseEvent) => {
    const rect = ref.current!.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.3);
    y.set((e.clientY - cy) * 0.3);
  };
  const onLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div ref={ref} style={{ x: sx, y: sy }} onMouseMove={onMove} onMouseLeave={onLeave} className="inline-block">
      {children}
    </motion.div>
  );
}

/* ── Counter ───────────────────────────────────────────── */
function Counter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const duration = 1600;
        const step = (timestamp: number) => {
          if (!start) start = timestamp;
          const progress = Math.min((timestamp - start) / duration, 1);
          setVal(Math.floor(progress * end));
          if (progress < 1) requestAnimationFrame(step);
          else setVal(end);
        };
        requestAnimationFrame(step);
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* ── FAQ Item ──────────────────────────────────────────── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-espresso/10">
      <button onClick={() => setOpen(!open)} className="w-full flex justify-between items-center py-6 text-left">
        <span className="font-display text-xl text-espresso">{q}</span>
        <span className="text-terracotta ml-4 flex-shrink-0">
          {open ? <Minus size={16} /> : <Plus size={16} />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-bark/60 font-sans text-sm leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Section Label ─────────────────────────────────────── */
function SectionLabel({ children }: { children: string }) {
  return (
    <p className="section-label reveal mb-6">{children}</p>
  );
}

/* ── Page ──────────────────────────────────────────────── */
export default function FormaPage() {
  useLenis();
  useReveal();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const projects = [
    { name: "Palazzo Rosso", cat: "Residential", loc: "Rome, IT", seed: "palazzo", w: 800, h: 600 },
    { name: "The Belgravia", cat: "Residential", loc: "London, UK", seed: "belgravia", w: 800, h: 600 },
    { name: "Hôtel du Parc", cat: "Hospitality", loc: "Paris, FR", seed: "hotelduparc", w: 800, h: 900 },
    { name: "Villa Arancio", cat: "Villa", loc: "Amalfi Coast", seed: "villa", w: 800, h: 600 },
  ];

  const services = [
    { n: "01", title: "Residential", desc: "From compact urban apartments to sweeping private estates — homes deeply, unmistakably yours.", img: "residential" },
    { n: "02", title: "Commercial", desc: "Hotels, restaurants, offices and retail environments that create lasting impressions.", img: "commercial" },
    { n: "03", title: "Hospitality", desc: "Guest experiences built through materiality, light, and the language of generous space.", img: "hospitality" },
    { n: "04", title: "Styling & FF&E", desc: "Furniture, fixtures, art — sourced globally, curated obsessively, placed precisely.", img: "styling" },
  ];

  const faqs = [
    { q: "What is your typical project timeline?", a: "Residential projects typically span 6–18 months from concept to completion, depending on scope and procurement lead times. We outline a detailed schedule during the briefing phase." },
    { q: "Do you work internationally?", a: "Yes — approximately 60% of our work is international. We have completed projects across the UK, Italy, France, UAE, Norway, and beyond. We manage everything remotely and on-site as required." },
    { q: "How do you structure your fees?", a: "Our fees are structured per project, based on scope and complexity. We are transparent from the first conversation and present a full fee proposal before any commitment is required." },
    { q: "Can you work with existing furniture and artwork?", a: "Absolutely. Many clients have beloved pieces that anchor their new space. We work sensitively with what exists, building a complementary narrative around it." },
    { q: "What design styles do you work in?", a: "We don't subscribe to a single aesthetic. Our approach is narrative-driven — every space tells a story unique to the client. We have delivered everything from strict minimalism to rich maximalism." },
  ];

  const marqueeItems = ["Residential", "Hospitality", "Commercial", "FF&E", "Art Advisory", "London", "Paris", "Dubai", "Milan", "Oslo", "Kinfolk", "AD100"];

  return (
    <main className="bg-linen min-h-screen noise-overlay">
      <CustomCursor />

      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? "glass-nav py-4 shadow-sm" : "py-8 bg-transparent"}`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <a href="#" className="font-display text-2xl tracking-[0.22em] text-espresso font-light">FORMA</a>
          <div className="hidden md:flex items-center gap-10">
            {["Projects", "Services", "Studio", "Journal", "Contact"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`}
                className="text-espresso/45 hover:text-terracotta text-[0.65rem] tracking-[0.25em] uppercase font-sans transition-colors duration-300">
                {item}
              </a>
            ))}
          </div>
          <div className="hidden md:block">
            <MagneticWrap>
              <button className="btn-primary text-[0.65rem]">Start a Project</button>
            </MagneticWrap>
          </div>
          <button className="md:hidden flex flex-col gap-[5px] p-2" onClick={() => setMenuOpen(!menuOpen)}>
            <motion.span animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 7 : 0 }} className="menu-line" />
            <motion.span animate={{ opacity: menuOpen ? 0 : 1 }} className="menu-line" />
            <motion.span animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -7 : 0 }} className="menu-line" />
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-40 bg-linen flex flex-col items-center justify-center gap-10">
            {["Projects", "Services", "Studio", "Journal", "Contact"].map((item, i) => (
              <motion.a
                key={item}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                href={`#${item.toLowerCase()}`}
                onClick={() => setMenuOpen(false)}
                className="font-display text-5xl text-espresso hover:text-terracotta transition-colors"
              >{item}</motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── §1 HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-28 pb-20 px-6">
        {/* Linen panel */}
        <div className="absolute inset-0 bg-gradient-to-br from-linen via-stone/40 to-linen" />

        {/* 3D scene */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-80 pointer-events-none">
          <RoomScene3D />
        </div>

        {/* Floating accent labels */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-36 right-[30%] hidden lg:block"
        >
          <div className="glass-card rounded-full px-4 py-2 text-[0.6rem] tracking-[0.2em] uppercase text-espresso/60 font-sans">
            Biophilic Design
          </div>
        </motion.div>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-48 right-[38%] hidden lg:block"
        >
          <div className="glass-card rounded-full px-4 py-2 text-[0.6rem] tracking-[0.2em] uppercase text-espresso/60 font-sans">
            Natural Materials
          </div>
        </motion.div>
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/2 right-[22%] hidden lg:block"
        >
          <div className="glass-card rounded-full px-4 py-2 text-[0.6rem] tracking-[0.2em] uppercase text-espresso/60 font-sans">
            Bespoke Craft
          </div>
        </motion.div>

        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-3 mb-10"
            >
              <span className="divider-terracotta" />
              <span className="text-terracotta text-[0.65rem] tracking-[0.4em] uppercase font-sans">
                Interior Design · Est. 2011 · London
              </span>
            </motion.div>

            <div className="line-reveal mb-2 visible" style={{ transitionDelay: "0.5s" }}>
              <motion.h1
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="font-display text-[clamp(4rem,8vw,7rem)] leading-[0.88] text-espresso font-light"
              >
                We Design<br />
                <span className="italic text-terracotta">How You</span><br />
                Live.
              </motion.h1>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="text-bark/55 font-sans text-base leading-relaxed mb-10 max-w-md mt-8"
            >
              Award-winning studio crafting spaces of extraordinary beauty and enduring meaning.
              Residential, hospitality, and commercial projects worldwide.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="flex flex-wrap gap-4"
            >
              <MagneticWrap>
                <button className="btn-primary">View Our Work</button>
              </MagneticWrap>
              <MagneticWrap>
                <button className="btn-ghost flex items-center gap-2">
                  Meet the Studio <ArrowRight size={14} />
                </button>
              </MagneticWrap>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="grid grid-cols-3 gap-8 mt-16 pt-10 border-t border-espresso/10"
            >
              {[["120", "+", "Projects"], ["14", "", "Countries"], ["22", "", "Awards"]].map(([v, s, l]) => (
                <div key={l}>
                  <p className="font-display text-4xl text-espresso font-light">
                    <Counter end={parseInt(v)} />{s}
                  </p>
                  <p className="text-bark/40 text-[0.6rem] tracking-[0.25em] uppercase font-sans mt-1">{l}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── §2 TRUST / MARQUEE ──────────────────────────────────────── */}
      <div className="overflow-hidden py-5 bg-espresso relative">
        <div className="flex">
          <div className="marquee-track">
            {[...marqueeItems, ...marqueeItems].map((t, i) => (
              <span key={i} className="text-linen/25 text-[0.65rem] tracking-[0.3em] uppercase font-sans inline-flex items-center gap-6">
                {t} <span className="text-terracotta/50">·</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <section className="py-20 px-6 bg-espresso">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { v: 500, s: "+", l: "Projects Completed" },
              { v: 15, s: "", l: "Years Experience" },
              { v: 22, s: "", l: "Design Awards" },
              { v: 14, s: "", l: "Countries Served" },
            ].map(({ v, s, l }) => (
              <div key={l} className="glass-card rounded-2xl p-8 text-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="font-display text-5xl text-terracotta font-light mb-2">
                  <Counter end={v} suffix={s} />
                </p>
                <p className="text-linen/30 text-[0.6rem] tracking-[0.22em] uppercase font-sans">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── §3 SERVICES BENTO ───────────────────────────────────────── */}
      <section id="services" className="py-32 px-6 bg-linen">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <SectionLabel>What We Do</SectionLabel>
              <h2 className="font-display text-[clamp(2.5rem,5vw,4rem)] text-espresso font-light leading-tight reveal reveal-delay-1">
                Full-Service Design,<br />End to End.
              </h2>
            </div>
            <p className="text-bark/55 font-sans text-sm leading-relaxed max-w-xs reveal reveal-delay-2">
              From initial concept through to final installation — a multidisciplinary team working seamlessly.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card card-hover rounded-2xl overflow-hidden group"
              >
                <div className="h-56 overflow-hidden">
                  <img
                    src={s.title === "Residential" ? "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&h=450&fit=crop&auto=format" : s.title === "Commercial" ? "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=450&fit=crop&auto=format" : s.title === "Hospitality" ? "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=450&fit=crop&auto=format" : "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=450&fit=crop&auto=format"}
                    alt={s.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-terracotta/40 font-display text-2xl font-light">{s.n}</span>
                    <ArrowUpRight size={16} className="text-terracotta opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                  </div>
                  <h3 className="font-display text-2xl text-espresso mb-2">{s.title}</h3>
                  <p className="text-bark/55 font-sans text-xs leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── §4 FEATURED PROJECTS ────────────────────────────────────── */}
      <section id="projects" className="py-32 px-6 bg-stone/40">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-16">
            <div>
              <SectionLabel>Selected Work</SectionLabel>
              <h2 className="font-display text-[clamp(2.5rem,5vw,4rem)] text-espresso font-light reveal reveal-delay-1">Recent Projects</h2>
            </div>
            <button className="hidden md:flex btn-ghost items-center gap-2 text-[0.65rem]">
              All Projects <ArrowRight size={14} />
            </button>
          </div>

          {/* Asymmetric grid */}
          <div className="grid lg:grid-cols-5 gap-5">
            {/* Hero image — col-span-3, tall */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-3 project-card rounded-2xl overflow-hidden group cursor-pointer"
            >
              <div className="relative h-[560px]">
                <img
                  src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=900&h=700&fit=crop&auto=format"
                  alt={projects[0].name}
                  className="w-full h-full object-cover"
                />
                <div className="overlay rounded-2xl">
                  <div className="absolute bottom-8 left-8 text-linen">
                    <p className="text-[0.6rem] tracking-widest uppercase font-sans text-linen/60 mb-2">{projects[0].cat} · {projects[0].loc}</p>
                    <p className="font-display text-3xl">{projects[0].name}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right column — 2 stacked */}
            <div className="lg:col-span-2 flex flex-col gap-5">
              {projects.slice(1, 3).map((p, i) => (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 + i * 0.1 }}
                  className="project-card rounded-2xl overflow-hidden group cursor-pointer flex-1"
                >
                  <div className="relative h-[268px]">
                    <img
                      src={p.seed === "belgravia" ? "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=700&h=500&fit=crop&auto=format" : "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=700&h=500&fit=crop&auto=format"}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="overlay rounded-2xl">
                      <div className="absolute bottom-6 left-6 text-linen">
                        <p className="text-[0.6rem] tracking-widest uppercase font-sans text-linen/60 mb-1">{p.cat} · {p.loc}</p>
                        <p className="font-display text-xl">{p.name}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bottom row — full width */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.25 }}
              className="lg:col-span-5 project-card rounded-2xl overflow-hidden group cursor-pointer"
            >
              <div className="relative h-[280px]">
                <img
                  src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1400&h=400&fit=crop&auto=format"
                  alt={projects[3].name}
                  className="w-full h-full object-cover"
                />
                <div className="overlay rounded-2xl">
                  <div className="absolute bottom-6 left-8 text-linen flex items-end justify-between w-full pr-16">
                    <div>
                      <p className="text-[0.6rem] tracking-widest uppercase font-sans text-linen/60 mb-1">{projects[3].cat} · {projects[3].loc}</p>
                      <p className="font-display text-2xl">{projects[3].name}</p>
                    </div>
                    <ArrowUpRight size={20} className="text-terracotta mb-1" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── §5 ABOUT/STUDIO ─────────────────────────────────────────── */}
      <section id="studio" className="py-32 px-6 bg-espresso text-linen">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <SectionLabel>About FORMA</SectionLabel>
            <h2 className="font-display text-[clamp(2.5rem,5vw,4rem)] text-linen font-light leading-tight mb-8 reveal reveal-delay-1">
              Born from obsession<br />with the perfect space.
            </h2>
            <p className="text-linen/45 font-sans text-sm leading-relaxed mb-5 reveal reveal-delay-2">
              Founded in 2011 by Sofia Andersson and Marco Ricci, FORMA emerged from a shared conviction: that beautiful spaces are not about abundance, but about the right things in the right places.
            </p>
            <p className="text-linen/45 font-sans text-sm leading-relaxed mb-10 reveal reveal-delay-2">
              Fifteen years later, we are a team of 28 designers working across four studios in London, Paris, Milan, and Dubai — serving private clients, developers, and hospitality brands who share our values.
            </p>
            <MagneticWrap>
              <button className="btn-ghost border-linen/30 text-linen hover:bg-linen hover:text-espresso reveal reveal-delay-3">
                Meet the Team
              </button>
            </MagneticWrap>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { v: 500, s: "+", l: "Projects Completed" },
              { v: 15, s: "", l: "Years of Craft" },
              { v: 28, s: "", l: "Designers" },
              { v: 8, s: "", l: "Countries" },
            ].map(({ v, s, l }) => (
              <div key={l} className="rounded-2xl p-8" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p className="font-display text-5xl text-terracotta font-light mb-2">
                  <Counter end={v} suffix={s} />
                </p>
                <p className="text-linen/30 text-[0.6rem] tracking-[0.22em] uppercase font-sans">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── §6 PROCESS ──────────────────────────────────────────────── */}
      <section className="py-32 px-6 bg-linen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <SectionLabel>Our Approach</SectionLabel>
            <h2 className="font-display text-[clamp(2.5rem,5vw,4rem)] text-espresso font-light reveal reveal-delay-1 inline-block">How We Work</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { n: "01", t: "Consultation", d: "We listen deeply to understand your life, your aesthetic, and your vision for the space." },
              { n: "02", t: "Concept", d: "A narrative and visual direction crafted specifically for your space and its story." },
              { n: "03", t: "Design", d: "Detailed drawings, material specifications, and spatial layouts refined to perfection." },
              { n: "04", t: "Realisation", d: "Hands-on completion — down to the final object placed with intention and care." },
            ].map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="relative"
              >
                <div className="text-terracotta/15 font-display text-7xl font-light mb-4 leading-none">{step.n}</div>
                <div className="divider-terracotta mb-5" />
                <h3 className="font-display text-2xl text-espresso mb-3">{step.t}</h3>
                <p className="text-bark/50 font-sans text-xs leading-relaxed">{step.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── §7 TESTIMONIALS ─────────────────────────────────────────── */}
      <section className="py-32 px-6 bg-stone/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <SectionLabel>Client Voices</SectionLabel>
            <h2 className="font-display text-[clamp(2.5rem,5vw,4rem)] text-espresso font-light reveal reveal-delay-1 inline-block">What Our Clients Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { n: "Countess A. Moretti", l: "Rome", t: "FORMA transformed our palazzo into a home that feels centuries old and completely alive. Every room tells a different story — together, they tell ours." },
              { n: "David & Emma Whitmore", l: "London", t: "We gave Sofia and Marco our full trust. They returned it with a home that exceeded every expectation — and our vision." },
              { n: "Jean-Pierre Lavigne", l: "Paris", t: "For Hôtel du Parc, we needed a design that honored the building's 1920s bones while speaking to contemporary guests. FORMA delivered precisely that." },
            ].map((t, i) => (
              <motion.div
                key={t.n}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass-card card-hover rounded-2xl p-8"
              >
                <div className="flex gap-1 mb-6">
                  {Array(5).fill(0).map((_, j) => <Star key={j} size={12} className="text-terracotta fill-terracotta" />)}
                </div>
                <p className="text-bark/65 font-sans text-sm leading-relaxed mb-8 italic">"{t.t}"</p>
                <div className="flex items-center gap-4">
                  <img
                    src={i === 0 ? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&auto=format" : i === 1 ? "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&auto=format" : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&auto=format"}
                    alt={t.n}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-display text-lg text-espresso leading-tight">{t.n}</p>
                    <p className="text-terracotta text-[0.6rem] tracking-widest uppercase font-sans">{t.l}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── §8 FAQ ──────────────────────────────────────────────────── */}
      <section className="py-32 px-6 bg-linen">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <SectionLabel>Questions</SectionLabel>
            <h2 className="font-display text-[clamp(2.5rem,5vw,4rem)] text-espresso font-light reveal reveal-delay-1 inline-block">Common Questions</h2>
          </div>
          {faqs.map((f) => <FAQItem key={f.q} q={f.q} a={f.a} />)}
        </div>
      </section>

      {/* ── §9 CTA ──────────────────────────────────────────────────── */}
      <section id="contact" className="relative py-40 px-6 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1400&h=800&fit=crop&auto=format"
            alt="Luxury interior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-espresso/75" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-3 mb-8"
          >
            <span className="divider-terracotta" />
            <span className="text-terracotta text-[0.65rem] tracking-[0.4em] uppercase font-sans">Begin Your Project</span>
            <span className="divider-terracotta" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-[clamp(3rem,7vw,6rem)] text-linen font-light leading-[0.9] mb-8"
          >
            Transform<br /><span className="italic text-terracotta">Your Space.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-linen/50 font-sans text-sm mb-12 max-w-md mx-auto"
          >
            Every great space begins with a conversation. Tell us about your project and vision.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <MagneticWrap>
              <button className="btn-primary">Start a Conversation</button>
            </MagneticWrap>
            <MagneticWrap>
              <button className="btn-ghost border-linen/40 text-linen hover:bg-linen hover:text-espresso flex items-center gap-2">
                View Our Portfolio <ArrowRight size={14} />
              </button>
            </MagneticWrap>
          </motion.div>
        </div>
      </section>

      {/* ── §10 FOOTER ──────────────────────────────────────────────── */}
      <footer className="bg-espresso py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-5 gap-12 mb-14">
            <div className="md:col-span-2">
              <h3 className="font-display text-3xl text-linen tracking-[0.18em] font-light mb-4">FORMA</h3>
              <p className="text-linen/30 text-xs font-sans leading-relaxed mb-6 max-w-[200px]">
                An interior design studio built on restraint and intention.
              </p>
              <p className="text-linen/20 text-[0.6rem] font-sans tracking-widest uppercase">
                London · Paris · Milan · Dubai
              </p>
            </div>
            {[
              { t: "Practice", ls: ["Residential", "Hospitality", "Commercial", "FF&E", "Art Advisory"] },
              { t: "Studio", ls: ["About", "Team", "Awards", "Press", "Careers"] },
              { t: "Connect", ls: ["Contact", "Instagram", "LinkedIn", "Newsletter", "Journal"] },
            ].map((col) => (
              <div key={col.t}>
                <h4 className="text-terracotta/50 text-[0.6rem] tracking-[0.3em] uppercase font-sans mb-5">{col.t}</h4>
                <ul className="space-y-3">
                  {col.ls.map((l) => (
                    <li key={l}>
                      <a href="#" className="text-linen/25 hover:text-terracotta text-xs font-sans transition-colors duration-300">{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="divider mb-8" />
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-linen/18 text-[0.65rem] font-sans">© 2026 FORMA Design Studio. All rights reserved.</p>
            <div className="flex gap-6">
              {["Privacy", "Terms", "Cookies"].map((l) => (
                <a key={l} href="#" className="text-linen/18 hover:text-terracotta text-[0.65rem] font-sans transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
