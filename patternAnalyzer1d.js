const BASE_URL = "https://api.binance.com/api/v3/klines";
const SYMBOL = "BTCUSDT";
const INTERVAL = "1d";

export async function getPatternString1d(a) {
  let startTime = Date.now() - (a + 1) * 24* 60 * 60 * 1000;
  const endTime = Date.now() - 24* 60 * 60 * 1000;

  let directions = [];

  while (startTime < endTime) {
    const url =
      `${BASE_URL}?symbol=${SYMBOL}&interval=${INTERVAL}&limit=${a}&startTime=${startTime}`;

    const res = await fetch(url);

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text);
    }

    const data = await res.json();
    if (data.length === 0) break;

    // Lấy open, close và so sánh
    data.forEach(candle => {
      const open = parseFloat(candle[1]);
      const close = parseFloat(candle[4]);
      const direction = open > close ? "down" : open < close ? "up" : "flat";
      directions.push(direction);
    });

    startTime = data[data.length - 1][0] + 24 * 60 * 60 * 1000;
  }

  const directionString1d = directions.join(" ");
  return directionString1d;
}