import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
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

        const responseJson = await response.json();
        res.json({ output: responseJson });
    } catch (error) {
        console.error("服务器错误:", error);
        res.status(500).json({ error: "服务器错误" });
    }
});

// ✅ 关键改动：Vercel 需要导出 API 处理函数
export default app;
