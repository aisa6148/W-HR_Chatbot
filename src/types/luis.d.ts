export interface IIntent {
  intent: string;
  score: number;
}
export interface IEntities {
  entity: string;
  type: string;
  startIndex: number;
  endIndex: number;
  score: number;
}
export interface ILuisData {
  query: string;
  topScoringIntent: IIntent;
  intents: IIntent[];
  entities: IEntities[];
}
