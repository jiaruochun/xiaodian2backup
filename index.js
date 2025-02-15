import http from 'http';
import handler from './api/chat.js';

const server = http.createServer(async (req, res) => {
    try {
        await handler(req, res);
    } catch (error) {
        console.error('处理请求时发生错误:', error);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: '服务器内部错误' }));
    }
});

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
