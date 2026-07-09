import { createFileRoute } from "@tanstack/react-router";
import { Play } from "lucide-react";

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
              <div className="grid h-7 w-7 place-items-center rounded-md bg-[#0052cc]">
                <span className="text-sm font-black text-white">T</span>
              </div>
              <span className="text-xl font-black tracking-tight text-[#172b4d]">
                trelo
              </span>
            </a>
            <nav className="hidden items-center gap-7 md:flex">
              {["Features", "Solutions", "Plans", "Pricing", "Resources"].map((l) => (
                <button
                  key={l}
                  className="flex items-center gap-1 text-[15px] font-medium text-[#172b4d] hover:text-[#0052cc]"
                >
                  {l}
                  {l !== "Pricing" && <span className="text-xs">▾</span>}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-[15px] font-medium text-[#172b4d] hover:text-[#0052cc]">
              Log in
            </button>
            <button className="rounded-md bg-[#0052cc] px-5 py-2.5 text-[15px] font-semibold text-white shadow-sm transition hover:bg-[#0747a6]">
              Get Trelo for free
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-[#f4f5f7]">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-10 px-6 py-16 lg:grid-cols-2 lg:py-24">
          {/* LEFT */}
          <div className="max-w-xl">
            <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-[#172b4d] lg:text-6xl">
              Capture every decision, surface every answer.
            </h1>
            <p className="mt-6 text-lg text-[#42526e]">
              Trelo is the Slack agent that remembers what your team said — turning
              past threads into instant answers and commitments into tracked tasks.
            </p>

            <form className="mt-8 flex max-w-md gap-2">
              <input
                type="email"
                placeholder="Work email"
                className="flex-1 rounded-md border border-[#dfe1e6] bg-white px-4 py-3 text-[15px] text-[#172b4d] outline-none focus:border-[#0052cc]"
              />
              <button
                type="submit"
                className="whitespace-nowrap rounded-md bg-[#0052cc] px-5 py-3 text-[15px] font-semibold text-white shadow-sm transition hover:bg-[#0747a6]"
              >
                Add to Slack — free
              </button>
            </form>

            <p className="mt-5 max-w-md text-sm text-[#42526e]">
              By adding Trelo, you acknowledge the{" "}
              <a href="#" className="text-[#0052cc] underline">
                Trelo Privacy Policy
              </a>
              .
            </p>

            <button className="mt-6 flex items-center gap-2 text-[15px] font-semibold text-[#0052cc]">
              Watch video
              <span className="grid h-6 w-6 place-items-center rounded-full bg-[#0052cc] text-white">
                <Play className="h-3 w-3 fill-white" />
              </span>
            </button>
          </div>

          {/* RIGHT — phone mockup */}
          <div className="relative flex items-center justify-center">
            {/* decorative shapes */}
            <div className="absolute bottom-4 left-8 h-40 w-40 rotate-12 bg-[#ff8b00]" />
            <div className="absolute bottom-0 left-40 h-44 w-44 -rotate-6 bg-[#8777d9]" />

            {/* phone */}
            <div className="relative z-10 h-[560px] w-[280px] rounded-[44px] border-[10px] border-[#172b4d] bg-white shadow-2xl">
              <div className="absolute left-1/2 top-3 z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-[#172b4d]" />
              <div className="h-full w-full overflow-hidden rounded-[32px] bg-white p-4 pt-10">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-lg font-black text-[#172b4d]">Trelo</span>
                  <div className="flex gap-2 text-[#42526e]">
                    <span className="text-xs">⌕</span>
                    <span className="text-xs">⋯</span>
                  </div>
                </div>
                {[
                  { t: "Answered: Stripe webhook retry policy", tag: "#eng", c: "#0052cc" },
                  { t: "Action: Ship pricing page by Fri", tag: "@maya", c: "#36b37e" },
                  { t: "Reminder sent to @kai · due tomorrow", tag: "task", c: "#ff8b00" },
                  { t: "Digest: 12 decisions this week", tag: "weekly", c: "#8777d9" },
                ].map((card, i) => (
                  <div
                    key={i}
                    className="mb-2 rounded-lg border-l-4 bg-[#f4f5f7] p-3"
                    style={{ borderLeftColor: card.c }}
                  >
                    <div className="text-[11px] font-semibold text-[#172b4d]">
                      {card.t}
                    </div>
                    <div className="mt-1 text-[10px] text-[#42526e]">{card.tag}</div>
                  </div>
                ))}
                <div className="mt-3 rounded-lg border border-[#dfe1e6] p-2 text-[10px] text-[#42526e]">
                  Ask Trelo anything…
                </div>
              </div>
            </div>

            {/* floating integration icons */}
            <div className="absolute right-2 top-16 z-20 grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-lg">
              <span className="text-2xl">💬</span>
            </div>
            <div className="absolute right-8 top-40 z-20 grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-lg">
              <span className="text-2xl">📝</span>
            </div>
            <div className="absolute right-0 top-64 z-20 grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="absolute right-10 top-[22rem] z-20 grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-lg">
              <span className="text-2xl">🔔</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
