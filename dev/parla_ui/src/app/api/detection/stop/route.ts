export async function POST() {
  try {
    const response = await fetch("http://localhost:5000/stop", {
      method: "POST",
    });
    const text = await response.text();
    return new Response(text, { status: 200 });
  } catch (error) {
    return new Response("Failed to stop detection", { status: 500 });
  }
}
