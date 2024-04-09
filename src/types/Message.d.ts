export interface IButton {
  display: string;
  value: string;
}

export interface IMessage {
  text?: string;
  feedback?: boolean;
  buttons?: IButton[];
  image?: string;
}
