import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import handPhone from "@/assets/hand-phone.png";
import { getPublicSlackInstallUrl } from "@/lib/slack.functions";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShaderBackground } from "@/components/ui/waves-shaders-homlu-ui";
import TestimonialMarqueeDemo from "@/components/ui/marquee-01";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Trelo — Turn Slack conversations into answers and action" },
      {
        name: "description",
        content:
          "Trelo is the Slack agent that remembers what your team said, turning past threads into instant answers and commitments into tracked tasks.",
      },
      { property: "og:title", content: "Trelo — Turn Slack conversations into answers and action" },
      {
        property: "og:description",
        content:
          "Trelo is the Slack agent that remembers what your team said, turning past threads into instant answers and commitments into tracked tasks.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-white">
      {/* NAV */}
      <header className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-black/5 transition-all">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-3">
          <div className="flex items-center gap-10">
            <a href="/" className="flex items-center gap-2">
              <div className="grid h-7 w-7 place-items-center rounded-md bg-black">
                <span className="text-sm font-black text-white">T</span>
              </div>
              <span className="text-xl font-black tracking-tight text-black">trelo</span>
            </a>
            <nav className="hidden items-center gap-7 md:flex">
              <button className="text-[15px] font-medium text-black hover:opacity-70">
                Pricing
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-[12px] font-medium text-black hover:opacity-70">
              Log in
            </Link>
            <ContinueWithSlackButton variant="nav" />
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-white">
        {/* floating doodle icons scattered across hero */}
        <FloatingDoodle className="left-[2%] top-[8%]" delay={0.2} rotate={-12}>
          <DoodleFace variant="a" size={44} />
        </FloatingDoodle>
        <FloatingDoodle className="left-[46%] top-[4%]" delay={0.35} rotate={8}>
          <DoodleSparkle size={38} />
        </FloatingDoodle>
        <FloatingDoodle className="right-[3%] top-[6%]" delay={0.5} rotate={14}>
          <DoodleFolder size={48} />
        </FloatingDoodle>
        <FloatingDoodle className="left-[3%] top-[52%]" delay={0.6} rotate={-6}>
          <DoodleSignpost size={52} />
        </FloatingDoodle>
        <FloatingDoodle className="left-[38%] bottom-[6%]" delay={0.75} rotate={-10}>
          <DoodleFace variant="c" size={46} />
        </FloatingDoodle>
        <FloatingDoodle className="right-[6%] bottom-[10%]" delay={0.9} rotate={10}>
          <DoodleArrow size={56} />
        </FloatingDoodle>
        <FloatingDoodle className="right-[42%] top-[38%]" delay={1.0} rotate={0}>
          <DoodleStar size={30} />
        </FloatingDoodle>

        <div className="relative mx-auto grid max-w-[1400px] grid-cols-1 items-start gap-6 px-6 pb-4 pt-14 lg:grid-cols-2 lg:pb-6 lg:pt-20">
          {/* LEFT */}
          <div className="max-w-xl">
            <DoodleRow />
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 text-5xl font-black leading-[1.05] tracking-tight text-black sm:text-6xl"
            >
              Capture every decision, surface every answer
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="mt-5 text-[15px] leading-relaxed text-[#42526e]"
            >
              Trelo is the Slack agent that remembers what your team said turning past threads into
              instant answers and commitments into tracked tasks.
            </motion.p>

            <motion.form
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 flex max-w-md gap-2"
            >
              <input
                type="email"
                placeholder="Work email"
                className="flex-1 rounded-md border border-[#dfe1e6] bg-white px-4 py-3 text-[15px] text-black outline-none focus:border-black"
              />
              <button
                type="submit"
                className="whitespace-nowrap rounded-md bg-black px-4 py-3 text-[13px] font-medium text-white shadow-sm transition hover:bg-neutral-800"
              >
                Sign up it's free
              </button>
            </motion.form>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className="mt-4"
            >
              <ContinueWithSlackButton variant="hero" />
            </motion.div>
            <p className="mt-3 text-[13px] text-[#6b778c]">
              Sign in or create your Trelo account with your Slack workspace.
            </p>
          </div>

          {/* RIGHT — cinematic hand+phone stage */}
          <div className="mt-10 lg:mt-20">
            <HeroStage />
          </div>
        </div>
      </section>

      <FeaturesRedesigned />
      <HowItWorksSection />
      <StatsSection />
      <TestimonialsRedesigned />
      <ShowcaseSection />
      <IntegrationsSection />
      <FAQSection />
      <ColorfulShowcaseSection />
      <CTARedesigned />
      <Footer />
    </div>
  );
}

function ContinueWithSlackButton({ variant }: { variant: "nav" | "hero" }) {
  const getInstallUrl = useServerFn(getPublicSlackInstallUrl);
  const [loading, setLoading] = useState(false);

  async function onClick() {
    if (loading) return;
    setLoading(true);
    try {
      const { url } = await getInstallUrl();
      window.location.href = url;
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }

  if (variant === "nav") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="rounded-md bg-black px-3 py-1.5 text-[12px] font-medium text-white shadow-sm transition hover:bg-neutral-800 disabled:cursor-wait disabled:opacity-70"
      >
        {loading ? "Opening Slack…" : "Continue with Slack"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-3 rounded-md border border-[#dfe1e6] bg-white px-5 py-3 text-[15px] font-semibold text-black shadow-sm transition hover:bg-[#f4f5f7] disabled:cursor-wait disabled:opacity-70"
    >
      <SlackLogo small />
      {loading ? "Opening Slack…" : "Continue with Slack"}
    </button>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

function AnimatedText({
  as: Tag = "p",
  children,
  className = "",
  delay = 0,
}: {
  as?: any;
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const MotionTag = motion(Tag as any);
  return (
    <MotionTag
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
      variants={fadeUp}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}

function DoodleRow() {
  const icons = [
    { el: <DoodleFace variant="a" size={40} />, ring: "#4c9aff" },
    { el: <DoodleFace variant="b" size={40} />, ring: "#dfe1e6" },
    { el: <DoodleSignpost size={40} />, ring: "#e01e5a" },
    { el: <DoodleFace variant="c" size={40} />, ring: "#ffb020" },
    { el: <DoodleFace variant="d" size={40} />, ring: "#dfe1e6" },
    { el: <DoodleFolder size={40} />, ring: "#2684ff" },
    { el: <DoodleFace variant="e" size={40} />, ring: "#ff7452" },
  ];
  return (
    <motion.div
      initial="hidden"
      animate="show"
      transition={{ staggerChildren: 0.08, delayChildren: 0.1 }}
      className="flex -space-x-2"
      aria-hidden
    >
      {icons.map((a, i) => (
        <motion.div
          key={i}
          variants={{
            hidden: { opacity: 0, scale: 0.4, y: -8 },
            show: { opacity: 1, scale: 1, y: 0 },
          }}
          transition={{ duration: 0.5, ease: "backOut" }}
          className="grid h-14 w-14 place-items-center rounded-full border-[2.5px] bg-white shadow-sm"
          style={{ borderColor: a.ring }}
        >
          {a.el}
        </motion.div>
      ))}
    </motion.div>
  );
}

function FloatingDoodle({
  children,
  className = "",
  delay = 0,
  rotate = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  rotate?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, rotate: rotate - 20 }}
      animate={{ opacity: 1, scale: 1, rotate }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`pointer-events-none absolute z-0 hidden lg:block ${className}`}
      aria-hidden
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4 + delay, repeat: Infinity, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/* ---------- Hand-drawn doodle icon set (bold black strokes) ---------- */

function DoodleFace({
  variant = "a",
  size = 40,
}: {
  variant?: "a" | "b" | "c" | "d" | "e";
  size?: number;
}) {
  const s = { width: size, height: size } as const;
  const stroke = {
    stroke: "#111",
    strokeWidth: 2.4,
    fill: "none",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (variant === "a") {
    // side profile with bangs
    return (
      <svg viewBox="0 0 40 40" {...s}>
        <path {...stroke} d="M12 30c-2-4-2-10 1-14 3-4 9-5 13-2 3 2 4 6 3 10-1 3-4 5-7 5" />
        <path {...stroke} d="M13 16c2-3 6-4 9-3" />
        <circle cx="22" cy="22" r="1.4" fill="#111" />
      </svg>
    );
  }
  if (variant === "b") {
    // squinting face
    return (
      <svg viewBox="0 0 40 40" {...s}>
        <circle {...stroke} cx="20" cy="20" r="11" />
        <path {...stroke} d="M13 18c1.5-1.5 3.5-1.5 5 0M22 18c1.5-1.5 3.5-1.5 5 0" />
        <path {...stroke} d="M15 25c2 1.5 8 1.5 10 0" />
      </svg>
    );
  }
  if (variant === "c") {
    // curly hair face
    return (
      <svg viewBox="0 0 40 40" {...s}>
        <path {...stroke} d="M9 16c0-6 5-10 11-10s11 4 11 10" />
        <circle {...stroke} cx="20" cy="22" r="10" />
        <circle cx="16" cy="21" r="1.4" fill="#111" />
        <circle cx="24" cy="21" r="1.4" fill="#111" />
        <path {...stroke} d="M17 26c1 1 5 1 6 0" />
      </svg>
    );
  }
  if (variant === "d") {
    // winking face
    return (
      <svg viewBox="0 0 40 40" {...s}>
        <circle {...stroke} cx="20" cy="20" r="11" />
        <circle cx="15" cy="18" r="1.6" fill="#111" />
        <path {...stroke} d="M22 18c1.5-1 3.5-1 5 0" />
        <path {...stroke} d="M15 25c2 2 8 2 10 0" />
      </svg>
    );
  }
  // e — glasses
  return (
    <svg viewBox="0 0 40 40" {...s}>
      <circle {...stroke} cx="20" cy="20" r="11" />
      <circle {...stroke} cx="15" cy="19" r="3" />
      <circle {...stroke} cx="25" cy="19" r="3" />
      <path {...stroke} d="M18 19h4" />
      <path {...stroke} d="M15 26c2 1.5 8 1.5 10 0" />
    </svg>
  );
}

function DoodleSignpost({ size = 40 }: { size?: number }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size}>
      <path d="M20 6v28" stroke="#111" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <path
        d="M9 10h18l4 4-4 4H9z"
        fill="#e01e5a"
        stroke="#111"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DoodleFolder({ size = 40 }: { size?: number }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size}>
      <path
        d="M6 12h10l3 3h15v17H6z"
        fill="#2684ff"
        stroke="#111"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DoodleSparkle({ size = 30 }: { size?: number }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size}>
      <path
        d="M20 4l3 12 12 4-12 3-3 13-3-13-12-3 12-4z"
        fill="#ffcf3d"
        stroke="#111"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DoodleArrow({ size = 50 }: { size?: number }) {
  return (
    <svg viewBox="0 0 60 60" width={size} height={size}>
      <path
        d="M6 40c8-20 24-28 44-24"
        stroke="#111"
        strokeWidth="2.6"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M40 12l10 4-4 10"
        stroke="#111"
        strokeWidth="2.6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DoodleStar({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size}>
      <path
        d="M20 6l4 10 10 1-8 7 3 10-9-6-9 6 3-10-8-7 10-1z"
        fill="#8777d9"
        stroke="#111"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FeaturesRedesigned() {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from(".feature-card", {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        scrollTrigger: {
          trigger: container.current,
          start: "top 80%",
        }
      });
    }, container);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={container} className="relative pt-48 pb-32 mt-16 bg-white text-black overflow-hidden font-poppins">
      <div className="absolute inset-0 z-0">
         <ShaderBackground className="absolute inset-0 w-full h-full object-cover" />
      </div>
      <div className="relative z-10 mx-auto max-w-[1400px] px-6 text-center">
        <h2 className="text-4xl md:text-6xl font-medium tracking-tight mb-8">
          Slack is where work happens. <br/><span className="font-light">Trelo makes sure nothing gets lost.</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {[
            { title: "Instant answers", desc: "Ask Trelo anything — it searches every channel and DM." },
            { title: "Follow-through", desc: "When someone says 'I'll ship it Friday,' Trelo captures it." },
            { title: "Daily Digests", desc: "Wake up to a five-line briefing of what happened." }
          ].map((f, i) => (
            <div key={i} className="feature-card bg-black/5 backdrop-blur-md p-10 rounded-3xl border border-black/10 text-left transition-all duration-300 hover:scale-105 hover:bg-black/10 hover:shadow-xl cursor-default">
              <h3 className="text-2xl font-medium mb-4">{f.title}</h3>
              <p className="text-black/70 font-light">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from(".step-card", {
        scale: 0.95,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        scrollTrigger: {
          trigger: container.current,
          start: "top 80%",
        }
      });
    }, container);
    return () => ctx.revert();
  }, []);

  const steps = [
    { title: "Connect", desc: "Install the Trelo bot in your Slack workspace with one click." },
    { title: "Observe", desc: "Trelo silently indexes your public channels and learns your team's context." },
    { title: "Retrieve", desc: "Ask any question in Slack and get immediate, cited answers from your history." },
  ];

  return (
    <section ref={container} className="py-32 bg-[#f8f9fa] text-black px-6 font-poppins border-t border-black/5">
      <div className="max-w-[1200px] mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-16">
          How it <span className="font-light">works</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, i) => (
            <div key={i} className="step-card bg-white p-10 rounded-3xl border border-black/10 shadow-sm relative z-10 transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center text-xl font-medium mb-6 mx-auto">
                {i + 1}
              </div>
              <h3 className="text-2xl font-medium mb-3">{step.title}</h3>
              <p className="text-black/60 font-light">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from(".stat-item", {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        scrollTrigger: {
          trigger: container.current,
          start: "top 85%",
        }
      });
    }, container);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={container} className="py-24 bg-black text-white px-6 font-poppins">
      <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
        <div className="stat-item">
          <div className="text-5xl md:text-7xl font-medium mb-2">99%</div>
          <div className="text-white/60 font-light text-lg">Search Accuracy</div>
        </div>
        <div className="stat-item">
          <div className="text-5xl md:text-7xl font-medium mb-2">10x</div>
          <div className="text-white/60 font-light text-lg">Faster Onboarding</div>
        </div>
        <div className="stat-item">
          <div className="text-5xl md:text-7xl font-medium mb-2">24/7</div>
          <div className="text-white/60 font-light text-lg">Always Active</div>
        </div>
      </div>
    </section>
  );
}

function ShowcaseSection() {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from(".showcase-box", {
        opacity: 0,
        scale: 0.95,
        duration: 1.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: container.current,
          start: "top 80%",
        }
      });
    }, container);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={container} className="py-32 bg-white text-black px-6 font-poppins border-t border-black/5">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-4">
            Everything you need. <span className="font-light">Nothing you don't.</span>
          </h2>
        </div>
        <div className="showcase-box bg-gray-100 rounded-[2rem] p-8 md:p-16 border border-black/10 aspect-video flex flex-col items-center justify-center text-center overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-50"></div>
          
          {/* Floating UI Elements */}
          <div className="absolute top-10 left-10 hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-lg border border-black/5 transition-transform hover:scale-105 cursor-default z-20">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
             <span className="text-xs font-medium">Indexing complete</span>
          </div>

          <div className="absolute bottom-10 right-10 hidden md:block bg-white p-4 rounded-2xl shadow-xl border border-black/5 w-48 text-left transition-transform hover:-translate-y-2 cursor-pointer z-20">
             <div className="text-xs font-bold text-gray-400 mb-1">QUICK ACTION</div>
             <div className="text-sm font-medium">Summarize thread</div>
          </div>

          <div className="absolute top-20 right-16 hidden md:flex items-center gap-3 bg-white p-3 rounded-2xl shadow-lg border border-black/5 transition-transform hover:rotate-3 cursor-pointer z-20">
             <div className="flex -space-x-2">
               <img className="w-6 h-6 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop" alt="avatar" />
               <img className="w-6 h-6 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=64&h=64&fit=crop" alt="avatar" />
             </div>
             <span className="text-xs font-medium">2 mentions</span>
          </div>

          <div className="absolute bottom-16 left-16 hidden lg:block bg-white shadow-lg rounded-2xl p-4 border border-black/5 w-56 text-left transition-transform hover:scale-105 cursor-pointer z-20">
             <div className="flex justify-between items-center mb-2">
               <div className="text-xs font-medium">Weekly Activity</div>
               <div className="text-xs text-blue-500 font-bold">+14%</div>
             </div>
             <div className="h-10 flex items-end gap-1">
                {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
                  <div key={i} className="w-full bg-blue-100 rounded-t-sm transition-all hover:bg-blue-300" style={{ height: `${h}%` }}></div>
                ))}
             </div>
          </div>

          <div className="relative z-10 max-w-2xl mt-8 md:mt-0">
            <h3 className="text-3xl font-medium mb-6">Designed for Focus</h3>
            <p className="text-lg text-black/60 font-light mb-8">
              A minimalist interface that surfaces the exact information you need, precisely when you need it. No clutter.
            </p>
            <div className="inline-block bg-white shadow-xl rounded-2xl p-6 border border-black/5 text-left w-full max-w-md transition-all duration-500 hover:scale-105 hover:-rotate-2 cursor-pointer hover:shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white text-xs font-bold">T</div>
                <div>
                  <div className="text-sm font-medium">Trelo Bot</div>
                  <div className="text-xs text-gray-400">12:34 PM</div>
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                The latest Q3 roadmap was discussed in <span className="text-blue-500 font-medium">#product</span> on Tuesday. Key takeaways: shipping the new UI by August, and pausing legacy API support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsRedesigned() {
  const titleRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from(titleRef.current, {
        y: 30,
        opacity: 0,
        duration: 1,
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top 80%",
        }
      });
    }, titleRef);
    return () => ctx.revert();
  }, []);

  return (
    <section className="bg-white py-32 overflow-hidden border-t border-black/5 font-poppins">
      <div ref={titleRef} className="mx-auto max-w-[1400px] px-6 text-center mb-16">
         <h2 className="text-4xl md:text-5xl font-medium tracking-tight">
          Loved by teams. <span className="font-light">Fewer dropped balls.</span>
        </h2>
      </div>
      <div className="w-full max-w-[100vw] overflow-hidden">
        <TestimonialMarqueeDemo />
      </div>
    </section>
  );
}

function CTARedesigned() {
  const ctaRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from(".cta-text", {
        scale: 0.9,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ctaRef.current,
          start: "top 75%",
        }
      });
    }, ctaRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ctaRef} className="py-32 bg-[#f8f9fa] text-center px-6 font-poppins">
      <div className="cta-text max-w-4xl mx-auto">
        <h2 className="text-5xl md:text-7xl font-medium tracking-tighter mb-8">
          Give your team a memory <br/><span className="font-thin italic">that never forgets.</span>
        </h2>
        <p className="text-lg font-light text-black/60 mb-10 max-w-xl mx-auto">
          Free for the first 30 days. No credit card required. Installs in your Slack workspace in under a minute.
        </p>
        <button className="bg-black text-white px-8 py-4 rounded-full font-medium text-lg hover:scale-105 transition-transform shadow-md">
          Get Started For Free
        </button>
      </div>
    </section>
  );
}

function IntegrationsSection() {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from(".integration-item", {
        scale: 0.9,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "back.out(1.5)",
        scrollTrigger: {
          trigger: container.current,
          start: "top 80%",
        }
      });
    }, container);
    return () => ctx.revert();
  }, []);

  const tools = ["Jira", "Notion", "GitHub", "Linear", "Figma", "Google Drive"];

  return (
    <section ref={container} className="py-32 bg-white text-black px-6 font-poppins border-t border-black/5 overflow-hidden">
      <div className="max-w-[1200px] mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-4">
          Connects with <span className="font-light">everything</span>
        </h2>
        <p className="text-lg font-light text-black/60 mb-16 max-w-2xl mx-auto">
          Trelo lives in Slack, but it talks to all your favorite tools. 
          Create issues, fetch docs, and sync context without leaving your chat.
        </p>
        
        <div className="flex flex-wrap justify-center gap-6">
          {tools.map((tool, i) => (
            <div 
              key={i} 
              className="integration-item bg-[#f8f9fa] border border-black/10 px-8 py-4 rounded-full text-xl font-medium transition-all duration-300 hover:bg-black hover:text-white cursor-pointer shadow-sm hover:-translate-y-2 hover:shadow-lg"
            >
              {tool}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from(".faq-item", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        scrollTrigger: {
          trigger: container.current,
          start: "top 80%",
        }
      });
    }, container);
    return () => ctx.revert();
  }, []);

  const faqs = [
    { question: "How does Trelo integrate with Slack?", answer: "Trelo installs as a Slack app in your workspace. Once installed, it automatically indexes public channels and you can invite it to private channels." },
    { question: "Is my data secure?", answer: "Yes. We use industry-standard encryption at rest and in transit. Trelo is SOC2 compliant and we never sell your data." },
    { question: "Can I use Trelo with other tools?", answer: "Currently we focus on Slack, but integrations with Jira, Notion, and Google Drive are on our roadmap for Q3." },
    { question: "What happens when my free trial ends?", answer: "You'll be downgraded to the Free tier, which keeps your most recent 30 days of history searchable. You can upgrade anytime to unlock your full archive." },
  ];

  return (
    <section ref={container} className="py-32 bg-[#f8f9fa] text-black px-6 font-poppins">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-12 text-center">
          Frequently asked <span className="font-light">questions</span>
        </h2>
        
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="faq-item border-black/10">
              <AccordionTrigger className="text-left text-lg font-medium py-6 hover:no-underline hover:text-blue-600 transition-colors">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-base font-light text-black/70 leading-relaxed pb-6">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

function ColorfulShowcaseSection() {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let ctx = gsap.context(() => {
      // Reveal the container elements
      gsap.from(".color-badge", {
        scale: 0,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "back.out(2)",
        scrollTrigger: {
          trigger: container.current,
          start: "top 75%",
        }
      });
      // Continuous floating animation
      gsap.to(".color-float-1", {
        y: -20,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
      gsap.to(".color-float-2", {
        y: -25,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 0.5
      });
      gsap.to(".color-float-3", {
        y: -15,
        duration: 1.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1
      });
    }, container);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={container} className="relative py-40 overflow-hidden font-poppins text-white border-t border-black/5">
      {/* Background Shader mixed with vibrant gradients */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-violet-900 via-fuchsia-900 to-rose-900">
         <ShaderBackground className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen" />
      </div>
      
      {/* Colorful glowing orbs */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-60"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-pink-500 rounded-full blur-[120px] opacity-60"></div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 text-center">
        <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
          Work in <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-400 to-cyan-400">full color.</span>
        </h2>
        <p className="text-xl text-white/80 font-light max-w-2xl mx-auto mb-20">
          Transform dull Slack threads into vibrant, actionable insights. Bring joy back to your workflow with lightning-fast AI.
        </p>

        <div className="relative h-80 md:h-96 w-full max-w-4xl mx-auto">
          {/* Floating cards */}
          <div className="color-badge color-float-1 absolute top-0 left-4 md:left-20 bg-white/10 backdrop-blur-xl border border-white/30 p-6 rounded-3xl shadow-[0_0_40px_rgba(255,255,255,0.2)]">
            <div className="text-4xl mb-2">🚀</div>
            <div className="font-medium text-lg">Ship faster</div>
          </div>
          
          <div className="color-badge color-float-2 absolute bottom-0 right-4 md:right-20 bg-gradient-to-br from-pink-500/20 to-orange-500/20 backdrop-blur-xl border border-pink-500/30 p-6 rounded-3xl shadow-[0_0_40px_rgba(236,72,153,0.3)]">
            <div className="text-4xl mb-2">✨</div>
            <div className="font-medium text-lg">Zero config</div>
          </div>

          <div className="color-badge color-float-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-xl border border-cyan-500/30 p-8 rounded-[2.5rem] shadow-[0_0_60px_rgba(6,182,212,0.4)]">
            <div className="text-6xl mb-4">🧠</div>
            <div className="text-2xl font-bold">Infinite Memory</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[#ebecf0] bg-white py-12">
      <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-4 px-6 text-[13px] text-[#6b778c] sm:flex-row">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-black text-white">
            <span className="text-xs font-black">T</span>
          </div>
          <span className="text-base font-black tracking-tight text-black">trelo</span>
          <span className="ml-3 border-l border-black/10 pl-3">© 2026 Trelo Labs, Inc.</span>
        </div>
        <div className="flex items-center gap-8 text-[14px]">
          <a href="#" className="hover:text-black transition-colors">
            Privacy
          </a>
          <a href="#" className="hover:text-black transition-colors">
            Terms
          </a>
          <a href="#" className="hover:text-black transition-colors">
            Security
          </a>
          <a href="#" className="hover:text-black transition-colors">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
function HeroStage() {
  return (
    <div className="relative flex min-h-[560px] items-center justify-center overflow-visible">
      {/* soft radial spotlight */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(closest-side, rgba(0,82,204,0.10), rgba(255,255,255,0) 70%)",
        }}
      />

      {/* orbit rings */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1, rotate: 360 }}
        transition={{
          opacity: { duration: 1.2, delay: 0.4 },
          scale: { duration: 1.2, delay: 0.4 },
          rotate: { duration: 40, repeat: Infinity, ease: "linear" },
        }}
        className="pointer-events-none absolute h-[420px] w-[420px] rounded-full border border-dashed border-[#dfe1e6]"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1, rotate: -360 }}
        transition={{
          opacity: { duration: 1.2, delay: 0.6 },
          scale: { duration: 1.2, delay: 0.6 },
          rotate: { duration: 60, repeat: Infinity, ease: "linear" },
        }}
        className="pointer-events-none absolute h-[540px] w-[540px] rounded-full border border-dashed border-[#ebecf0]"
      />

      {/* decorative shapes — visible behind and around the phone */}
      <motion.div
        initial={{ opacity: 0, y: 40, rotate: 0 }}
        animate={{ opacity: 1, y: 0, rotate: 12 }}
        transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="absolute -top-2 right-4 z-0 h-48 w-48 bg-[#ff8b00] sm:right-10 sm:h-56 sm:w-56"
      />
      <motion.div
        initial={{ opacity: 0, y: 40, rotate: 0 }}
        animate={{ opacity: 1, y: 0, rotate: -10 }}
        transition={{ duration: 1, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="absolute -bottom-2 left-2 z-0 h-52 w-52 bg-[#8777d9] sm:left-10 sm:h-64 sm:w-64"
      />

      {/* Curved arrow pointing to phone — kept above phone card */}
      <svg
        viewBox="0 0 300 240"
        className="pointer-events-none absolute -top-4 right-0 z-40 h-48 w-60 text-black sm:-right-4 sm:h-56 sm:w-72"
        fill="none"
      >
        <motion.path
          d="M30 30 C 120 0, 240 20, 270 160"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, delay: 0.9, ease: "easeInOut" }}
        />
        <motion.path
          d="M255 148 L272 162 L258 180"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 2.2 }}
        />
      </svg>

      {/* Hand + phone */}
      <motion.div
        initial={{ opacity: 0, y: 140, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10"
      >
        <motion.div
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          <img
            src={handPhone}
            alt="Hand holding a phone showing the Trelo Slack agent"
            width={480}
            height={640}
            className="relative z-10 w-[300px] mix-blend-multiply sm:w-[380px]"
          />

          {/* Slack logo on screen */}
          <div className="absolute left-1/2 top-[10%] z-20 flex h-[36%] w-[36%] -translate-x-1/2 items-center justify-center">
            <motion.div
              initial={{ scale: 0, rotate: -40, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ duration: 0.9, delay: 1.4, ease: "backOut" }}
              className="grid h-24 w-24 place-items-center rounded-2xl bg-white shadow-2xl sm:h-28 sm:w-28"
            >
              <SlackLogo />
            </motion.div>
          </div>

          {/* Floating message pill 1 */}
          <motion.div
            initial={{ opacity: 0, x: -40, y: 20 }}
            animate={{
              opacity: 1,
              x: 0,
              y: [0, -8, 0],
            }}
            transition={{
              opacity: { duration: 0.6, delay: 1.8 },
              x: { duration: 0.8, delay: 1.8, ease: [0.16, 1, 0.3, 1] },
              y: { duration: 4, delay: 2.4, repeat: Infinity, ease: "easeInOut" },
            }}
            className="absolute -left-14 top-1/3 z-30 rounded-xl border border-[#dfe1e6] bg-white px-3 py-2 shadow-xl sm:-left-20"
          >
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#2eb67d]" />
              <span className="text-[11px] font-semibold text-black">Answer found</span>
            </div>
            <p className="mt-1 text-[10px] text-[#42526e]">3 past threads matched</p>
          </motion.div>

          {/* Floating message pill 2 */}
          <motion.div
            initial={{ opacity: 0, x: 40, y: -20 }}
            animate={{
              opacity: 1,
              x: 0,
              y: [0, 10, 0],
            }}
            transition={{
              opacity: { duration: 0.6, delay: 2.1 },
              x: { duration: 0.8, delay: 2.1, ease: [0.16, 1, 0.3, 1] },
              y: { duration: 5, delay: 2.8, repeat: Infinity, ease: "easeInOut" },
            }}
            className="absolute -right-10 top-[22%] z-30 rounded-xl border border-[#dfe1e6] bg-white px-3 py-2 shadow-xl sm:-right-16"
          >
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#ff8b00]" />
              <span className="text-[11px] font-semibold text-black">Task created</span>
            </div>
            <p className="mt-1 text-[10px] text-[#42526e]">@maya · due Fri</p>
          </motion.div>

          {/* Floating integration icons */}
          <FloatingIcon delay={2.3} className="-right-6 top-[55%] bg-[#000000]" label="N" />
          <FloatingIcon delay={2.5} className="-right-14 top-[70%] bg-[#611f69]" label="✓" />
        </motion.div>
      </motion.div>
    </div>
  );
}

function FloatingIcon({
  delay,
  className,
  label,
}: {
  delay: number;
  className: string;
  label: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
      transition={{
        opacity: { duration: 0.5, delay },
        scale: { duration: 0.6, delay, ease: "backOut" },
        y: { duration: 4, delay: delay + 0.5, repeat: Infinity, ease: "easeInOut" },
      }}
      className={`absolute z-30 grid h-10 w-10 place-items-center rounded-xl text-sm font-bold text-white shadow-xl ${className}`}
    >
      {label}
    </motion.div>
  );
}

function SlackLogo({ small = false }: { small?: boolean }) {
  const size = small ? "h-5 w-5" : "h-14 w-14 sm:h-16 sm:w-16";
  return (
    <svg viewBox="0 0 60 60" className={size} aria-hidden>
      <path fill="#E01E5A" d="M16 37a4 4 0 1 1-4-4h4v4zm2 0a4 4 0 1 1 8 0v10a4 4 0 1 1-8 0V37z" />
      <path fill="#36C5F0" d="M22 16a4 4 0 1 1 4-4v4h-4zm0 2a4 4 0 1 1 0 8H12a4 4 0 1 1 0-8h10z" />
      <path
        fill="#2EB67D"
        d="M43 22a4 4 0 1 1 4 4h-4v-4zm-2 0a4 4 0 1 1-8 0V12a4 4 0 1 1 8 0v10z"
      />
      <path fill="#ECB22E" d="M37 43a4 4 0 1 1-4 4v-4h4zm0-2a4 4 0 1 1 0-8h10a4 4 0 1 1 0 8H37z" />
    </svg>
  );
}
