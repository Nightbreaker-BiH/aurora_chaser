const NASA_APOD_API_URL = "https://api.nasa.gov/planetary/apod";
const NASA_APOD_PAGE_URL = "https://apod.nasa.gov/apod/astropix.html";
const REQUEST_HEADERS = {
  "User-Agent": "aurora-straza/0.2"
};

function normalizeText(value, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function normalizeUrl(value, baseUrl = NASA_APOD_PAGE_URL) {
  const text = normalizeText(value);
  if (!text) {
    return "";
  }

  try {
    const url = new URL(text, baseUrl);
    if (url.protocol === "http:") {
      url.protocol = "https:";
    }
    return url.href;
  } catch {
    return "";
  }
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

function extractYouTubeVideoId(value) {
  const text = String(value ?? "");
  const patterns = [
    /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/i,
    /youtube\.com\/watch\?[^"'\s>]*v=([A-Za-z0-9_-]{11})/i,
    /youtu\.be\/([A-Za-z0-9_-]{11})/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  return "";
}

function extractPageMediaUrl(html) {
  const mediaPatterns = [
    /<iframe[^>]+src=["']([^"']+)["']/i,
    /<video[^>]+src=["']([^"']+)["']/i,
    /<source[^>]+src=["']([^"']+)["']/i,
    /<a[^>]+href=["']([^"']*(?:youtube\.com|youtu\.be)[^"']*)["']/i
  ];

  for (const pattern of mediaPatterns) {
    const match = html.match(pattern);
    const candidate = normalizeUrl(match?.[1], NASA_APOD_PAGE_URL);
    if (candidate) {
      return candidate;
    }
  }

  return "";
}

function extractPageImageUrl(html) {
  const imagePatterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<video[^>]+poster=["']([^"']+)["']/i,
    /<img[^>]+src=["']([^"']+)["']/i
  ];

  for (const pattern of imagePatterns) {
    const match = html.match(pattern);
    const candidate = normalizeUrl(match?.[1], NASA_APOD_PAGE_URL);
    if (candidate) {
      return candidate;
    }
  }

  const youtubeId = extractYouTubeVideoId(extractPageMediaUrl(html)) || extractYouTubeVideoId(html);
  return youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : "";
}

function mergeApodPayloads(primaryApod, pageApod) {
  const primaryImageUrl = normalizeUrl(primaryApod?.imageUrl);
  const pageImageUrl = normalizeUrl(pageApod?.imageUrl);
  const mediaType = normalizeText(
    primaryApod?.mediaType,
    normalizeText(pageApod?.mediaType, primaryImageUrl || pageImageUrl ? "image" : "unknown")
  ).toLowerCase();

  const imageUrl =
    pageImageUrl && (!primaryImageUrl || mediaType !== "image") ? pageImageUrl : primaryImageUrl || pageImageUrl;
  const fallbackImageUrl = pageImageUrl && pageImageUrl !== imageUrl ? pageImageUrl : "";

  return {
    title: normalizeText(primaryApod?.title, normalizeText(pageApod?.title, "Astronomy Picture of the Day")),
    date: normalizeText(primaryApod?.date, normalizeText(pageApod?.date, new Date().toISOString().slice(0, 10))),
    explanation: normalizeText(
      primaryApod?.explanation,
      normalizeText(pageApod?.explanation, "NASA APOD opis nije dostupan.")
    ),
    imageUrl,
    fallbackImageUrl,
    mediaType,
    sourceUrl: NASA_APOD_PAGE_URL,
    mediaUrl: normalizeUrl(primaryApod?.mediaUrl || pageApod?.mediaUrl || imageUrl),
    hdUrl: normalizeUrl(primaryApod?.hdUrl || pageApod?.hdUrl || imageUrl),
    copyright: normalizeText(primaryApod?.copyright, normalizeText(pageApod?.copyright)),
    fetchedAt: new Date().toISOString()
  };
}

function normalizeApodPayload(payload) {
  const mediaType = normalizeText(payload.media_type, "image").toLowerCase();
  const imageUrl =
    mediaType === "image"
      ? normalizeUrl(payload.url || payload.hdurl)
      : normalizeUrl(payload.thumbnail_url || "");

  return {
    title: normalizeText(payload.title, "Astronomy Picture of the Day"),
    date: normalizeText(payload.date, new Date().toISOString().slice(0, 10)),
    explanation: normalizeText(payload.explanation, "NASA APOD opis nije dostupan."),
    imageUrl,
    fallbackImageUrl: "",
    mediaType,
    sourceUrl: NASA_APOD_PAGE_URL,
    mediaUrl: normalizeUrl(payload.url),
    hdUrl: normalizeUrl(payload.hdurl || payload.url),
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
  const explanationMatch = html.match(
    /Explanation:\s*<\/b>([\s\S]*?)(?:<p>\s*<center>|<center>|<b>\s*Tomorrow's picture|<\/body>)/i
  );
  const mediaUrl = extractPageMediaUrl(html);
  const imageUrl = extractPageImageUrl(html);

  const title = stripHtml(titleMatch?.[1] || "Astronomy Picture of the Day");
  const explanation = stripHtml(explanationMatch?.[1] || "NASA APOD opis nije dostupan.");

  return {
    title,
    date: new Date().toISOString().slice(0, 10),
    explanation,
    imageUrl,
    fallbackImageUrl: "",
    mediaType: mediaUrl && mediaUrl !== imageUrl ? "video" : imageUrl ? "image" : "unknown",
    sourceUrl: NASA_APOD_PAGE_URL,
    mediaUrl: mediaUrl || imageUrl,
    hdUrl: imageUrl,
    copyright: "",
    fetchedAt: new Date().toISOString()
  };
}

export async function fetchApod(apiKey = "DEMO_KEY") {
  let apiApod = null;
  let pageApod = null;
  let apiError = null;
  let pageError = null;

  if (apiKey) {
    try {
      apiApod = await fetchApodFromApi(apiKey);
    } catch (error) {
      apiError = error;
    }
  }

  try {
    pageApod = await fetchApodFromPage();
  } catch (error) {
    pageError = error;
  }

  if (apiApod && pageApod) {
    return mergeApodPayloads(apiApod, pageApod);
  }

  if (apiApod) {
    return apiApod;
  }

  if (pageApod) {
    return pageApod;
  }

  if (pageError && apiError) {
    pageError.cause = apiError;
  }

  throw pageError || apiError || new Error("APOD fetch failed");
}
