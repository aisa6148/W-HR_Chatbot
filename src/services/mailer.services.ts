import logger from '../models/logger';
import config from '../configs/config';
import sgMail from '@sendgrid/mail';

class Mail {
  private apikey: string;
  constructor() {
    this.apikey = config.sendgridAPIKey;
    sgMail.setApiKey(this.apikey);
  }
  // Customizable email
  public async sendMail(
    to: string,
    replyTo: string,
    subject: string,
    content: string
  ): Promise<any> {
    try {
      const mailOptions: any = {
        from: config.emailOptions.from,
        to,
        subject,
        html: content
      };
      if (replyTo) mailOptions.replyTo = replyTo;
      logger.log({ mailOptions });
      await sgMail.send(mailOptions);
    } catch (e) {
      logger.error({ location: 'mailer sendMail', error: e });
    }
  }

  public async sendMultipleMails(
    to: string[],
    replyTo: string,
    subject: string,
    content: string
  ): Promise<any> {
    for (const email of to) {
      await this.sendMail(email, replyTo, subject, content);
    }
  }

  public async sendAnswer(email: string, message: string) {
    try {
      let to: { email: string }[] | string = email;
      if (email.includes(',')) {
        const emails = email.split(',');
        to = [];
        emails.forEach(e => (to as { email: string }[]).push({ email: e }));
      }
      const mailOptions = {
        from: config.emailOptions.from,
        to: to,
        cc: '',
        replyTo: email,
        subject: 'Answer from Ask ME',
        html: ''
      };
      mailOptions.html = message;
      logger.log({ location: 'mailer send sending mail', mailOptions: mailOptions });
      await sgMail.send(mailOptions);
    } catch (e) {
      logger.error({ location: 'mailer send answer', error: e });
    }
  }
  public async mailOnUndefinedGTSID(email: string, message: string) {
    try {
      const to: { email: string }[] | string = config.emailOptions.to;
      const mailOptions = {
        from: config.emailOptions.from,
        to: to,
        cc: '',
        subject: 'Ask ME: User Unavailable',
        html: ''
      };
      mailOptions.html = message;
      logger.debug({ location: 'mailOnUndefinedGTSID', mailOptions: mailOptions });
      await sgMail.send(mailOptions);
    } catch (error) {
      logger.error({
        location: 'mailOnUndefinedGTSID',
        error,
        message: error.message,
        stack: error.stack
      });
    }
  }
}

export default new Mail();
