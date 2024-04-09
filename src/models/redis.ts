import logger from '../models/logger';
import redis from 'redis';
import bluebird from 'bluebird';
import config from '../configs/config';
const redisConfig = config.redis;

export class Redis {
    private client: redis.RedisClient;
    constructor() {
        bluebird.promisifyAll(redis.RedisClient.prototype);
        bluebird.promisifyAll(redis.Multi.prototype);
        this.client = redis.createClient(6380, redisConfig.tls.servername, redisConfig);
        this.client.on('error', function (error) {
            logger.error({ location: 'redis initialization', error: error });
        });
    }
    public async get(key: string): Promise<string> {
        return new Promise((resolve, reject) => {
            this.client.get(key, (error: Error | null, reply: string) => error ? reject(error) : resolve(reply));
        });
    }
    public set(key: string, value: string, mode: string, duration: number): boolean {
        return this.client.set(key, value, mode, duration);
    }
}