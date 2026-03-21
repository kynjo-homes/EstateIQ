"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: "For small estates getting started",
    features: [
      "Up to 50 units",
      "Dues tracking",
      "Community noticeboard",
      "Email support",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "$49",
    period: "/mo",
    description: "For growing estates that need control",
    features: [
      "Up to 500 units",
      "Automated billing & reminders",
      "Maintenance workflows",
      "Financial reporting",
      "Visitor management",
      "Priority support",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For multi-estate portfolios",
    features: [
      "Unlimited units & estates",
      "Dedicated account manager",
      "Custom integrations",
      "SLA & uptime guarantee",
      "On-premise deployment option",
      "Advanced analytics & AI",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const Pricing = () => {
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
    <section id="pricing" className="py-24 md:py-32 bg-secondary" ref={ref}>
      <div className="max-w-7xl mx-auto section-padding">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-xs font-semibold tracking-widest text-primary uppercase">
            Pricing
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold text-foreground leading-tight">
            Transparent plans, no hidden fees
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Start free and scale as your community grows.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((p, i) => (
            <div
              key={p.name}
              className={`relative rounded-xl border p-6 flex flex-col ${
                p.highlighted
                  ? "border-primary bg-card shadow-xl shadow-primary/10"
                  : "border-border bg-card"
              } ${visible ? "reveal-up" : "opacity-0"}`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {p.highlighted && (
                <div className="absolute -top-3 left-6 px-3 py-0.5 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                  Most Popular
                </div>
              )}
              <h3 className="font-sans text-lg font-semibold text-foreground">{p.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{p.description}</p>
              <div className="mt-5 mb-6">
                <span className="text-4xl font-bold text-foreground tabular-nums">{p.price}</span>
                {p.period && <span className="text-muted-foreground text-sm">{p.period}</span>}
              </div>
              <ul className="flex-1 space-y-3 mb-8">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                    <Check size={16} className="text-primary mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className={`w-full active:scale-[0.97] transition-all ${
                  p.highlighted
                    ? "bg-primary hover:bg-primary-dark text-primary-foreground shadow-md"
                    : "bg-foreground/5 hover:bg-foreground/10 text-foreground"
                }`}
                asChild
              >
                <Link href={p.cta === "Contact Sales" ? "/sign-up" : "/sign-up"}>{p.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
