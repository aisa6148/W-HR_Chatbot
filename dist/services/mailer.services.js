"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../models/logger"));
const config_1 = __importDefault(require("../configs/config"));
const mail_1 = __importDefault(require("@sendgrid/mail"));
class Mail {
    constructor() {
        this.apikey = config_1.default.sendgridAPIKey;
        mail_1.default.setApiKey(this.apikey);
    }
    // Customizable email
    sendMail(to, replyTo, subject, content) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const mailOptions = {
                    from: config_1.default.emailOptions.from,
                    to,
                    subject,
                    html: content
                };
                if (replyTo)
                    mailOptions.replyTo = replyTo;
                logger_1.default.log({ mailOptions });
                yield mail_1.default.send(mailOptions);
            }
            catch (e) {
                logger_1.default.error({ location: 'mailer sendMail', error: e });
            }
        });
    }
    sendMultipleMails(to, replyTo, subject, content) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const email of to) {
                yield this.sendMail(email, replyTo, subject, content);
            }
        });
    }
    sendAnswer(email, message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let to = email;
                if (email.includes(',')) {
                    const emails = email.split(',');
                    to = [];
                    emails.forEach(e => to.push({ email: e }));
                }
                const mailOptions = {
                    from: config_1.default.emailOptions.from,
                    to: to,
                    cc: '',
                    replyTo: email,
                    subject: 'Answer from Ask ME',
                    html: ''
                };
                mailOptions.html = message;
                logger_1.default.log({ location: 'mailer send sending mail', mailOptions: mailOptions });
                yield mail_1.default.send(mailOptions);
            }
            catch (e) {
                logger_1.default.error({ location: 'mailer send answer', error: e });
            }
        });
    }
    mailOnUndefinedGTSID(email, message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const to = config_1.default.emailOptions.to;
                const mailOptions = {
                    from: config_1.default.emailOptions.from,
                    to: to,
                    cc: '',
                    subject: 'Ask ME: User Unavailable',
                    html: ''
                };
                mailOptions.html = message;
                logger_1.default.debug({ location: 'mailOnUndefinedGTSID', mailOptions: mailOptions });
                yield mail_1.default.send(mailOptions);
            }
            catch (error) {
                logger_1.default.error({
                    location: 'mailOnUndefinedGTSID',
                    error,
                    message: error.message,
                    stack: error.stack
                });
            }
        });
    }
}
exports.default = new Mail();
//# sourceMappingURL=mailer.services.js.map