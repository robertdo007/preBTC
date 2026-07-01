import { getPatternString1d } from "./patternAnalyzer1d.js";
import { analyzePattern1d } from "./analyzer1d.js";

export async function findLongestPattern1d() {
  let a = 1;
  let foundPattern = null;
  let foundResult = null;
  let statsHistory = [];

  while (true) {
    console.log(`\n⏳ Đang lấy pattern 1d với length = ${a}...`);
    const pattern = await getPatternString1d(a);
    console.log(`📊 Pattern 1d: ${pattern}`);

    const patternArray = pattern.split(" ");
    const result = analyzePattern1d(patternArray);

    if (result.total === 0) {
      console.log(`❌ Pattern 1d này KHÔNG tìm thấy trong lịch sử`);
      break;
    } else {
      console.log(`✅ Pattern 1d tìm thấy ${result.total} lần`);
      
      statsHistory.push({
        length: a,
        pattern: pattern,
        up: result.stats.up,
        down: result.stats.down,
        countUp: result.stats.countUp,
        countDown: result.stats.countDown,
        total: result.total
      });
      
      foundPattern = pattern;
      foundResult = result;
      a++;
    }
  }
  
  // ✅ Return statsHistory thay vì chỉ log
  return statsHistory;
}