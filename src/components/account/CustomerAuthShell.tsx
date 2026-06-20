import { ArrowLeft, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { ROUTES } from "@/constants/routes";

interface CustomerAuthShellProps {
  children: ReactNode;
  description: string;
  eyebrow: string;
  title: string;
}

export function CustomerAuthShell({
  children,
  description,
  eyebrow,
  title,
}: CustomerAuthShellProps) {
  return (
    <main className="grid min-h-[calc(100vh-5rem)] bg-background lg:grid-cols-[minmax(0,0.9fr)_minmax(30rem,1.1fr)]">
      <section className="hidden bg-maroon px-12 py-14 text-ivory lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="font-serif text-3xl text-ivory">House of Patani</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.24em] text-gold">
            Customer account
          </p>
        </div>
        <div className="max-w-lg">
          <p className="eyebrow">A more personal House</p>
          <h1 className="mt-4 text-6xl leading-tight text-ivory">
            Your orders and keepsakes, gathered together.
          </h1>
          <p className="mt-6 max-w-md text-sm leading-7 text-ivory/70">
            Secure mobile verification connects guest orders, delivery
            addresses, and saved pieces without changing the ease of checkout.
          </p>
        </div>
        <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-ivory/50">
          <ShieldCheck aria-hidden="true" size={15} />
          Verified mobile access
        </p>
      </section>

      <section className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <Link
            className="inline-flex items-center gap-2 text-sm font-semibold text-maroon hover:text-maroon/75"
            to={ROUTES.HOME}
          >
            <ArrowLeft aria-hidden="true" size={17} />
            Back to store
          </Link>
          <div className="mt-10 rounded-lg border border-maroon/10 bg-card p-6 shadow-lift sm:p-8">
            <p className="eyebrow">{eyebrow}</p>
            <h2 className="mt-2 text-4xl">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {description}
            </p>
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}
