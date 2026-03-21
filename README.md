# AuroraChaser

Autor: Alan Catovic

Pocetna verzija web aplikacije koja procjenjuje mogucnost vidljivosti aurore iz Bosne i Hercegovine. Fokus je na kombinaciji:

- NOAA SWPC OVATION aurora nowcast mape i grida
- NOAA planetary Kp i real-time solar wind indikatora
- NASA DONKI CMEAnalysis kao dopunski signal za pravac/energiju CME dogadjaja
- Open-Meteo forecasta oblacnosti za vise BiH lokacija
- nocnog uslova po lokaciji preko SunCalc

## Sta ova verzija radi

- prikazuje NOAA aurora mapu istog tipa kao na SWPC stranici
- racuna BiH skor za Bihac, Banju Luku, Brcko i Tuzlu
- bira najbolju referentnu lokaciju i okvirni termin za posmatranje
- prikazuje BiH-orijentisan screening dashboard bez email alarm funkcije

## Vazna tehnicka napomena

Baklje same po sebi nisu dovoljan kriterij za auroru iste veceri. Za operativni alarm glavni signal treba da bude geomagnetna reakcija kod Zemlje: OVATION aurora nowcast, Kp, solar wind speed i posebno negativan Bz. NASA CME podaci su korisni kao dopunski indikator pravca i nadolazeceg dogadjaja, ali ne kao jedini okidac.

## Pokretanje

```bash
npm install
copy .env.example .env
npm run dev
```

App ce biti na `http://127.0.0.1:3000`.

## Cloudflare Worker

Cloudflare migracija sada koristi:

- `src/worker.js` kao Worker entrypoint
- `wrangler.jsonc` za assets i runtime vars

- `NASA_API_KEY`

Osnovni deploy tok:

```bash
npm install
npx wrangler login
npx wrangler secret put NASA_API_KEY
npx wrangler deploy
```

## Reference

- NOAA SWPC, "Aurora - 30 Minute Forecast": https://www.swpc.noaa.gov/products/aurora-30-minute-forecast
- NOAA SWPC OVATION latest JSON: https://services.swpc.noaa.gov/json/ovation_aurora_latest.json
- NOAA SWPC Planetary K Index: https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json
- NOAA SWPC Solar Wind Plasma: https://services.swpc.noaa.gov/products/solar-wind/plasma-7-day.json
- NOAA SWPC Solar Wind Magnetic Field: https://services.swpc.noaa.gov/products/solar-wind/mag-7-day.json
- NASA DONKI CMEAnalysis API: https://api.nasa.gov/DONKI/CMEAnalysis
- Open-Meteo GFS API docs: https://open-meteo.com/en/docs/gfs-api

## Dalji koraci koje vrijedi dodati

- viewline overlay za Evropu/Balkan
- posebna procjena sjevernog horizonta po reljefu i svjetlosnom zagadjenju
- dnevni/nightly scheduler sa logikom protiv duplog spama
- istorija alarma i graf Kp/Bz kroz noc
