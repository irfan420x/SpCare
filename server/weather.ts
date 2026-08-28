type OpenMeteoResponse = {
  current?: {
    temperature_2m?: number;
    apparent_temperature?: number;
    relative_humidity_2m?: number;
    wind_speed_10m?: number;
    weather_code?: number;
  };
};

const SHERPUR = { latitude: 25.0205, longitude: 90.017, timezone: "Asia/Dhaka" };

const weatherLabel = (code: number | undefined) => {
  if (code === undefined) return "আবহাওয়ার তথ্য";
  if (code === 0) return "পরিষ্কার আকাশ";
  if ([1, 2, 3].includes(code)) return "আংশিক মেঘলা";
  if ([45, 48].includes(code)) return "কুয়াশাচ্ছন্ন";
  if ([51, 53, 55, 56, 57].includes(code)) return "হালকা গুঁড়ি বৃষ্টি";
  if ([61, 63, 65, 66, 67].includes(code)) return "বৃষ্টি";
  if ([80, 81, 82].includes(code)) return "বৃষ্টির ঝাপটা";
  if ([95, 96, 99].includes(code)) return "বজ্রসহ বৃষ্টি";
  return "পরিবর্তনশীল আবহাওয়া";
};

export async function getSherpurWeather() {
  const fallback = { location: "শেরপুর", temperatureC: 31, feelsLikeC: 33, humidity: 72, windKmh: 8, labelBn: "সুন্দর আবহাওয়া", source: "demo-fallback" };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3500);
  try {
    const params = new URLSearchParams({
      latitude: String(SHERPUR.latitude),
      longitude: String(SHERPUR.longitude),
      current: "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code",
      timezone: SHERPUR.timezone,
    });
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal: controller.signal, headers: { accept: "application/json" } });
    if (!response.ok) return fallback;
    const data = (await response.json()) as OpenMeteoResponse;
    const current = data.current;
    if (!current?.temperature_2m) return fallback;
    return {
      location: "শেরপুর",
      temperatureC: Math.round(current.temperature_2m),
      feelsLikeC: Math.round(current.apparent_temperature ?? current.temperature_2m),
      humidity: Math.round(current.relative_humidity_2m ?? 0),
      windKmh: Math.round(current.wind_speed_10m ?? 0),
      labelBn: weatherLabel(current.weather_code),
      source: "open-meteo",
    };
  } catch {
    return fallback;
  } finally {
    clearTimeout(timer);
  }
}
