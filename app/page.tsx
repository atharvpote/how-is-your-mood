import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs";

export default function Home() {
  if (auth().userId) redirect("/journal");

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <header className="max-w-md">
          <h1 className="text-5xl font-bold capitalize">
            The best Journal app, period.
          </h1>
          <p className="py-6">
            This the best app for tracking your mood through out your life, All
            you have to do is be honest.
          </p>
          <Link href="/sign-up" prefetch className="btn btn-primary">
            Get Started
          </Link>
        </header>
      </div>
    </div>
  );
}
