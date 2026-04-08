"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { pricingPlans } from "@/lib/pricingPlans";
import { Button } from "@/components/ui/button";

const Pricing = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  function handleSelect(planId: string) {
    if (planId === "CUSTOM") {
      router.push("/contact");
      return;
    }
    router.push(`/sign-up?plan=${planId}`);
  }

  return (
    <section id="pricing" className="py-24 md:py-32 bg-secondary" ref={ref}>
      <div className="max-w-7xl mx-auto section-padding">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-xs font-semibold tracking-widest text-primary uppercase">
            Pricing
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold text-foreground leading-tight">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Choose the plan that works for your estate. Start free, upgrade when
            you are ready.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {pricingPlans.map((plan, i) => (
            <div
              key={plan.id}
              className={cn(
                "relative rounded-xl flex flex-col border p-6",
                plan.featured
                  ? "border-primary bg-card shadow-xl shadow-primary/10"
                  : "border-border bg-card",
                visible ? "reveal-up" : "opacity-0"
              )}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-6 px-3 py-0.5 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                  Most popular
                </div>
              )}
              <h3 className="font-sans text-lg font-semibold text-foreground">
                {plan.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {plan.description}
              </p>
              <div className="mt-5 mb-4 flex items-baseline gap-1.5">
                <span
                  className={cn(
                    "font-bold text-foreground tabular-nums",
                    plan.price ? "text-3xl" : "text-2xl"
                  )}
                >
                  {plan.priceLabel}
                </span>
                {plan.priceSub ? (
                  <span className="text-sm text-muted-foreground">
                    {plan.priceSub}
                  </span>
                ) : null}
              </div>

              <div className="border-t border-border pt-5 flex-1 space-y-3 mb-6">
                {plan.features.map(({ label, included }) => (
                  <div key={label} className="flex items-start gap-2.5">
                    {included ? (
                      <CheckCircle2
                        size={15}
                        className="text-primary shrink-0 mt-0.5"
                      />
                    ) : (
                      <X size={15} className="text-muted-foreground/40 shrink-0 mt-0.5" />
                    )}
                    <span
                      className={cn(
                        "text-sm leading-snug",
                        included
                          ? "text-foreground"
                          : "text-muted-foreground/50 line-through"
                      )}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                onClick={() => handleSelect(plan.id)}
                className={cn(
                  "w-full active:scale-[0.97] transition-all flex items-center justify-center gap-2",
                  plan.featured
                    ? "bg-primary hover:bg-primary-dark text-primary-foreground shadow-md"
                    : "bg-foreground/5 hover:bg-foreground/10 text-foreground"
                )}
              >
                {plan.cta}
                <ArrowRight size={14} />
              </Button>
            </div>
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-muted-foreground max-w-2xl mx-auto">
          You can start using the platform immediately after sign-up.
          Questions?{" "}
          <a
            href="mailto:contact@kynjo.homes"
            className="text-primary hover:underline"
          >
            contact@kynjo.homes
          </a>
        </p>
      </div>
    </section>
  );
};

export default Pricing;
