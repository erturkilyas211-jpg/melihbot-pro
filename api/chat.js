// Eski usül, sağlam kütüphane çağrısı
const { GoogleGenerativeAI } = require("@google/generative-ai");

// API Anahtarını al
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Mod Ayarları (Senin Kişiliklerin)
const MODES = {
    assistant: "Sen MelihBot adında yardımsever bir asistansın. Kısa ve net cevap ver.",
    coder: "Sen Kıdemli bir Yazılımcısın. Sadece kod odaklı konuş.",
    creative: "Sen yaratıcı bir yazarsın. Hikaye anlatır gibi konuş.",
    troll: "Sen komik ve şakacı bir botsun."
};

module.exports = async (req, res) => {
    // Sadece POST isteği
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { history, mode } = req.body;

        // Geçmişi hazırla
        // (Eski kütüphanede format biraz farklıdır, burası doğru format)
        const chatHistory = history.slice(0, -1).map(msg => ({
            role: msg.role === 'model' ? 'model' : 'user',
            parts: [{ text: msg.text }]
        }));

        const lastMessage = history[history.length - 1].text;
        
        // Modeli seç (gemini-pro bu kütüphanede standarttır)
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Sohbeti başlat
        const chat = model.startChat({
            history: chatHistory,
            // Sistem talimatını bu eski kütüphanede mesajın başına ekleyerek simüle ediyoruz
        });

        // Mod talimatını mesajın başına ekleyerek gönder (Prompt Engineering)
        const instruction = MODES[mode] || MODES.assistant;
        const fullMessage = `SYSTEM: ${instruction}\nUSER: ${lastMessage}`;

        const result = await chat.sendMessage(fullMessage);
        const response = result.response.text();

        res.status(200).json({ reply: response });

    } catch (error) {
        console.error("API Hatası:", error);
        res.status(500).json({ reply: "Hata oluştu: " + error.message });
    }
};