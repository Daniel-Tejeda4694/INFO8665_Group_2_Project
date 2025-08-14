"use client";
import ParlaLogo from "@/components/home/ParlaLogo";
import PrimaryButton from "@/components/ui/PrimaryButton";
import GlassPanel from "@/components/ui/GlassPanel";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/config";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/home");
    } catch (error: any) {
      alert("Signup failed: " + error.message);
    }
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center text-center px-4 text-[#ece5d8]"
      style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}
    >
      <ParlaLogo />
      <GlassPanel className="flex flex-col items-center justify-center absolute top-20 left-1/2 transform -translate-x-1/2 w-full max-w-7xl h-3/4">
        <div className="p-10 rounded-2xl shadow-lg w-sm align-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-8">
            Create a Parla Account
          </h1>
          <form
            onSubmit={handleSignup}
            className="flex flex-col gap-4 translate-x-26 w-[85px] text-center items-center"
          >
            <input
              className="px-5 py-3 rounded-full border text-white border-[#486684] w-100 focus:ring-[#6893be] focus:shadow-none"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="px-5 py-3 rounded-full border text-white border-[#486684] w-100 focus:ring-[#6893be] focus:shadow-none"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <PrimaryButton>Sign&nbsp;Up</PrimaryButton>
          </form>
          <p style={{ marginTop: "10px" }}>
            Already have an account?{" "}
            <a
              href="/login"
              style={{ color: "#007bff", textDecoration: "underline" }}
            >
              Login
            </a>
          </p>
        </div>
      </GlassPanel>
    </main>
  );
}
