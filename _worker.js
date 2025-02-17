export default {
  async fetch(request, env) {
    // 允许所有请求方法的 CORS 预检
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // 只处理 POST 请求
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      });
    }

    try {
      const body = await request.json();
      const { message, session_id } = body;

      if (!message) {
        return new Response(JSON.stringify({ error: "消息不能为空" }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const API_URL = `https://dashscope.aliyuncs.com/api/v1/apps/${env.APP_ID}/completion`;
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
          'Authorization': `Bearer ${env.API_KEY}`,
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
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};
