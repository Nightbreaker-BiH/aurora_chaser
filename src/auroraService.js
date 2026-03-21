import SunCalc from "suncalc";

import { APP_META, OBSERVATION_SITES } from "./config.js";

const NOAA_OVATION_URL = "https://services.swpc.noaa.gov/json/ovation_aurora_latest.json";
const NOAA_KP_URL = "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json";
const NOAA_PLASMA_URL = "https://services.swpc.noaa.gov/products/solar-wind/plasma-7-day.json";
const NOAA_MAG_URL = "https://services.swpc.noaa.gov/products/solar-wind/mag-7-day.json";
const NOAA_HPI_TEXT_URL = "https://services.swpc.noaa.gov/text/aurora-nowcast-hemi-power.txt";
const NOAA_GEOMAG_3DAY_URL = "https://services.swpc.noaa.gov/text/3-day-geomag-forecast.txt";
const NOAA_45DAY_URL = "https://services.swpc.noaa.gov/json/45-day-forecast.json";

const L1_DISTANCE_KM = 1500000;
const MONTHS = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeHeader(header) {
  return String(header)
    .trim()
    .toLowerCase()
    .replaceAll(/[^\w]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function parseSpaceWeatherTime(value) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  const raw = String(value).trim();
  if (!raw) {
    return null;
  }

  if (raw.includes("T") && raw.endsWith("Z")) {
    return new Date(raw);
  }

  if (raw.includes("_")) {
    return new Date(raw.replace("_", "T") + ":00Z");
  }

  if (raw.includes(" ")) {
    return new Date(raw.replace(" ", "T") + "Z");
  }

  return new Date(raw);
}

function formatNumber(value, suffix = "", digits = 0) {
  if (!Number.isFinite(value)) {
    return "n/a";
  }

  return `${value.toFixed(digits)}${suffix}`;
}

function formatDateTime(value, timezone, options = {}) {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    return "n/a";
  }

  return new Intl.DateTimeFormat("bs-BA", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
    ...options
  }).format(value);
}

function ageMinutes(now, value) {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    return null;
  }

  return Math.max(0, Math.round((now.getTime() - value.getTime()) / 60000));
}

function formatAgeLabel(minutes) {
  if (!Number.isFinite(minutes)) {
    return "n/a";
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;
  return restMinutes ? `${hours} h ${restMinutes} min` : `${hours} h`;
}

function classifyFreshness(minutes, freshMinutes = 35, warningMinutes = 120) {
  if (!Number.isFinite(minutes)) {
    return {
      level: "unknown",
      label: "Nepoznato"
    };
  }

  if (minutes <= freshMinutes) {
    return {
      level: "fresh",
      label: "Svjeze"
    };
  }

  if (minutes <= warningMinutes) {
    return {
      level: "aging",
      label: "Malo starije"
    };
  }

  return {
    level: "stale",
    label: "Zastarjelo"
  };
}

function rowArrayToObjects(rows) {
  if (!Array.isArray(rows) || rows.length < 2) {
    return [];
  }

  const [headers, ...dataRows] = rows;
  return dataRows
    .filter((row) => Array.isArray(row))
    .map((row) => {
      const record = {};
      headers.forEach((header, index) => {
        record[normalizeHeader(header)] = row[index];
      });
      return record;
    });
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "aurora-straza/0.2"
    }
  });

  if (!response.ok) {
    throw new Error(`Fetch failed for ${url}: ${response.status}`);
  }

  return response.json();
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "aurora-straza/0.2"
    }
  });

  if (!response.ok) {
    throw new Error(`Fetch failed for ${url}: ${response.status}`);
  }

  return response.text();
}

async function fetchWeather(site, timezone) {
  const weatherUrl =
    `https://api.open-meteo.com/v1/forecast?latitude=${site.lat}&longitude=${site.lon}` +
    `&hourly=cloud_cover,cloud_cover_low,precipitation_probability,visibility` +
    `&forecast_days=6&timezone=${encodeURIComponent(timezone)}`;

  return fetchJson(weatherUrl);
}

async function fetchCmeAnalysis(apiKey) {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  const dateString = (value) => value.toISOString().slice(0, 10);

  const url =
    `https://api.nasa.gov/DONKI/CMEAnalysis?startDate=${dateString(startDate)}` +
    `&endDate=${dateString(endDate)}&mostAccurateOnly=true&speed=300&halfAngle=15&catalog=ALL` +
    `&api_key=${encodeURIComponent(apiKey)}`;

  try {
    return await fetchJson(url);
  } catch {
    return [];
  }
}

function getLatestRecord(records) {
  for (let index = records.length - 1; index >= 0; index -= 1) {
    if (records[index]) {
      return records[index];
    }
  }
  return null;
}

function normalizeLongitude(lon) {
  let normalized = lon;
  while (normalized < 0) {
    normalized += 360;
  }
  while (normalized >= 360) {
    normalized -= 360;
  }
  return normalized;
}

function longitudeDelta(a, b) {
  const diff = Math.abs(normalizeLongitude(a) - normalizeLongitude(b));
  return Math.min(diff, 360 - diff);
}

function buildOvationIndex(coordinates) {
  const index = new Map();

  for (const point of coordinates || []) {
    if (!Array.isArray(point) || point.length < 3) {
      continue;
    }

    const lon = toNumber(point[0]);
    const lat = toNumber(point[1]);
    const value = toNumber(point[2]);
    index.set(`${lon}:${lat}`, value);
  }

  return index;
}

function lookupOvation(index, lon, lat) {
  const key = `${normalizeLongitude(Math.round(lon))}:${Math.round(lat)}`;
  return toNumber(index.get(key), 0);
}

function analyzeAuroraReach(index, site) {
  const localProbability = lookupOvation(index, site.lon, site.lat);
  let best = {
    probability: 0,
    weightedProbability: 0,
    distanceKm: 9999,
    latitude: null,
    longitude: null
  };

  for (let lat = Math.round(site.lat + 2); lat <= 78; lat += 1) {
    for (let lonOffset = -22; lonOffset <= 22; lonOffset += 1) {
      const lon = site.lon + lonOffset;
      const probability = lookupOvation(index, lon, lat);
      if (!probability) {
        continue;
      }

      const deltaLat = lat - site.lat;
      const deltaLon = longitudeDelta(site.lon, lon) * Math.cos((site.lat * Math.PI) / 180);
      const distanceDeg = Math.sqrt(deltaLat ** 2 + deltaLon ** 2);
      const distanceKm = distanceDeg * 111;
      const weightedProbability = probability - distanceDeg * 0.55;

      if (
        weightedProbability > best.weightedProbability ||
        (weightedProbability === best.weightedProbability && distanceKm < best.distanceKm)
      ) {
        best = {
          probability,
          weightedProbability,
          distanceKm,
          latitude: lat,
          longitude: normalizeLongitude(lon)
        };
      }
    }
  }

  return {
    localProbability,
    ...best
  };
}

function computeSiteOpticsFactor(site) {
  const horizon = toNumber(site.northHorizonScore, 0.75);
  const lightPollution = toNumber(site.lightPollutionScore, 0.75);
  return clamp(horizon * 0.58 + lightPollution * 0.42, 0.72, 1);
}

function describeAuroraReach(auroraReach) {
  const distanceKm = Math.round(auroraReach.distanceKm);

  if (!Number.isFinite(distanceKm)) {
    return {
      label: "Signal nejasan",
      detail: "OVATION nema dovoljno jasnu aktivnu zonu sjeverno od BiH."
    };
  }

  if (distanceKm <= 1000) {
    return {
      label: "Blizu horizonta",
      detail: `Najjaci aktivni segment je oko ${distanceKm} km od referentne lokacije.`
    };
  }

  if (distanceKm <= 1800) {
    return {
      label: "Daleko sjeverno",
      detail: `Najjaci aktivni segment je oko ${distanceKm} km sjeverno; jos nije blizu viewline praga.`
    };
  }

  return {
    label: "Vrlo daleko sjeverno",
    detail: `Najjaci aktivni segment je oko ${distanceKm} km od lokacije i ne sugerise vizuelnu vidljivost sam po sebi.`
  };
}

function computeCorridorScore(auroraReach) {
  const distanceFactor = clamp(1 - Math.max(0, auroraReach.distanceKm - 900) / 1400, 0, 1);
  const reachProbabilityFactor = clamp(auroraReach.probability / 30, 0, 1);
  const localFactor = clamp(auroraReach.localProbability / 12, 0, 1);
  return clamp(localFactor * 12 + reachProbabilityFactor * distanceFactor * 22, 0, 34);
}

function parseHpiText(rawText) {
  const lines = rawText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));

  const entries = lines.map((line) => {
    const parts = line.split(/\s+/);
    return {
      observationTime: parseSpaceWeatherTime(parts[0]),
      forecastTime: parseSpaceWeatherTime(parts[1]),
      northGw: toNumber(parts[2], 0),
      southGw: toNumber(parts[3], 0)
    };
  });

  return entries.filter((entry) => entry.observationTime && entry.forecastTime);
}

function parseGeomagForecastText(rawText, now) {
  const lines = rawText.split("\n").map((line) => line.trimEnd());
  const issuedLine = lines.find((line) => line.startsWith(":Issued:"));
  const issuedYearMatch = issuedLine?.match(/(\d{4})/);
  const forecastYear = issuedYearMatch ? Number(issuedYearMatch[1]) : now.getUTCFullYear();

  const tableStartIndex = lines.findIndex((line) => line.includes("NOAA Kp index forecast"));
  if (tableStartIndex < 0) {
    return [];
  }

  const headerLine = lines[tableStartIndex + 1] ?? "";
  const dayMatches = [...headerLine.matchAll(/([A-Z][a-z]{2})\s+(\d{1,2})/g)];
  const days = dayMatches.map((match) => ({
    monthIndex: MONTHS[match[1]],
    day: Number(match[2]),
    label: `${match[1]} ${match[2]}`
  }));

  const bins = [];

  for (let index = tableStartIndex + 2; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line) {
      break;
    }

    const match = line.match(
      /^(\d{2})-(\d{2})UT\s+([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)/
    );

    if (!match || days.length < 3) {
      continue;
    }

    const startHour = Number(match[1]);
    const endHour = Number(match[2]);
    const values = [toNumber(match[3]), toNumber(match[4]), toNumber(match[5])];

    values.forEach((value, valueIndex) => {
      const day = days[valueIndex];
      const startUtc = new Date(Date.UTC(forecastYear, day.monthIndex, day.day, startHour, 0, 0));
      const endUtc = new Date(
        Date.UTC(
          forecastYear,
          day.monthIndex,
          day.day + (endHour <= startHour ? 1 : 0),
          endHour,
          0,
          0
        )
      );

      bins.push({
        startUtc,
        endUtc,
        value,
        utcWindow: `${match[1]}-${match[2]} UTC`,
        dayLabel: day.label
      });
    });
  }

  return bins;
}

function parseLongRangeForecast(payload) {
  return (payload?.data ?? [])
    .map((entry) => ({
      time: parseSpaceWeatherTime(entry.time),
      metric: String(entry.metric ?? "").toLowerCase(),
      value: toNumber(entry.value, Number.NaN)
    }))
    .filter((entry) => entry.time && entry.metric && Number.isFinite(entry.value));
}

function estimateKpFromAp(ap) {
  if (ap >= 208) {
    return 9;
  }
  if (ap >= 132) {
    return 8;
  }
  if (ap >= 80) {
    return 7;
  }
  if (ap >= 48) {
    return 6;
  }
  if (ap >= 27) {
    return 5;
  }
  if (ap >= 15) {
    return 4;
  }
  if (ap >= 8) {
    return 3;
  }
  if (ap >= 4) {
    return 2;
  }
  return 1;
}

function buildTrend(records, timeField, valueField, hours, limit = 24) {
  const threshold = Date.now() - hours * 60 * 60 * 1000;

  const items = records
    .map((record) => ({
      time: parseSpaceWeatherTime(record[timeField]),
      value: toNumber(record[valueField], Number.NaN)
    }))
    .filter((item) => item.time && Number.isFinite(item.value) && item.time.getTime() >= threshold);

  const step = Math.max(1, Math.ceil(items.length / limit));
  return items.filter((_, index) => index % step === 0).slice(-limit);
}

function computeNoaaScale(kp) {
  if (kp >= 8) {
    return "G4-G5";
  }
  if (kp >= 7) {
    return "G3";
  }
  if (kp >= 6) {
    return "G2";
  }
  if (kp >= 5) {
    return "G1";
  }
  return "Quiet";
}

function computeHpiStatus(hpiGw) {
  if (hpiGw >= 80) {
    return "Vrlo jako";
  }
  if (hpiGw >= 40) {
    return "Jako";
  }
  if (hpiGw >= 20) {
    return "Umjereno";
  }
  if (hpiGw >= 10) {
    return "Slabo";
  }
  return "Mirno";
}

function computeBzStatus(bz) {
  if (bz <= -10) {
    return "Vrlo povoljno";
  }
  if (bz < 0) {
    return "Povoljno";
  }
  if (bz < 10) {
    return "Neutralno";
  }
  return "Nepovoljno";
}

function computeSpeedStatus(speed) {
  if (speed >= 700) {
    return "Vrlo brzo";
  }
  if (speed >= 500) {
    return "Povoljno";
  }
  return "Umjereno";
}

function phaseToLabel(phase) {
  if (phase < 0.03 || phase > 0.97) {
    return "Mladi Mjesec";
  }
  if (phase < 0.22) {
    return "Rastuci srp";
  }
  if (phase < 0.28) {
    return "Prva cetvrt";
  }
  if (phase < 0.47) {
    return "Rastuci Mjesec";
  }
  if (phase < 0.53) {
    return "Pun Mjesec";
  }
  if (phase < 0.72) {
    return "Opadajuci Mjesec";
  }
  if (phase < 0.78) {
    return "Zadnja cetvrt";
  }
  return "Opadajuci srp";
}

function getNightBoundaries(now) {
  const tonightStart = new Date(now);
  tonightStart.setHours(18, 0, 0, 0);

  const tonightEnd = new Date(tonightStart);
  tonightEnd.setDate(tonightEnd.getDate() + 1);
  tonightEnd.setHours(3, 0, 0, 0);

  const tomorrowStart = new Date(tonightStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);

  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
  tomorrowEnd.setHours(3, 0, 0, 0);

  return {
    tonight: {
      label: "Veceras",
      start: tonightStart,
      end: tonightEnd
    },
    tomorrow: {
      label: "Sutra navecer",
      start: tomorrowStart,
      end: tomorrowEnd
    }
  };
}

function buildNightWindowForOffset(now, offsetDays) {
  const start = new Date(now);
  start.setDate(start.getDate() + offsetDays);
  start.setHours(18, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  end.setHours(3, 0, 0, 0);

  return { start, end };
}

function evaluateNightWindow(site, weather, start, end, runtimeConfig) {
  const hourly = weather?.hourly;
  if (!hourly?.time?.length) {
    return {
      bestCloudFactor: 0.25,
      bestWindowLabel: "Nema weather podataka",
      bestLocalTime: null,
      cloudCover: null,
      lowCloudCover: null,
      precipProbability: null,
      visibilityKm: null,
      sunAltitudeDeg: null,
      weatherFactor: 0.25
    };
  }

  const horizon = [];

  for (let index = 0; index < hourly.time.length; index += 1) {
    const time = new Date(hourly.time[index]);
    if (Number.isNaN(time.getTime()) || time.getTime() < start.getTime() || time.getTime() > end.getTime()) {
      continue;
    }

    const sunAltitudeDeg = (SunCalc.getPosition(time, site.lat, site.lon).altitude * 180) / Math.PI;
    const cloudCover = toNumber(hourly.cloud_cover?.[index], 75);
    const lowCloudCover = toNumber(hourly.cloud_cover_low?.[index], cloudCover);
    const precipProbability = toNumber(hourly.precipitation_probability?.[index], 0);
    const visibilityKm = toNumber(hourly.visibility?.[index], 20000) / 1000;
    const darkEnough = sunAltitudeDeg <= runtimeConfig.darkAltitudeDeg;

    const cloudFactor = clamp(
      1 - (0.55 * cloudCover + 0.25 * lowCloudCover + 0.2 * precipProbability) / 100,
      0,
      1
    );
    const visibilityFactor = clamp(visibilityKm / 35, 0.2, 1);
    const weatherFactor = cloudFactor * 0.78 + visibilityFactor * 0.22;
    const observationFactor = darkEnough
      ? weatherFactor * clamp(Math.abs(sunAltitudeDeg) / 18, 0.3, 1.15)
      : 0;

    horizon.push({
      time,
      cloudCover,
      lowCloudCover,
      precipProbability,
      visibilityKm,
      sunAltitudeDeg,
      weatherFactor,
      observationFactor
    });
  }

  const best = horizon.sort((a, b) => b.observationFactor - a.observationFactor)[0];

  if (!best) {
    return {
      bestCloudFactor: 0.2,
      bestWindowLabel: "Nema dovoljno tame",
      bestLocalTime: null,
      cloudCover: null,
      lowCloudCover: null,
      precipProbability: null,
      visibilityKm: null,
      sunAltitudeDeg: null,
      weatherFactor: 0.2
    };
  }

  return {
    bestCloudFactor: best.weatherFactor,
    bestWindowLabel: formatDateTime(best.time, runtimeConfig.timezone),
    bestLocalTime: best.time.toISOString(),
    cloudCover: Math.round(best.cloudCover),
    lowCloudCover: Math.round(best.lowCloudCover),
    precipProbability: Math.round(best.precipProbability),
    visibilityKm: Number(best.visibilityKm.toFixed(1)),
    sunAltitudeDeg: best.sunAltitudeDeg,
    weatherFactor: best.weatherFactor
  };
}

function scoreSite({ site, auroraReach, nightWindow, kp, solarWindSpeed, bz, hpiNorthGw, cme }) {
  const kpScore = clamp((kp - 4.3) * 10, 0, 34);
  const corridorScore = computeCorridorScore(auroraReach);
  const solarWindScore = clamp(
    Math.max(0, solarWindSpeed - 420) / 14 + Math.max(0, -bz) * 1.8,
    0,
    16
  );
  const hpiScore = clamp(hpiNorthGw / 3.5, 0, 10);
  const cmeScore = cme
    ? clamp(Math.max(0, cme.speed - 700) / 80 + Math.max(0, cme.predictedKp - 5) * 3, 0, 12)
    : 0;

  const spaceWeatherScore = kpScore + corridorScore + solarWindScore + hpiScore + cmeScore;
  const opticsFactor = computeSiteOpticsFactor(site);
  const darknessFactor = Number.isFinite(nightWindow.sunAltitudeDeg)
    ? clamp(Math.abs(nightWindow.sunAltitudeDeg) / 18, 0.25, 1)
    : 0.25;
  const score = clamp(spaceWeatherScore * nightWindow.weatherFactor * darknessFactor * opticsFactor, 0, 100);
  const roundedScore = Math.round(score);

  return {
    site,
    score: roundedScore,
    visibilityLabel: classifyScore(roundedScore).levelLabel,
    opticsFactor,
    auroraReach,
    nightWindow,
    reasons: [
      `Kp ${formatNumber(kp, "", 1)}`,
      `HPI ${formatNumber(hpiNorthGw, " GW", 1)}`,
      `Bz ${formatNumber(bz, " nT", 1)}`,
      `oblacnost ${formatNumber(nightWindow.cloudCover, "%")}`
    ]
  };
}

function classifyScore(score) {
  const normalizedScore = Math.round(score);

  if (normalizedScore >= 72) {
    return { level: "favorable", levelLabel: "Povoljno" };
  }
  if (normalizedScore >= 60) {
    return { level: "possible", levelLabel: "Moguce" };
  }
  if (normalizedScore >= 45) {
    return { level: "watch", levelLabel: "Pratiti" };
  }
  return { level: "unlikely", levelLabel: "Malo vjerovatno" };
}

function normalizeCmeEntry(entry) {
  const predictedKp = Math.max(
    toNumber(entry.kp_18, 0),
    toNumber(entry.kp_90, 0),
    toNumber(entry.kp_135, 0),
    toNumber(entry.kp_180, 0)
  );

  const explicitEarthImpact =
    Boolean(entry.isEarthGB) ||
    (Array.isArray(entry.impactList) &&
      entry.impactList.some((impact) => /earth/i.test(String(impact?.location || ""))));

  const possibleEarthImpact =
    explicitEarthImpact ||
    predictedKp >= 5 ||
    /earth|halo|direct|glancing/i.test(String(entry.note || "")) ||
    Math.abs(toNumber(entry.longitude, 999)) <= 45;

  const impactSignal = explicitEarthImpact ? "explicit" : possibleEarthImpact ? "possible" : "weak";

  return {
    time: parseSpaceWeatherTime(
      entry.estimatedShockArrivalTime || entry.time21_5 || entry.associatedCMEID || entry.catalog || ""
    ),
    speed: toNumber(entry.speed, 0),
    halfAngle: toNumber(entry.halfAngle, 0),
    latitude: entry.latitude ?? null,
    longitude: entry.longitude ?? null,
    note: entry.note || "",
    predictedKp,
    explicitEarthImpact,
    possibleEarthImpact,
    impactSignal
  };
}

function summarizeCme(cmeEntries, timezone) {
  const normalized = (cmeEntries || [])
    .map(normalizeCmeEntry)
    .filter((entry) => entry.time)
    .sort((a, b) => b.time.getTime() - a.time.getTime());

  const latest = normalized[0] ?? null;
  const maxSpeed = normalized.reduce((max, entry) => Math.max(max, entry.speed), 0);
  const maxPredictedKp = normalized.reduce((max, entry) => Math.max(max, entry.predictedKp), 0);
  const earthImpactCount = normalized.filter((entry) => entry.possibleEarthImpact).length;
  const explicitImpactCount = normalized.filter((entry) => entry.explicitEarthImpact).length;

  return {
    latest: latest
      ? {
          ...latest,
          timeLabel: formatDateTime(latest.time, timezone),
          speedLabel: formatNumber(latest.speed, " km/s"),
          predictedKpLabel: latest.predictedKp ? formatNumber(latest.predictedKp, "", 1) : "n/a",
          impactLabel:
            latest.impactSignal === "explicit"
              ? "Eksplicitan signal u feedu"
              : latest.impactSignal === "possible"
                ? "Moguc Earth/glancing signal"
                : "Nije potvrdjeno"
        }
      : null,
    recent: normalized.slice(0, 5).map((entry) => ({
      timeLabel: formatDateTime(entry.time, timezone),
      speed: entry.speed,
      speedLabel: formatNumber(entry.speed, " km/s"),
      halfAngle: entry.halfAngle,
      predictedKp: entry.predictedKp,
      impactSignal: entry.impactSignal
    })),
    stats: {
      count7d: normalized.length,
      earthImpactCount,
      explicitImpactCount,
      maxSpeed,
      maxSpeedLabel: formatNumber(maxSpeed, " km/s"),
      maxPredictedKp,
      maxPredictedKpLabel: maxPredictedKp ? formatNumber(maxPredictedKp, "", 1) : "n/a"
    }
  };
}

function summarizeMoon(site, date, timezone) {
  const illumination = SunCalc.getMoonIllumination(date);
  const moonTimes = SunCalc.getMoonTimes(date, site.lat, site.lon);

  return {
    siteName: site.name,
    illuminationPct: Math.round(illumination.fraction * 100),
    illuminationFraction: Number(illumination.fraction.toFixed(4)),
    phase: Number(illumination.phase.toFixed(4)),
    angle: Number(illumination.angle.toFixed(4)),
    phaseLabel: phaseToLabel(illumination.phase),
    riseLabel: moonTimes.rise ? formatDateTime(moonTimes.rise, timezone, { day: undefined, month: undefined }) : "n/a",
    setLabel: moonTimes.set ? formatDateTime(moonTimes.set, timezone, { day: undefined, month: undefined }) : "n/a"
  };
}

function forecastForInterval(forecastBins, start, end) {
  const overlapping = forecastBins.filter(
    (bin) => bin.endUtc.getTime() > start.getTime() && bin.startUtc.getTime() < end.getTime()
  );

  if (!overlapping.length) {
    return {
      maxKp: 0,
      avgKp: 0,
      bins: []
    };
  }

  const total = overlapping.reduce((sum, bin) => sum + bin.value, 0);
  return {
    maxKp: Math.max(...overlapping.map((bin) => bin.value)),
    avgKp: total / overlapping.length,
    bins: overlapping
  };
}

function scoreForecastOpportunity({ kpMax, weatherFactor, hpiNorthGw, cme }) {
  const kpScore = clamp((kpMax - 4) * 13, 0, 60);
  const hpiScore = clamp(hpiNorthGw / 4, 0, 10);
  const cmeScore =
    cme?.impactSignal === "explicit" ? clamp(Math.max(0, cme.predictedKp - 4) * 4, 0, 14) : 0;
  return clamp((kpScore + hpiScore + cmeScore) * weatherFactor, 0, 100);
}

function scoreLongRangeOpportunity({ estimatedKp, weatherFactor, moonFactor, cmeBoost }) {
  const kpScore = clamp((estimatedKp - 4.5) * 16, 0, 76);
  return clamp((kpScore + cmeBoost) * weatherFactor * moonFactor, 0, 100);
}

function buildRegionalOutlook(label, sites, forecastBins, start, end, hpiNorthGw, cme, runtimeConfig) {
  const siteForecasts = sites
    .map((siteEntry) => {
      const kpForecast = forecastForInterval(forecastBins, start, end);
      const score = scoreForecastOpportunity({
        kpMax: kpForecast.maxKp,
        weatherFactor: siteEntry.weather.weatherFactor,
        hpiNorthGw,
        cme
      });

      return {
        site: siteEntry.site,
        score,
        kpMax: kpForecast.maxKp,
        kpAvg: kpForecast.avgKp,
        weather: siteEntry.weather
      };
    })
    .sort((a, b) => b.score - a.score);

  const best = siteForecasts[0];
  const classification = classifyScore(best?.score ?? 0);

  return {
    label,
    score: Math.round(best?.score ?? 0),
    level: classification.level,
    levelLabel: classification.levelLabel,
    bestSiteName: best?.site.name ?? "n/a",
    bestWindowLabel: best?.weather.bestWindowLabel ?? "n/a",
    maxForecastKp: Number((best?.kpMax ?? 0).toFixed(1)),
    avgForecastKp: Number((best?.kpAvg ?? 0).toFixed(1)),
    cloudCover: best?.weather.cloudCover ?? null,
    precipProbability: best?.weather.precipProbability ?? null,
    windowStartLabel: formatDateTime(start, runtimeConfig.timezone),
    windowEndLabel: formatDateTime(end, runtimeConfig.timezone)
  };
}

function classifyFiveDayCard(score, estimatedKp, moonInterferencePct) {
  if (score >= 62 || estimatedKp >= 6) {
    return { tone: "elevated", label: "Povisen signal" };
  }
  if (moonInterferencePct >= 55 && estimatedKp >= 4) {
    return { tone: "moon", label: "Mjesec smeta" };
  }
  return { tone: "quiet", label: "Tiho" };
}

function buildFiveDayOutlook(now, weatherResults, longRangeForecast, cme, runtimeConfig) {
  const dailyAp = longRangeForecast
    .filter((entry) => entry.metric === "ap")
    .sort((a, b) => a.time.getTime() - b.time.getTime());

  return Array.from({ length: 5 }, (_, offsetDays) => {
    const window = buildNightWindowForOffset(now, offsetDays);
    const targetDay = new Intl.DateTimeFormat("sv-SE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: runtimeConfig.timezone
    }).format(window.start);

    const apEntry =
      dailyAp.find((entry) => {
        const entryDay = new Intl.DateTimeFormat("sv-SE", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          timeZone: runtimeConfig.timezone
        }).format(entry.time);
        return entryDay === targetDay;
      }) ?? null;

    const estimatedKp = estimateKpFromAp(apEntry?.value ?? 0);
    const siteForecasts = OBSERVATION_SITES.map((site, index) => {
      const weather = evaluateNightWindow(site, weatherResults[index], window.start, window.end, runtimeConfig);
      const illuminationFraction = SunCalc.getMoonIllumination(window.start).fraction;
      const moonFactor = clamp(1 - illuminationFraction * 0.35, 0.68, 1);
      const cmeBoost =
        offsetDays <= 1 && cme?.latest?.impactSignal === "explicit"
          ? clamp(Math.max(0, cme.latest.predictedKp - 4) * 5, 0, 18)
          : 0;
      const score = scoreLongRangeOpportunity({
        estimatedKp,
        weatherFactor: weather.weatherFactor,
        moonFactor,
        cmeBoost
      });

      return {
        site,
        weather,
        illuminationFraction,
        score
      };
    }).sort((a, b) => b.score - a.score);

    const best = siteForecasts[0];
    const moonInterferencePct = Math.round((best?.illuminationFraction ?? 0) * 100);
    const classification = classifyFiveDayCard(best?.score ?? 0, estimatedKp, moonInterferencePct);

    return {
      dateIso: window.start.toISOString(),
      dateLabel: new Intl.DateTimeFormat("bs-BA", {
        month: "short",
        day: "2-digit",
        timeZone: runtimeConfig.timezone
      }).format(window.start),
      weekdayLabel: new Intl.DateTimeFormat("bs-BA", {
        weekday: "short",
        timeZone: runtimeConfig.timezone
      }).format(window.start),
      guidanceKpEquivalent: estimatedKp,
      guidanceKpEquivalentLabel: formatNumber(estimatedKp, "", 0),
      ap: apEntry?.value ?? 0,
      apLabel: formatNumber(apEntry?.value ?? 0, "", 0),
      score: Math.round(best?.score ?? 0),
      bestSiteName: best?.site.name ?? "n/a",
      bestWindowLabel: best?.weather.bestWindowLabel ?? "n/a",
      cloudCover: best?.weather.cloudCover ?? null,
      moonInterferencePct,
      tone: classification.tone,
      toneLabel: classification.label,
      guidanceLabel: "Ap->Kp proxy",
      guidanceDisclaimer: "Planerski signal iz NOAA 45-day Ap guidance; nije operativna nocna prognoza.",
      note:
        estimatedKp >= 6
          ? "Povisen geomagnetni signal u guidance proizvodu; za BiH i dalje treba potvrda kroz vecernji Kp/Bz/OVATION."
          : estimatedKp >= 5
            ? "Granican guidance signal; BiH i dalje zavisi od sjevernog horizonta i vedrine."
            : "Tiha geomagnetna pozadina; tretiraj ovo kao planerski indikator, ne kao alarm."
    };
  });
}

function buildDataQuality({
  now,
  ovationObservationTime,
  ovationForecastTime,
  latestKpTime,
  latestPlasmaTime,
  latestMagTime,
  latestHpiTime
}) {
  const feeds = [
    {
      id: "ovation-observation",
      label: "OVATION observation",
      time: ovationObservationTime,
      freshMinutes: 35,
      warningMinutes: 120
    },
    {
      id: "ovation-forecast",
      label: "OVATION forecast",
      time: ovationForecastTime,
      freshMinutes: 80,
      warningMinutes: 180
    },
    {
      id: "kp",
      label: "Planetary Kp",
      time: latestKpTime,
      freshMinutes: 210,
      warningMinutes: 420
    },
    {
      id: "plasma",
      label: "Solar wind plasma",
      time: latestPlasmaTime,
      freshMinutes: 35,
      warningMinutes: 120
    },
    {
      id: "mag",
      label: "Interplanetary magnetic field",
      time: latestMagTime,
      freshMinutes: 35,
      warningMinutes: 120
    },
    {
      id: "hpi",
      label: "HPI",
      time: latestHpiTime,
      freshMinutes: 35,
      warningMinutes: 120
    }
  ].map((feed) => {
    const age = ageMinutes(now, feed.time);
    const freshness = classifyFreshness(age, feed.freshMinutes, feed.warningMinutes);
    return {
      id: feed.id,
      label: feed.label,
      ageMinutes: age,
      ageLabel: formatAgeLabel(age),
      freshness: freshness.level,
      freshnessLabel: freshness.label,
      timeLabel: formatDateTime(feed.time, "Europe/Sarajevo")
    };
  });

  const qualityScore = feeds.reduce((score, feed) => {
    if (feed.freshness === "fresh") {
      return score;
    }
    if (feed.freshness === "aging") {
      return score - 7;
    }
    if (feed.freshness === "stale") {
      return score - 18;
    }
    return score - 12;
  }, 100);

  const overall =
    qualityScore >= 82
      ? { level: "high", label: "Visoko povjerenje" }
      : qualityScore >= 58
        ? { level: "medium", label: "Srednje povjerenje" }
        : { level: "low", label: "Nisko povjerenje" };

  const plasmaFeed = feeds.find((feed) => feed.id === "plasma");
  const magFeed = feeds.find((feed) => feed.id === "mag");
  const l1ProxyFresh =
    plasmaFeed?.freshness === "fresh" &&
    magFeed?.freshness === "fresh";

  return {
    overall: {
      ...overall,
      qualityScore
    },
    l1Proxy: {
      level: l1ProxyFresh ? "fresh" : "aging",
      label: l1ProxyFresh ? "L1 proxy feed svjez" : "L1 proxy feed stariji",
      note: "Proxy indikator iz plasma+mag starosti; NOAA ne daje eksplicitnu fallback zastavicu u ovom feedu."
    },
    feeds
  };
}

function buildObservationModes({ score, bestSite, moon, current }) {
  const moonPenalty = moon.illuminationPct * 0.08;
  const visualScore = clamp(score - 12 - moonPenalty + (current.bz < 0 ? 4 : 0), 0, 100);
  const cameraScore = clamp(score + 8 - moon.illuminationPct * 0.03 + (current.bz < 0 ? 3 : 0), 0, 100);

  const visualClass = classifyScore(Math.round(visualScore));
  const cameraClass = classifyScore(Math.round(cameraScore));

  return {
    visual: {
      score: Math.round(visualScore),
      label: visualClass.levelLabel,
      note:
        visualScore >= 60
          ? `Vizuelno ima smisla provjeriti ${bestSite.name} ako je sjever otvoren i nebo cisto.`
          : visualScore >= 45
            ? `Vizuelno je granicno; vjerovatniji je slab niski luk ili kratka pojava prema sjeveru.`
            : `Vizuelna detekcija je teska; golim okom vjerovatno nece biti uvjerljiv signal.`
    },
    camera: {
      score: Math.round(cameraScore),
      label: cameraClass.levelLabel,
      note:
        cameraScore >= 60
          ? `Kamera ima realnu sansu da registruje boju i slabiji luk prije nego oko.`
          : cameraScore >= 45
            ? `Kamera je korisnija od oka; probaj duzu ekspoziciju i sirok kadar prema sjeveru.`
            : `Cak je i za kameru signal trenutno slab bez dodatnog pogorsanja geomagnetnih uslova.`
    }
  };
}

function classifyChecklistStatus(ok, caution) {
  if (ok) {
    return { level: "go", label: "GO" };
  }
  if (caution) {
    return { level: "watch", label: "WATCH" };
  }
  return { level: "no", label: "NO-GO" };
}

function buildGoNoGoChecklist({ current, tonightOutlook, moon, bestSiteScore }) {
  const geomag = classifyChecklistStatus(
    Math.max(current.kp, tonightOutlook.maxForecastKp) >= 6,
    Math.max(current.kp, tonightOutlook.maxForecastKp) >= 5
  );
  const bz = classifyChecklistStatus(current.bz <= -5, current.bz < 0);
  const wind = classifyChecklistStatus(current.solarWindSpeed >= 500, current.solarWindSpeed >= 430);
  const weather = classifyChecklistStatus(
    (bestSiteScore.nightWindow.cloudCover ?? 100) <= 25 && (bestSiteScore.nightWindow.precipProbability ?? 100) <= 20,
    (bestSiteScore.nightWindow.cloudCover ?? 100) <= 50
  );
  const moonStatus = classifyChecklistStatus(moon.illuminationPct <= 35, moon.illuminationPct <= 60);
  const optics = classifyChecklistStatus(bestSiteScore.opticsFactor >= 0.9, bestSiteScore.opticsFactor >= 0.8);

  const items = [
    {
      title: "Geomagnetni signal",
      value: `Kp sada ${formatNumber(current.kp, "", 1)} | veceras max ${formatNumber(tonightOutlook.maxForecastKp, "", 1)}`,
      note: "Za BiH je tipicno potreban bar Kp oko 6 uz dodatnu podrsku Bz i vedrine.",
      ...geomag
    },
    {
      title: "Bz smjer",
      value: current.bzLabel,
      note: "Negativan Bz otvara povoljniji coupling sa Zemljinim poljem.",
      ...bz
    },
    {
      title: "Solarni vjetar",
      value: current.solarWindSpeedLabel,
      note: "Brzina sama nije dovoljna, ali ispod ~430-500 km/s BiH tesko dobija jak signal.",
      ...wind
    },
    {
      title: "Vrijeme na terenu",
      value: `${formatNumber(bestSiteScore.nightWindow.cloudCover, "%")} cloud | ${formatNumber(bestSiteScore.nightWindow.precipProbability, "%")} precip`,
      note: `Najbolji punkt trenutno je ${bestSiteScore.site.name}.`,
      ...weather
    },
    {
      title: "Mjesec",
      value: `${moon.illuminationPct}% | ${moon.phaseLabel}`,
      note: "Mjeseceva svjetlost najvise smeta slabim niskim auroralnim strukturama.",
      ...moonStatus
    },
    {
      title: "Sjeverni horizont i svjetlo",
      value: `${bestSiteScore.site.northHorizonLabel} | ${bestSiteScore.site.lightPollutionLabel}`,
      note: "Opticka spremnost punkta je skoro jednako bitna kao i sam Kp na BiH sirinama.",
      ...optics
    }
  ];

  const goCount = items.filter((item) => item.level === "go").length;
  const noCount = items.filter((item) => item.level === "no").length;

  return {
    summary:
      goCount >= 4 && noCount <= 1
        ? { level: "go", label: "Idi na teren" }
        : goCount >= 2 && noCount <= 2
          ? { level: "watch", label: "Prati jos malo" }
          : { level: "no", label: "Ne izlaziti jos" },
    items
  };
}

export async function buildAuroraStatus(runtimeConfig) {
  const now = new Date();

  const [ovation, kpRows, plasmaRows, magRows, hpiText, geomagText, longRangeRows, cmeRows, ...weatherResults] =
    await Promise.all([
      fetchJson(NOAA_OVATION_URL),
      fetchJson(NOAA_KP_URL),
      fetchJson(NOAA_PLASMA_URL),
      fetchJson(NOAA_MAG_URL),
      fetchText(NOAA_HPI_TEXT_URL),
      fetchText(NOAA_GEOMAG_3DAY_URL),
      fetchJson(NOAA_45DAY_URL),
      fetchCmeAnalysis(runtimeConfig.nasaApiKey),
      ...OBSERVATION_SITES.map((site) => fetchWeather(site, runtimeConfig.timezone))
    ]);

  const ovationIndex = buildOvationIndex(ovation.coordinates);
  const kpRecords = rowArrayToObjects(kpRows);
  const plasmaRecords = rowArrayToObjects(plasmaRows);
  const magRecords = rowArrayToObjects(magRows);
  const hpiRecords = parseHpiText(hpiText);
  const geomagForecast = parseGeomagForecastText(geomagText, now);
  const longRangeForecast = parseLongRangeForecast(longRangeRows);
  const cme = summarizeCme(cmeRows, runtimeConfig.timezone);

  const latestKp = getLatestRecord(kpRecords);
  const latestPlasma = getLatestRecord(plasmaRecords);
  const latestMag = getLatestRecord(magRecords);
  const latestHpi = getLatestRecord(hpiRecords);
  const ovationObservationTime = parseSpaceWeatherTime(ovation["Observation Time"]);
  const ovationForecastTime = parseSpaceWeatherTime(ovation["Forecast Time"]);
  const latestKpTime = parseSpaceWeatherTime(latestKp?.time_tag);
  const latestPlasmaTime = parseSpaceWeatherTime(latestPlasma?.time_tag);
  const latestMagTime = parseSpaceWeatherTime(latestMag?.time_tag);
  const latestHpiTime = latestHpi?.forecastTime ?? null;

  const kp = toNumber(latestKp?.kp, 0);
  const solarWindSpeed = toNumber(latestPlasma?.speed, 0);
  const density = toNumber(latestPlasma?.density, 0);
  const bz = toNumber(latestMag?.bz_gsm ?? latestMag?.bz, 0);
  const hpiNorthGw = toNumber(latestHpi?.northGw, 0);
  const hpiSouthGw = toNumber(latestHpi?.southGw, 0);
  const propagationDelayMinutes = solarWindSpeed > 0 ? Math.round(L1_DISTANCE_KM / solarWindSpeed / 60) : null;

  const kpObserved24h = kpRecords.slice(-8).map((record) => ({
    time: parseSpaceWeatherTime(record.time_tag),
    value: toNumber(record.kp, 0)
  }));
  const kpMax24h = kpObserved24h.reduce((max, entry) => Math.max(max, entry.value), 0);
  const hpiRecent24h = hpiRecords.slice(-24);
  const hpiMax24h = hpiRecent24h.reduce((max, entry) => Math.max(max, entry.northGw), 0);

  const currentNightWindowStart = now;
  const currentNightWindowEnd = new Date(now.getTime() + runtimeConfig.evaluationHours * 60 * 60 * 1000);

  const siteScores = OBSERVATION_SITES.map((site, index) => {
    const auroraReach = analyzeAuroraReach(ovationIndex, site);
    const nightWindow = evaluateNightWindow(
      site,
      weatherResults[index],
      currentNightWindowStart,
      currentNightWindowEnd,
      runtimeConfig
    );

    return scoreSite({
      site,
      auroraReach,
      nightWindow,
      kp,
      solarWindSpeed,
      bz,
      hpiNorthGw,
      cme: cme.latest
    });
  }).sort((a, b) => b.score - a.score);

  const bestSiteScore = siteScores[0];
  const classification = classifyScore(bestSiteScore.score);
  const localNightKey = new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: runtimeConfig.timezone
  })
    .format(now)
    .replaceAll("-", "");

  const nightBoundaries = getNightBoundaries(now);
  const tonightSiteForecasts = OBSERVATION_SITES.map((site, index) => ({
    site,
    weather: evaluateNightWindow(site, weatherResults[index], nightBoundaries.tonight.start, nightBoundaries.tonight.end, runtimeConfig)
  }));
  const tomorrowSiteForecasts = OBSERVATION_SITES.map((site, index) => ({
    site,
    weather: evaluateNightWindow(site, weatherResults[index], nightBoundaries.tomorrow.start, nightBoundaries.tomorrow.end, runtimeConfig)
  }));

  const tonightOutlook = buildRegionalOutlook(
    nightBoundaries.tonight.label,
    tonightSiteForecasts,
    geomagForecast,
    nightBoundaries.tonight.start,
    nightBoundaries.tonight.end,
    hpiNorthGw,
    cme.latest,
    runtimeConfig
  );
  const tomorrowOutlook = buildRegionalOutlook(
    nightBoundaries.tomorrow.label,
    tomorrowSiteForecasts,
    geomagForecast,
    nightBoundaries.tomorrow.start,
    nightBoundaries.tomorrow.end,
    hpiNorthGw,
    cme.latest,
    runtimeConfig
  );

  const moon = summarizeMoon(bestSiteScore.site, now, runtimeConfig.timezone);
  const fiveDayOutlook = buildFiveDayOutlook(now, weatherResults, longRangeForecast, cme, runtimeConfig);
  const dataQuality = buildDataQuality({
    now,
    ovationObservationTime,
    ovationForecastTime,
    latestKpTime,
    latestPlasmaTime,
    latestMagTime,
    latestHpiTime
  });
  const observationModes = buildObservationModes({
    score: bestSiteScore.score,
    bestSite: bestSiteScore.site,
    moon,
    current: {
      kp,
      bz,
      solarWindSpeed
    }
  });
  const checklist = buildGoNoGoChecklist({
    current: {
      kp,
      bz,
      bzLabel: formatNumber(bz, " nT", 1),
      solarWindSpeed,
      solarWindSpeedLabel: formatNumber(solarWindSpeed, " km/s")
    },
    tonightOutlook,
    moon,
    bestSiteScore
  });

  return {
    app: {
      name: APP_META.name,
      author: APP_META.author,
      region: APP_META.region,
      description: APP_META.description
    },
    updatedAt: now.toISOString(),
    auroraMap: {
      sourceUrl: APP_META.mapSourceUrl,
      imageUrl: APP_META.mapImageUrl,
      observationTime: ovation["Observation Time"] ?? null,
      forecastTime: ovation["Forecast Time"] ?? null
    },
    viewline: {
      sourceUrl: APP_META.viewlineSourceUrl,
      tonightImageUrl: APP_META.viewlineTonightUrl,
      tomorrowImageUrl: APP_META.viewlineTomorrowUrl,
      caveat:
        "Za BiH nije direktna karta vidljivosti; koristi ga kao kontekst jacine, ne kao lokalnu mapu."
    },
    current: {
      kp,
      kpLabel: formatNumber(kp, "", 1),
      kpMax24h,
      kpMax24hLabel: formatNumber(kpMax24h, "", 1),
      noaaScale: computeNoaaScale(kp),
      solarWindSpeed,
      solarWindSpeedLabel: formatNumber(solarWindSpeed, " km/s"),
      solarWindStatus: computeSpeedStatus(solarWindSpeed),
      density,
      densityLabel: formatNumber(density, " cm^-3", 1),
      bz,
      bzLabel: formatNumber(bz, " nT", 1),
      bzStatus: computeBzStatus(bz),
      hpiNorthGw,
      hpiNorthLabel: formatNumber(hpiNorthGw, " GW", 1),
      hpiSouthGw,
      hpiSouthLabel: formatNumber(hpiSouthGw, " GW", 1),
      hpiMax24h,
      hpiMax24hLabel: formatNumber(hpiMax24h, " GW", 1),
      hpiStatus: computeHpiStatus(hpiNorthGw),
      propagationDelayMinutes,
      propagationDelayLabel: propagationDelayMinutes ? `${propagationDelayMinutes} min` : "n/a"
    },
    summary: {
      score: bestSiteScore.score,
      ...classification,
      bestSite: bestSiteScore.site,
      bestWindowLabel: bestSiteScore.nightWindow.bestWindowLabel,
      localNightKey,
      message:
        classification.level === "favorable"
          ? "Signal je dovoljno jak da vrijedi izaci na tamnu lokaciju sa otvorenim sjevernim horizontom."
          : classification.level === "possible"
            ? "Postoji realna sansa za nizak auroralni luk prema sjeveru BiH, ali Bz i lokalna vedrina ostaju presudni."
            : classification.level === "watch"
              ? "Vrijedi pratiti Kp, Bz i NOAA mapu tokom veceri. Alarm je na granici."
              : "Trenutni geomagnetni uslovi nisu dovoljno jaki za vjerovatnu vidljivost iz BiH."
    },
    outlooks: {
      tonight: tonightOutlook,
      tomorrow: tomorrowOutlook
    },
    fiveDayOutlook,
    moon,
    dataQuality,
    observationModes,
    checklist,
    kp: {
      observed24h: kpObserved24h.map((entry) => ({
        timeLabel: formatDateTime(entry.time, runtimeConfig.timezone, {
          day: undefined,
          month: undefined
        }),
        value: Number(entry.value.toFixed(2))
      })),
      forecast3Day: geomagForecast.slice(0, 24).map((bin) => ({
        timeLabel: `${formatDateTime(bin.startUtc, runtimeConfig.timezone, {
          day: undefined,
          month: undefined
        })}-${formatDateTime(bin.endUtc, runtimeConfig.timezone, { day: undefined, month: undefined })}`,
        value: Number(bin.value.toFixed(2))
      }))
    },
    hpi: {
      recent24h: hpiRecent24h.map((entry) => ({
        timeLabel: formatDateTime(entry.forecastTime, runtimeConfig.timezone, {
          day: undefined,
          month: undefined
        }),
        northGw: entry.northGw,
        southGw: entry.southGw
      }))
    },
    solarWind: {
      speedTrend: buildTrend(plasmaRecords, "time_tag", "speed", 24),
      densityTrend: buildTrend(plasmaRecords, "time_tag", "density", 24),
      bzTrend: buildTrend(magRecords, "time_tag", "bz_gsm", 24)
    },
    cme,
    visibility: {
      bestSiteName: bestSiteScore.site.name,
      bestVisibilityLabel: bestSiteScore.visibilityLabel,
      bestCloudCover: bestSiteScore.nightWindow.cloudCover,
      bestPrecipProbability: bestSiteScore.nightWindow.precipProbability,
      bestVisibilityKm: bestSiteScore.nightWindow.visibilityKm
    },
    sites: siteScores.map((entry) => ({
      id: entry.site.id,
      name: entry.site.name,
      lat: entry.site.lat,
      lon: entry.site.lon,
      note: entry.site.note,
      northHorizonLabel: entry.site.northHorizonLabel,
      lightPollutionLabel: entry.site.lightPollutionLabel,
      opticsFactor: Number(entry.opticsFactor.toFixed(2)),
      score: entry.score,
      visibilityLabel: entry.visibilityLabel,
      bestWindowLabel: entry.nightWindow.bestWindowLabel,
      cloudCover: entry.nightWindow.cloudCover,
      lowCloudCover: entry.nightWindow.lowCloudCover,
      precipProbability: entry.nightWindow.precipProbability,
      visibilityKm: entry.nightWindow.visibilityKm,
      sunAltitudeDeg: entry.nightWindow.sunAltitudeDeg,
      auroraProbabilityNorth: entry.auroraReach.probability,
      auroraLocalProbability: entry.auroraReach.localProbability,
      auroraDistanceKm: Math.round(entry.auroraReach.distanceKm),
      auroraSignalLabel: describeAuroraReach(entry.auroraReach).label,
      auroraSignalDetail: describeAuroraReach(entry.auroraReach).detail,
      reasons: entry.reasons
    })),
    sources: APP_META.sources
  };
}
