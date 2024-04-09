import { IMessage } from './Message';

export interface ILuisMapData {
  id: string;
  messages?: IMessage[];
  type: string;
  value?: string;
  contexts?: {
    [index: string]: {
      [index: string]:
        | {
            messages: IMessage[];
          }
        | IMessage[];
    };
  };
}
