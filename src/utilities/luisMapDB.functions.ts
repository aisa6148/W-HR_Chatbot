import { Redis } from '../models/redis.js';
import { fetchLuisMapFromDB } from '../models/luisMapDB';
import logger from '../models/logger';
import { ILuisMapData } from '../types/luisMap.js';
const redisStore = new Redis();

export const fetchLuisMap = async (intent: string): Promise<ILuisMapData> => {
  logger.debug({ location: 'fetchLuisMap', intent: intent });
  return new Promise(async function(resolve, reject) {
    try {
      const fetchedData = await redisStore.get(intent);
      if (fetchedData == undefined) {
        logger.debug({ location: 'fetchLuisMap', intent: intent, message: 'fetch from db' });
        const data = await fetchLuisMapFromDB(intent);
        if (data) {
          redisStore.set(intent, JSON.stringify(data), 'EX', 3600);
          resolve(data);
        } else {
          logger.log({ location: 'fetchLuisMap', intent: intent, message: 'no data found' });
          resolve(undefined);
        }
      } else {
        logger.debug({ location: 'fetchLuisMap', intent: intent, message: 'fetch from redis' });
        resolve(JSON.parse(fetchedData));
      }
    } catch (error) {
      logger.error({ location: 'fetchLuisMap', error: error });
      reject(error);
    }
  });
};
