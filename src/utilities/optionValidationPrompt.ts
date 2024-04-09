import { TextPrompt, Choice } from 'botbuilder-dialogs';
import logger from '../models/logger';
import { REPLY_TEXTS } from '../configs/bot.constants';

class OptionValidationPrompt extends TextPrompt {
  constructor(dialogId: string) {
    super(dialogId, async prompt => {
      if (!prompt.recognized.succeeded) {
        await prompt.context.sendActivity(REPLY_TEXTS.VALIDATE_BUTTONS);
        return false;
      } else {
        try {
          const value = prompt.recognized.value;
          const options: (string | Choice)[] = prompt.options.choices;
          if (options) {
            if (options.includes(value)) {
              return true;
            } else {
              await prompt.context.sendActivity(REPLY_TEXTS.VALIDATE_BUTTONS);
              return false;
            }
          }
        } catch (error) {
          logger.error({
            location: 'OptionValidationPrompt prompt',
            error: error
          });
        }
      }
    });
  }
}

export { OptionValidationPrompt };
