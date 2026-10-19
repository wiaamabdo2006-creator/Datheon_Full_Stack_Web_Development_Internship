(function () {
  'use strict';

  // Open-Meteo needs no API key, so nothing secret is stored in the repository.
  const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';
  const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';
  const LAST_CITY_KEY = 'skycast.lastCity';
  const UNIT_KEY = 'skycast.unit';

  let unit = 'C';
  let current = null;   // { place, weather }
  let requestId = 0;    // ignores out-of-date responses

  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  class CityNotFoundError extends Error {}

  // ---- Weather codes (WMO) -> label + kind ----
  function describe(code) {
    if (code === 0) return ['Clear sky', 'clear'];
    if (code === 1) return ['Mainly clear', 'clear'];
    if (code === 2) return ['Partly cloudy', 'partly'];
    if (code === 3) return ['Overcast', 'cloud'];
    if (code === 45 || code === 48) return ['Fog', 'fog'];
    if (code >= 51 && code <= 57) return ['Drizzle', 'rain'];
    if (code >= 61 && code <= 67) return ['Rain', 'rain'];
    if (code >= 71 && code <= 77) return ['Snow', 'snow'];
    if (code >= 80 && code <= 82) return ['Rain showers', 'rain'];
    if (code === 85 || code === 86) return ['Snow showers', 'snow'];
    if (code >= 95) return ['Thunderstorm', 'storm'];
    return ['Unknown', 'cloud'];
  }

  function themeFor(kind, isDay) {
    if (kind === 'clear') return isDay ? 'clear-day' : 'clear-night';
    if (kind === 'partly' || kind === 'cloud') return isDay ? 'cloud-day' : 'cloud-night';
    return kind; // rain, snow, storm, fog
  }

  // ---- Dynamic SVG icons ----
  const CLOUD = '<path d="M18 46a9 9 0 0 1 1-18 13 13 0 0 1 25-3 10 10 0 0 1 2 21z" fill="#fff"/>';
  const SUN = '<g stroke="#ffd23f" stroke-width="3" stroke-linecap="round"><path d="M32 6v6M32 52v6M6 32h6M52 32h6M13.6 13.6l4.2 4.2M46.2 46.2l4.2 4.2M13.6 50.4l4.2-4.2M46.2 17.8l4.2-4.2"/></g><circle cx="32" cy="32" r="11" fill="#ffd23f"/>';
  const MOON = '<path d="M40 12a20 20 0 1 0 14 34A17 17 0 0 1 40 12z" fill="#e8ecf6"/>';

  function icon(kind, isDay) {
    const body = isDay ? SUN : MOON;
    let inner;
    switch (kind) {
      case 'clear': inner = body; break;
      case 'partly': inner = '<g transform="translate(-8 -8) scale(.75)">' + body + '</g>' + CLOUD; break;
      case 'cloud': inner = '<g fill="#cfd6df" transform="translate(-6 -8)"><path d="M18 46a9 9 0 0 1 1-18 13 13 0 0 1 25-3 10 10 0 0 1 2 21z"/></g>' + CLOUD; break;
      case 'rain': inner = CLOUD + '<g stroke="#7cc4ff" stroke-width="3" stroke-linecap="round"><path d="M22 50l-3 7M32 50l-3 7M42 50l-3 7"/></g>'; break;
      case 'snow': inner = CLOUD + '<g fill="#fff"><circle cx="22" cy="53" r="2.5"/><circle cx="32" cy="57" r="2.5"/><circle cx="42" cy="53" r="2.5"/></g>'; break;
      case 'storm': inner = CLOUD + '<path d="M34 44l-8 12h6l-3 8 11-14h-6z" fill="#ffd23f"/>'; break;
      case 'fog': inner = '<g stroke="#fff" stroke-width="4" stroke-linecap="round"><path d="M12 24h40M8 34h40M14 44h40"/></g>'; break;
      default: inner = CLOUD;
    }
    return '<svg viewBox="0 0 64 64" aria-hidden="true">' + inner + '</svg>';
  }

  // ---- API ----
  async function getJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  }

  async function geocode(city) {
    const data = await getJson(`${GEO_URL}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
    if (!data.results || !data.results.length) throw new CityNotFoundError(city);
    return data.results[0];
  }

  function fetchWeather(lat, lon) {
    const params = new URLSearchParams({
      latitude: lat, longitude: lon, timezone: 'auto', forecast_days: 5,
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,surface_pressure,wind_speed_10m',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min'
    });
    return getJson(`${WEATHER_URL}?${params}`);
  }

  // ---- UI state ----
  function showLoading(city) {
    const s = $('status');
    s.className = 'status';
    s.innerHTML = '<div class="spinner" role="progressbar" aria-label="Loading"></div>Fetching weather for ' + esc(city) + '...';
    s.hidden = false;
    $('weather').hidden = true;
  }
  function showError(message) {
    const s = $('status');
    s.className = 'status error';
    s.textContent = message;
    s.hidden = false;
    $('weather').hidden = true;
    document.body.dataset.theme = 'default';
  }
  function hideStatus() { $('status').hidden = true; }

  async function search(rawCity) {
    const city = rawCity.trim();
    if (!city) { showError('Enter a city name to see its weather.'); return; }
    const id = ++requestId;
    showLoading(city);
    try {
      const place = await geocode(city);
      const weather = await fetchWeather(place.latitude, place.longitude);
      if (id !== requestId) return;
      current = { place, weather };
      render();
      hideStatus();
      try { localStorage.setItem(LAST_CITY_KEY, city); } catch (e) { /* ignore */ }
    } catch (err) {
      if (id !== requestId) return;
      if (err instanceof CityNotFoundError) {
        showError(`We couldn't find "${city}". Check the spelling or try a larger nearby city.`);
      } else if (!navigator.onLine) {
        showError('You appear to be offline. Check your connection and try again.');
      } else {
        showError('The weather service is unavailable right now. Please try again in a moment.');
      }
    }
  }

  // ---- Rendering ----
  const toUnit = (c) => Math.round(unit === 'C' ? c : (c * 9) / 5 + 32);
  const deg = (c) => toUnit(c) + '\u00b0';

  function render() {
    if (!current) return;
    const { place, weather } = current;
    const c = weather.current;
    const isDay = c.is_day === 1;
    const [label, kind] = describe(c.weather_code);
    document.body.dataset.theme = themeFor(kind, isDay);

    $('place').textContent = [place.name, place.admin1, place.country].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(', ');
    $('updated').textContent = 'Local time ' + c.time.split('T')[1] + (isDay ? ' (daytime)' : ' (night)');
    $('icon').innerHTML = icon(kind, isDay);
    $('temp').textContent = deg(c.temperature_2m) + unit;
    $('condition').textContent = label;

    const wind = unit === 'C' ? Math.round(c.wind_speed_10m) + ' km/h' : Math.round(c.wind_speed_10m * 0.621) + ' mph';
    const metrics = [
      ['Feels like', deg(c.apparent_temperature) + unit],
      ['Humidity', Math.round(c.relative_humidity_2m) + '%'],
      ['Wind speed', wind],
      ['Pressure', Math.round(c.surface_pressure) + ' hPa']
    ];
    $('metrics').innerHTML = metrics.map(([l, v]) =>
      `<div class="metric"><div class="label">${l}</div><div class="value">${v}</div></div>`).join('');

    const d = weather.daily;
    $('forecast').innerHTML = d.time.map((date, i) => {
      const [desc, k] = describe(d.weather_code[i]);
      const name = i === 0 ? 'Today' : new Date(date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short' });
      return `<div class="day"><div class="name">${esc(name)}</div>${icon(k, true)}
        <div><span class="hi">${deg(d.temperature_2m_max[i])}</span><span class="lo">${deg(d.temperature_2m_min[i])}</span></div>
        <div class="desc">${esc(desc)}</div></div>`;
    }).join('');

    $('weather').hidden = false;
  }

  // ---- Events ----
  $('searchForm').addEventListener('submit', (e) => { e.preventDefault(); search($('cityInput').value); });

  document.querySelectorAll('[data-unit]').forEach((btn) => {
    btn.addEventListener('click', () => {
      unit = btn.dataset.unit;
      document.querySelectorAll('[data-unit]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      try { localStorage.setItem(UNIT_KEY, unit); } catch (e) { /* ignore */ }
      render();
    });
  });

  // ---- Init ----
  try { unit = localStorage.getItem(UNIT_KEY) === 'F' ? 'F' : 'C'; } catch (e) { /* ignore */ }
  document.querySelectorAll('[data-unit]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.unit === unit)));
  let start = 'Beirut';
  try { start = localStorage.getItem(LAST_CITY_KEY) || start; } catch (e) { /* ignore */ }
  $('cityInput').value = start;
  search(start);
})();
