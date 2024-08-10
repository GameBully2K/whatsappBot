import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

export const redisClient = await createClient({
    password: process.env.REDIS_PASS,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
})
.on('error', err => console.log('Redis Client Error', err))
.connect(console.log("Connected to redis"));