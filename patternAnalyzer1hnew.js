const BASE_URL = "https://data-api.binance.vision/api/v3/klines";
const SYMBOL = "BTCUSDT";
const INTERVAL = "1h";

/**
 * Lấy pattern (chuỗi up/down/flat) của a cây nến gần nhất,
 * đồng thời tính luôn xu hướng TỔNG của cả khối nến đó:
 * netChange = close(nến mới nhất) - close(nến cũ nhất)
 */
export async function getPatternData1h(a) {
  let startTime = Date.now() - (a + 1) * 60 * 60 * 1000;
  const endTime = Date.now() - 60 * 60 * 1000;

  let directions = [];
  let closes = [];

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

    data.forEach(candle => {
      const open = parseFloat(candle[1]);
      const close = parseFloat(candle[4]);
      const direction = open > close ? "down" : open < close ? "up" : "flat";
      directions.push(direction);
      closes.push(close);
    });

    startTime = data[data.length - 1][0] + 1 * 60 * 60 * 1000;
  }

  const pattern = directions.join(" ");

  const oldestClose = closes[0];
  const newestClose = closes[closes.length - 1];
  const netChange = newestClose - oldestClose;
  const netChangePercent = oldestClose ? (netChange / oldestClose) * 100 : 0;
  const trend = netChange > 0 ? "up" : netChange < 0 ? "down" : "flat";

  return {
    pattern,
    closes,
    netChange: parseFloat(netChange.toFixed(2)),
    netChangePercent: parseFloat(netChangePercent.toFixed(4)),
    trend
  };
}

// Giữ lại hàm cũ để không phá vỡ code khác đang import getPatternString1h
export async function getPatternString1h(a) {
  const { pattern } = await getPatternData1h(a);
  return pattern;
}
