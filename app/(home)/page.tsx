import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-svh bg-base-200">
      <nav className="flex justify-end gap-4 p-2">
        <Link href="/sign-up" prefetch className="btn btn-primary">
          Sign Up
        </Link>
        <Link href="/sign-in" prefetch className="btn btn-neutral">
          Sign In
        </Link>
      </nav>
      <div className="hero min-h-[calc(100svh-var(--home-navbar-height))]">
        <div className="hero-content text-center">
          <header className="prose max-w-md">
            <h1 className="capitalize">The best Journal app</h1>
            <p className="py-6">
              This the best app for tracking your mood through out your life,
              All you have to do is be honest.
            </p>
            <Link href="/sign-up" prefetch className="btn btn-primary">
              Get Started
            </Link>
          </header>
        </div>
      </div>
    </div>
  );
}
