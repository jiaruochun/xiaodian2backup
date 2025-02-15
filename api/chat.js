import axios from 'axios';
import dotenv from "dotenv";

dotenv.config();

function getRequestBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch (error) {
                reject(error);
            }
        });
        req.on('error', reject);
    });
}

export default async function handler(req, res) {
    // 设置 SSE 头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === "OPTIONS") {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.method !== "POST") {
        res.write(`data: ${JSON.stringify({ error: "仅支持 POST 请求" })}\n\n`);
        res.end();
        return;
    }

    try {
        const body = await getRequestBody(req);
        const { message, session_id } = body;

        if (!message) {
            res.write(`data: ${JSON.stringify({ error: "消息不能为空" })}\n\n`);
            res.end();
            return;
        }

        const API_KEY = process.env.API_KEY;
        const APP_ID = process.env.APP_ID;
        
        if (!API_KEY?.trim() || !APP_ID?.trim()) {
            res.write(`data: ${JSON.stringify({ error: "服务器环境变量缺失" })}\n\n`);
            res.end();
            return;
        }

        const API_URL = `https://dashscope.aliyuncs.com/api/v1/apps/${APP_ID}/completion`;
        const requestBody = {
            input: { prompt: message },
            parameters: {
                'incremental_output': true
            },
            debug: {}
        };

        if (session_id) {
            requestBody.input.session_id = session_id;
        }

        const response = await axios.post(API_URL, requestBody, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'X-DashScope-SSE': 'enable'
            },
            responseType: 'stream'
        });

        response.data.on('data', chunk => {
            const text = chunk.toString();
            if (text.trim()) {
                res.write(`data: ${text}\n\n`);
            }
        });

        response.data.on('end', () => {
            res.end();
        });

    } catch (error) {
        console.error("服务器错误:", error);
        res.write(`data: ${JSON.stringify({ error: "服务器错误" })}\n\n`);
        res.end();
    }
}
