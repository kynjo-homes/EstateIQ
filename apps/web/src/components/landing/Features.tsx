"use client";

import { useEffect, useRef, useState } from "react";
import {
  Receipt,
  Wrench,
  BarChart3,
  ShieldCheck,
  Bell,
  Users,
} from "lucide-react";

const features = [
  {
    icon: Receipt,
    title: "Dues & Levy Collection",
    description:
      "Automate service charge billing, track payments in real-time, and send gentle reminders to defaulters.",
  },
  {
    icon: Wrench,
    title: "Maintenance Requests",
    description:
      "Residents submit issues from their phone. Your team triages, assigns, and resolves — all in one place.",
  },
  {
    icon: BarChart3,
    title: "Financial Dashboard",
    description:
      "Income, expenditure, arrears, and forecasts presented in clear visuals your board will actually read.",
  },
  {
    icon: ShieldCheck,
    title: "Access & Security",
    description:
      "Visitor pre-authorization, gate logs, and panic alerts integrated into one security layer.",
  },
  {
    icon: Bell,
    title: "Community Notices",
    description:
      "Push announcements, AGM agendas, and polls to every resident — no more WhatsApp chaos.",
  },
  {
    icon: Users,
    title: "Resident Directory",
    description:
      "A private, permission-based directory so estate managers and residents stay connected.",
  },
];

const Features = () => {
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
    <section id="features" className="py-24 md:py-32 bg-card" ref={ref}>
      <div className="max-w-7xl mx-auto section-padding">
        <div className="max-w-xl mb-16">
          <span className="text-xs font-semibold tracking-widest text-primary uppercase">
            Features
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold text-foreground leading-tight">
            Everything your estate needs, nothing it doesn't
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Built for the realities of neighborhood management — not retrofitted from generic property tools.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`group p-6 rounded-xl border border-border bg-card hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 ${
                visible ? "reveal-up" : "opacity-0"
              }`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="w-11 h-11 rounded bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <f.icon size={20} className="text-primary" />
              </div>
              <h3 className="font-sans text-base font-semibold text-foreground mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
