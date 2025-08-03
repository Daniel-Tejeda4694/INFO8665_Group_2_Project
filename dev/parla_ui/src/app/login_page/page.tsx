"use client";
import ParlaLogo from "@/components/home/ParlaLogo";
import PrimaryButton from "@/components/ui/PrimaryButton";
import GlassPanel from "@/components/ui/GlassPanel";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "admin" && password === "admin") {
      router.push("/home_page");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center text-center px-4 text-[#ece5d8]"
      style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}
    >
      <ParlaLogo />
      {/* Login Card */}
      <GlassPanel className="flex flex-col items-center justify-center absolute top-20 left-1/2 transform -translate-x-1/2 w-full max-w-7xl h-3/4">
        <div className="p-10 rounded-2xl shadow-lg w-sm align-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-8">
            Login to Parla
          </h1>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 translate-x-26 w-[85px] text-center items-center"
          >
            <input
              className="px-5 py-3 rounded-full border text-white border-[#486684] w-100 focus:ring-[#6893be] focus:shadow-none"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
              }}
            />

            <input
              className="px-5 py-3 rounded-full border text-white border-[#486684] w-100 focus:ring-[#6893be] focus:shadow-none"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <PrimaryButton>Login</PrimaryButton>
          </form>
          <p style={{ marginTop: "10px" }}>
            Don&apos;t have an account?{" "}
            <a
              href="/signup"
              style={{ color: "#007bff", textDecoration: "underline" }}
            >
              Sign up
            </a>
          </p>
        </div>
      </GlassPanel>
    </main>
  );
}
