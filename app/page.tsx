import Link from "next/link";
import { auth } from "@clerk/nextjs";

export default function Home() {
  const href = auth().userId ? "/journal" : "/new-user";

  return (
    <div className="h-screen bg-black grid place-content-center text-white">
      <div className="w-full max-w-[600px] px-6 my-6">
        <h1 className="text-6xl mb-4">The best Journal app, period.</h1>
        <p className="text-2xl text-white/60 mb-4">
          This the best app for tracking your mood through out your life, All
          you have to do is be honest.
        </p>
        <Link href={href} className="bg-blue-600 px-4 py-2 rounded-lg text-xl">
          Get Started
        </Link>
      </div>
    </div>
  );
}
