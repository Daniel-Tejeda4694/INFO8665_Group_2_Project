export async function POST() {
  try {
    const response = await fetch("http://localhost:5000/start", {
      method: "POST",
    });
    const text = await response.text();
    return new Response(text, { status: 200 });
  } catch {
    return new Response("Failed to start detection", { status: 500 });
  }
}
