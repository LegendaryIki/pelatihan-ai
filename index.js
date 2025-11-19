// Import library yang diperlukan
import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import { GoogleGenAI } from '@google/genai';

// === 1. DETEKTIF .ENV (Cek Kunci Dulu) ===
console.log("--------------------------------------------------");
console.log("🕵️  SEDANG MEMERIKSA API KEY...");

if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GAGAL TOTAL: File .env tidak terbaca!");
    console.error("   Penyebab 1: Nama file adalah '.env.txt' (bukan .env)");
    console.error("   Penyebab 2: Lupa save file .env");
    console.error("   Penyebab 3: Isi file .env salah ketik");
    process.exit(1); // MATIKAN SERVER OTOMATIS
} else {
    console.log("✅ BERHASIL: API Key ditemukan!");
    // Tampilkan 5 huruf depan saja biar aman
    console.log("   Kunci: " + process.env.GEMINI_API_KEY.slice(0, 5) + "...");
}
console.log("--------------------------------------------------");

// buat variable app untuk express
const app = express();

// buat variable upload untuk multer
const upload = multer();

// buat variable untuk akses GoogleGenAi
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// buat variable gemini model yang akan digunakan
const GEMINI_MODEL = "gemini-2.0-flash";

app.use(express.json());

// Kita akan jalankan di local PORT 3000
const PORT = 3000;
app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));

// endpoint POST untuk generate text /generate-text
app.post('/generate-text', async (req, res) => {
    const { prompt } = req.body;

    try {
        // variable response berisi content yang digenerate oleh gemini
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt,
        });

        res.status(200).json({ result: response.text })
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: e.message });
    }
})


// endpoint POST untuk generate from image /generate-from-image
app.post('/generate-from-image', upload.single('image'), async (req, res) => {
    const { prompt } = req.body;
    const base64Image = req.file.buffer.toString('base64');

    try {
        // variable response berisi content yang digenerate oleh gemini
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                { text: prompt, type: 'text' },
                { inlineData: { data: base64Image, mimeType: req.file.mimetype } }
            ],
        });

        res.status(200).json({ result: response.text })
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: e.message });
    }
})
// endpoint POST untuk generate from image /generate-from-document
app.post('/generate-from-document', upload.single('document'), async (req, res) => {
    const { prompt } = req.body;
    const base64Document = req.file.buffer.toString('base64');

    try {
        // variable response berisi content yang digenerate oleh gemini
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                { text: prompt ?? "Tolong buat ringkasan dari dokumen berikut: ", type: 'text' },
                { inlineData: { data: base64Document, mimeType: req.file.mimetype } }
            ],
        });

        res.status(200).json({ result: response.text })
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: e.message });
    }
})