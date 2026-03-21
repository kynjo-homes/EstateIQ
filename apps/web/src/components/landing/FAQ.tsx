"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useEffect, useRef, useState } from "react";

const faqs = [
  {
    q: "How long does setup take?",
    a: "Most estates are fully onboarded within a single afternoon. Upload your resident list via CSV, configure your billing rules, and send invites — that's it.",
  },
  {
    q: "Do residents need to download an app?",
    a: "EstateIQ works as a progressive web app, so residents can use it from any browser. Native iOS and Android apps are also available for a richer experience.",
  },
  {
    q: "Can we migrate from spreadsheets or another tool?",
    a: "Yes. We provide free migration assistance for all Professional and Enterprise plans. Our team will help you transfer historical data seamlessly.",
  },
  {
    q: "Is our financial data secure?",
    a: "Absolutely. We use bank-grade encryption (AES-256 at rest, TLS 1.3 in transit), SOC 2 Type II compliant infrastructure, and role-based access controls.",
  },
  {
    q: "What payment methods are supported for residents?",
    a: "We integrate with bank transfers, card payments, mobile money, and direct debit — covering the most popular methods in your region.",
  },
];

const FAQ = () => {
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
    <section id="faq" className="py-24 md:py-32 bg-card" ref={ref}>
      <div className="max-w-3xl mx-auto section-padding">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold tracking-widest text-primary uppercase">
            FAQ
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold text-foreground leading-tight">
            Common questions, honest answers
          </h2>
        </div>

        <div className={visible ? "reveal-up" : "opacity-0"}>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((f, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border border-border rounded px-5 data-[state=open]:shadow-sm transition-shadow"
              >
                <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline py-4">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
