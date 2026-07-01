import fs from "fs";

/**
 * Tính stats up/down/flat của "nến kế tiếp" cho một danh sách match
 */
function buildStats(matchList) {
  const total = matchList.length;
  if (total === 0) return null;

  const up = matchList.filter(m => m.nextDirection === "up").length;
  const down = matchList.filter(m => m.nextDirection === "down").length;
  const flat = total - up - down;

  return {
    up: ((up / total) * 100).toFixed(2),
    down: ((down / total) * 100).toFixed(2),
    flat: ((flat / total) * 100).toFixed(2),
    countUp: up,
    countDown: down,
    countFlat: flat
  };
}

/**
 * @param {string[]} patternArray  chuỗi hướng nến cần tìm (vd: ["up","down","up"])
 * @param {string|null} liveTrend  xu hướng tổng (up/down/flat) của pattern hiện tại (live),
 *                                  lấy từ getPatternData1h(a).trend
 */
export function analyzePattern1h(patternArray, liveTrend = null) {
  const inputFile = "btc_60m_analysis.csv";

  if (!fs.existsSync(inputFile)) {
    return { error: "Không tìm thấy file dữ liệu btc_60m_analysis.csv" };
  }

  const raw = fs.readFileSync(inputFile, "utf8").trim();
  const lines = raw.split("\n");
  const data = lines.slice(1).map(line => {
    const [date, close, change, changePercent, direction] = line.split(",");
    return {
      date,
      close: parseFloat(close),
      direction,
      change: parseFloat(change),
      changePercent: parseFloat(changePercent)
    };
  });

  const patternLen = patternArray.length;

  // total/up/down/flat: giữ nguyên ý nghĩa CŨ -> chỉ match theo chuỗi up/down/flat,
  // CHƯA lọc theo xu hướng tổng. Dùng để quyết định "pattern còn tồn tại trong lịch sử hay không".
  let total = 0, up = 0, down = 0, flat = 0;
  let matches = [];

  for (let i = 0; i <= data.length - patternLen - 1; i++) {
    let isMatch = true;
    for (let j = 0; j < patternLen; j++) {
      if (data[i + j].direction !== patternArray[j]) {
        isMatch = false;
        break;
      }
    }

    if (isMatch) {
      const windowStart = data[i];
      const windowEnd = data[i + patternLen - 1];

      // xu hướng TỔNG của khối nến này: nến mới nhất trừ nến cũ nhất
      const netChange = windowEnd.close - windowStart.close;
      const netChangePercent = windowStart.close
        ? (netChange / windowStart.close) * 100
        : 0;
      const trend = netChange > 0 ? "up" : netChange < 0 ? "down" : "flat";

      const nextCandle = data[i + patternLen];

      total++;
      if (nextCandle.direction === "up") up++;
      else if (nextCandle.direction === "down") down++;
      else flat++;

      matches.push({
        startDate: windowStart.date,
        endDate: windowEnd.date,
        netChange: parseFloat(netChange.toFixed(2)),
        netChangePercent: parseFloat(netChangePercent.toFixed(4)),
        trend,
        nextDirection: nextCandle.direction
      });
    }
  }

  // 1) LỌC theo xu hướng tổng của pattern hiện tại (live)
  //    -> chỉ giữ những match lịch sử "thật sự giống" pattern hiện tại
  //       (cùng chuỗi up/down/flat từng nến VÀ cùng chiều xu hướng tổng)
  const filteredMatches = liveTrend
    ? matches.filter(m => m.trend === liveTrend)
    : matches;
  const filteredStats = buildStats(filteredMatches);

  // 2) NHÓM toàn bộ match lịch sử theo xu hướng tổng (không phụ thuộc live)
  //    -> dữ liệu mới để dùng cho một mô hình dự đoán khác
  const groupUp = matches.filter(m => m.trend === "up");
  const groupDown = matches.filter(m => m.trend === "down");
  const groupFlat = matches.filter(m => m.trend === "flat");

  const groupedByTrend = {
    up: { count: groupUp.length, stats: buildStats(groupUp), matches: groupUp },
    down: { count: groupDown.length, stats: buildStats(groupDown), matches: groupDown },
    flat: { count: groupFlat.length, stats: buildStats(groupFlat), matches: groupFlat }
  };

  return {
    pattern: patternArray.join(" "),

    // số liệu cũ, KHÔNG lọc trend (chỉ match chuỗi up/down/flat)
    total,
    stats: total > 0
      ? {
          up: ((up / total) * 100).toFixed(2),
          down: ((down / total) * 100).toFixed(2),
          flat: ((flat / total) * 100).toFixed(2),
          countUp: up,
          countDown: down,
          countFlat: flat
        }
      : null,

    // số liệu mới: lọc theo xu hướng tổng của pattern hiện tại
    liveTrend,
    filteredTotal: filteredMatches.length,
    filteredStats,

    // dữ liệu nhóm theo xu hướng tổng (dùng để xây model khác)
    groupedByTrend,

    // chi tiết từng match (debug / export ra dataset riêng)
    matches
  };
}
