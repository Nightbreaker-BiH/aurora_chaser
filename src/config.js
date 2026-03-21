export const APP_META = {
  name: "AuroraChaser",
  author: "Alan Catovic",
  region: "Bosna i Hercegovina",
  description:
    "Aurora alarm za BiH koji kombinuje NOAA aurora mapu, geomagnetne indikatore, nocne uslove i oblacnost.",
  mapSourceUrl: "https://www.swpc.noaa.gov/products/aurora-30-minute-forecast",
  mapImageUrl: "https://services.swpc.noaa.gov/images/animations/ovation/north/latest.jpg",
  apodSourceUrl: "https://apod.nasa.gov/apod/astropix.html",
  viewlineSourceUrl: "https://www.swpc.noaa.gov/products/aurora-viewline-tonight-and-tomorrow-night-experimental",
  viewlineTonightUrl:
    "https://services.swpc.noaa.gov/experimental/images/aurora_dashboard/tonights_static_viewline_forecast.png",
  viewlineTomorrowUrl:
    "https://services.swpc.noaa.gov/experimental/images/aurora_dashboard/tomorrow_nights_static_viewline_forecast.png",
  sources: [
    {
      id: "noaa-aurora",
      name: "NOAA SWPC Aurora - 30 Minute Forecast",
      url: "https://www.swpc.noaa.gov/products/aurora-30-minute-forecast"
    },
    {
      id: "noaa-ovation-json",
      name: "NOAA SWPC OVATION latest JSON",
      url: "https://services.swpc.noaa.gov/json/ovation_aurora_latest.json"
    },
    {
      id: "noaa-kp",
      name: "NOAA SWPC Planetary K Index",
      url: "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json"
    },
    {
      id: "noaa-45-day",
      name: "NOAA SWPC 45-Day Forecast",
      url: "https://services.swpc.noaa.gov/json/45-day-forecast.json"
    },
    {
      id: "noaa-viewline",
      name: "NOAA SWPC Aurora Viewline (Experimental)",
      url: "https://www.swpc.noaa.gov/products/aurora-viewline-tonight-and-tomorrow-night-experimental"
    },
    {
      id: "noaa-solar-wind",
      name: "NOAA SWPC Solar Wind",
      url: "https://services.swpc.noaa.gov/products/solar-wind/plasma-7-day.json"
    },
    {
      id: "nasa-donki",
      name: "NASA DONKI CME Analysis",
      url: "https://api.nasa.gov/DONKI/CMEAnalysis"
    },
    {
      id: "nasa-apod",
      name: "NASA Astronomy Picture of the Day",
      url: "https://apod.nasa.gov/apod/astropix.html"
    },
    {
      id: "open-meteo",
      name: "Open-Meteo GFS Forecast API",
      url: "https://open-meteo.com/en/docs/gfs-api"
    },
    {
      id: "meteosat-balkans",
      name: "Meteosat IR Italy / Slovenia / Croatia / BiH (courtesy of EUMETSAT via Allmetsat)",
      url: "https://en.allmetsat.com/images/msg_italia_ir039.php"
    }
  ]
};

export const OBSERVATION_SITES = [
  {
    id: "bihac",
    name: "Bihac",
    lat: 44.8167,
    lon: 15.8708,
    note: "Najkorisniji sjeverozapadni profil za BiH.",
    northHorizonLabel: "Otvoren sjever",
    northHorizonScore: 1,
    lightPollutionLabel: "Nize svjetlosno zagadjenje",
    lightPollutionScore: 0.92
  },
  {
    id: "banja-luka",
    name: "Banja Luka",
    lat: 44.7722,
    lon: 17.191,
    note: "Sjeverni horizont dobar za niske auroralne lukove.",
    northHorizonLabel: "Uglavnom otvoren sjever",
    northHorizonScore: 0.95,
    lightPollutionLabel: "Umjereno gradsko svjetlo",
    lightPollutionScore: 0.82
  },
  {
    id: "brcko",
    name: "Brcko",
    lat: 44.8728,
    lon: 18.8106,
    note: "Najsevernija ravnicarska opcija u BiH.",
    northHorizonLabel: "Otvoren ravnicarski sjever",
    northHorizonScore: 0.97,
    lightPollutionLabel: "Umjereno do poviseno svjetlo",
    lightPollutionScore: 0.76
  },
  {
    id: "tuzla",
    name: "Tuzla",
    lat: 44.5384,
    lon: 18.6671,
    note: "Koristan istocni referentni punkt.",
    northHorizonLabel: "Djelimicno otvoren sjever",
    northHorizonScore: 0.82,
    lightPollutionLabel: "Poviseno gradsko svjetlo",
    lightPollutionScore: 0.7
  },
  {
    id: "sarajevo",
    name: "Sarajevo",
    lat: 43.8563,
    lon: 18.4131,
    note: "Centralna BiH, korisno za realnu vecernju dostupnost.",
    northHorizonLabel: "Ogranicen sjever zbog reljefa",
    northHorizonScore: 0.58,
    lightPollutionLabel: "Jace gradsko svjetlo",
    lightPollutionScore: 0.62
  },
  {
    id: "mostar",
    name: "Mostar",
    lat: 43.3438,
    lon: 17.8078,
    note: "Juzna BiH, slabija geometrija ali dobar indikator koliko je dogadjaj jak.",
    northHorizonLabel: "Reljefno ogranicen sjever",
    northHorizonScore: 0.52,
    lightPollutionLabel: "Umjereno gradsko svjetlo",
    lightPollutionScore: 0.68
  }
];

function buildRuntimeConfig(source = {}) {
  return {
    port: Number(source.PORT || 3000),
    pollMinutes: Number(source.POLL_MINUTES || 15),
    nasaApiKey: source.NASA_API_KEY || "DEMO_KEY",
    timezone: source.TIMEZONE || "Europe/Sarajevo",
    darkAltitudeDeg: Number(source.DARK_ALTITUDE_DEG || -12),
    evaluationHours: Number(source.EVALUATION_HOURS || 18),
    alertThresholds: {
      watch: 45,
      possible: 60,
      favorable: 72
    },
    smtp: {
      host: source.SMTP_HOST || "",
      port: Number(source.SMTP_PORT || 587),
      secure: String(source.SMTP_SECURE || "false").toLowerCase() === "true",
      user: source.SMTP_USER || "",
      pass: source.SMTP_PASS || "",
      from: source.SMTP_FROM || "AuroraChaser <alerts@example.com>"
    }
  };
}

export function getRuntimeConfig() {
  return buildRuntimeConfig(process.env);
}

export function getWorkerRuntimeConfig(env = {}) {
  return buildRuntimeConfig(env);
}
