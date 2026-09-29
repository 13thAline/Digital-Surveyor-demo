import express from 'express';
import axios from 'axios';

const router = express.Router();
const aiServerUrl = process.env.AI_SERVER_URL || 'http://localhost:8000';

// Keep the AI service's internal address off the mobile client.
router.get('/:filename', async (req, res) => {
    const { filename } = req.params;
    if (!/^[a-zA-Z0-9_-]+\.(?:jpg|jpeg|png)$/i.test(filename)) {
        return res.status(400).json({ error: 'Invalid image filename.' });
    }
    try {
        const response = await axios.get(`${aiServerUrl}/uploads/${filename}`, {
            responseType: 'arraybuffer',
            timeout: 15000,
            maxContentLength: 20 * 1024 * 1024,
            maxRedirects: 0,
        });
        res.type(response.headers['content-type'] || 'image/jpeg');
        res.send(Buffer.from(response.data));
    } catch (error) {
        res.status(error.response?.status === 404 ? 404 : 502)
            .json({ error: 'Image unavailable.' });
    }
});

export default router;
