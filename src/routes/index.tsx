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
          "Trelo is the Slack agent that surfaces past answers and turns commitments into tracked tasks — automatically.",
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
          <div className="flex items-center gap-4">
            <button className="text-[15px] font-medium text-black hover:opacity-70">
              Log in
            </button>
            <button className="rounded-md bg-black px-5 py-2.5 text-[15px] font-semibold text-white shadow-sm transition hover:bg-neutral-800">
              Create account
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-[#f4f5f7]">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-10 px-6 py-16 lg:grid-cols-2 lg:py-24">
          {/* LEFT */}
          <div className="max-w-xl">
            <h1 className="text-3xl font-semibold leading-[1.2] text-black sm:text-4xl">
              Capture every decision, surface every answer.
            </h1>
            <p className="mt-6 text-lg text-[#42526e]">
              Trelo is the Slack agent that remembers what your team said —
              turning past threads into instant answers and commitments into
              tracked tasks.
            </p>

            <form className="mt-8 flex max-w-md gap-2">
              <input
                type="email"
                placeholder="Work email"
                className="flex-1 rounded-md border border-[#dfe1e6] bg-white px-4 py-3 text-[15px] text-black outline-none focus:border-black"
              />
              <button
                type="submit"
                className="whitespace-nowrap rounded-md bg-black px-5 py-3 text-[15px] font-semibold text-white shadow-sm transition hover:bg-neutral-800"
              >
                Add to Slack — free
              </button>
            </form>
          </div>

          {/* RIGHT — hand-holding-phone mockup with animation */}
          <div className="relative flex min-h-[560px] items-center justify-center">
            {/* decorative shapes */}
            <motion.div
              initial={{ opacity: 0, y: 40, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: 12 }}
              transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
              className="absolute bottom-8 left-4 h-40 w-40 bg-[#ff8b00] sm:left-16"
            />
            <motion.div
              initial={{ opacity: 0, y: 40, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: -6 }}
              transition={{ duration: 0.9, delay: 0.5, ease: "easeOut" }}
              className="absolute bottom-0 left-32 h-44 w-44 bg-[#8777d9] sm:left-52"
            />

            {/* Hand + phone with floating animation */}
            <motion.div
              initial={{ opacity: 0, y: 120 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10"
            >
              <motion.div
                animate={{ y: [0, -14, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative"
              >
                <img
                  src={handPhone}
                  alt="Hand holding a phone showing the Trelo Slack agent"
                  width={480}
                  height={640}
                  className="relative z-10 w-[320px] sm:w-[420px]"
                />

                {/* Slack logo screen overlay on the phone */}
                <div className="absolute left-1/2 top-[8%] z-20 flex h-[38%] w-[38%] -translate-x-1/2 items-center justify-center">
                  <motion.div
                    initial={{ scale: 0, rotate: -30, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 1.2, ease: "backOut" }}
                    className="grid h-24 w-24 place-items-center rounded-2xl bg-white shadow-xl sm:h-28 sm:w-28"
                  >
                    <SlackLogo />
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

function SlackLogo() {
  return (
    <svg viewBox="0 0 60 60" className="h-14 w-14 sm:h-16 sm:w-16" aria-hidden>
      <path fill="#E01E5A" d="M16 37a4 4 0 1 1-4-4h4v4zm2 0a4 4 0 1 1 8 0v10a4 4 0 1 1-8 0V37z" />
      <path fill="#36C5F0" d="M22 16a4 4 0 1 1 4-4v4h-4zm0 2a4 4 0 1 1 0 8H12a4 4 0 1 1 0-8h10z" />
      <path fill="#2EB67D" d="M43 22a4 4 0 1 1 4 4h-4v-4zm-2 0a4 4 0 1 1-8 0V12a4 4 0 1 1 8 0v10z" />
      <path fill="#ECB22E" d="M37 43a4 4 0 1 1-4 4v-4h4zm0-2a4 4 0 1 1 0-8h10a4 4 0 1 1 0 8H37z" />
    </svg>
  );
}
