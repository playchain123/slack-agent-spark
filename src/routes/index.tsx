import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import handPhone from "@/assets/hand-phone.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Trelo — Turn Slack conversations into answers and action" },
      {
        name: "description",
        content:
          "Trelo is the Slack agent that remembers what your team said, turning past threads into instant answers and commitments into tracked tasks.",
      },
      { property: "og:title", content: "Trelo — Slack's memory & follow-through agent" },
      {
        property: "og:description",
        content:
          "Search past threads, extract action items, and never lose a decision in Slack again.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-white">
      {/* NAV */}
      <header className="w-full bg-white">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5">
          <div className="flex items-center gap-10">
            <a href="/" className="flex items-center gap-2">
              <div className="grid h-7 w-7 place-items-center rounded-md bg-black">
                <span className="text-sm font-black text-white">T</span>
              </div>
              <span className="text-xl font-black tracking-tight text-black">
                trelo
              </span>
            </a>
            <nav className="hidden items-center gap-7 md:flex">
              <button className="text-[15px] font-medium text-black hover:opacity-70">
                Pricing
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-[15px] font-medium text-black hover:opacity-70">
              Log in
            </button>
            <button className="inline-flex items-center gap-2 rounded-md bg-black px-4 py-2.5 text-[15px] font-semibold text-white shadow-sm transition hover:bg-neutral-800">
              <SlackLogo small />
              Continue with Slack
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-6 px-6 pb-10 pt-0 lg:grid-cols-2 lg:pb-16 lg:pt-0">
          {/* LEFT */}
          <div className="max-w-xl">
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl font-semibold leading-[1.1] text-black sm:text-5xl"
            >
              Capture every decision, surface every answer.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="mt-5 text-[15px] leading-relaxed text-[#42526e]"
            >
              Trelo is the Slack agent that remembers what your team said
              turning past threads into instant answers and commitments into
              tracked tasks.
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
                className="whitespace-nowrap rounded-md bg-black px-5 py-3 text-[15px] font-semibold text-white shadow-sm transition hover:bg-neutral-800"
              >
                Sign up — it's free
              </button>
            </motion.form>

            <motion.button
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              type="button"
              className="mt-4 inline-flex items-center gap-3 rounded-md border border-[#dfe1e6] bg-white px-5 py-3 text-[15px] font-semibold text-black shadow-sm transition hover:bg-[#f4f5f7]"
            >
              <SlackLogo small />
              Continue with Slack
            </motion.button>
            <p className="mt-3 text-[13px] text-[#6b778c]">
              Sign in or create your Trelo account with your Slack workspace.
            </p>
          </div>


          {/* RIGHT — cinematic hand+phone stage */}
          <HeroStage />
        </div>
      </section>
    </div>
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
          background:
            "radial-gradient(closest-side, rgba(0,82,204,0.10), rgba(255,255,255,0) 70%)",
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

      {/* decorative shapes behind phone */}
      <motion.div
        initial={{ opacity: 0, y: 60, rotate: 0 }}
        animate={{ opacity: 1, y: 0, rotate: 14 }}
        transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-6 left-6 h-40 w-40 bg-[#ff8b00] sm:left-16"
      />
      <motion.div
        initial={{ opacity: 0, y: 60, rotate: 0 }}
        animate={{ opacity: 1, y: 0, rotate: -8 }}
        transition={{ duration: 1, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-0 left-36 h-44 w-44 bg-[#8777d9] sm:left-56"
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
            className="relative z-10 w-[320px] sm:w-[420px] drop-shadow-2xl"
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
              <span className="text-[11px] font-semibold text-black">
                Answer found
              </span>
            </div>
            <p className="mt-1 text-[10px] text-[#42526e]">
              3 past threads matched
            </p>
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
              <span className="text-[11px] font-semibold text-black">
                Task created
              </span>
            </div>
            <p className="mt-1 text-[10px] text-[#42526e]">
              @maya · due Fri
            </p>
          </motion.div>

          {/* Floating integration icons */}
          <FloatingIcon
            delay={2.3}
            className="-right-6 top-[55%] bg-[#000000]"
            label="N"
          />
          <FloatingIcon
            delay={2.5}
            className="-right-14 top-[70%] bg-[#611f69]"
            label="✓"
          />
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
      <path fill="#2EB67D" d="M43 22a4 4 0 1 1 4 4h-4v-4zm-2 0a4 4 0 1 1-8 0V12a4 4 0 1 1 8 0v10z" />
      <path fill="#ECB22E" d="M37 43a4 4 0 1 1-4 4v-4h4zm0-2a4 4 0 1 1 0-8h10a4 4 0 1 1 0 8H37z" />
    </svg>
  );
}

