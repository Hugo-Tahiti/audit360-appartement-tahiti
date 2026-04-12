export async function GET() {
  try {
    const url = process.env.GOOGLE_SHEET_URL;
    if (!url) return Response.json({ leads: [], tracking: [] });

    const res = await fetch(
      url.replace("/exec", "/exec?action=getData&t=" + Date.now()),
      { cache: "no-store" }
    );

    const text = await res.text();
    let data = { leads: [], tracking: [] };

    try {
      data = JSON.parse(text);
    } catch {
      // If not JSON, return empty
    }

    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (e) {
    return Response.json({ leads: [], tracking: [], error: e.message });
  }
}
