import rawData from '../../game/data/data.json';
import type { GameData } from '../types/data';

export const gameData = rawData as unknown as GameData;
