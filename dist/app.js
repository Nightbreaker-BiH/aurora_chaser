const LANGUAGE_STORAGE_KEY = "aurorachaser.language";
const LOCALES = {
  bs: "bs-BA",
  en: "en-US"
};

const state = {
  status: null,
  apod: null,
  lang: localStorage.getItem(LANGUAGE_STORAGE_KEY) === "en" ? "en" : "bs"
};

const statusRibbon = document.querySelector("#status-ribbon");
const scoreValue = document.querySelector("#score-value");
const scoreSummary = document.querySelector("#score-summary");
const heroKp = document.querySelector("#hero-kp");
const heroKpMax = document.querySelector("#hero-kp-max");
const heroHpi = document.querySelector("#hero-hpi");
const heroSpeed = document.querySelector("#hero-speed");
const authorLabel = document.querySelector("#author-label");
const heroLede = document.querySelector("#hero-lede");
const heroMetricLabels = [...document.querySelectorAll(".hero-metric span")];
const aboutAppButton = document.querySelector("#about-app-button");
const aboutAppModal = document.querySelector("#about-app-modal");
const aboutAppKicker = document.querySelector("#about-app-kicker");
const aboutAppTitle = document.querySelector("#about-app-title");
const aboutAppIntro = document.querySelector("#about-app-intro");
const aboutAppBody = document.querySelector("#about-app-body");
const aboutAppClose = document.querySelector("#about-app-close");
const heroPrimaryAction = document.querySelector("#hero-primary-action");
const heroSecondaryAction = document.querySelector("#hero-secondary-action");
const heroBannerImage = document.querySelector("#hero-banner-image");
const scoreLabel = document.querySelector(".score-label");
const langButtons = [...document.querySelectorAll("[data-lang]")];

const locateButton = document.querySelector("#locate-me");
const locationTitle = document.querySelector("#location-title");
const locationSummary = document.querySelector("#location-summary");
const locationGrid = document.querySelector("#location-grid");

const mapImage = document.querySelector("#aurora-map");
const mapCaption = document.querySelector("#map-caption");
const viewlineSource = document.querySelector("#viewline-source");
const viewlineTonight = document.querySelector("#viewline-tonight");
const viewlineTomorrow = document.querySelector("#viewline-tomorrow");
const viewlineTonightCaption = document.querySelector("#viewline-tonight-caption");
const viewlineTomorrowCaption = document.querySelector("#viewline-tomorrow-caption");
const viewlineCaveat = document.querySelector("#viewline-caveat");
const tonightCard = document.querySelector("#tonight-card");
const tomorrowCard = document.querySelector("#tomorrow-card");
const sarajevoCard = document.querySelector("#sarajevo-card");
const northSiteCard = document.querySelector("#north-site-card");
const fiveDayGrid = document.querySelector("#five-day-grid");
const qualitySummary = document.querySelector("#quality-summary");
const qualityList = document.querySelector("#quality-list");
const apodTitle = document.querySelector("#apod-title");
const apodLink = document.querySelector("#apod-link");
const apodMedia = document.querySelector("#apod-media");
const apodImage = document.querySelector("#apod-image");
const apodPlaceholder = document.querySelector("#apod-placeholder");
const apodDate = document.querySelector("#apod-date");
const apodExplanation = document.querySelector("#apod-explanation");
const apodCredit = document.querySelector("#apod-credit");

const kpValue = document.querySelector("#kp-value");
const kpScale = document.querySelector("#kp-scale");
const kpMaxValue = document.querySelector("#kp-max-value");
const kpTonightValue = document.querySelector("#kp-tonight-value");
const kpTomorrowValue = document.querySelector("#kp-tomorrow-value");
const kpObservedChart = document.querySelector("#kp-observed-chart");
const kpForecastChart = document.querySelector("#kp-forecast-chart");

const hpiValue = document.querySelector("#hpi-value");
const hpiSouthValue = document.querySelector("#hpi-south-value");
const hpiMaxValue = document.querySelector("#hpi-max-value");
const hpiStatus = document.querySelector("#hpi-status");
const hpiChart = document.querySelector("#hpi-chart");

const bzValue = document.querySelector("#bz-value");
const bzStatus = document.querySelector("#bz-status");
const speedValue = document.querySelector("#speed-value");
const speedStatus = document.querySelector("#speed-status");
const densityValue = document.querySelector("#density-value");
const delayValue = document.querySelector("#delay-value");
const speedChart = document.querySelector("#speed-chart");
const bzChart = document.querySelector("#bz-chart");

const cmeLatest = document.querySelector("#cme-latest");
const cmeStats = document.querySelector("#cme-stats");
const cmeRecent = document.querySelector("#cme-recent");

const moonPhase = document.querySelector("#moon-phase");
const moonIllumination = document.querySelector("#moon-illumination");
const moonRise = document.querySelector("#moon-rise");
const moonSet = document.querySelector("#moon-set");
const moonVisual = document.querySelector("#moon-visual");
const moonNote = document.querySelector("#moon-note");
const visualModeCard = document.querySelector("#visual-mode-card");
const visualModeTipCard = document.querySelector("#visual-mode-tip-card");
const visualModeCheckCard = document.querySelector("#visual-mode-check-card");
const cameraModeCard = document.querySelector("#camera-mode-card");
const cameraModeTipCard = document.querySelector("#camera-mode-tip-card");
const cameraModeCheckCard = document.querySelector("#camera-mode-check-card");
const weatherSatImage = document.querySelector("#weather-sat-image");
const weatherSatNote = document.querySelector("#weather-sat-note");
const checklistSummary = document.querySelector("#checklist-summary");
const checklistList = document.querySelector("#checklist-list");

const sitesList = document.querySelector("#sites-list");
const sitesNote = document.querySelector("#sites-note");
const sourcesList = document.querySelector("#sources-list");
const form = document.querySelector("#email-form");
const formFeedback = document.querySelector("#form-feedback");
const emailLabel = document.querySelector("#email-label");
const thresholdLabel = document.querySelector("#threshold-label");
const subscriptionSubmit = document.querySelector("#subscription-submit");
const formNote = document.querySelector("#form-note");
const fiveDayNote = document.querySelector("#five-day-note");
const variablesGrid = document.querySelector("#variables-grid");
const phenomenologyGrid = document.querySelector("#phenomenology-grid");
const hpiThresholdGrid = document.querySelector("#hpi-threshold-grid");
const infoTabs = [...document.querySelectorAll("[data-tab]")];
const infoPanels = [...document.querySelectorAll(".info-panel")];
const modeTabs = [...document.querySelectorAll("[data-mode-tab]")];
const modePanels = [...document.querySelectorAll("[data-mode-panel]")];
const APOD_FALLBACK_URL = "/sample-apod.json";
const thresholdSelect = form?.querySelector('select[name="threshold"]');
const emailInput = form?.querySelector('input[name="email"]');

const SITE_COPY = {
  bihac: {
    note: {
      bs: "Najkorisniji sjeverozapadni profil za BiH.",
      en: "Most useful northwestern viewing profile for Bosnia and Herzegovina."
    },
    northHorizon: {
      bs: "Otvoren sjever",
      en: "Open northern horizon"
    },
    lightPollution: {
      bs: "Nize svjetlosno zagadjenje",
      en: "Lower light pollution"
    }
  },
  "banja-luka": {
    note: {
      bs: "Sjeverni horizont dobar za niske auroralne lukove.",
      en: "Northern horizon is suitable for low auroral arcs."
    },
    northHorizon: {
      bs: "Uglavnom otvoren sjever",
      en: "Mostly open northern horizon"
    },
    lightPollution: {
      bs: "Umjereno gradsko svjetlo",
      en: "Moderate city glow"
    }
  },
  brcko: {
    note: {
      bs: "Najsevernija ravnicarska opcija u BiH.",
      en: "Northernmost flatland option in Bosnia and Herzegovina."
    },
    northHorizon: {
      bs: "Otvoren ravnicarski sjever",
      en: "Open flat northern horizon"
    },
    lightPollution: {
      bs: "Umjereno do poviseno svjetlo",
      en: "Moderate to elevated light pollution"
    }
  },
  tuzla: {
    note: {
      bs: "Koristan istocni referentni punkt.",
      en: "Useful eastern reference site."
    },
    northHorizon: {
      bs: "Djelimicno otvoren sjever",
      en: "Partially open northern horizon"
    },
    lightPollution: {
      bs: "Poviseno gradsko svjetlo",
      en: "Elevated city glow"
    }
  },
  sarajevo: {
    note: {
      bs: "Centralna BiH, korisno za realnu vecernju dostupnost.",
      en: "Central Bosnia reference, useful for realistic evening access."
    },
    northHorizon: {
      bs: "Ogranicen sjever zbog reljefa",
      en: "Northern horizon limited by terrain"
    },
    lightPollution: {
      bs: "Jace gradsko svjetlo",
      en: "Stronger city glow"
    }
  },
  mostar: {
    note: {
      bs: "Juzna BiH, slabija geometrija ali dobar indikator koliko je dogadjaj jak.",
      en: "Southern Bosnia site, weaker geometry but a good indicator of overall event strength."
    },
    northHorizon: {
      bs: "Reljefno ogranicen sjever",
      en: "Terrain-limited northern horizon"
    },
    lightPollution: {
      bs: "Umjereno gradsko svjetlo",
      en: "Moderate city glow"
    }
  }
};

const SOURCE_COPY = {
  "noaa-aurora": {
    bs: "NOAA SWPC aurora mapa - 30-minutna prognoza",
    en: "NOAA SWPC Aurora Map - 30 Minute Forecast"
  },
  "noaa-ovation-json": {
    bs: "NOAA SWPC OVATION latest JSON",
    en: "NOAA SWPC OVATION Latest JSON"
  },
  "noaa-kp": {
    bs: "NOAA SWPC planetarni K indeks",
    en: "NOAA SWPC Planetary K Index"
  },
  "noaa-45-day": {
    bs: "NOAA SWPC 45-dnevna prognoza",
    en: "NOAA SWPC 45-Day Forecast"
  },
  "noaa-viewline": {
    bs: "NOAA SWPC Aurora Viewline (eksperimentalno)",
    en: "NOAA SWPC Aurora Viewline (Experimental)"
  },
  "noaa-solar-wind": {
    bs: "NOAA SWPC solarni vjetar",
    en: "NOAA SWPC Solar Wind"
  },
  "nasa-donki": {
    bs: "NASA DONKI CME analiza",
    en: "NASA DONKI CME Analysis"
  },
  "nasa-apod": {
    bs: "NASA Astronomy Picture of the Day",
    en: "NASA Astronomy Picture of the Day"
  },
  "open-meteo": {
    bs: "Open-Meteo GFS prognozni API",
    en: "Open-Meteo GFS Forecast API"
  },
  "meteosat-balkans": {
    bs: "Meteosat IR Italija / Slovenija / Hrvatska / BiH",
    en: "Meteosat IR Italy / Slovenia / Croatia / BiH"
  }
};

const FEED_COPY = {
  "ovation-observation": {
    bs: "OVATION opservacija",
    en: "OVATION observation"
  },
  "ovation-forecast": {
    bs: "OVATION prognoza",
    en: "OVATION forecast"
  },
  kp: {
    bs: "Planetarni Kp",
    en: "Planetary Kp"
  },
  plasma: {
    bs: "Solarni vjetar - plazma",
    en: "Solar wind plasma"
  },
  mag: {
    bs: "Interplanetarno magnetno polje",
    en: "Interplanetary magnetic field"
  },
  hpi: {
    bs: "HPI",
    en: "HPI"
  }
};

const UI_TEXT = {
  bs: {
    author: "Autor: Alan Catovic",
    heroLede: "NOAA aurora mapa, KP/HPI/MAG/CME podaci i BiH nocni uslovi u jednom dashboardu.",
    aboutAppButton: "O aplikaciji",
    aboutAppKicker: "O aplikaciji",
    aboutAppTitle: "Sta AuroraChaser radi za BiH",
    aboutAppClose: "Zatvori",
    aboutAppIntro:
      "AuroraChaser je BiH-orijentisan operativni dashboard za procjenu da li auroru vrijedi pratiti iz Bosne i Hercegovine u datoj noci. Ne prikazuje samo globalnu geomagnetnu aktivnost nego je filtrira kroz lokalne vremenske i opticke uslove.",
    aboutAppSections: [
      {
        title: "Koje podatke koristi",
        items: [
          "Koristi NOAA OVATION mapu i viewline kao kontekst rasporeda auroralnog ovala i jacine dogadjaja.",
          "Prati planetarni Kp, HPI, Bz, brzinu i gustinu solarnog vjetra, plus DONKI CME zapise kao indikatore moguceg geomagnetnog impulsa.",
          "Dodaje Open-Meteo oblacnost, padavine i vidljivost, Mjesec i satelitski infracrveni kadar oblaka za BiH, Hrvatsku i Sloveniju."
        ]
      },
      {
        title: "Sta racuna za korisnika u BiH",
        items: [
          "Racuna jedinstveni BiH skor za veceras, outlook za veceras i sutra, te petodnevni planerski signal.",
          "Poreda referentne lokacije po otvorenosti sjevernog horizonta, svjetlosnom zagadjenju i trenutnim vremenskim uslovima.",
          "Daje posebne procjene za golo oko i kameru, uz go/no-go checklist za izlazak na teren."
        ]
      },
      {
        title: "Kako citati rezultat",
        items: [
          "Visok skor sam po sebi nije dovoljan ako je Bz neutralan, ako je sjever zatvoren oblacima ili ako lokacija ima los horizont.",
          "Na BiH sirinama vizuelna pojava obicno trazi jaci geomagnetni poremecaj; kamera cesto registruje signal prije oka.",
          "Aplikacija je alat za screening i odluku o izlasku, a ne garancija da ce aurora biti vizuelno vidljiva."
        ]
      }
    ],
    heroPrimaryAction: "BiH vidljivost",
    heroSecondaryAction: "Email alarm",
    heroBannerAlt: "AuroraChaser hero ilustracija za Bosnu i Hercegovinu",
    heroMetricCurrentKp: "Trenutni KP",
    heroMetricMaxKp: "Maks KP 24h",
    heroMetricHpi: "HPI",
    heroMetricSolarWind: "Solarni vjetar",
    scoreLabel: "BiH skor za veceras",
    scoreSummaryLoading: "Citanje NOAA, NASA i weather feedova...",
    loading: "Ucitavanje...",
    locationKicker: "Lokacija i auroralna vidljivost",
    locationHeading: "BiH vidljivost po lokaciji",
    locateMe: "Koristi moju lokaciju",
    locationTitle: "Preporucena lokacija za BiH",
    mapKicker: "Aktuelna aurora prognoza",
    mapHeading: "NOAA Aurora 30-minute mapa",
    mapLink: "NOAA izvor",
    mapAlt: "NOAA aurora mapa za sjevernu hemisferu",
    mapCaption:
      "NOAA OVATION mapa za sjevernu hemisferu, sa BiH interpretacijom u ostatku dashboarda.",
    viewlineKicker: "NOAA kontekst proizvod",
    viewlineHeading: "NOAA viewline panel",
    viewlineLink: "NOAA viewline",
    viewlineTonightAlt: "NOAA viewline za veceras",
    viewlineTomorrowAlt: "NOAA viewline za sutra navecer",
    tonight: "Veceras",
    tomorrowNight: "Sutra navecer",
    viewlineCaveat: "Za BiH ovo nije direktna lokalna mapa nego referenca na jacinu dogadjaja.",
    outlookKicker: "Prognoza auroralne aktivnosti",
    outlookHeading: "BiH outlook",
    fiveDayKicker: "Sira prognoza",
    fiveDayHeading: "Narednih 5 dana",
    fiveDayNote:
      "Narednih 5 dana koriste NOAA 45-day `Ap` guidance kao planerski proxy, ne kao operativni nocni alarm.",
    qualityKicker: "Povjerenje i svjezina",
    qualityHeading: "Svjezina feeda",
    kpKicker: "KP indeks i geomagnetna aktivnost",
    kpHeading: "KP monitor",
    hpiKicker: "Auroralni indeks snage",
    hpiHeading: "HPI monitor",
    magKicker: "Solarni vjetar i magnetno polje",
    magHeading: "MAG / plasma",
    cmeKicker: "Najnoviji koronalni izbacaji mase",
    cmeHeading: "CME monitor",
    cmeRecentHeading: "Skorasnji CME dogadjaji (7 dana)",
    checklistKicker: "Go / No-Go",
    checklistHeading: "Teren checklist",
    moonKicker: "Faza Mjeseca",
    moonHeading: "Mjesec i tamno nebo",
    modesKicker: "Golo oko vs kamera",
    modesHeading: "Kako posmatrati",
    visualTab: "Golo oko",
    cameraTab: "Kamera",
    weatherSatKicker: "Satelitski prikaz oblaka",
    weatherSatHeading: "Satelitski snimak iznad BiH / HR / SI",
    weatherSatAlt: "Meteosat infracrveni snimak oblaka iznad Slovenije, Hrvatske, Bosne i Hercegovine i sjevernog Jadrana",
    sitesKicker: "Opticki sloj BiH lokacija",
    sitesHeading: "BiH referentne lokacije",
    sitesNote:
      "Svaka lokacija sada nosi i opticki sloj: otvorenost sjevernog horizonta i procjenu svjetlosnog zagadjenja.",
    explainKicker: "Razumijevanje solarne aktivnosti i aurore",
    explainHeading: "Sta znace ove varijable",
    variablesTab: "Varijable",
    phenomenologyTab: "Fenomenologija",
    alertKicker: "Ukljuci aurora alarme",
    alertHeading: "Email pretplata",
    emailLabel: "Email",
    emailPlaceholder: "ime@domena.com",
    thresholdLabel: "Prag alarma",
    thresholdOptions: [
      { value: "possible", label: "Moguce (preporuceno)" },
      { value: "watch", label: "Pratiti ranije" },
      { value: "favorable", label: "Samo jaci signal" }
    ],
    submit: "Sacuvaj pretplatu",
    formNote:
      "Alarm salje mail kada procjena za BiH predje izabrani prag. Za stvarni outgoing mail treba SMTP konfiguracija u `.env`.",
    sourcesKicker: "Reference",
    sourcesHeading: "Izvori i feedovi",
    hpiThresholdTitle: "Razumijevanje auroralne snage",
    hpiCards: [
      {
        title: "Sta znaci HPI",
        lines: ["HPI mjeri energiju unesenu u auroralni oval. Veci broj GW obicno znaci jacu auroralnu aktivnost."]
      },
      {
        title: "Pragovi snage",
        lines: ["10-20 GW: slabo", "20-40 GW: umjereno", "40-80 GW: jako", "80+ GW: vrlo jako"]
      }
    ],
    variableCards: [
      {
        title: "Magnetno polje",
        body:
          "Bz komponenta medjuplanetarnog magnetnog polja je kljucna za auroru. Negativan Bz olaksava spajanje sa Zemljinim poljem i pojacava auroralni odgovor."
      },
      {
        title: "Solarni vjetar",
        body:
          "Solarni vjetar je tok cestica sa Sunca. Brzina, gustina i orijentacija magnetnog polja odredjuju koliko energije ulazi u magnetosferu."
      },
      {
        title: "Kasnjenje propagacije",
        body:
          "Mjerenja dolaze sa L1 tacke oko 1.5 miliona km od Zemlje, pa postoji kasnjenje izmedju mjerenja i ulaska poremecaja u Zemljinu okolinu."
      },
      {
        title: "KP indeks",
        body:
          "KP je globalni indeks geomagnetne aktivnosti od 0 do 9. Za BiH je cesto potreban KP 6-7 ili vise, uz povoljan Bz i vedar sjeverni horizont."
      },
      {
        title: "NOAA geomagnetne skale",
        body:
          "G1 je priblizno KP 5, G2 oko KP 6, G3 oko KP 7, a G4-G5 su vrlo jake oluje koje guraju auroralni oval ka srednjim geografskim sirinama."
      },
      {
        title: "Savjeti za posmatranje aurore",
        body:
          "Prati forecast redovno, idi na tamnu lokaciju dalje od gradskog svjetla i ciljaj 22:00-02:00 sa otvorenim sjevernim horizontom."
      }
    ],
    phenomenologyCards: [
      {
        title: "Sta je aurora",
        body:
          "Aurora je opticki trag talozenja energije u gornjoj atmosferi. Naelektrisane cestice iz Suncevog vjetra ulaze duz magnetnih silnica, pobudjuju kiseonik i azot, a atmosfera zatim emituje svjetlost."
      },
      {
        title: "Boje i visine",
        body:
          "Zelena je najcesca i vezana je uglavnom za kiseonik na oko 100-150 km. Crvena se javlja vise i slabija je, dok ljubicaste i plave komponente cesto dolaze od azota u dinamicnijim strukturama."
      },
      {
        title: "Solar Cycle 25",
        body:
          "Pojacana solarna aktivnost znaci vise baklji, CME-ova i povoljnijih uslova za jace geomagnetne oluje. Zato su godine oko maksimuma ciklusa najzanimljivije za nize geografske sirine."
      },
      {
        title: "Zasto je teska za BiH",
        body:
          "BiH je daleko juznije od standardnog auroralnog ovala, pa je za vizuelnu pojavu obicno potreban jak geomagnetni poremecaj i znacajno pomjeranje ovala prema jugu. Zato je otvoren sjeverni horizont presudan."
      },
      {
        title: "Kada gledati",
        body:
          "Najbolji prozor je lokalna noc, posebno 22:00-02:00. Vedro nebo, manji Mjesec i periodi oko ekvinocija dodatno povecavaju sansu da isti KP zaista bude upotrebljiv za posmatranje."
      },
      {
        title: "Kako izgleda u praksi",
        body:
          "Na BiH sirinama aurora se cesto prvo vidi kao slab sjeverni luk, difuzno zelenilo ili niski stubovi. Kamera cesto pokazuje vise boje i kontrasta nego ljudsko oko."
      },
      {
        title: "Kako citati dashboard",
        body:
          "NOAA mapa daje kratkorocni raspored ovala, KP daje globalnu jacinu oluje, Bz govori da li je magnetna kapija otvorena, HPI mjeri energiju, a cloud i moon filter govore da li BiH uopste ima opticke uslove."
      },
      {
        title: "Kontrolna lista za BiH",
        body:
          "Trazi negativan Bz, solarni vjetar barem oko 500 km/s, KP prema 6-7, nisku oblacnost prema sjeveru i lokaciju van urbanog sjaja. Tek kombinacija tih faktora daje realan izlazak na teren."
      }
    ],
    apodLoading: "Ucitavanje APOD feeda...",
    apodUnavailable: "NASA APOD trenutno nije dostupan.",
    apodUnavailableFeed: "NASA APOD feed nije dostupan.",
    apodSourceFallback: "Izvor: NASA APOD kada mreza i endpoint odgovore.",
    apodSource: "Izvor: NASA Astronomy Picture of the Day.",
    apodVideoThumb: "APOD video thumbnail",
    apodImage: "APOD image",
    apodMissingVideo: "Danasnji APOD je video bez dostupnog thumbnaila.",
    apodMissingImage: "NASA APOD nije vratio sliku za danasnji unos.",
    geoUnavailable: "Browser geolokacija nije dostupna.",
    geoLocating: "Odredjujem najblizi BiH referentni punkt...",
    geoNoMatch: "Nisam uspio mapirati lokaciju na BiH referentni punkt.",
    geoDenied: "Geolokacija nije dozvoljena ili nije dostupna.",
    nearestSitePrefix: "Najblizi referentni punkt",
    formSending: "Slanje...",
    formInvalidEmail: "Unesite validnu email adresu.",
    formInvalidThreshold: "Nepoznat prag alarma.",
    formSaved: "Pretplata sacuvana. Alarm ce slati email kada procjena za BiH predje izabrani prag.",
    formSavedNoSmtp:
      "Pretplata sacuvana. Za stvarno slanje emailova treba popuniti SMTP varijable u .env.",
    formError: "Greska pri cuvanju pretplate.",
    statusLoadError: "Nisam uspio ucitati NOAA/NASA/weather podatke. Provjeri backend i mrezu.",
    confidence: "Povjerenje",
    fieldDecision: "Teren odluka",
    visualMode: "Vizuelni mod",
    cameraMode: "Kamera mod",
    moonCurrentView: "Trenutni izgled",
    illuminated: "Osvijetljeno",
    weatherSatNotePrefix: "Siri infrared cloud-top snimak za Sloveniju, Hrvatsku i BiH. Osvjezeno uz dashboard:",
    mapObservation: "Posmatranje",
    mapForecast: "Prognoza",
    bestSite: "Najbolji punkt",
    bestWindow: "Najbolji termin",
    point: "Punkt",
    status: "Status",
    window: "Termin",
    optics: "Optika",
    north: "Sjever",
    light: "Svjetlo",
    score: "Skor",
    age: "Starost",
    feedTime: "Vrijeme feeda",
    fieldWeather: "Vrijeme na terenu",
    siteMetricLabel: "BiH punkt",
    langSwitchAria: "Prekidac jezika",
    infoTabsAria: "Kartice informacija o aurori",
    modeTabsAria: "Kartice nacina posmatranja"
  },
  en: {
    author: "Author: Alan Catovic",
    heroLede: "NOAA aurora map, KP/HPI/MAG/CME data, and Bosnia night-sky conditions in one dashboard.",
    aboutAppButton: "About app",
    aboutAppKicker: "About app",
    aboutAppTitle: "What AuroraChaser does for Bosnia",
    aboutAppClose: "Close",
    aboutAppIntro:
      "AuroraChaser is a Bosnia-focused operational dashboard for deciding whether an aurora is worth tracking from Bosnia and Herzegovina on a given night. It does not show only global geomagnetic activity; it filters that signal through local weather and optical constraints.",
    aboutAppSections: [
      {
        title: "What data it uses",
        items: [
          "It uses the NOAA OVATION map and viewline as context for auroral-oval placement and overall event strength.",
          "It tracks planetary Kp, HPI, Bz, solar-wind speed and density, plus DONKI CME entries as indicators of a possible geomagnetic impulse.",
          "It adds Open-Meteo cloud cover, precipitation, and visibility, Moon conditions, and an infrared cloud satellite frame for Bosnia, Croatia, and Slovenia."
        ]
      },
      {
        title: "What it computes for Bosnia users",
        items: [
          "It computes a single Bosnia score for tonight, outlook cards for tonight and tomorrow, and a five-day planning signal.",
          "It ranks reference sites by northern-horizon openness, light pollution, and current local weather conditions.",
          "It gives separate estimates for visual observing and camera use, together with a go/no-go field checklist."
        ]
      },
      {
        title: "How to interpret the result",
        items: [
          "A high score alone is not enough if Bz is neutral, northern cloud blocks the view, or the site has a poor horizon.",
          "At Bosnia latitudes a visual aurora usually requires a stronger geomagnetic disturbance; a camera often records the signal before the eye does.",
          "The app is a screening and field-decision tool, not a guarantee of visual visibility."
        ]
      }
    ],
    heroPrimaryAction: "BiH visibility",
    heroSecondaryAction: "Email alerts",
    heroBannerAlt: "AuroraChaser hero illustration for Bosnia and Herzegovina",
    heroMetricCurrentKp: "Current KP",
    heroMetricMaxKp: "Max KP 24h",
    heroMetricHpi: "HPI",
    heroMetricSolarWind: "Solar wind",
    scoreLabel: "BiH score for tonight",
    scoreSummaryLoading: "Reading NOAA, NASA, and weather feeds...",
    loading: "Loading...",
    locationKicker: "Location & Aurora Visibility",
    locationHeading: "BiH visibility by site",
    locateMe: "Use my location",
    locationTitle: "Recommended site for Bosnia and Herzegovina",
    mapKicker: "Live Aurora Forecast",
    mapHeading: "NOAA Aurora 30-Minute Map",
    mapLink: "NOAA source",
    mapAlt: "NOAA aurora map for the northern hemisphere",
    mapCaption:
      "NOAA OVATION map for the northern hemisphere, with Bosnia-specific interpretation across the rest of the dashboard.",
    viewlineKicker: "NOAA Context Product",
    viewlineHeading: "NOAA Viewline Panel",
    viewlineLink: "NOAA viewline",
    viewlineTonightAlt: "NOAA viewline for tonight",
    viewlineTomorrowAlt: "NOAA viewline for tomorrow night",
    tonight: "Tonight",
    tomorrowNight: "Tomorrow night",
    viewlineCaveat: "For Bosnia this is not a direct local visibility map; use it as event-strength context.",
    outlookKicker: "Aurora Activity Forecast",
    outlookHeading: "BiH outlook",
    fiveDayKicker: "Longer Forecast",
    fiveDayHeading: "Next 5 Days",
    fiveDayNote:
      "The next 5 days use NOAA 45-day `Ap` guidance as a planning proxy, not as an operational night alert.",
    qualityKicker: "Confidence & Freshness",
    qualityHeading: "Feed freshness",
    kpKicker: "KP Index Forecast & Geomagnetic Activity",
    kpHeading: "KP monitor",
    hpiKicker: "Aurora Power Index",
    hpiHeading: "HPI monitor",
    magKicker: "Solar Wind & Magnetic Field",
    magHeading: "MAG / plasma",
    cmeKicker: "Latest Coronal Mass Ejections",
    cmeHeading: "CME monitor",
    cmeRecentHeading: "Recent CME events (7 days)",
    checklistKicker: "Go / No-Go",
    checklistHeading: "Field checklist",
    moonKicker: "Moon Phase",
    moonHeading: "Moon and dark sky",
    modesKicker: "Visual vs Camera",
    modesHeading: "How to Observe",
    visualTab: "Visual",
    cameraTab: "Camera",
    weatherSatKicker: "Satellite Cloud View",
    weatherSatHeading: "Satellite image over BiH / HR / SI",
    weatherSatAlt: "Meteosat infrared cloud image over Slovenia, Croatia, Bosnia and Herzegovina, and the north Adriatic",
    sitesKicker: "BiH Site Optics Layer",
    sitesHeading: "BiH reference sites",
    sitesNote:
      "Each site now includes an optics layer: northern-horizon openness and a light-pollution estimate.",
    explainKicker: "Understanding Solar Activity & Aurora",
    explainHeading: "What These Variables Mean",
    variablesTab: "Variables",
    phenomenologyTab: "Phenomenology",
    alertKicker: "Enable Aurora Alerts",
    alertHeading: "Email subscription",
    emailLabel: "Email",
    emailPlaceholder: "name@domain.com",
    thresholdLabel: "Alert threshold",
    thresholdOptions: [
      { value: "possible", label: "Possible (recommended)" },
      { value: "watch", label: "Watch earlier" },
      { value: "favorable", label: "Only stronger signal" }
    ],
    submit: "Save subscription",
    formNote:
      "The alert sends an email when the Bosnia estimate crosses the selected threshold. SMTP configuration in `.env` is required for real outgoing mail.",
    sourcesKicker: "References",
    sourcesHeading: "Sources and feeds",
    hpiThresholdTitle: "Understanding Aurora Power",
    hpiCards: [
      {
        title: "HPI meaning",
        lines: ["HPI measures power injected into the auroral oval. Higher GW values usually mean stronger auroral activity."]
      },
      {
        title: "Power thresholds",
        lines: ["10-20 GW: weak", "20-40 GW: moderate", "40-80 GW: strong", "80+ GW: very strong"]
      }
    ],
    variableCards: [
      {
        title: "Magnetic Field",
        body:
          "The Bz component of the interplanetary magnetic field is critical for aurora. Negative Bz makes magnetic coupling easier and strengthens the auroral response."
      },
      {
        title: "Solar Wind",
        body:
          "Solar wind is a stream of particles from the Sun. Speed, density, and magnetic-field orientation control how much energy enters the magnetosphere."
      },
      {
        title: "Propagation Delay",
        body:
          "Measurements come from the L1 point about 1.5 million km from Earth, so there is a delay between the measurement and the disturbance reaching near-Earth space."
      },
      {
        title: "KP Index",
        body:
          "KP is a global geomagnetic activity index from 0 to 9. Bosnia often needs KP 6-7 or higher, together with favorable Bz and a clear northern horizon."
      },
      {
        title: "NOAA Geomagnetic Scales",
        body:
          "G1 is roughly KP 5, G2 about KP 6, G3 about KP 7, while G4-G5 are very strong storms that push the auroral oval toward mid-latitudes."
      },
      {
        title: "Aurora Viewing Tips",
        body:
          "Check the forecast often, move to a dark site away from city glow, and target 22:00-02:00 with an open northern horizon."
      }
    ],
    phenomenologyCards: [
      {
        title: "What aurora is",
        body:
          "Aurora is the optical trace of energy deposition in the upper atmosphere. Charged solar-wind particles follow magnetic field lines, excite oxygen and nitrogen, and the atmosphere then emits light."
      },
      {
        title: "Colors and altitudes",
        body:
          "Green is the most common and is mainly linked to oxygen around 100-150 km. Red occurs higher and is weaker, while purple and blue components often come from nitrogen in more dynamic structures."
      },
      {
        title: "Solar Cycle 25",
        body:
          "Stronger solar activity means more flares, more CMEs, and better odds for stronger geomagnetic storms. That is why years near solar maximum are the most interesting for lower latitudes."
      },
      {
        title: "Why Bosnia is difficult",
        body:
          "Bosnia sits far south of the standard auroral oval, so visible aurora usually needs a strong geomagnetic disturbance and a significant southward shift of the oval. That is why an open northern horizon is critical."
      },
      {
        title: "When to watch",
        body:
          "The best window is local night, especially 22:00-02:00. Clear skies, a dimmer Moon, and periods near the equinoxes further improve the chance that the same KP becomes usable for observing."
      },
      {
        title: "What it looks like in practice",
        body:
          "At Bosnia latitudes aurora often first appears as a faint northern arc, diffuse green glow, or low pillars. A camera often reveals more color and contrast than the human eye."
      },
      {
        title: "How to read the dashboard",
        body:
          "The NOAA map shows short-term oval placement, KP gives global storm strength, Bz shows whether the magnetic gate is open, HPI measures power, and cloud plus Moon filters show whether Bosnia has optical conditions at all."
      },
      {
        title: "Bosnia checklist",
        body:
          "Look for negative Bz, solar wind at least around 500 km/s, KP trending toward 6-7, low northern cloud cover, and a site away from urban glow. Only that combination makes a real field trip worthwhile."
      }
    ],
    apodLoading: "Loading APOD feed...",
    apodUnavailable: "NASA APOD is currently unavailable.",
    apodUnavailableFeed: "NASA APOD feed is unavailable.",
    apodSourceFallback: "Source: NASA APOD when network and endpoint respond.",
    apodSource: "Source: NASA Astronomy Picture of the Day.",
    apodVideoThumb: "APOD video thumbnail",
    apodImage: "APOD image",
    apodMissingVideo: "Today's APOD is a video without an available thumbnail.",
    apodMissingImage: "NASA APOD did not return an image for today's entry.",
    geoUnavailable: "Browser geolocation is not available.",
    geoLocating: "Finding the nearest Bosnia reference site...",
    geoNoMatch: "I could not map your location to a Bosnia reference site.",
    geoDenied: "Geolocation was denied or is not available.",
    nearestSitePrefix: "Nearest reference site",
    formSending: "Sending...",
    formInvalidEmail: "Enter a valid email address.",
    formInvalidThreshold: "Unknown alert threshold.",
    formSaved: "Subscription saved. The alert will send an email when the Bosnia estimate crosses the selected threshold.",
    formSavedNoSmtp:
      "Subscription saved. Fill in the SMTP variables in .env to enable real email sending.",
    formError: "Error while saving the subscription.",
    statusLoadError: "I could not load NOAA/NASA/weather data. Check the backend and network.",
    confidence: "Confidence",
    fieldDecision: "Field decision",
    visualMode: "Visual mode",
    cameraMode: "Camera mode",
    moonCurrentView: "Current appearance",
    illuminated: "Illuminated",
    weatherSatNotePrefix: "Wide infrared cloud-top image for Slovenia, Croatia, and Bosnia. Updated with dashboard:",
    mapObservation: "Observation",
    mapForecast: "Forecast",
    bestSite: "Best site",
    bestWindow: "Best window",
    point: "Site",
    status: "Status",
    window: "Window",
    optics: "Optics",
    north: "North",
    light: "Light",
    score: "Score",
    age: "Age",
    feedTime: "Feed time",
    fieldWeather: "Field weather",
    siteMetricLabel: "BiH site",
    langSwitchAria: "Language switch",
    infoTabsAria: "Aurora information tabs",
    modeTabsAria: "Observation mode tabs"
  }
};

function getUi() {
  return UI_TEXT[state.lang] ?? UI_TEXT.bs;
}

function getLocale() {
  return LOCALES[state.lang] ?? LOCALES.bs;
}

function formatPercent(value) {
  return Number.isFinite(Number(value)) ? `${Math.round(Number(value))}%` : "n/a";
}

function formatKm(value) {
  return Number.isFinite(Number(value)) ? `${Number(value).toFixed(1)} km` : "n/a";
}

function formatFactor(value) {
  return Number.isFinite(Number(value)) ? `${Math.round(Number(value) * 100)}%` : "n/a";
}

function classifyScoreLabel(score) {
  const normalized = Math.round(Number(score) || 0);
  const labels =
    state.lang === "en"
      ? {
          favorable: "Favorable",
          possible: "Possible",
          watch: "Monitor",
          unlikely: "Unlikely"
        }
      : {
          favorable: "Povoljno",
          possible: "Moguce",
          watch: "Pratiti",
          unlikely: "Malo vjerovatno"
        };

  if (normalized >= 72) {
    return labels.favorable;
  }
  if (normalized >= 60) {
    return labels.possible;
  }
  if (normalized >= 45) {
    return labels.watch;
  }
  return labels.unlikely;
}

function computeNoaaScaleLabel(kp) {
  if (Number(kp) >= 9) {
    return "G5";
  }
  if (Number(kp) >= 8) {
    return "G4";
  }
  if (Number(kp) >= 7) {
    return "G3";
  }
  if (Number(kp) >= 6) {
    return "G2";
  }
  if (Number(kp) >= 5) {
    return "G1";
  }
  return state.lang === "en" ? "Quiet" : "Mirno";
}

function computeHpiStatusLabel(hpiGw) {
  const value = Number(hpiGw) || 0;
  if (state.lang === "en") {
    if (value >= 80) {
      return "Very strong";
    }
    if (value >= 40) {
      return "Strong";
    }
    if (value >= 20) {
      return "Moderate";
    }
    if (value >= 10) {
      return "Weak";
    }
    return "Quiet";
  }

  if (value >= 80) {
    return "Vrlo jako";
  }
  if (value >= 40) {
    return "Jako";
  }
  if (value >= 20) {
    return "Umjereno";
  }
  if (value >= 10) {
    return "Slabo";
  }
  return "Mirno";
}

function computeBzStatusLabel(bz) {
  const value = Number(bz) || 0;
  if (state.lang === "en") {
    if (value <= -10) {
      return "Very favorable";
    }
    if (value < 0) {
      return "Favorable";
    }
    if (value < 10) {
      return "Neutral";
    }
    return "Unfavorable";
  }

  if (value <= -10) {
    return "Vrlo povoljno";
  }
  if (value < 0) {
    return "Povoljno";
  }
  if (value < 10) {
    return "Neutralno";
  }
  return "Nepovoljno";
}

function computeSpeedStatusLabel(speed) {
  const value = Number(speed) || 0;
  if (state.lang === "en") {
    if (value >= 700) {
      return "Very fast";
    }
    if (value >= 500) {
      return "Favorable";
    }
    return "Moderate";
  }

  if (value >= 700) {
    return "Vrlo brzo";
  }
  if (value >= 500) {
    return "Povoljno";
  }
  return "Umjereno";
}

function phaseToLabel(phase) {
  const value = Number(phase) || 0;
  if (state.lang === "en") {
    if (value < 0.03 || value > 0.97) {
      return "New Moon";
    }
    if (value < 0.22) {
      return "Waxing crescent";
    }
    if (value < 0.28) {
      return "First quarter";
    }
    if (value < 0.47) {
      return "Waxing moon";
    }
    if (value < 0.53) {
      return "Full Moon";
    }
    if (value < 0.72) {
      return "Waning moon";
    }
    if (value < 0.78) {
      return "Last quarter";
    }
    return "Waning crescent";
  }

  if (value < 0.03 || value > 0.97) {
    return "Mladi Mjesec";
  }
  if (value < 0.22) {
    return "Rastuci srp";
  }
  if (value < 0.28) {
    return "Prva cetvrt";
  }
  if (value < 0.47) {
    return "Rastuci Mjesec";
  }
  if (value < 0.53) {
    return "Pun Mjesec";
  }
  if (value < 0.72) {
    return "Opadajuci Mjesec";
  }
  if (value < 0.78) {
    return "Zadnja cetvrt";
  }
  return "Opadajuci srp";
}

function localizeBestWindowLabel(label) {
  if (state.lang === "bs") {
    return label ?? "n/a";
  }

  return String(label ?? "n/a")
    .replace(/\s+u\s+/g, " at ")
    .replace(/\s+navecer/g, " evening");
}

function localizeFeedTimeLabel(label) {
  if (state.lang === "bs") {
    return label ?? "n/a";
  }

  return String(label ?? "n/a").replace(/\s+u\s+/g, " at ");
}

function localizeSiteCopy(site) {
  const copy = SITE_COPY[site?.id];
  if (!copy) {
    return site;
  }

  return {
    ...site,
    note: copy.note[state.lang] ?? site.note,
    northHorizonLabel: copy.northHorizon[state.lang] ?? site.northHorizonLabel,
    lightPollutionLabel: copy.lightPollution[state.lang] ?? site.lightPollutionLabel
  };
}

function describeAuroraSignal(distanceKm) {
  const distance = Number(distanceKm);

  if (!Number.isFinite(distance)) {
    return state.lang === "en"
      ? {
          label: "Signal unclear",
          detail: "OVATION does not show a sufficiently clear active zone north of Bosnia."
        }
      : {
          label: "Signal nejasan",
          detail: "OVATION nema dovoljno jasnu aktivnu zonu sjeverno od BiH."
        };
  }

  if (distance <= 1000) {
    return state.lang === "en"
      ? {
          label: "Near the horizon",
          detail: `The strongest active segment is about ${distance} km from the reference site.`
        }
      : {
          label: "Blizu horizonta",
          detail: `Najjaci aktivni segment je oko ${distance} km od referentne lokacije.`
        };
  }

  if (distance <= 1800) {
    return state.lang === "en"
      ? {
          label: "Far to the north",
          detail: `The strongest active segment is about ${distance} km north; it is still not near the viewline threshold.`
        }
      : {
          label: "Daleko sjeverno",
          detail: `Najjaci aktivni segment je oko ${distance} km sjeverno; jos nije blizu viewline praga.`
        };
  }

  return state.lang === "en"
    ? {
        label: "Very far north",
        detail: `The strongest active segment is about ${distance} km from the site and does not imply visual visibility on its own.`
      }
    : {
        label: "Vrlo daleko sjeverno",
        detail: `Najjaci aktivni segment je oko ${distance} km od lokacije i ne sugerise vizuelnu vidljivost sam po sebi.`
      };
}

function localizeSourceName(source) {
  return SOURCE_COPY[source?.id]?.[state.lang] ?? source?.name ?? "";
}

function localizeFeedLabel(feed) {
  return FEED_COPY[feed?.id]?.[state.lang] ?? feed?.label ?? "";
}

function buildSummaryMessage(level) {
  if (state.lang === "en") {
    if (level === "favorable") {
      return "The signal is strong enough to justify going to a dark site with an open northern horizon.";
    }
    if (level === "possible") {
      return "There is a real chance of a low auroral arc toward northern Bosnia, but Bz and local sky clarity remain decisive.";
    }
    if (level === "watch") {
      return "It is worth monitoring KP, Bz, and the NOAA map through the evening. The alert is near the threshold.";
    }
    return "Current geomagnetic conditions are not strong enough for likely visibility from Bosnia.";
  }

  if (level === "favorable") {
    return "Signal je dovoljno jak da vrijedi izaci na tamnu lokaciju sa otvorenim sjevernim horizontom.";
  }
  if (level === "possible") {
    return "Postoji realna sansa za nizak auroralni luk prema sjeveru BiH, ali Bz i lokalna vedrina ostaju presudni.";
  }
  if (level === "watch") {
    return "Vrijedi pratiti Kp, Bz i NOAA mapu tokom veceri. Alarm je na granici.";
  }
  return "Trenutni geomagnetni uslovi nisu dovoljno jaki za vjerovatnu vidljivost iz BiH.";
}

function renderStaticCardGrid(container, cards, cardClass) {
  if (!container) {
    return;
  }

  container.innerHTML = cards
    .map((card, index) => {
      const wideClass = card.wide ? " guide-card-wide" : "";
      const paragraphs = Array.isArray(card.lines)
        ? card.lines.map((line) => `<p>${escapeHtml(line)}</p>`).join("")
        : `<p>${escapeHtml(card.body)}</p>`;
      return `<article class="${cardClass}${wideClass}" data-copy-index="${index}"><h3>${escapeHtml(card.title)}</h3>${paragraphs}</article>`;
    })
    .join("");
}

function renderAboutAppModal() {
  const ui = getUi();

  aboutAppKicker.textContent = ui.aboutAppKicker;
  aboutAppTitle.textContent = ui.aboutAppTitle;
  aboutAppIntro.textContent = ui.aboutAppIntro;
  aboutAppClose.textContent = ui.aboutAppClose;
  aboutAppClose.setAttribute("aria-label", ui.aboutAppClose);
  aboutAppBody.innerHTML = ui.aboutAppSections
    .map(
      (section) => `
        <section class="app-modal-section">
          <h3>${escapeHtml(section.title)}</h3>
          <ul class="app-modal-list">
            ${section.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
        </section>
      `
    )
    .join("");
}

function applyStaticTranslations() {
  const ui = getUi();
  document.documentElement.lang = state.lang;
  document.title = state.lang === "en" ? "AuroraChaser | BiH Aurora Monitor" : "AuroraChaser | BiH Aurora monitor";

  authorLabel.textContent = ui.author;
  heroLede.textContent = ui.heroLede;
  aboutAppButton.textContent = ui.aboutAppButton;
  heroMetricLabels[0].textContent = ui.heroMetricCurrentKp;
  heroMetricLabels[1].textContent = ui.heroMetricMaxKp;
  heroMetricLabels[2].textContent = ui.heroMetricHpi;
  heroMetricLabels[3].textContent = ui.heroMetricSolarWind;
  renderAboutAppModal();
  heroPrimaryAction.textContent = ui.heroPrimaryAction;
  heroSecondaryAction.textContent = ui.heroSecondaryAction;
  heroBannerImage.alt = ui.heroBannerAlt;
  scoreLabel.textContent = ui.scoreLabel;
  document.querySelector(".lang-switch")?.setAttribute("aria-label", ui.langSwitchAria);
  document.querySelector(".info-tabs")?.setAttribute("aria-label", ui.infoTabsAria);
  document.querySelector(".mode-tabs")?.setAttribute("aria-label", ui.modeTabsAria);

  document.querySelector(".location-panel .panel-kicker").textContent = ui.locationKicker;
  document.querySelector(".location-panel h2").textContent = ui.locationHeading;
  locateButton.textContent = ui.locateMe;
  locationTitle.textContent = ui.locationTitle;

  document.querySelector(".map-panel .panel-kicker").textContent = ui.mapKicker;
  document.querySelector(".map-panel h2").textContent = ui.mapHeading;
  document.querySelector(".map-panel .panel-head a").textContent = ui.mapLink;
  mapImage.alt = ui.mapAlt;

  document.querySelector(".viewline-panel .panel-kicker").textContent = ui.viewlineKicker;
  document.querySelector(".viewline-panel h2").textContent = ui.viewlineHeading;
  viewlineSource.textContent = ui.viewlineLink;
  viewlineTonight.alt = ui.viewlineTonightAlt;
  viewlineTomorrow.alt = ui.viewlineTomorrowAlt;
  viewlineTonightCaption.textContent = ui.tonight;
  viewlineTomorrowCaption.textContent = ui.tomorrowNight;
  viewlineCaveat.textContent = ui.viewlineCaveat;

  document.querySelector(".outlook-panel .panel-kicker").textContent = ui.outlookKicker;
  document.querySelector(".outlook-panel h2").textContent = ui.outlookHeading;
  document.querySelector(".five-day-panel .panel-kicker").textContent = ui.fiveDayKicker;
  document.querySelector(".five-day-panel h2").textContent = ui.fiveDayHeading;
  fiveDayNote.textContent = ui.fiveDayNote;
  document.querySelector(".quality-panel .panel-kicker").textContent = ui.qualityKicker;
  document.querySelector(".quality-panel h2").textContent = ui.qualityHeading;
  document.querySelector(".kp-panel .panel-kicker").textContent = ui.kpKicker;
  document.querySelector(".kp-panel h2").textContent = ui.kpHeading;
  document.querySelector(".hpi-panel .panel-kicker").textContent = ui.hpiKicker;
  document.querySelector(".hpi-panel h2").textContent = ui.hpiHeading;
  document.querySelector(".mag-panel .panel-kicker").textContent = ui.magKicker;
  document.querySelector(".mag-panel h2").textContent = ui.magHeading;
  document.querySelector(".cme-panel .panel-kicker").textContent = ui.cmeKicker;
  document.querySelector(".cme-panel h2").textContent = ui.cmeHeading;
  document.querySelector(".checklist-panel .panel-kicker").textContent = ui.checklistKicker;
  document.querySelector(".checklist-panel h2").textContent = ui.checklistHeading;
  document.querySelector(".moon-panel .panel-kicker").textContent = ui.moonKicker;
  document.querySelector(".moon-panel h2").textContent = ui.moonHeading;
  document.querySelector(".modes-panel .panel-kicker").textContent = ui.modesKicker;
  document.querySelector(".modes-panel h2").textContent = ui.modesHeading;
  modeTabs.find((tab) => tab.dataset.modeTab === "visual").textContent = ui.visualTab;
  modeTabs.find((tab) => tab.dataset.modeTab === "camera").textContent = ui.cameraTab;
  document.querySelector(".weather-sat-panel .panel-kicker").textContent = ui.weatherSatKicker;
  document.querySelector(".weather-sat-panel h2").textContent = ui.weatherSatHeading;
  weatherSatImage.alt = ui.weatherSatAlt;
  document.querySelector(".sites-panel .panel-kicker").textContent = ui.sitesKicker;
  document.querySelector(".sites-panel h2").textContent = ui.sitesHeading;
  sitesNote.textContent = ui.sitesNote;
  document.querySelector(".explain-panel .panel-kicker").textContent = ui.explainKicker;
  document.querySelector(".explain-panel h2").textContent = ui.explainHeading;
  infoTabs.find((tab) => tab.dataset.tab === "variables").textContent = ui.variablesTab;
  infoTabs.find((tab) => tab.dataset.tab === "phenomenology").textContent = ui.phenomenologyTab;
  document.querySelector(".alert-panel .panel-kicker").textContent = ui.alertKicker;
  document.querySelector(".alert-panel h2").textContent = ui.alertHeading;
  document.querySelector(".sources-panel .panel-kicker").textContent = ui.sourcesKicker;
  document.querySelector(".sources-panel h2").textContent = ui.sourcesHeading;
  document.querySelector(".cme-panel .list-card h3").textContent = ui.cmeRecentHeading;

  emailLabel.textContent = ui.emailLabel;
  thresholdLabel.textContent = ui.thresholdLabel;
  subscriptionSubmit.textContent = ui.submit;
  formNote.textContent = ui.formNote;
  emailInput.placeholder = ui.emailPlaceholder;
  thresholdSelect.innerHTML = ui.thresholdOptions
    .map((option) => `<option value="${option.value}">${escapeHtml(option.label)}</option>`)
    .join("");

  document.querySelector("#apod-placeholder").textContent = ui.apodLoading;
  document.querySelector("#apod-credit").textContent = ui.apodSource;
  if (!state.apod) {
    apodDate.textContent = ui.apodLoading;
    apodExplanation.textContent =
      state.lang === "en"
        ? "The daily NASA astronomy image will appear here as additional visual context."
        : "Dnevna NASA astronomska slika ce se prikazati ovdje kao dodatni vizuelni kontekst.";
  }

  const kpCards = document.querySelectorAll(".kp-panel .metric-card .metric-label");
  kpCards[0].textContent = state.lang === "en" ? "Current KP" : "Trenutni KP";
  kpCards[1].textContent = state.lang === "en" ? "Max KP (24h)" : "Maks KP (24h)";
  kpCards[2].textContent = state.lang === "en" ? "Tonight max KP" : "Veceras max KP";
  kpCards[3].textContent = state.lang === "en" ? "Tomorrow max KP" : "Sutra max KP";
  const kpChartTitles = document.querySelectorAll(".kp-panel .chart-card h3");
  kpChartTitles[0].textContent = state.lang === "en" ? "Observed KP 24h" : "Posmatrani KP 24h";
  kpChartTitles[1].textContent = state.lang === "en" ? "Forecast bins" : "Prognozni binovi";

  const hpiCardsLabels = document.querySelectorAll(".hpi-panel .metric-card .metric-label");
  hpiCardsLabels[0].textContent = state.lang === "en" ? "Current HPI North" : "Trenutni sjeverni HPI";
  hpiCardsLabels[1].textContent = state.lang === "en" ? "Current HPI South" : "Trenutni juzni HPI";
  hpiCardsLabels[2].textContent = state.lang === "en" ? "Max HPI 24h" : "Maks HPI 24h";
  const hpiTitles = document.querySelectorAll(".hpi-panel .chart-card h3");
  hpiTitles[0].textContent = state.lang === "en" ? "North HPI 24h" : "Sjeverni HPI 24h";
  hpiTitles[1].textContent = ui.hpiThresholdTitle;

  const magLabels = document.querySelectorAll(".mag-panel .metric-card .metric-label");
  magLabels[0].textContent = "Bz";
  magLabels[1].textContent = state.lang === "en" ? "Solar wind" : "Solarni vjetar";
  magLabels[2].textContent = state.lang === "en" ? "Density" : "Gustina";
  magLabels[3].textContent = state.lang === "en" ? "L1 delay" : "L1 kasnjenje";
  const magTitles = document.querySelectorAll(".mag-panel .chart-card h3");
  magTitles[0].textContent = state.lang === "en" ? "Solar wind speed 24h" : "Brzina solarnog vjetra 24h";
  magTitles[1].textContent = "Bz trend 24h";

  const moonLabels = document.querySelectorAll(".moon-panel .metric-card .metric-label");
  moonLabels[0].textContent = state.lang === "en" ? "Phase" : "Faza";
  moonLabels[1].textContent = state.lang === "en" ? "Illumination" : "Osvijetljenost";
  moonLabels[2].textContent = state.lang === "en" ? "Moon rise" : "Izlazak Mjeseca";
  moonLabels[3].textContent = state.lang === "en" ? "Moon set" : "Zalazak Mjeseca";

  renderStaticCardGrid(
    hpiThresholdGrid,
    ui.hpiCards.map((card) => ({ ...card })),
    "threshold-card"
  );
  renderStaticCardGrid(
    variablesGrid,
    ui.variableCards.map((card) => ({ ...card })),
    "explain-card"
  );
  renderStaticCardGrid(
    phenomenologyGrid,
    ui.phenomenologyCards.map((card, index) => ({ ...card, wide: index === 0 })),
    "guide-card"
  );

  if (!state.status) {
    statusRibbon.textContent = ui.loading;
    locationSummary.textContent = ui.loading;
    scoreSummary.textContent = ui.scoreSummaryLoading;
  }

  langButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.lang === state.lang);
    button.setAttribute("aria-pressed", String(button.dataset.lang === state.lang));
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function formatApodDate(value) {
  if (!value) {
    return "n/a";
  }

  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(getLocale(), {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  }).format(parsed);
}

function formatDisplayTime(value) {
  if (!value) {
    return "n/a";
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleString(getLocale(), {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  return localizeFeedTimeLabel(value);
}

function getObservationTip(mode, details) {
  const score = Number(details?.score ?? 0);

  if (mode === "visual") {
    if (score >= 45) {
      return state.lang === "en"
        ? {
            label: "Practical tip",
            title: "Look low to the north, not at the zenith",
            items: [
              "Watch 10-20 degrees above the northern horizon and use peripheral vision for a weak arc.",
              "Stay off bright screens for at least 20 minutes; dark adaptation often matters more than a small KP increase."
            ]
          }
        : {
            label: "Prakticni savjet",
            title: "Trazi niski sjeverni luk, ne zenit",
            items: [
              "Gledaj 10-20 stepeni iznad sjevernog horizonta i koristi periferni vid za slabiji luk.",
              "Bez bijelog ekrana barem 20 minuta; adaptacija oka cesto vrijedi vise od malog rasta KP."
            ]
          };
    }

    return state.lang === "en"
      ? {
          label: "Practical tip",
          title: "Filter the horizon and clouds first",
          items: [
            "With a low score, wait for a stronger Bz drop and a cleaner northern sky before leaving town.",
            "A weak visual signal loses first against light pollution, low haze, and a blocked northern horizon."
          ]
        }
      : {
          label: "Prakticni savjet",
          title: "Prvo filtriraj horizont i oblake",
          items: [
            "Kod niskog skora cekaj dodatni pad Bz i cist sjever prije izlaska van grada.",
            "Slab vizuelni signal prvo izgubi bitku protiv rasvjete, niske izmaglice i zatvorenog horizonta."
          ]
        };
  }

  if (score >= 45) {
    return state.lang === "en"
      ? {
          label: "Practical tip",
          title: "Lock focus and shoot bursts",
          items: [
            "A wide frame at 14-24 mm, f/1.4-f/2.8, 4-8 s, and ISO 1600-3200 is a good starting point for weaker aurora.",
            "Set manual focus on a star or distant light and shoot bursts because structure changes faster than it seems."
          ]
        }
      : {
          label: "Prakticni savjet",
          title: "Zakljucaj fokus i radi serije",
          items: [
            "Siroki kadar 14-24 mm, f/1.4-f/2.8, 4-8 s i ISO 1600-3200 je dobar start za slabiju auroru.",
            "Fokus postavi manualno na zvijezdu ili daleko svjetlo i snimaj u seriji jer se struktura brzo mijenja."
          ]
        };
  }

  return state.lang === "en"
    ? {
        label: "Practical tip",
        title: "A camera helps, but it cannot beat clouds",
        items: [
          "Start with 24 mm, f/1.8-f/2.8, 6-10 s, ISO 1600-3200, and always shoot RAW.",
          "If the northern sky is blocked by clouds or haze, a longer exposure will not recover the signal."
        ]
      }
    : {
        label: "Prakticni savjet",
        title: "Kamera ima prednost, ali ne spasava oblake",
        items: [
          "Kreni sa 24 mm, f/1.8-f/2.8, 6-10 s, ISO 1600-3200 i obavezno RAW zapisom.",
          "Ako je sjever zatvoren oblacima ili maglom, duza ekspozicija nece vratiti izgubljen signal."
        ]
      };
}

function renderObservationTip(card, mode, details) {
  if (!card) {
    return;
  }

  const tip = getObservationTip(mode, details);
  card.innerHTML = `
    <span class="metric-label">${escapeHtml(tip.label)}</span>
    <strong>${escapeHtml(tip.title)}</strong>
    <div class="mode-tip-body">
      ${tip.items.map((item) => `<p class="site-meta">${escapeHtml(item)}</p>`).join("")}
    </div>
  `;
}

function getObservationChecklist(mode, details) {
  const score = Number(details?.score ?? 0);

  if (mode === "visual") {
    if (score >= 45) {
      return state.lang === "en"
        ? {
            label: "Quick check",
            title: "What to verify before leaving",
            items: [
              { badge: "Horizon", text: "Choose a site with the first 10-15 degrees open toward the north." },
              { badge: "Cloud", text: "Track the satellite opening toward the north and northwest, not only above the city." },
              { badge: "Light", text: "Reduce local light and give your eyes a few minutes away from bright screens." }
            ]
          }
        : {
            label: "Brza provjera",
            title: "Sta provjeriti prije izlaska",
            items: [
              { badge: "Horizont", text: "Trazi lokaciju sa otvorenih prvih 10-15 stepeni prema sjeveru." },
              { badge: "Oblaci", text: "Prati satelitski prozor iznad sjevera i sjeverozapada, ne samo iznad grada." },
              { badge: "Svjetlo", text: "Smanji lokalnu rasvjetu i daj oku nekoliko minuta bez jakog ekrana." }
            ]
          };
    }

    return state.lang === "en"
      ? {
          label: "Quick check",
          title: "What to eliminate first",
          items: [
            { badge: "Bz", text: "Without a stronger negative Bz, do not make a GO decision too early." },
            { badge: "Cloud", text: "If cloud blocks the north, a visual trip is unlikely to pay off." },
            { badge: "Site", text: "Do not drive far if the site lacks an open north and lower light pollution." }
          ]
        }
      : {
          label: "Brza provjera",
          title: "Sta prvo eliminisati",
          items: [
            { badge: "Bz", text: "Bez jacog negativnog Bz nemoj prerano donositi GO odluku." },
            { badge: "Oblak", text: "Ako oblak zatvara sjever, vizuelni izlazak tesko se isplati." },
            { badge: "Site", text: "Ne idi daleko ako lokacija nema otvoren sjever i nize svjetlosno zagadjenje." }
          ]
        };
  }

  if (score >= 45) {
    return state.lang === "en"
      ? {
          label: "Quick setup",
          title: "Field setup for camera",
          items: [
            { badge: "Lens", text: "Start with 14-24 mm and the widest aperture your lens handles well." },
            { badge: "Exp.", text: "Try 4-8 s and shorten exposure if faster curtains appear." },
            { badge: "Focus", text: "Lock manual focus on a star before burst shooting." }
          ]
        }
      : {
          label: "Brza postavka",
          title: "Terenske postavke za kameru",
          items: [
            { badge: "Objektiv", text: "Kreni sa 14-24 mm i najotvorenijom blendom koju objektiv drzi." },
            { badge: "Eksp.", text: "Probaj 4-8 s i skracuj ekspoziciju ako se pojave brze zavjese." },
            { badge: "Fokus", text: "Manualni fokus zakljucaj na zvijezdi prije serijskog okidanja." }
          ]
        };
  }

  return state.lang === "en"
    ? {
        label: "Quick setup",
        title: "Minimum setup for a usable frame",
        items: [
          { badge: "RAW", text: "Shoot RAW so you can recover a weak signal later without color breakup." },
          { badge: "ISO", text: "Start at 1600-3200 and adjust to the sky background and moonlight." },
          { badge: "Tripod", text: "Without a tripod and stable triggering, a weak signal will blur away quickly." }
        ]
      }
    : {
        label: "Brza postavka",
        title: "Minimum da kadar uspije",
        items: [
          { badge: "RAW", text: "Snimaj u RAW formatu da kasnije izvuces slab signal bez raspada boje." },
          { badge: "ISO", text: "Start 1600-3200 pa koriguj prema pozadini neba i mjesecini." },
          { badge: "Stativ", text: "Bez stativa i mirnog okidanja slab signal ce lako pasti u zamucljenje." }
        ]
      };
}

function renderObservationChecklist(card, mode, details) {
  if (!card) {
    return;
  }

  const checklist = getObservationChecklist(mode, details);
  card.innerHTML = `
    <span class="metric-label">${escapeHtml(checklist.label)}</span>
    <strong>${escapeHtml(checklist.title)}</strong>
    <div class="mode-check-body">
      ${checklist.items
        .map(
          (item) => `
            <div class="mode-check-row">
              <span class="forecast-badge">${escapeHtml(item.badge)}</span>
              <p class="site-meta">${escapeHtml(item.text)}</p>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderApodUnavailable(message = getUi().apodUnavailable) {
  if (!apodTitle) {
    return;
  }

  apodTitle.textContent = "Astronomy Picture of the Day";
  apodDate.textContent = getUi().apodUnavailableFeed;
  apodExplanation.textContent = message;
  apodCredit.textContent = getUi().apodSourceFallback;
  apodLink.href = "https://apod.nasa.gov/apod/astropix.html";
  apodMedia?.classList.remove("has-image");
  if (apodImage) {
    apodImage.removeAttribute("src");
  }
  if (apodPlaceholder) {
    apodPlaceholder.textContent = message;
  }
}

function renderApod(apod) {
  if (!apodTitle) {
    return;
  }

  const title = String(apod?.title || "Astronomy Picture of the Day");
  const explanation = String(apod?.explanation || getUi().apodUnavailable);
  const imageUrl = String(apod?.imageUrl || "");
  const mediaType = String(apod?.mediaType || "image");
  const sourceUrl = String(apod?.sourceUrl || "https://apod.nasa.gov/apod/astropix.html");
  const credit = String(apod?.copyright || "").trim();

  state.apod = apod;
  apodTitle.textContent = title;
  apodDate.textContent = `${formatApodDate(apod?.date)} | ${mediaType === "video" ? getUi().apodVideoThumb : getUi().apodImage}`;
  apodExplanation.textContent = explanation;
  apodCredit.textContent = credit ? `${state.lang === "en" ? "Copyright" : "Autorska prava"}: ${credit}` : getUi().apodSource;
  apodLink.href = sourceUrl;

  if (imageUrl) {
    apodImage.src = imageUrl;
    apodImage.alt = `${title} | NASA APOD`;
    apodMedia?.classList.add("has-image");
    if (apodPlaceholder) {
      apodPlaceholder.textContent = "";
    }
    return;
  }

  apodMedia?.classList.remove("has-image");
  apodImage.removeAttribute("src");
  apodImage.alt = "";
  if (apodPlaceholder) {
    apodPlaceholder.textContent =
      mediaType === "video" ? getUi().apodMissingVideo : getUi().apodMissingImage;
  }
}

function renderMoonVisual(moon) {
  if (!moonVisual) {
    return;
  }

  const phase = Number(moon?.phase ?? 0);
  const normalizedPhase = Number.isFinite(phase) ? Math.min(1, Math.max(0, phase)) : 0;
  const radius = 112;
  const center = 136;
  const terminatorRadius = Math.max(0.0001, Math.abs(Math.cos(normalizedPhase * Math.PI * 2)) * radius);
  const waxing = normalizedPhase <= 0.5;
  const gibbous = waxing ? normalizedPhase >= 0.25 : normalizedPhase <= 0.75;
  const outerSweep = waxing ? 1 : 0;
  const innerSweep = waxing ? 0 : 1;
  const innerLargeArc = gibbous ? 1 : 0;
  const craterMarkup = [
    { x: center - 42, y: center - 28, r: 14, opacity: 0.14 },
    { x: center + 18, y: center - 10, r: 11, opacity: 0.12 },
    { x: center - 8, y: center + 36, r: 16, opacity: 0.12 },
    { x: center + 42, y: center + 44, r: 10, opacity: 0.16 },
    { x: center - 50, y: center + 46, r: 9, opacity: 0.13 }
  ]
    .map(
      (crater) => `
        <circle cx="${crater.x}" cy="${crater.y}" r="${crater.r}" fill="rgba(83, 102, 124, ${crater.opacity})"></circle>
        <circle cx="${crater.x - crater.r * 0.18}" cy="${crater.y - crater.r * 0.18}" r="${Math.max(
          2,
          crater.r * 0.42
        )}" fill="rgba(240, 244, 255, 0.07)"></circle>
      `
    )
    .join("");

  const illuminatedPath = `
    M ${center} ${center - radius}
    A ${radius} ${radius} 0 0 ${outerSweep} ${center} ${center + radius}
    A ${terminatorRadius} ${radius} 0 ${innerLargeArc} ${innerSweep} ${center} ${center - radius}
    Z
  `;

  moonVisual.innerHTML = `
    <div class="moon-visual-frame">
      <svg viewBox="0 0 272 272" role="img" aria-label="${state.lang === "en" ? "Current Moon appearance" : "Trenutni izgled Mjeseca"}">
        <defs>
          <radialGradient id="moonHalo" cx="50%" cy="50%" r="62%">
            <stop offset="0%" stop-color="rgba(124, 231, 255, 0.22)" />
            <stop offset="100%" stop-color="rgba(124, 231, 255, 0)" />
          </radialGradient>
          <radialGradient id="moonDiscGlow" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#fbfdff" />
            <stop offset="48%" stop-color="#dce5f3" />
            <stop offset="100%" stop-color="#9baac1" />
          </radialGradient>
          <radialGradient id="moonShadow" cx="50%" cy="50%" r="80%">
            <stop offset="0%" stop-color="#182435" />
            <stop offset="100%" stop-color="#07111b" />
          </radialGradient>
        </defs>
        <circle cx="${center}" cy="${center}" r="${radius + 28}" fill="url(#moonHalo)"></circle>
        <circle cx="${center}" cy="${center}" r="${radius}" fill="url(#moonShadow)"></circle>
        <path d="${illuminatedPath.replace(/\s+/g, " ").trim()}" fill="url(#moonDiscGlow)"></path>
        <g>${craterMarkup}</g>
        <circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="2.5"></circle>
      </svg>
      <div class="moon-visual-meta">
        <span class="metric-label">${escapeHtml(getUi().moonCurrentView)}</span>
        <strong>${escapeHtml(phaseToLabel(moon.phase))}</strong>
        <p class="site-meta">${escapeHtml(getUi().illuminated)}: ${escapeHtml(moon.illuminationPct)}%</p>
      </div>
    </div>
  `;
}

function haversineKm(aLat, aLon, bLat, bLon) {
  const toRad = (value) => (value * Math.PI) / 180;
  const earth = 6371;
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * earth * Math.asin(Math.sqrt(h));
}

function pickNearestSite(lat, lon) {
  if (!state.status?.sites?.length) {
    return null;
  }

  return [...state.status.sites]
    .map((site) => ({
      ...site,
      distanceToUserKm: haversineKm(lat, lon, site.lat, site.lon)
    }))
    .sort((a, b) => a.distanceToUserKm - b.distanceToUserKm)[0];
}

function renderBarChart(container, items, getValue, getLabel, { negative = false, maxItems = 14 } = {}) {
  if (!container) {
    return;
  }

  const subset = items.slice(-maxItems);
  const values = subset.map((item) => Number(getValue(item))).filter((value) => Number.isFinite(value));

  if (!values.length) {
    container.innerHTML = `<p class="panel-note">${state.lang === "en" ? "No data." : "Nema podataka."}</p>`;
    return;
  }

  const max = negative
    ? Math.max(...values.map((value) => Math.abs(value)), 1)
    : Math.max(...values, 1);

  container.innerHTML = subset
    .map((item) => {
      const rawValue = Number(getValue(item));
      const safeValue = Number.isFinite(rawValue) ? rawValue : 0;
      const ratio = negative ? Math.abs(safeValue) / max : safeValue / max;
      const height = `${Math.max(8, Math.round(ratio * 96))}px`;
      const barClass = negative && safeValue < 0 ? "bar negative" : "bar";

      return `
        <div class="spark-bar">
          <span class="spark-value">${escapeHtml(safeValue.toFixed(1))}</span>
          <div class="${barClass}" style="height:${height}"></div>
          <span class="spark-label">${escapeHtml(getLabel(item))}</span>
        </div>
      `;
    })
    .join("");
}

function renderAreaChart(container, items, getValue, getLabel, { maxItems = 18 } = {}) {
  if (!container) {
    return;
  }

  const subset = items.slice(-maxItems);
  const values = subset.map((item) => Number(getValue(item))).filter((value) => Number.isFinite(value));

  if (!values.length) {
    container.innerHTML = `<p class="panel-note">${state.lang === "en" ? "No data." : "Nema podataka."}</p>`;
    return;
  }

  const max = Math.max(...values, 1);
  const width = 720;
  const height = 210;
  const leftPad = 14;
  const rightPad = 14;
  const topPad = 14;
  const bottomPad = 36;
  const innerWidth = width - leftPad - rightPad;
  const innerHeight = height - topPad - bottomPad;

  const points = subset.map((item, index) => {
    const value = Number(getValue(item));
    const x = leftPad + (subset.length === 1 ? innerWidth / 2 : (index / (subset.length - 1)) * innerWidth);
    const y = topPad + innerHeight - (Math.max(0, value) / max) * innerHeight;
    return {
      x,
      y,
      value,
      label: getLabel(item)
    };
  });

  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - bottomPad} L ${points[0].x} ${height - bottomPad} Z`;
  const ticks = [0.25, 0.5, 0.75, 1].map((ratio) => ({
    y: topPad + innerHeight - innerHeight * ratio,
    value: (max * ratio).toFixed(0)
  }));

  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${state.lang === "en" ? "HPI area chart" : "HPI povrsinski grafikon"}">
      <defs>
        <linearGradient id="hpiAreaFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="rgba(145,255,77,0.38)" />
          <stop offset="100%" stop-color="rgba(255,193,7,0.12)" />
        </linearGradient>
      </defs>
      ${ticks
        .map(
          (tick) => `
            <line class="chart-gridline" x1="${leftPad}" y1="${tick.y}" x2="${width - rightPad}" y2="${tick.y}"></line>
            <text class="chart-axis-label" x="${leftPad}" y="${tick.y - 6}">${escapeHtml(tick.value)} GW</text>
          `
        )
        .join("")}
      <path class="chart-area-fill" d="${areaPath}"></path>
      <path class="chart-line" d="${linePath}"></path>
      ${points
        .map(
          (point) => `
            <circle class="chart-point" cx="${point.x}" cy="${point.y}" r="4"></circle>
          `
        )
        .join("")}
      ${points
        .filter((_, index) => index === 0 || index === points.length - 1 || index % 4 === 0)
        .map(
          (point) => `
            <text class="chart-bottom-label" x="${point.x}" y="${height - 10}" text-anchor="middle">${escapeHtml(point.label)}</text>
          `
        )
        .join("")}
      <text class="chart-now-label" x="${points[points.length - 1].x - 2}" y="${topPad + 8}" text-anchor="end">${state.lang === "en" ? "Now" : "Sada"}</text>
    </svg>
  `;
}

function renderLocation(site, prefix = getUi().locationTitle) {
  const ui = getUi();
  const localizedSite = localizeSiteCopy(site);
  const visibilityLabel = classifyScoreLabel(site.score);

  locationSummary.textContent =
    `${prefix}: ${localizedSite.name} | ${visibilityLabel}. ${ui.bestWindow}: ${localizeBestWindowLabel(site.bestWindowLabel)}.`;

  locationGrid.innerHTML = `
    <article class="location-metric">
      <span>${state.lang === "en" ? "Site" : "Lokacija"}</span>
      <strong>${escapeHtml(localizedSite.name)}</strong>
    </article>
    <article class="location-metric">
      <span>${state.lang === "en" ? "Cloud" : "Oblaci"}</span>
      <strong>${formatPercent(localizedSite.cloudCover)}</strong>
    </article>
    <article class="location-metric">
      <span>${state.lang === "en" ? "Visibility" : "Vidljivost"}</span>
      <strong>${formatKm(localizedSite.visibilityKm)}</strong>
    </article>
    <article class="location-metric">
      <span>${state.lang === "en" ? "Precip" : "Padavine"}</span>
      <strong>${formatPercent(localizedSite.precipProbability)}</strong>
    </article>
    <article class="location-metric">
      <span>${state.lang === "en" ? "Site optics" : "Optika lokacije"}</span>
      <strong>${formatFactor(localizedSite.opticsFactor)}</strong>
    </article>
    <article class="location-metric">
      <span>${ui.north}</span>
      <strong>${escapeHtml(localizedSite.northHorizonLabel)}</strong>
    </article>
  `;
}

function renderOutlook(card, outlook, title) {
  const ui = getUi();
  card.innerHTML = `
    <div class="title-row">
      <h3>${escapeHtml(title)}</h3>
      <span class="outlook-score">${escapeHtml(classifyScoreLabel(outlook.score))} | ${outlook.score}/100</span>
    </div>
    <p class="site-meta">${ui.bestSite}: ${escapeHtml(outlook.bestSiteName)}</p>
    <p class="site-meta">${ui.bestWindow}: ${escapeHtml(localizeBestWindowLabel(outlook.bestWindowLabel))}</p>
    <p class="site-meta">${state.lang === "en" ? "Forecast KP max/avg" : "Prognozni KP max/avg"}: ${escapeHtml(outlook.maxForecastKp)} / ${escapeHtml(outlook.avgForecastKp)}</p>
    <p class="site-meta">${state.lang === "en" ? "Cloud / precip" : "Oblaci / padavine"}: ${formatPercent(outlook.cloudCover)} / ${formatPercent(outlook.precipProbability)}</p>
  `;
}

function renderQuickSite(card, site, title) {
  if (!card || !site) {
    return;
  }

  const ui = getUi();
  const localizedSite = localizeSiteCopy(site);
  const auroraSignal = describeAuroraSignal(site.auroraDistanceKm);

  card.innerHTML = `
    <div class="title-row">
      <h3>${escapeHtml(title)}</h3>
      <span class="outlook-score">${escapeHtml(classifyScoreLabel(site.score))} | ${site.score}/100</span>
    </div>
    <p class="site-meta">${ui.point}: ${escapeHtml(localizedSite.name)}</p>
    <p class="site-meta">${ui.bestWindow}: ${escapeHtml(localizeBestWindowLabel(site.bestWindowLabel))}</p>
    <p class="site-meta">${state.lang === "en" ? "Cloud / precip" : "Oblaci / padavine"}: ${formatPercent(site.cloudCover)} / ${formatPercent(site.precipProbability)}</p>
    <p class="site-meta">OVATION proxy: ${escapeHtml(auroraSignal.label)}</p>
    <p class="site-meta">${ui.optics}: ${escapeHtml(localizedSite.northHorizonLabel)} | ${escapeHtml(localizedSite.lightPollutionLabel)}</p>
  `;
}

function pickQuickSites(sites) {
  const sarajevo = (sites ?? []).find((site) => site.id === "sarajevo") ?? null;
  const bestNorth =
    [...(sites ?? [])]
      .filter((site) => ["bihac", "banja-luka", "brcko", "tuzla"].includes(site.id))
      .sort((a, b) => b.score - a.score)[0] ?? null;

  return { sarajevo, bestNorth };
}

function renderFiveDayOutlook(days) {
  if (!fiveDayGrid) {
    return;
  }

  const toneLabels =
    state.lang === "en"
      ? {
          elevated: "Elevated signal",
          moon: "Moon interference",
          quiet: "Quiet"
        }
      : {
          elevated: "Povisen signal",
          moon: "Mjesec smeta",
          quiet: "Tiho"
        };

  const guidanceDisclaimer =
    state.lang === "en"
      ? "Planning signal from NOAA 45-day Ap guidance; not an operational night forecast."
      : "Planerski signal iz NOAA 45-day Ap guidance; nije operativna nocna prognoza.";

  const noteForDay = (day) => {
    if (state.lang === "en") {
      if (day.guidanceKpEquivalent >= 6) {
        return "Elevated geomagnetic signal in guidance; Bosnia still needs evening confirmation through KP/Bz/OVATION.";
      }
      if (day.guidanceKpEquivalent >= 5) {
        return "Borderline guidance signal; Bosnia still depends on a clear northern horizon and clear sky.";
      }
      return "Quiet geomagnetic background; treat this as a planning indicator, not an alert.";
    }

    if (day.guidanceKpEquivalent >= 6) {
      return "Povisen geomagnetni signal u guidance proizvodu; za BiH i dalje treba potvrda kroz vecernji Kp/Bz/OVATION.";
    }
    if (day.guidanceKpEquivalent >= 5) {
      return "Granican guidance signal; BiH i dalje zavisi od sjevernog horizonta i vedrine.";
    }
    return "Tiha geomagnetna pozadina; tretiraj ovo kao planerski indikator, ne kao alarm.";
  };

  fiveDayGrid.innerHTML = (days ?? [])
    .map(
      (day) => `
        <article class="forecast-day-card tone-${escapeHtml(day.tone)}">
          <div class="forecast-topline">
            <div>
              <p class="forecast-date">${escapeHtml(
                new Intl.DateTimeFormat(getLocale(), { month: "short", day: "2-digit" }).format(new Date(day.dateIso))
              )}</p>
              <strong>${escapeHtml(
                new Intl.DateTimeFormat(getLocale(), { weekday: "short" }).format(new Date(day.dateIso))
              )}</strong>
            </div>
            <span class="forecast-badge">${escapeHtml(toneLabels[day.tone] ?? day.toneLabel)}</span>
          </div>
          <div class="forecast-metric">
            <span>Ap->Kp proxy</span>
            <strong>${escapeHtml(day.guidanceKpEquivalentLabel)}</strong>
          </div>
          <div class="forecast-metric">
            <span>Ap</span>
            <strong>${escapeHtml(day.apLabel)}</strong>
          </div>
          <div class="forecast-metric">
            <span>${state.lang === "en" ? "Moon" : "Mjesec"}</span>
            <strong>${escapeHtml(day.moonInterferencePct)}%</strong>
          </div>
          <p class="site-meta">${getUi().siteMetricLabel}: ${escapeHtml(day.bestSiteName)}</p>
          <p class="site-meta">${getUi().bestWindow}: ${escapeHtml(localizeBestWindowLabel(day.bestWindowLabel))}</p>
          <p class="site-meta">${state.lang === "en" ? "Cloud" : "Oblaci"}: ${formatPercent(day.cloudCover)} | ${getUi().score}: ${day.score}/100</p>
          <p class="site-meta">${escapeHtml(guidanceDisclaimer)}</p>
          <p class="forecast-note">${escapeHtml(noteForDay(day))}</p>
        </article>
      `
    )
    .join("");
}

function renderCme(cme) {
  const impactLabel =
    cme?.latest?.impactSignal === "explicit"
      ? state.lang === "en"
        ? "Explicit feed signal"
        : "Eksplicitan signal u feedu"
      : cme?.latest?.impactSignal === "possible"
        ? state.lang === "en"
          ? "Possible Earth/glancing signal"
          : "Moguc Earth/glancing signal"
        : state.lang === "en"
          ? "Not confirmed"
          : "Nije potvrdjeno";

  if (!cme?.latest) {
    cmeLatest.innerHTML =
      state.lang === "en"
        ? "<h3>Latest CME</h3><p>No stronger current CME signal is present in the DONKI feed.</p><p class=\"site-meta\">DONKI remains a supplementary experimental indicator.</p>"
        : "<h3>Najnoviji CME</h3><p>Nema jaceg aktuelnog CME signala u DONKI feedu.</p><p class=\"site-meta\">DONKI ostaje dopunski, eksperimentalni indikator.</p>";
  } else {
    cmeLatest.innerHTML = `
      <h3>${state.lang === "en" ? "Latest CME" : "Najnoviji CME"}</h3>
      <p>${state.lang === "en" ? "Time" : "Vrijeme"}: ${escapeHtml(localizeFeedTimeLabel(cme.latest.timeLabel))}</p>
      <p>${state.lang === "en" ? "Speed" : "Brzina"}: ${escapeHtml(cme.latest.speedLabel)}</p>
      <p>WSA-Enlil Kp proxy: ${escapeHtml(cme.latest.predictedKpLabel)}</p>
      <p>${state.lang === "en" ? "Impact signal" : "Signal udara"}: ${escapeHtml(impactLabel)}</p>
      <p>${state.lang === "en" ? "Direction" : "Pravac"}: lat ${escapeHtml(cme.latest.latitude ?? "n/a")}, lon ${escapeHtml(cme.latest.longitude ?? "n/a")}, ${state.lang === "en" ? "half-angle" : "polu-ugao"} ${escapeHtml(cme.latest.halfAngle ?? "n/a")} ${state.lang === "en" ? "deg" : "stepeni"}</p>
      <p>${escapeHtml(cme.latest.note || (state.lang === "en" ? "DONKI CMEAnalysis serves only as a supplementary indicator for an incoming geomagnetic impulse." : "DONKI CMEAnalysis sluzi kao dopunski indikator za dolazeci geomagnetni impuls."))}</p>
      <p class="site-meta">${state.lang === "en" ? "NASA DONKI is an experimental research feed, not an operational NOAA forecast." : "NASA DONKI je eksperimentalni istrazivacki feed, ne operativna NOAA prognoza."}</p>
    `;
  }

  cmeStats.innerHTML = `
    <h3>${state.lang === "en" ? "CME Statistics" : "CME statistika"}</h3>
    <p>${state.lang === "en" ? "Count in 7 days" : "Broj u 7 dana"}: ${escapeHtml(cme?.stats?.count7d ?? 0)}</p>
    <p>${state.lang === "en" ? "Possible Earth/glancing signals" : "Mogucih Earth/glancing signala"}: ${escapeHtml(cme?.stats?.earthImpactCount ?? 0)}</p>
    <p>${state.lang === "en" ? "Explicit Earth signals" : "Eksplicitnih Earth signala"}: ${escapeHtml(cme?.stats?.explicitImpactCount ?? 0)}</p>
    <p>${state.lang === "en" ? "Max speed" : "Maks brzina"}: ${escapeHtml(cme?.stats?.maxSpeedLabel ?? "n/a")}</p>
    <p>${state.lang === "en" ? "Max Kp proxy" : "Maks Kp proxy"}: ${escapeHtml(cme?.stats?.maxPredictedKpLabel ?? "n/a")}</p>
  `;

  if (!cme?.recent?.length) {
    cmeRecent.innerHTML =
      state.lang === "en" ? "<p class=\"panel-note\">No recent CME entries.</p>" : "<p class=\"panel-note\">Nema recentnih CME stavki.</p>";
    return;
  }

  cmeRecent.innerHTML = `
    <div class="cme-list">
      ${cme.recent
        .map(
          (entry) => `
            <div class="cme-item">
              <div class="cme-row">
                <strong>${escapeHtml(localizeFeedTimeLabel(entry.timeLabel))}</strong>
                <span>${escapeHtml(entry.speedLabel)}</span>
              </div>
              <p class="site-meta">Kp proxy: ${escapeHtml(entry.predictedKp)} | ${state.lang === "en" ? "Impact signal" : "Signal udara"}: ${escapeHtml(
                entry.impactSignal === "explicit"
                  ? state.lang === "en"
                    ? "explicit"
                    : "eksplicitan"
                  : entry.impactSignal === "possible"
                    ? state.lang === "en"
                      ? "possible"
                      : "moguc"
                    : state.lang === "en"
                      ? "weak"
                      : "slab"
              )}</p>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderSites(sites) {
  sitesList.innerHTML = sites
    .map(
      (site) => {
        const localizedSite = localizeSiteCopy(site);
        const auroraSignal = describeAuroraSignal(site.auroraDistanceKm);
        return `
        <article class="site-card">
          <div class="site-topline">
            <h3>${escapeHtml(localizedSite.name)}</h3>
            <span class="site-score">${site.score}/100</span>
          </div>
          <p class="site-meta">${escapeHtml(localizedSite.note)}</p>
          <p class="site-meta">${getUi().status}: ${escapeHtml(classifyScoreLabel(site.score))}</p>
          <p class="site-meta">${getUi().window}: ${escapeHtml(localizeBestWindowLabel(site.bestWindowLabel))}</p>
          <p class="site-meta">OVATION proxy: ${escapeHtml(auroraSignal.label)} | signal ${formatPercent(site.auroraProbabilityNorth)}</p>
          <p class="site-meta">${escapeHtml(auroraSignal.detail)}</p>
          <p class="site-meta">${state.lang === "en" ? "Cloud / precip / visibility" : "Oblaci / padavine / vidljivost"}: ${formatPercent(site.cloudCover)} / ${formatPercent(site.precipProbability)} / ${formatKm(site.visibilityKm)}</p>
          <p class="site-meta">${getUi().north}: ${escapeHtml(localizedSite.northHorizonLabel)} | ${getUi().light}: ${escapeHtml(localizedSite.lightPollutionLabel)} | ${getUi().optics}: ${formatFactor(site.opticsFactor)}</p>
        </article>
      `;
      }
    )
    .join("");
}

function renderDataQuality(dataQuality) {
  const overallLabel =
    state.lang === "en"
      ? {
          high: "High confidence",
          medium: "Medium confidence",
          low: "Low confidence"
        }[dataQuality.overall.level] ?? dataQuality.overall.label
      : {
          high: "Visoko povjerenje",
          medium: "Srednje povjerenje",
          low: "Nisko povjerenje"
        }[dataQuality.overall.level] ?? dataQuality.overall.label;

  const l1ProxyLabel =
    dataQuality.l1Proxy.level === "fresh"
      ? state.lang === "en"
        ? "L1 proxy feed fresh"
        : "L1 proxy feed svjez"
      : state.lang === "en"
        ? "L1 proxy feed aging"
        : "L1 proxy feed stariji";

  qualitySummary.innerHTML = `
    <article class="quality-card">
      <span class="metric-label">${escapeHtml(getUi().confidence)}</span>
      <strong>${escapeHtml(overallLabel)}</strong>
      <p class="site-meta">${getUi().score}: ${escapeHtml(dataQuality.overall.qualityScore)}/100</p>
      <p class="site-meta">${escapeHtml(l1ProxyLabel)}</p>
      <p class="site-meta">${escapeHtml(
        state.lang === "en"
          ? "Proxy freshness indicator from plasma+mag feed ages; NOAA does not expose an explicit fallback flag in this feed."
          : "Proxy indikator iz plasma+mag starosti; NOAA ne daje eksplicitnu fallback zastavicu u ovom feedu."
      )}</p>
    </article>
  `;

  qualityList.innerHTML = dataQuality.feeds
    .map(
      (feed) => `
        <article class="quality-card quality-feed-${escapeHtml(feed.freshness)}">
          <span class="metric-label">${escapeHtml(localizeFeedLabel(feed))}</span>
          <strong>${escapeHtml(
            state.lang === "en"
              ? { fresh: "Fresh", aging: "Aging", stale: "Stale", unknown: "Unknown" }[feed.freshness] ?? feed.freshnessLabel
              : { fresh: "Svjeze", aging: "Malo starije", stale: "Zastarjelo", unknown: "Nepoznato" }[feed.freshness] ?? feed.freshnessLabel
          )}</strong>
          <p class="site-meta">${getUi().age}: ${escapeHtml(feed.ageLabel)}</p>
          <p class="site-meta">${getUi().feedTime}: ${escapeHtml(localizeFeedTimeLabel(feed.timeLabel))}</p>
        </article>
      `
    )
    .join("");
}

function renderObservationModes(observationModes) {
  const bestSiteName = state.status?.sites?.[0]?.name ?? "BiH";
  const visualNote =
    observationModes.visual.score >= 60
      ? state.lang === "en"
        ? `A visual check at ${bestSiteName} makes sense if the northern horizon is open and the sky is clear.`
        : `Vizuelno ima smisla provjeriti ${bestSiteName} ako je sjever otvoren i nebo cisto.`
      : observationModes.visual.score >= 45
        ? state.lang === "en"
          ? "Visual detection is borderline; a faint low arc or short-lived feature to the north is more likely."
          : "Vizuelno je granicno; vjerovatniji je slab niski luk ili kratka pojava prema sjeveru."
        : state.lang === "en"
          ? "Visual detection is difficult; the naked eye is unlikely to see a convincing signal."
          : "Vizuelna detekcija je teska; golim okom vjerovatno nece biti uvjerljiv signal.";

  const cameraNote =
    observationModes.camera.score >= 60
      ? state.lang === "en"
        ? "A camera has a real chance to register color and a weaker arc before the eye does."
        : "Kamera ima realnu sansu da registruje boju i slabiji luk prije nego oko."
      : observationModes.camera.score >= 45
        ? state.lang === "en"
          ? "A camera is more useful than the eye here; try a longer exposure and a wide frame toward the north."
          : "Kamera je korisnija od oka; probaj duzu ekspoziciju i sirok kadar prema sjeveru."
        : state.lang === "en"
          ? "Even for a camera the signal is still weak without additional worsening of geomagnetic conditions."
          : "Cak je i za kameru signal trenutno slab bez dodatnog pogorsanja geomagnetnih uslova.";

  visualModeCard.innerHTML = `
    <span class="metric-label">${escapeHtml(getUi().visualMode)}</span>
    <strong>${escapeHtml(classifyScoreLabel(observationModes.visual.score))} | ${escapeHtml(observationModes.visual.score)}/100</strong>
    <p class="site-meta">${escapeHtml(visualNote)}</p>
  `;

  cameraModeCard.innerHTML = `
    <span class="metric-label">${escapeHtml(getUi().cameraMode)}</span>
    <strong>${escapeHtml(classifyScoreLabel(observationModes.camera.score))} | ${escapeHtml(observationModes.camera.score)}/100</strong>
    <p class="site-meta">${escapeHtml(cameraNote)}</p>
  `;

  renderObservationTip(visualModeTipCard, "visual", observationModes.visual);
  renderObservationTip(cameraModeTipCard, "camera", observationModes.camera);
  renderObservationChecklist(visualModeCheckCard, "visual", observationModes.visual);
  renderObservationChecklist(cameraModeCheckCard, "camera", observationModes.camera);
}

function renderChecklist(status) {
  const checklist = status.checklist;
  const bestSite = localizeSiteCopy(status.sites[0]);
  const moonLabel = phaseToLabel(status.moon.phase);
  const items = [
    {
      title: state.lang === "en" ? "Geomagnetic signal" : "Geomagnetni signal",
      value: state.lang === "en" ? `KP now ${status.current.kpLabel} | tonight max ${status.outlooks.tonight.maxForecastKp}` : `Kp sada ${status.current.kpLabel} | veceras max ${status.outlooks.tonight.maxForecastKp}`,
      note:
        state.lang === "en"
          ? "Bosnia typically needs at least KP around 6 with additional support from Bz and clear skies."
          : "Za BiH je tipicno potreban bar Kp oko 6 uz dodatnu podrsku Bz i vedrine.",
      level: checklist.items[0]?.level ?? "watch",
      label: checklist.items[0]?.label ?? "WATCH"
    },
    {
      title: state.lang === "en" ? "Bz direction" : "Bz smjer",
      value: status.current.bzLabel,
      note:
        state.lang === "en"
          ? "Negative Bz opens more favorable coupling with Earth's field."
          : "Negativan Bz otvara povoljniji coupling sa Zemljinim poljem.",
      level: checklist.items[1]?.level ?? "no",
      label: checklist.items[1]?.label ?? "NO-GO"
    },
    {
      title: state.lang === "en" ? "Solar wind" : "Solarni vjetar",
      value: status.current.solarWindSpeedLabel,
      note:
        state.lang === "en"
          ? "Speed alone is not enough, but below roughly 430-500 km/s Bosnia rarely gets a strong signal."
          : "Brzina sama nije dovoljna, ali ispod ~430-500 km/s BiH tesko dobija jak signal.",
      level: checklist.items[2]?.level ?? "watch",
      label: checklist.items[2]?.label ?? "WATCH"
    },
    {
      title: getUi().fieldWeather,
      value:
        state.lang === "en"
          ? `${formatPercent(bestSite.cloudCover)} cloud | ${formatPercent(bestSite.precipProbability)} precip`
          : `${formatPercent(bestSite.cloudCover)} oblaci | ${formatPercent(bestSite.precipProbability)} padavine`,
      note:
        state.lang === "en"
          ? `Best site right now is ${bestSite.name}.`
          : `Najbolji punkt trenutno je ${bestSite.name}.`,
      level: checklist.items[3]?.level ?? "go",
      label: checklist.items[3]?.label ?? "GO"
    },
    {
      title: state.lang === "en" ? "Moon" : "Mjesec",
      value: `${status.moon.illuminationPct}% | ${moonLabel}`,
      note:
        state.lang === "en"
          ? "Moonlight interferes most with weak low auroral structures."
          : "Mjeseceva svjetlost najvise smeta slabim niskim auroralnim strukturama.",
      level: checklist.items[4]?.level ?? "go",
      label: checklist.items[4]?.label ?? "GO"
    },
    {
      title: state.lang === "en" ? "Northern horizon and light" : "Sjeverni horizont i svjetlo",
      value: `${bestSite.northHorizonLabel} | ${bestSite.lightPollutionLabel}`,
      note:
        state.lang === "en"
          ? "Site optical readiness is almost as important as KP itself at Bosnia latitudes."
          : "Opticka spremnost punkta je skoro jednako bitna kao i sam Kp na BiH sirinama.",
      level: checklist.items[5]?.level ?? "go",
      label: checklist.items[5]?.label ?? "GO"
    }
  ];

  checklistSummary.innerHTML = `
    <article class="quality-card checklist-${escapeHtml(checklist.summary.level)}">
      <span class="metric-label">${escapeHtml(getUi().fieldDecision)}</span>
      <strong>${escapeHtml(
        state.lang === "en"
          ? { go: "Go to the field", watch: "Monitor a bit longer", no: "Do not go yet" }[checklist.summary.level] ?? checklist.summary.label
          : checklist.summary.label
      )}</strong>
    </article>
  `;

  checklistList.innerHTML = items
    .map(
      (item) => `
        <article class="quality-card checklist-${escapeHtml(item.level)}">
          <div class="title-row">
            <h3>${escapeHtml(item.title)}</h3>
            <span class="forecast-badge">${escapeHtml(item.label)}</span>
          </div>
          <p class="site-meta">${escapeHtml(item.value)}</p>
          <p class="site-meta">${escapeHtml(item.note)}</p>
        </article>
      `
    )
    .join("");
}

function renderSources(sources) {
  sourcesList.innerHTML = sources
    .map(
      (source) => `
        <li><a href="${source.url}" target="_blank" rel="noreferrer">${escapeHtml(localizeSourceName(source))}</a></li>
      `
    )
    .join("");
}

function renderStatus(status) {
  state.status = status;
  const ui = getUi();
  const bestSite = localizeSiteCopy(status.sites[0]);

  statusRibbon.textContent = `${classifyScoreLabel(status.summary.score)} | ${bestSite.name}`;
  scoreValue.textContent = `${status.summary.score}/100`;
  scoreSummary.textContent = `${buildSummaryMessage(status.summary.level)} ${ui.bestWindow}: ${localizeBestWindowLabel(status.summary.bestWindowLabel)}.`;

  heroKp.textContent = status.current.kpLabel;
  heroKpMax.textContent = status.current.kpMax24hLabel;
  heroHpi.textContent = status.current.hpiNorthLabel;
  heroSpeed.textContent = status.current.solarWindSpeedLabel;

  kpValue.textContent = status.current.kpLabel;
  kpScale.textContent = computeNoaaScaleLabel(status.current.kp);
  kpMaxValue.textContent = status.current.kpMax24hLabel;
  kpTonightValue.textContent = status.outlooks.tonight.maxForecastKp;
  kpTomorrowValue.textContent = status.outlooks.tomorrow.maxForecastKp;

  hpiValue.textContent = status.current.hpiNorthLabel;
  hpiSouthValue.textContent = status.current.hpiSouthLabel;
  hpiMaxValue.textContent = status.current.hpiMax24hLabel;
  hpiStatus.textContent = computeHpiStatusLabel(status.current.hpiNorthGw);

  bzValue.textContent = status.current.bzLabel;
  bzStatus.textContent = computeBzStatusLabel(status.current.bz);
  speedValue.textContent = status.current.solarWindSpeedLabel;
  speedStatus.textContent = computeSpeedStatusLabel(status.current.solarWindSpeed);
  densityValue.textContent = status.current.densityLabel;
  delayValue.textContent = status.current.propagationDelayLabel;

  moonPhase.textContent = phaseToLabel(status.moon.phase);
  moonIllumination.textContent = `${status.moon.illuminationPct}%`;
  moonRise.textContent = status.moon.riseLabel;
  moonSet.textContent = status.moon.setLabel;
  renderMoonVisual(status.moon);
  moonNote.textContent =
    state.lang === "en"
      ? `Moon panel is computed for ${status.moon.siteName}, i.e. the currently best Bosnia reference site.`
      : `Moon panel racunat za ${status.moon.siteName}, tj. trenutno najbolju BiH referentnu lokaciju.`;

  if (viewlineSource) {
    viewlineSource.href = status.viewline.sourceUrl;
  }
  if (viewlineTonight) {
    viewlineTonight.src = `${status.viewline.tonightImageUrl}?ts=${encodeURIComponent(status.updatedAt)}`;
  }
  if (viewlineTomorrow) {
    viewlineTomorrow.src = `${status.viewline.tomorrowImageUrl}?ts=${encodeURIComponent(status.updatedAt)}`;
  }
  if (viewlineCaveat) {
    viewlineCaveat.textContent = ui.viewlineCaveat;
  }
  if (weatherSatImage) {
    weatherSatImage.src = `https://img.allmetsat.com/sat/msg_fes-italia-ir039.jpg?ts=${encodeURIComponent(status.updatedAt)}`;
  }
  if (weatherSatNote) {
    weatherSatNote.textContent = `${ui.weatherSatNotePrefix} ${new Date(status.updatedAt).toLocaleString(getLocale())}.`;
  }

  mapImage.src = `${status.auroraMap.imageUrl}?ts=${encodeURIComponent(status.updatedAt)}`;
  mapCaption.textContent =
    `${ui.mapObservation}: ${formatDisplayTime(status.auroraMap.observationTime)} | ${ui.mapForecast}: ${formatDisplayTime(status.auroraMap.forecastTime)}`;

  renderLocation(status.sites[0]);
  renderOutlook(tonightCard, status.outlooks.tonight, getUi().tonight);
  renderOutlook(tomorrowCard, status.outlooks.tomorrow, getUi().tomorrowNight);
  const quickSites = pickQuickSites(status.sites);
  renderQuickSite(sarajevoCard, quickSites.sarajevo, "Sarajevo");
  renderQuickSite(northSiteCard, quickSites.bestNorth, state.lang === "en" ? "Northern site" : "Sjeverni punkt");
  renderFiveDayOutlook(status.fiveDayOutlook);
  renderDataQuality(status.dataQuality);
  renderCme(status.cme);
  renderChecklist(status);
  renderObservationModes(status.observationModes);
  renderSites(status.sites);
  renderSources(status.sources);

  renderBarChart(kpObservedChart, status.kp.observed24h, (item) => item.value, (item) => item.timeLabel, {
    maxItems: 8
  });
  renderBarChart(kpForecastChart, status.kp.forecast3Day, (item) => item.value, (item) => item.timeLabel, {
    maxItems: 12
  });
  renderAreaChart(hpiChart, status.hpi.recent24h, (item) => item.northGw, (item) => item.timeLabel, {
    maxItems: 12
  });
  renderBarChart(speedChart, status.solarWind.speedTrend, (item) => item.value, (item) => {
    return new Date(item.time).toLocaleTimeString(getLocale(), { hour: "2-digit", minute: "2-digit" });
  });
  renderBarChart(
    bzChart,
    status.solarWind.bzTrend,
    (item) => item.value,
    (item) => new Date(item.time).toLocaleTimeString(getLocale(), { hour: "2-digit", minute: "2-digit" }),
    { negative: true }
  );
}

async function fetchStatus() {
  let response = await fetch("/api/status");
  if (!response.ok) {
    response = await fetch("/sample-status.json");
  }

  if (!response.ok) {
    throw new Error("Status fetch failed");
  }

  const status = await response.json();
  renderStatus(status);
}

async function fetchApod() {
  const endpoints = ["/api/apod", APOD_FALLBACK_URL];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        continue;
      }

      renderApod(await response.json());
      return;
    } catch {
      // Try the next endpoint before falling back to the placeholder state.
    }
  }

  renderApodUnavailable();
  throw new Error("APOD fetch failed");
}

function switchInfoTab(targetTab) {
  infoTabs.forEach((tab) => {
    const active = tab.dataset.tab === targetTab;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
  });

  infoPanels.forEach((panel) => {
    const active = panel.dataset.panel === targetTab;
    panel.classList.toggle("is-active", active);
    panel.hidden = !active;
  });
}

function switchModeTab(targetTab) {
  modeTabs.forEach((tab) => {
    const active = tab.dataset.modeTab === targetTab;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
  });

  modePanels.forEach((panel) => {
    const active = panel.dataset.modePanel === targetTab;
    panel.classList.toggle("is-active", active);
    panel.hidden = !active;
  });
}

function openAboutAppModal() {
  if (!aboutAppModal) {
    return;
  }

  aboutAppModal.hidden = false;
  document.body.classList.add("modal-open");
  aboutAppClose?.focus();
}

function closeAboutAppModal() {
  if (!aboutAppModal) {
    return;
  }

  aboutAppModal.hidden = true;
  document.body.classList.remove("modal-open");
  aboutAppButton?.focus();
}

infoTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    switchInfoTab(tab.dataset.tab);
  });
});

modeTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    switchModeTab(tab.dataset.modeTab);
  });
});

aboutAppButton?.addEventListener("click", () => {
  openAboutAppModal();
});

aboutAppClose?.addEventListener("click", () => {
  closeAboutAppModal();
});

aboutAppModal?.addEventListener("click", (event) => {
  if (event.target === aboutAppModal) {
    closeAboutAppModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !aboutAppModal?.hidden) {
    closeAboutAppModal();
  }
});

locateButton.addEventListener("click", () => {
  if (!navigator.geolocation || !state.status) {
    locationSummary.textContent = getUi().geoUnavailable;
    return;
  }

  locationSummary.textContent = getUi().geoLocating;
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const site = pickNearestSite(position.coords.latitude, position.coords.longitude);
      if (!site) {
        locationSummary.textContent = getUi().geoNoMatch;
        return;
      }

      renderLocation(site, `${getUi().nearestSitePrefix} (${Math.round(site.distanceToUserKm)} km)`);
    },
    () => {
      locationSummary.textContent = getUi().geoDenied;
    },
    {
      enableHighAccuracy: false,
      timeout: 10000
    }
  );
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  formFeedback.textContent = getUi().formSending;

  const formData = new FormData(form);
  const payload = {
    email: formData.get("email"),
    threshold: formData.get("threshold")
  };

  try {
    const response = await fetch("/api/subscriptions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(
        data.error === "INVALID_EMAIL"
          ? getUi().formInvalidEmail
          : data.error === "INVALID_THRESHOLD"
            ? getUi().formInvalidThreshold
            : getUi().formError
      );
    }

    form.reset();
    formFeedback.textContent = data.emailReady ? getUi().formSaved : getUi().formSavedNoSmtp;
  } catch (error) {
    formFeedback.textContent = error instanceof Error ? error.message : getUi().formError;
  }
});

langButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.lang === state.lang) {
      return;
    }

    state.lang = button.dataset.lang === "en" ? "en" : "bs";
    localStorage.setItem(LANGUAGE_STORAGE_KEY, state.lang);
    applyStaticTranslations();
    if (state.status) {
      renderStatus(state.status);
    }
    if (state.apod) {
      renderApod(state.apod);
    } else {
      renderApodUnavailable();
    }
  });
});

applyStaticTranslations();

fetchStatus().catch(() => {
  scoreSummary.textContent = getUi().statusLoadError;
});
fetchApod().catch(() => {});

setInterval(() => {
  fetchStatus().catch(() => {});
}, 5 * 60 * 1000);

setInterval(() => {
  fetchApod().catch(() => {});
}, 60 * 60 * 1000);
