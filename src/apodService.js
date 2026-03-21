const NASA_APOD_API_URL = "https://api.nasa.gov/planetary/apod";
const NASA_APOD_PAGE_URL = "https://apod.nasa.gov/apod/astropix.html";
const REQUEST_HEADERS = {
  "User-Agent": "aurora-straza/0.2"
};

function normalizeText(value, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function decodeEntities(value) {
  return String(value)
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function stripHtml(value) {
  return decodeEntities(
    String(value)
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<\/p>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
  ).trim();
}

function normalizeApodPayload(payload) {
  const mediaType = normalizeText(payload.media_type, "image").toLowerCase();
  const imageUrl =
    mediaType === "image"
      ? normalizeText(payload.hdurl || payload.url)
      : normalizeText(payload.thumbnail_url || "");

  return {
    title: normalizeText(payload.title, "Astronomy Picture of the Day"),
    date: normalizeText(payload.date, new Date().toISOString().slice(0, 10)),
    explanation: normalizeText(payload.explanation, "NASA APOD opis nije dostupan."),
    imageUrl,
    mediaType,
    sourceUrl: NASA_APOD_PAGE_URL,
    mediaUrl: normalizeText(payload.url),
    hdUrl: normalizeText(payload.hdurl),
    copyright: normalizeText(payload.copyright),
    fetchedAt: new Date().toISOString()
  };
}

async function fetchApodFromApi(apiKey) {
  const response = await fetch(`${NASA_APOD_API_URL}?thumbs=true&api_key=${encodeURIComponent(apiKey)}`, {
    headers: REQUEST_HEADERS
  });

  if (!response.ok) {
    throw new Error(`Fetch failed for APOD API: ${response.status}`);
  }

  return normalizeApodPayload(await response.json());
}

async function fetchApodFromPage() {
  const response = await fetch(NASA_APOD_PAGE_URL, {
    headers: REQUEST_HEADERS
  });

  if (!response.ok) {
    throw new Error(`Fetch failed for APOD page: ${response.status}`);
  }

  const html = await response.text();
  const titleMatch = html.match(/<b>\s*([^<]+?)\s*<\/b>/i);
  const imageMatch = html.match(/<img[^>]+src="([^"]+)"/i);
  const explanationMatch = html.match(
    /Explanation:\s*<\/b>([\s\S]*?)(?:<p>\s*<center>|<center>|<b>\s*Tomorrow's picture|<\/body>)/i
  );

  const title = stripHtml(titleMatch?.[1] || "Astronomy Picture of the Day");
  const explanation = stripHtml(explanationMatch?.[1] || "NASA APOD opis nije dostupan.");
  const imageUrl = imageMatch?.[1] ? new URL(imageMatch[1], NASA_APOD_PAGE_URL).href : "";

  return {
    title,
    date: new Date().toISOString().slice(0, 10),
    explanation,
    imageUrl,
    mediaType: imageUrl ? "image" : "unknown",
    sourceUrl: NASA_APOD_PAGE_URL,
    mediaUrl: imageUrl,
    hdUrl: imageUrl,
    copyright: "",
    fetchedAt: new Date().toISOString()
  };
}

export async function fetchApod(apiKey = "DEMO_KEY") {
  let apiError = null;

  if (apiKey) {
    try {
      return await fetchApodFromApi(apiKey);
    } catch (error) {
      apiError = error;
    }
  }

  try {
    return await fetchApodFromPage();
  } catch (pageError) {
    if (apiError) {
      pageError.cause = apiError;
    }
    throw pageError;
  }
}
