import { Request, Response, NextFunction } from 'express';
import { Activity } from 'botbuilder';
import logger from '../models/logger';
import config from '../configs/config';
import { sendZoomNotification } from '../channels/zoom';
import { birthdayNotificationBody } from '../services/associate.services';
import createError from 'http-errors';
import { IMessage } from '../types/Message';
import { IBirthdayNotification } from '../types/Notification';
import * as slack from '../channels/slack';
import * as facebook from '../channels/facebook';
import mailerServices from '../services/mailer.services';
import { notifyUser, notifySlackUser } from '../utilities/helper.functions';
import { GREETING_BUTTONS, GREETING_BUTTONS_NOTIFICATIONS } from '../configs/bot.constants';
import { getAssociatesWithWorkAnniversaryDate } from '../services/associate.services';
import { logNotifications, logNotificationJobs } from '../models/logger';
const moment = require('moment');
const axios = require('axios');
const { QueueServiceClient } = require('@azure/storage-queue');
const connectionString = process.env.AZURE_STORAGE_ACCOUNT_CONNECTION_STRING;
const queueName = process.env.STORAGE_QUEUE_NAME;

interface INotification {
	message: IMessage[];
	emails: string[];
	channel: string;
	createdBy: string;
	jobId: string;
}

async function channelNotification(body: INotification) {
	const messages = body['message'];
	const channel = body['channel'];
	const createdBy = body['createdBy'];
	const jobId = body['jobId'];
	for (let i = 0; i < body['emails'].length; i++) {
		const email = body['emails'][i];
		if (channel === 'slack') {
			try {
				const user = await slack.getUserByEmail(email);
				const address: Partial<Activity> = {
					from: user,
					recipient: {
						id: config.slackBotId,
						name: config.slackBotName,
					},
					channelId: 'slack',
					serviceUrl: 'https://slack.botframework.com/',
				};
				await notifySlackUser(address, messages);
				logNotifications(email, true, createdBy, jobId);
			} catch (error) {
				logger.error({ location: '/api/notify fetch slack', error: error });
				logNotifications(email, false, createdBy, jobId);
			}
		}
		else if (channel === 'zoom') {
			try {
				sendZoomNotification(email, messages, createdBy, jobId);
			}
			catch (error) {
				logger.error({ location: '/api/notify zoom', error: error });
			}
		}
		else if (channel === 'facebook') {
			try {
				const user = await facebook.getUserByEmail(email);
				const address: Partial<Activity> = {
					from: user,
					recipient: {
						id: config.facebookBotId,
						name: config.facebookBotName,
					},
					channelId: 'facebook',
					serviceUrl: 'https://facebook.botframework.com',
				};
				await notifyUser(address, messages);
			} catch (error) {
				logger.error({ location: '/api/notify fetch facebook', error: error });
			}
		} else {
			try {
				let emailText = '';
				for (const message of messages) {
					if (!message.buttons) {
						emailText = emailText + message.text + '\n\n';
					}
				}
				const emailHtml = emailText
					.replace(/\n/g, '<br/>') // Replace each \n with <br/>
					.replace(/_([^_]*)_/g, '<i>$1</i>'); // Replace each pair of _ with <i> </i> pair.
				await mailerServices.sendAnswer(
					email,
					`${emailHtml}<br/><br/>Best Regards,<br/>Ask ME`,
				);
			} catch (error) {
				logger.error({ location: '/api/notify fetch webchat', error: error });
			}
		}
	}
}

export const notifyMessage = async function (req: Request, res: Response, next: NextFunction) {
	try {
		logger.debug({
			location: '/api/message-notification endpoint',
			body: req.body,
			notifyKey: config.notifyKey,
		});
		channelNotification(req.body);
		res.send('Completed');
	} catch (error) {
		logger.error({ location: '/api/message-notification endpoint', error });
		next(new createError.InternalServerError('Internal server error'));
	}
};
export const startNotifications = async function (req: Request, res: Response, next: NextFunction) {
	try {
		logger.log({ location: 'startNotifications', body: req.body.notificationId });
		await logNotificationJobs(req.body);
		sendAllNotifications();
		res.send('Notifications Started');
	} catch (error) {
		logger.error({ location: '/api/start-notifications endpoint', error });
		next(new createError.InternalServerError('Internal server error'));
	}
};
export const notifyBirthday = async function (req: Request, res: Response, next: NextFunction) {
	try {
		logger.log({ location: '/api/birthdayNotify endpoint', body: req.body });
		res.send('Started Birthday Notification').status(200);
		const birthdayGroup: IBirthdayNotification[] = await birthdayNotificationBody();
		for (const associateInfo of birthdayGroup) {
			const message = [
				{
					image: config.linktogif,
				},
				{
					text:
						'Hi ' +
						associateInfo['name'] +
						',\n\nHappy birthday!🎂\n\nHere’s wishing you prosperity and great success in the year ahead! \n\nHope you have an amazing day! Stay blessed! 🎉\n\nAnd if you need any assitance, I am at your service 🧞. Click on the following to get started:',
				},
				{
					buttons: GREETING_BUTTONS_NOTIFICATIONS,
				}
			];
			const body = {
				emails: associateInfo['emails'],
				message: message,
				channel: associateInfo['channel'],
				createdBy: 'FunctionApp',
				jobId: ''
			};
			await channelNotification(body);
			const teamEmail = [];
			for (const member of associateInfo['team']) {
				teamEmail.push(member.email);
			}
			let apostrophe = '';
			if (typeof associateInfo['name'] === 'string') {
				if (associateInfo['name'].endsWith('s')) {
					apostrophe = "'";
				} else {
					apostrophe = "'s";
				}
			}
			const teamMessage = [
				{
					text:
						'Hey! It’s ' +
						associateInfo['name'] +
						apostrophe +
						' birthday today. Don’t forget to celebrate a fellow associate’s special day 🎉',
				},
			];
			const teamBody = {
				emails: teamEmail,
				message: teamMessage,
				channel: associateInfo['channel'],
				createdBy: 'Function App',
				jobId: ''
			};
			await channelNotification(teamBody);
		}
	} catch (error) {
		logger.error({ location: '/api/birthday-notify endpoint', error });
		next(new createError.InternalServerError('Internal server error'));
	}
};

export const notifyWorkAnniversary = async function (
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		res.send('Started Work Anniversary Notification').status(200);
		logger.log({ location: '/notify/workAnniversaryNotify endpoint', body: req.body });
		const associatesWithWorkAnniversary: any =
			(await getAssociatesWithWorkAnniversaryDate(Date.now())) || [];
		for (const associate of associatesWithWorkAnniversary) {
			try {
				const years = moment(Date.now()).year() - moment(associate.hireDate).year();
				const yearText = years > 1 ? 'years' : 'year';
				const message = [
					{
						image: config.imgWorkAnniversary,
					},
					{
						text: 'If you need any assistance, I am at your service 🧞. Click on the following to get started:',
					},
					{
						buttons: GREETING_BUTTONS_NOTIFICATIONS,
					}
				];
				const teamBody = {
					emails: [associate.email],
					message: message,
					channel: 'slack',
					createdBy: 'Function App',
					jobId: ''
				};
				await channelNotification(teamBody);
			} catch (error) {
				logger.error({
					location: '/api/work-anniversary-notify endpoint associate loop',
					error,
				});
			}
		}
	} catch (error) {
		logger.error({ location: '/api/work-anniversary-notify endpoint', error });
		next(new createError.InternalServerError('Internal server error'));
	}
};




export const notifySlackChannel = async function (
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		const url = config.slackChannelUrl;
		axios.get(url)
			.then(function (response: any) {
				logger.log('successfully messaged slack channel');
				res.end();
			})
			.catch(function (error: any) {
				logger.error({ location: '/api/notify-slack-channel endpoint', error });
				res.end();
			});

	} catch (error) {
		logger.error({ location: '/api/work-anniversary-notify endpoint', error });
		next(new createError.InternalServerError('Internal server error'));
	}
};


async function sendAllNotifications() {
	try {
		const queueServiceClient = QueueServiceClient.fromConnectionString(connectionString);
		const queueClient = queueServiceClient.getQueueClient(queueName);
		let properties = await queueClient.getProperties();
		logger.log({ location: 'sendAllNotifications', propertiesApproximateMessagesCount: properties.approximateMessagesCount });
		while (properties.approximateMessagesCount > 0) {
			const response = await queueClient.receiveMessages();
			if (response.receivedMessageItems.length === 1) {
				const receivedMessageItem = response.receivedMessageItems[0];
				const messageBody = JSON.parse(receivedMessageItem.messageText);
				logger.log({ location: 'deleting message with body:', body: messageBody, propertiesApproximateMessagesCount: properties.approximateMessagesCount });
				// sendNotification
				await channelNotification(messageBody);
				logger.log('notification for batch sent');
				const deleteMessageResponse = await queueClient.deleteMessage(
					receivedMessageItem.messageId,
					receivedMessageItem.popReceipt
				);
			}
			properties = await queueClient.getProperties();
		}
		logger.log({ location: 'sendAllNotifications', message: 'Notifications finished' });
	}
	catch (error) {
		logger.error({ location: 'sendAllNotifications', error });
	}
}