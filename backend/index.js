const express = require("express");
const cors = require("cors");
const tilelive = require("@mapbox/tilelive");
require("@mapbox/mbtiles").registerProtocols(tilelive);
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors()); 

// --- CẤU HÌNH ---
const PORT = 3000;
const YEARS = ['2017', '2023', '2025'];
const MBTILES_SOURCES = {}; 

// Hàm load nguồn bản đồ (có Low và High)
async function loadAllMBTiles() {
    console.log("⏳ Đang khởi động hệ thống bản đồ...");

    for (const year of YEARS) {
        MBTILES_SOURCES[year] = {}; // Tạo object rỗng cho năm đó

        // 1. Load File LOW (Toàn cảnh)
        const lowPath = path.resolve(__dirname, `mbtiles/${year}_low.mbtiles`);
        if (fs.existsSync(lowPath)) {
            try {
                MBTILES_SOURCES[year]['low'] = await loadSource("mbtiles://" + lowPath);
                console.log(`   ✅ ${year} [LOW] - Đã nạp xong.`);
            } catch (e) {
                console.error(`   ❌ Lỗi file LOW năm ${year}:`, e.message);
            }
        } else {
            console.warn(`   ⚠️ Không tìm thấy file LOW cho năm ${year}`);
        }

        // 2. Load File HIGH (Chi tiết)
        const highPath = path.resolve(__dirname, `mbtiles/${year}_high.mbtiles`);
        if (fs.existsSync(highPath)) {
            try {
                MBTILES_SOURCES[year]['high'] = await loadSource("mbtiles://" + highPath);
                console.log(`   ✅ ${year} [HIGH] - Đã nạp xong.`);
            } catch (e) {
                console.error(`   ❌ Lỗi file HIGH năm ${year}:`, e.message);
            }
        } else {
            console.warn(`   ⚠️ Không tìm thấy file HIGH cho năm ${year}`);
        }
    }
}

// Hàm phụ trợ (Promise wrapper)
function loadSource(path) {
    return new Promise((resolve, reject) => {
        tilelive.load(path, (err, source) => {
            if (err) reject(err); else resolve(source);
        });
    });
}

// --- KHỞI ĐỘNG SERVER ---
loadAllMBTiles().then(() => {
    
    // API Route: /tiles/2017/low/14/100/200.jpeg
    app.get("/tiles/:year/:type/:z/:x/:y.jpeg", (req, res) => {
        const { year, type, z, x, y } = req.params; 

        // Kiểm tra xem nguồn có tồn tại không
        if (!MBTILES_SOURCES[year] || !MBTILES_SOURCES[year][type]) {
            return res.status(404).send("Source map not found");
        }

        // Lấy tile từ mbtiles
        MBTILES_SOURCES[year][type].getTile(z, x, y, (err, tile, headers) => {
            if (err) {
                // Nếu không có tile (do zoom ra ngoài vùng), trả về 404
                return res.status(404).send("Tile not found");
            }

            // Set Header để trình duyệt hiểu là ảnh và lưu cache
            res.set("Content-Type", "image/jpeg");
            res.set("Cache-Control", "public, max-age=31536000"); // Cache 1 năm
            res.send(tile);
        });
    });

    // Lắng nghe cổng 3000
    app.listen(PORT, () => {
        console.log(`🚀 Server bản đồ đang chạy tại: http://localhost:${PORT}`);
    });

}).catch(err => {
    console.error("❌ Lỗi nghiêm trọng khi khởi động Server:", err);
});