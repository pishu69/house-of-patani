import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

export function NotFoundPage() {
  return (
    <section className="bg-linen/70 py-24">
      <div className="section-shell text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-4 text-6xl leading-tight md:text-8xl">
          This path has wandered.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
          The page you are looking for is not part of the House of Patani
          collection.
        </p>
        <Link
          className="mt-8 inline-flex min-h-11 items-center justify-center rounded-full bg-maroon px-5 py-2 text-sm font-semibold text-primary-foreground shadow-lift transition hover:bg-maroon/90"
          to={ROUTES.HOME}
        >
          Return Home
        </Link>
      </div>
    </section>
  );
}
