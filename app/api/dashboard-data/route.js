export async function GET() {
  try {
    const url = process.env.GOOGLE_SHEET_URL;
    if (!url) return Response.json({ leads: [], tracking: [] });

    // Fetch leads from Google Sheets via Apps Script GET endpoint
    const res = await fetch(url.replace("/exec", "/exec?action=getData"), {
      method: "GET",
    });

    const text = await res.text();
    let data = { leads: [], tracking: [] };

    try {
      data = JSON.parse(text);
    } catch {
      // If not JSON, return empty
    }

    return Response.json(data);
  } catch (e) {
    return Response.json({ leads: [], tracking: [], error: e.message });
  }
}
