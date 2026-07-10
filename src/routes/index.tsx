import { createFileRoute, Link } from "@tanstack/react-router";
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
      <header className="w-full bg-white">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-3">

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
            <Link to="/dashboard" className="text-[12px] font-medium text-black hover:opacity-70">
              Log in
            </Link>
            <button
              type="button"
              className="rounded-md bg-black px-3 py-1.5 text-[12px] font-medium text-white shadow-sm transition hover:bg-neutral-800"
            >
              Continue with Slack
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-start gap-6 px-6 pb-4 pt-0 lg:grid-cols-2 lg:pb-6 lg:pt-0">
          {/* LEFT */}
          <div className="max-w-xl">
            <AvatarRow />
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 text-5xl font-black leading-[1.05] tracking-tight text-black sm:text-6xl"
            >
              Capture every decision, surface every answer
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
                className="whitespace-nowrap rounded-md bg-black px-4 py-3 text-[13px] font-medium text-white shadow-sm transition hover:bg-neutral-800"
              >
                Sign up it's free
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
          <div className="mt-10 lg:mt-20">
            <HeroStage />
          </div>
        </div>
      </section>

      <Trelo101 />
      <FeaturesSection />
      <HowItWorks />
      <IntegrationsSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
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


function Trelo101() {
  return (
    <section className="bg-white py-5 lg:py-6">
      <div className="mx-auto max-w-[1400px] px-6">
        <AnimatedText className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#172b4d]">
          Trelo 101
        </AnimatedText>
        <AnimatedText
          as="p"
          delay={0.1}
          className="mt-2 max-w-xl text-[14px] leading-relaxed text-[#42526e]"
        >
          Trelo agent remembers your team's conversations. It searches past
          threads to give instant answers and turns promises made in Slack into
          actual tracked tasks. Teams that live in Slack and need their
          conversations to become searchable, actionable, and accountable.
        </AnimatedText>
      </div>
    </section>
  );
}


function FeaturesSection() {
  const features = [
    {
      tag: "MEMORY",
      title: "Instant answers from past threads",
      desc: "Ask Trelo anything — it searches every channel and DM your team allowed, then replies inline with the exact message and link.",
      accent: "#0052cc",
    },
    {
      tag: "FOLLOW-THROUGH",
      title: "Commitments become tracked tasks",
      desc: "When someone says 'I'll ship it Friday,' Trelo captures it with owner and due date, then nudges before it slips.",
      accent: "#ff8b00",
    },
    {
      tag: "DIGESTS",
      title: "Daily summaries that respect your time",
      desc: "Wake up to a five-line briefing of what happened, what needs your input, and what's overdue — no scrolling required.",
      accent: "#8777d9",
    },
  ];
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-[1400px] px-6">
        <AnimatedText className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#0052cc]">
          Why teams choose Trelo
        </AnimatedText>
        <AnimatedText
          as="h2"
          delay={0.1}
          className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.1] text-black sm:text-5xl"
        >
          Slack is where work happens. Trelo makes sure nothing gets lost.
        </AnimatedText>
        <AnimatedText
          delay={0.2}
          className="mt-5 max-w-2xl text-[15px] leading-relaxed text-[#42526e]"
        >
          Three features, one goal: turn the messy river of Slack into a system your team can actually rely on.
        </AnimatedText>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -6 }}
              className="group rounded-2xl border border-[#dfe1e6] bg-white p-8 shadow-sm transition hover:shadow-xl"
            >
              <div className="h-10 w-10 rounded-lg" style={{ backgroundColor: f.accent }} />
              <div className="mt-6 text-[11px] font-bold uppercase tracking-[0.18em] text-[#6b778c]">
                {f.tag}
              </div>
              <h3 className="mt-2 text-xl font-semibold text-black">{f.title}</h3>
              <p className="mt-3 text-[14px] leading-relaxed text-[#42526e]">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", title: "Connect your Slack workspace", desc: "One click. Trelo installs as a Slack app and respects every channel permission your admins set." },
    { n: "02", title: "Trelo listens and learns", desc: "It indexes threads you have access to and quietly builds a private memory of decisions and commitments." },
    { n: "03", title: "Ask, act, and ship", desc: "Search past answers, auto-create tasks from messages, and get reminded before anything falls through." },
  ];
  return (
    <section className="bg-[#f7f8fa] py-24">
      <div className="mx-auto max-w-[1400px] px-6">
        <AnimatedText className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#0052cc]">
          How it works
        </AnimatedText>
        <AnimatedText
          as="h2"
          delay={0.1}
          className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.1] text-black sm:text-5xl"
        >
          Set up in 60 seconds. Value from day one.
        </AnimatedText>

        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="text-5xl font-black text-[#dfe1e6]">{s.n}</div>
              <h3 className="mt-3 text-xl font-semibold text-black">{s.title}</h3>
              <p className="mt-3 text-[14px] leading-relaxed text-[#42526e]">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function IntegrationsSection() {
  const items = ["Slack", "Notion", "Linear", "Jira", "GitHub", "Google Drive", "Zoom", "Gmail"];
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-[1400px] px-6 text-center">
        <AnimatedText className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#0052cc]">
          Integrations
        </AnimatedText>
        <AnimatedText
          as="h2"
          delay={0.1}
          className="mx-auto mt-4 max-w-3xl text-4xl font-semibold leading-[1.1] text-black sm:text-5xl"
        >
          Plays nicely with the tools your team already loves.
        </AnimatedText>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ staggerChildren: 0.06 }}
          className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {items.map((i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4, scale: 1.03 }}
              className="rounded-xl border border-[#dfe1e6] bg-white px-4 py-6 text-[15px] font-semibold text-black shadow-sm"
            >
              {i}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const quotes = [
    { q: "Trelo answered a policy question in seconds that used to take three people and a two-day thread hunt.", a: "Maya Chen", r: "Head of Ops, Ravel" },
    { q: "We stopped losing action items overnight. Literally overnight. The daily digest is our new stand-up.", a: "Diego Alvarez", r: "Engineering Lead, Northlab" },
    { q: "It feels like the smartest teammate we ever hired — and it works entirely inside Slack.", a: "Priya Rao", r: "COO, Fieldnote" },
  ];
  return (
    <section className="bg-[#0b0d12] py-24 text-white">
      <div className="mx-auto max-w-[1400px] px-6">
        <AnimatedText className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#5cbdff]">
          Loved by teams
        </AnimatedText>
        <AnimatedText
          as="h2"
          delay={0.1}
          className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.1] sm:text-5xl"
        >
          Less repeating. Fewer dropped balls. Faster decisions.
        </AnimatedText>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {quotes.map((t, i) => (
            <motion.figure
              key={t.a}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur"
            >
              <blockquote className="text-[16px] leading-relaxed text-white/90">"{t.q}"</blockquote>
              <figcaption className="mt-6">
                <div className="text-[14px] font-semibold">{t.a}</div>
                <div className="text-[13px] text-white/60">{t.r}</div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-[1100px] px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-3xl bg-black px-8 py-16 text-center text-white sm:px-16 sm:py-20"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#8777d9] opacity-30 blur-3xl"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#ff8b00] opacity-30 blur-3xl"
          />
          <AnimatedText
            as="h2"
            className="relative text-4xl font-semibold leading-[1.1] sm:text-5xl"
          >
            Give your team a memory that never forgets.
          </AnimatedText>
          <AnimatedText
            delay={0.15}
            className="relative mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-white/70"
          >
            Free for the first 30 days. No credit card. Installs in Slack in under a minute.
          </AnimatedText>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <button className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-3 text-[15px] font-semibold text-black transition hover:bg-white/90">
              <SlackLogo small />
              Continue with Slack
            </button>
            <button className="rounded-md border border-white/20 px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-white/10">
              Book a demo
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[#ebecf0] bg-white py-12">
      <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-4 px-6 text-[13px] text-[#6b778c] sm:flex-row">
        <div className="flex items-center gap-2">
          <div className="grid h-6 w-6 place-items-center rounded-md bg-black">
            <span className="text-xs font-black text-white">T</span>
          </div>
          <span className="font-black tracking-tight text-black">trelo</span>
          <span className="ml-2">© 2026 Trelo Labs, Inc.</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-black">Privacy</a>
          <a href="#" className="hover:text-black">Terms</a>
          <a href="#" className="hover:text-black">Security</a>
          <a href="#" className="hover:text-black">Contact</a>
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

