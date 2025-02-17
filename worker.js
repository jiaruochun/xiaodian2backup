import { Router } from 'itty-router';

const router = Router();

router.post('/api/chat', async request => {
  try {
    const body = await request.json();
    const { message, session_id } = body;

    if (!message) {
      return new Response(JSON.stringify({ error: "消息不能为空" }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const API_KEY = process.env.API_KEY;
    const APP_ID = process.env.APP_ID;

    if (!API_KEY?.trim() || !APP_ID?.trim()) {
      return new Response(JSON.stringify({ error: "服务器环境变量缺失" }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
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

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'X-DashScope-SSE': 'enable'
      },
      body: JSON.stringify(requestBody)
    });

    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: "服务器错误" }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
});

router.options('/api/chat', () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
});

addEventListener('fetch', event => {
  event.respondWith(router.handle(event.request));
});
