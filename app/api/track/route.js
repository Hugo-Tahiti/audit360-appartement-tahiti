export async function POST(req) {
  try {
    const { event, data } = await req.json();

    const payload = {
      event,
      timestamp: new Date().toISOString(),
      ...data,
    };

    // Log to Vercel (visible in logs)
    console.log("TRACK", JSON.stringify(payload));

    // Send to Google Sheets tracking tab
    if (process.env.GOOGLE_SHEET_URL) {
      await fetch(process.env.GOOGLE_SHEET_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _track: true, ...payload }),
      }).catch(() => {});
    }

    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false });
  }
}
