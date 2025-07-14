"use client";

import { useEffect } from "react";

export default function SocketInitializer() {
  useEffect(() => {
    // this hits your /api/socket endpoint to bootstrap Socket.IO
    fetch("/api/socket");
  }, []);

  return null; // no UI
}
