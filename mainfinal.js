import { Telegraf } from 'telegraf';

import { findLongestPattern1h } from './find1hnew.js'; // ✅ Import function
import { findLongestPattern4h } from './find4hnew.js'; // ✅ Import function
import { findLongestPattern1d } from './find1d.js'; // ✅ Import function

const bot = new Telegraf('8645546982:AAHsNlQ3e-rcxy0l1JAj7IDme5wPpE7QqQg');

bot.on('text', async (ctx) => {
    const message = ctx.message.text.toLowerCase().trim();

    if (message.startsWith('find1h')) {
        await ctx.reply('⏳ Đang tìm pattern 1h dài nhất... Vui lòng chờ');
        const statsHistory = await findLongestPattern1h();
        if (statsHistory.length === 0) { return ctx.reply('❌ Không tìm thấy pattern nào'); }

        // ========================= // FORMAT TELEGRAM MESSAGE // ========================= 
        // 
        

        let response = `📊 *LỊCH SỬ PATTERNS TÌM ĐƯỢC*\n\n`;

        const trendEmoji = { up: "⬆️", down: "⬇️", flat: "➡️" };

        statsHistory.forEach((item, index) => {
            const f = item.filteredStats; // thống kê nến kế tiếp trong nhóm CÙNG xu hướng tổng
            const emoji = trendEmoji[item.liveTrend] || "➡️";

            let score = 0;
            if (f) {
                const denom = f.countUp + f.countDown;
                score = denom > 0 ? ((f.countUp - f.countDown) / denom) * 100 : 0;
            }

            response += `*${index + 1}. Length ${item.length}:*\n`;
            response += `Pattern: \`${item.pattern}\`\n`;
            response += `Xu hướng tổng: ${emoji} ${item.liveTrend} (${item.liveNetChangePercent}%)\n`;
            response += `Xuất hiện (chuỗi up/down): ${item.total} lần\n`;
            response += `↳ Cùng xu hướng tổng: ${item.filteredTotal} lần\n`;

            if (f) {
                response += `📈 Nến kế tiếp: Up ${f.up}% (${f.countUp}) | Down ${f.down}% (${f.countDown})\n`;
                response += `📊 Score: ${score.toFixed(2)}%\n\n`;
            } else {
                response += `📈 Nến kế tiếp: chưa có dữ liệu cùng xu hướng tổng\n\n`;
            }
        });
        // ========================= // THÊM KẾT QUẢ DỰ ĐOÁN // ========================= 
        // 

        // ========================= // CUMULATIVE SCORE // ========================= 
        // 

        // ========================= // FINAL SIGNAL // ========================= 
        // 

        // ========================= // SEND TELEGRAM // ========================= 
        // 
        if (response.length > 4096) {
            const chunks = response.match(/[\s\S]{1,4096}/g);
            for (const chunk of chunks) { await ctx.replyWithMarkdown(chunk); }
        }
        else {
            await ctx.replyWithMarkdown(response);

        }
    }


    // 4h

    if (message.startsWith('find4h')) {
        await ctx.reply('⏳ Đang tìm pattern 4h dài nhất... Vui lòng chờ');
        const statsHistory4h = await findLongestPattern4h();
        if (statsHistory4h.length === 0) { return ctx.reply('❌ Không tìm thấy pattern nào'); }
        // ========================= // TẠO TÍN HIỆU + CỘNG DỒN 
        // // ========================= 

        // ========================= // FORMAT TELEGRAM MESSAGE // ========================= 
        // 
        let response4h = `📊 *LỊCH SỬ PATTERNS TÌM ĐƯỢC*\n\n`;

        const trendEmoji = { up: "⬆️", down: "⬇️", flat: "➡️" };

        statsHistory4h.forEach((item, index) => {
            const f = item.filteredStats; // thống kê nến kế tiếp trong nhóm CÙNG xu hướng tổng
            const emoji = trendEmoji[item.liveTrend] || "➡️";

            let score = 0;
            if (f) {
                const denom = f.countUp + f.countDown;
                score = denom > 0 ? ((f.countUp - f.countDown) / denom) * 100 : 0;
            }

            response4h += `*${index + 1}. Length ${item.length}:*\n`;
            response4h += `Pattern: \`${item.pattern}\`\n`;
            response4h += `Xu hướng tổng: ${emoji} ${item.liveTrend} (${item.liveNetChangePercent}%)\n`;
            response4h += `Xuất hiện (chuỗi up/down): ${item.total} lần\n`;
            response4h += `↳ Cùng xu hướng tổng: ${item.filteredTotal} lần\n`;

            if (f) {
                response4h += `📈 Nến kế tiếp: Up ${f.up}% (${f.countUp}) | Down ${f.down}% (${f.countDown})\n`;
                response4h += `📊 Score: ${score.toFixed(2)}%\n\n`;
            } else {
                response4h += `📈 Nến kế tiếp: chưa có dữ liệu cùng xu hướng tổng\n\n`;
            }
        });
        // ========================= // THÊM KẾT QUẢ DỰ ĐOÁN // ========================= 
        // 

        // ========================= // SEND TELEGRAM // ========================= 
        // 
        if (response4h.length > 4096) {
            const chunks4h = response4h.match(/[\s\S]{1,4096}/g);
            for (const chunk4h of chunks4h) { await ctx.replyWithMarkdown(chunk4h); }
        }
        else {
            await ctx.replyWithMarkdown(response4h);

        }
    }


    // 1day

    if (message.startsWith('find1d')) {
        await ctx.reply('⏳ Đang tìm pattern 1d dài nhất... Vui lòng chờ'); const statsHistory1d = await findLongestPattern1d(); if (statsHistory1d.length === 0) { return ctx.reply('❌ Không tìm thấy pattern nào'); }
        // ========================= // TẠO TÍN HIỆU + CỘNG DỒN 
        // // ========================= 

        // ========================= // FORMAT TELEGRAM MESSAGE // ========================= 
        // 
        let response1d = `📊 *LỊCH SỬ PATTERNS TÌM ĐƯỢC*\n\n`;
        statsHistory1d.forEach((item, index) => {
            const score = item.countUp - item.countDown;
            response1d += `*${index + 1}. Length ${item.length}:*\n`;
            response1d += `Pattern: \`${item.pattern}\`\n`;
            response1d += `Xuất hiện: ${item.total} lần\n`;
            response1d += `📈 Up: ${item.up}% (${item.countUp}) | Down: ${item.down}% (${item.countDown})\n`; response1d += `📊 Score: ${score}\n\n`;
        });
        // ========================= // THÊM KẾT QUẢ DỰ ĐOÁN // ========================= 
        // 
        response1d += `📌 *TÍN HIỆU DỰ ĐOÁN*\n\n`;
        response1d += signalText.join(' → ') + '\n\n';
        response1d += signalEmoji.join(' ') + '\n\n';

        // ========================= // SEND TELEGRAM // ========================= 
        // 
        if (response1d.length > 4096) {
            const chunks1d = response1d.match(/[\s\S]{1,4096}/g);
            for (const chunk1d of chunks1d) { await ctx.replyWithMarkdown(chunk1d); }
        }
        else {
            await ctx.replyWithMarkdown(response1d);

        }
    }

});

bot.launch();