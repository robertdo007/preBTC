import fs from "fs";

export function analyzePattern1d(patternArray) {
    const inputFile = "btc_analysis.csv";
    
    if (!fs.existsSync(inputFile)) {
        return { error: "Không tìm thấy file dữ liệu btc_analysis.csv" };
    }

    const raw = fs.readFileSync(inputFile, "utf8").trim();
    const lines = raw.split("\n");
    const data = lines.slice(1).map(line => {
        const [date, close, change, changePercent, direction] = line.split(",");
        return { date, close, direction, change: parseFloat(change), changePercent: parseFloat(changePercent) };
    });

    let total = 0, up = 0, down = 0, flat = 0;

    for (let i = 0; i <= data.length - patternArray.length - 1; i++) {
        let match = true;
        for (let j = 0; j < patternArray.length; j++) {
            if (data[i + j].direction !== patternArray[j]) {
                match = false;
                break;
            }
        }

        if (match) {
            const nextDay = data[i + patternArray.length];
            total++;
            if (nextDay.direction === "up") up++;
            else if (nextDay.direction === "down") down++;
            else flat++;
        }
    }

    return {
        pattern: patternArray.join(" "),
        total,
        stats: total > 0 ? {
            up: ((up / total) * 100).toFixed(2),
            down: ((down / total) * 100).toFixed(2),
            flat: ((flat / total) * 100).toFixed(2),
            countUp: up,
            countDown: down,
            countFlat: flat
        } : null
    };
}