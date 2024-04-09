import { ILuisData } from '../types/luis';
import fetch from 'node-fetch';
import logger from '../models/logger';

export const getIntent = async (url: string, text: string): Promise<ILuisData> => {
  try {
    const res = await fetch(url + 'q=' + encodeURIComponent(text), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const body: ILuisData = await res.json();
    return body;
  } catch (error) {
    logger.error({ error, location: 'luis.services' });
    return undefined;
  }
};
