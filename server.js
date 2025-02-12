import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
    origin: "*", // 允许所有来源，测试阶段先这样，生产环境再限定
    methods: ["GET", "POST", "OPTIONS"], // 确保 OPTIONS 请求也被允许
    allowedHeaders: ["Content-Type", "Authorization"], // 确保 Authorization 头部也被允许
};
app.use(cors(corsOptions));



app.use(cors(corsOptions)); // 使用 CORS 中间件
app.use(express.json());

const API_KEY = process.env.API_KEY;
const APP_ID = process.env.APP_ID;
const API_URL = `https://dashscope.aliyuncs.com/api/v1/apps/${APP_ID}/completion`;

app.post("/api/chat", async (req, res) => {
    try {
        const userMessage = req.body.message;

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({ input: { prompt: userMessage } }),
        });

        if (!response.ok) {
            return res.status(response.status).json({ error: "API 请求失败" });
        }

        const responseText = await response.text();
        res.setHeader("Content-Type", "text/plain");
        res.send(responseText);
    } catch (error) {
        console.error("服务器错误:", error);
        res.status(500).json({ error: "服务器错误" });
    }
});

app.listen(PORT, () => {
    console.log(`后端服务器运行在 http://localhost:${PORT}`);
});
