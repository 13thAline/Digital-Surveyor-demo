import { Router, Request, Response } from 'express';

export const healthRouter = Router();

healthRouter.get('/', (req: Request, res: Response) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        services: {
            api: 'online',
            database: 'not configured', // Will update when DB is connected
            aiServer: 'not configured', // Will check AI server status
        },
    });
});
