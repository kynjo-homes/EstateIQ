"use client";

import { useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Ngozi Adeyemi",
    role: "Estate Manager, Parkview Gardens",
    quote:
      "We cut our arrears rate by 60% in the first quarter. The automated reminders alone paid for the subscription.",
    rating: 5,
  },
  {
    name: "David Okonkwo",
    role: "HOA Chair, Lekki Crescent",
    quote:
      "Our AGM went from a 3-hour shouting match to a 45-minute productive meeting, because everyone could see the financials in advance.",
    rating: 5,
  },
  {
    name: "Amara Chukwu",
    role: "Facility Manager, The Reserve",
    quote:
      "Maintenance turnaround dropped from 11 days to 3. Residents are happier, and my team is less stressed.",
    rating: 5,
  },
];

const Testimonials = () => {
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
    <section className="py-24 md:py-32 bg-card" ref={ref}>
      <div className="max-w-7xl mx-auto section-padding">
        <div className="max-w-xl mb-16">
          <span className="text-xs font-semibold tracking-widest text-primary uppercase">
            Testimonials
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold text-foreground leading-tight">
            Trusted by estate managers across the country
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className={`p-6 rounded-xl border border-border bg-background flex flex-col ${
                visible ? "reveal-up" : "opacity-0"
              }`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={14} className="fill-primary text-primary" />
                ))}
              </div>
              <blockquote className="text-sm text-foreground leading-relaxed flex-1">
                "{t.quote}"
              </blockquote>
              <div className="mt-6 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                  {t.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
