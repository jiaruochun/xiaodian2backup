import { buffer } from "micro"; // Vercel 解析 body 需要 buffer
import fetch from "node-fetch";

export default async function handler(req, res) {
    // 允许跨域请求
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    // 处理 OPTIONS 预检请求
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "仅支持 POST 请求" });
    }

    try {
        // 解析 JSON 请求体
        const rawBody = await buffer(req);
        const body = JSON.parse(rawBody.toString());
        console.log("请求体:", body); // 调试日志

        const { message, session_id } = body;

        if (!message) {
            return res.status(400).json({ error: "消息不能为空" });
        }

        // 读取环境变量
        const API_KEY = process.env.API_KEY;
        const APP_ID = process.env.APP_ID;
        if (!API_KEY?.trim() || !APP_ID?.trim()) {
            return res.status(500).json({ error: "服务器环境变量缺失" });
        }

        // API 请求地址
        const API_URL = `https://dashscope.aliyuncs.com/api/v1/apps/${APP_ID}/completion`;

        // 构造请求体
        const requestBody = {
            input: { prompt: message },
            parameters: {},
            debug: {}
        };

        // 如果前端传了 session_id，则加上
        if (session_id) {
            requestBody.input.session_id = session_id;
        }

        console.log("请求 DashScope API:", requestBody); // 调试 API 请求

        // 发送请求到阿里百炼 API
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`,
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("API 请求失败:", errorText);
            return res.status(response.status).json({ error: "API 请求失败", details: errorText });
        }

        const data = await response.json();
        console.log("API 响应:", data); // 打印 API 响应

        res.json({
            output: data.output,
            session_id: data.output?.output?.session_id || session_id  // 确保返回 session_id
        });

    } catch (error) {
        console.error("服务器错误:", error);
        res.status(500).json({ error: "服务器错误" });
    }
}

// 关闭 Vercel 的 body 解析，防止冲突
export const config = {
    api: {
        bodyParser: false
    }
};
