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

    const API_KEY = process.env.API_KEY;
    const APP_ID = process.env.APP_ID;
    const API_URL = `https://dashscope.aliyuncs.com/api/v1/apps/${APP_ID}/completion`;

    if (!API_KEY || !APP_ID) {
        return res.status(500).json({ error: "服务器环境变量缺失，请检查 API_KEY 和 APP_ID" });
    }

    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: "消息不能为空" });
        }

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({ input: { prompt: message } }),
        });

        if (!response.ok) {
            return res.status(response.status).json({ error: "API 请求失败" });
        }

        const data = await response.json();
        res.json({ output: data });

        
    } catch (error) {
        console.error("服务器错误:", error);
        res.status(500).json({ error: "服务器错误" });
    }
}
