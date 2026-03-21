"use client";

import { useEffect, useRef, useState } from "react";

const steps = [
  {
    num: "01",
    title: "Onboard your estate",
    description: "Add your property details, units, and resident roster in minutes — CSV import supported.",
  },
  {
    num: "02",
    title: "Configure billing & rules",
    description: "Set up service charges, payment schedules, late-fee policies, and approval workflows.",
  },
  {
    num: "03",
    title: "Invite residents",
    description: "Each resident gets a personal portal and mobile app — no training needed.",
  },
  {
    num: "04",
    title: "Manage with insight",
    description: "Real-time dashboards, automated reports, and AI-assisted recommendations keep you ahead.",
  },
];

const HowItWorks = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-secondary" ref={ref}>
      <div className="max-w-7xl mx-auto section-padding">
        <div className="max-w-xl mb-16">
          <span className="text-xs font-semibold tracking-widest text-primary uppercase">
            How It Works
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold text-foreground leading-tight">
            Up and running in a single afternoon
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            No consultants, no month-long rollouts. EstateIQ is designed to be self-serve from day one.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, i) => (
            <div
              key={s.num}
              className={`relative ${visible ? "reveal-up" : "opacity-0"}`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <span className="text-5xl font-display font-bold text-primary/15 leading-none select-none">
                {s.num}
              </span>
              <h3 className="mt-2 font-sans text-base font-semibold text-foreground">
                {s.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {s.description}
              </p>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-6 -right-4 w-8 border-t border-dashed border-primary/30" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
