import { getPatternData1h } from "./patternAnalyzer1hnew.js";
import { analyzePattern1h } from "./analyzer1hnew.js";

export async function findLongestPattern1h() {
  let a = 1;
  let statsHistory = [];

  while (true) {
    console.log(`\n⏳ Đang lấy pattern 1h với length = ${a}...`);

    const live = await getPatternData1h(a); // { pattern, closes, netChange, netChangePercent, trend }
    console.log(`📊 Pattern 1h: ${live.pattern}`);
    console.log(`📈 Xu hướng tổng (live): ${live.trend} | netChange=${live.netChange} (${live.netChangePercent}%)`);

    const patternArray = live.pattern.split(" ");
    const result = analyzePattern1h(patternArray, live.trend);

    if (result.total === 0) {
      console.log(`❌ Pattern 1h này KHÔNG tìm thấy trong lịch sử`);
      break;
    }

    console.log(`✅ Pattern (chuỗi up/down) tìm thấy ${result.total} lần trong lịch sử`);
    console.log(`✅ Trong đó cùng xu hướng tổng (${live.trend}) với hiện tại: ${result.filteredTotal} lần`);

    // 👉 Thống kê nến kế tiếp NGAY SAU pattern, chỉ tính trong số match cùng xu hướng tổng
    if (result.filteredStats) {
      console.log(
        `   📌 Thống kê nến kế tiếp (trong nhóm cùng xu hướng "${live.trend}"): ` +
        `UP ${result.filteredStats.up}% (${result.filteredStats.countUp}) | ` +
        `DOWN ${result.filteredStats.down}% (${result.filteredStats.countDown}) | ` +
        `FLAT ${result.filteredStats.flat}% (${result.filteredStats.countFlat})`
      );
    } else {
      console.log(`   📌 Không có match nào cùng xu hướng tổng "${live.trend}" để thống kê nến kế tiếp`);
    }

    statsHistory.push({
      length: a,
      pattern: live.pattern,

      liveTrend: live.trend,
      liveNetChange: live.netChange,
      liveNetChangePercent: live.netChangePercent,

      // số liệu cũ (chỉ match chuỗi up/down/flat, KHÔNG lọc xu hướng tổng)
      total: result.total,
      stats: result.stats,

      // 👉 số liệu chính: chỉ tính trên các match CÙNG xu hướng tổng với pattern hiện tại
      filteredTotal: result.filteredTotal,
      filteredStats: result.filteredStats,

      // dữ liệu nhóm theo xu hướng tổng (up/down/flat) -> để build model khác
      groupedByTrend: {
        up: { count: result.groupedByTrend.up.count, stats: result.groupedByTrend.up.stats },
        down: { count: result.groupedByTrend.down.count, stats: result.groupedByTrend.down.stats },
        flat: { count: result.groupedByTrend.flat.count, stats: result.groupedByTrend.flat.stats }
      }
    });

    a++;
  }

  return statsHistory;
}