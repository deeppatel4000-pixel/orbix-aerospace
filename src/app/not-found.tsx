import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Container } from "@/components/layout/container";

export default function NotFound() {
  return (
    <Container className="flex min-h-[70vh] flex-col items-start justify-center py-20">
      <p className="font-mono text-sm tracking-[0.2em] text-accent uppercase">
        404 / Navigation error
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
        This route is off the flight plan.
      </h1>
      <p className="mt-5 max-w-xl text-lg leading-8 text-muted">
        The page may have moved, or its workspace has not been established yet.
      </p>
      <Link
        className="mt-8 inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-semibold transition-colors hover:border-accent/60 hover:text-accent"
        href="/"
      >
        <ArrowLeft aria-hidden="true" size={17} />
        Return home
      </Link>
    </Container>
  );
}
