"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFarm } from "./FarmContext";

const DONE_KEY = "kg_tour_done";
const REPLAY_KEY = "kg_tour_replay";

const STEPS = [
  {
    icon: "👋",
    title: "Welcome to KhulaGrow",
    body: "Your grow's records in one place — from seed to sale-ready lot, SAHPRA-inspection ready. This quick tour shows you how to get set up in a few minutes.",
  },
  {
    icon: "🚜",
    title: "Step 1 — Add your farm",
    body: "Everything starts with a farm: its name, SAHPRA licence number and location. You'll find it under More → Farms & areas, or straight from the button at the end of this tour.",
  },
  {
    icon: "🌿",
    title: "Map your spaces, start a batch",
    body: "Add your growing areas (tunnels, rooms, fields), then start your first batch with a strain and plant count. Every batch gets a traceable code and its own timeline.",
  },
  {
    icon: "💧",
    title: "Log as you work — even offline",
    body: "The big ＋ button is Quick log: irrigation, feeding, pest checks and photos in a few taps. No signal in the tunnel? Entries save on your phone and sync later.",
  },
  {
    icon: "📊",
    title: "Stay compliant, export anytime",
    body: "Tasks keep the team on schedule, compliance registers build themselves from your logs, and Reports gives you one-tap PDF or Excel — including your inspection pack.",
  },
];

export function Onboarding() {
  const { farms, loading } = useFarm();
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (loading) return;
    const replay = localStorage.getItem(REPLAY_KEY) === "1";
    const firstTime = farms.length === 0 && !localStorage.getItem(DONE_KEY);
    if (replay || firstTime) {
      localStorage.removeItem(REPLAY_KEY);
      setStep(0);
      setVisible(true);
    }
  }, [loading, farms]);

  // Replay from the help page happens via client-side navigation, which
  // doesn't remount this component — listen for the explicit event too.
  useEffect(() => {
    function onReplay() {
      localStorage.removeItem(REPLAY_KEY);
      setStep(0);
      setVisible(true);
    }
    window.addEventListener("kg-replay-tour", onReplay);
    return () => window.removeEventListener("kg-replay-tour", onReplay);
  }, []);

  if (!visible) return null;

  const last = step === STEPS.length - 1;
  const s = STEPS[step];

  function dismiss() {
    localStorage.setItem(DONE_KEY, "1");
    setVisible(false);
  }

  function finish() {
    dismiss();
    router.push("/farms/new");
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Getting started tour"
    >
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-3xl" aria-hidden>
            {s.icon}
          </span>
          <button onClick={dismiss} className="px-2 py-1 text-sm font-medium text-gray-400 hover:text-gray-600">
            Skip
          </button>
        </div>
        <h2 className="mt-4 text-xl font-bold text-gray-900">{s.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">{s.body}</p>

        <div className="mt-5 flex items-center justify-between">
          <div className="flex gap-1.5" aria-hidden>
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${i === step ? "w-5 bg-brand-600" : "w-1.5 bg-gray-200"}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-50"
              >
                Back
              </button>
            )}
            {last ? (
              <button
                onClick={finish}
                className="rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-800"
              >
                🚜 Add my farm
              </button>
            ) : (
              <button
                onClick={() => setStep(step + 1)}
                className="rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-800"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Shows the welcome tour again (works both in-session and after a reload). */
export function replayTour() {
  localStorage.setItem(REPLAY_KEY, "1");
  window.dispatchEvent(new Event("kg-replay-tour"));
}
