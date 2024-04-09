import {
	ConversationState,
	UserState,
	StatePropertyAccessor,
	TurnContext,
	ActivityTypes,
	Activity,
	ResourceResponse,
	BotFrameworkAdapter,
} from 'botbuilder';
import * as uuid from 'uuid';
import logger from '../models/logger';
import ChatLogger from '../models/bot-logger/chatlogger';
import { getUserInfo } from '../channels/channel-handler';
import config from '../configs/config';
import { STATE_PROPERTY_NAMES } from '../configs/bot.constants';

const CURRENT_USER = STATE_PROPERTY_NAMES.CURRENT_USER || 'current-user';
const CURRENT_USER_CONVERSATION =
	STATE_PROPERTY_NAMES.CURRENT_USER_CONVERSATION || 'current-user-conversation';
const PROFILE_CONVERSATION_START =
	STATE_PROPERTY_NAMES.PROFILE_CONVERSATION_START || 'profile-conversation-start';
const PROFILE_CONVERSATION_LAST =
	STATE_PROPERTY_NAMES.PROFILE_CONVERSATION_LAST || 'profile-conversation-last';
const QUERY_PARAMS = STATE_PROPERTY_NAMES.QUERY_PARAMS || 'query-profile';

export interface IBotLoggerResourceResponse extends ResourceResponse {
	documentID?: string;
}

export { BotLoggerMiddleware, QUERY_PARAMS };

class BotLoggerMiddleware {
	private adapter: BotFrameworkAdapter;
	private conversationState: ConversationState;
	private userState: UserState;
	public static userProfile: StatePropertyAccessor;
	private conversationRegister: StatePropertyAccessor;
	private startTimeStamp: StatePropertyAccessor;
	private endTimeStamp: StatePropertyAccessor;
	public static queryProfile: StatePropertyAccessor;
	private chatLogger: ChatLogger;
	private static botLoggerMiddleware: BotLoggerMiddleware;

	private constructor(
		conversationState: ConversationState,
		userState: UserState,
		adapter: BotFrameworkAdapter,
	) {
		this.chatLogger = new ChatLogger(
			config.cosmosOptions.host,
			config.cosmosOptions.masterKey,
			config.botID,
			config.botName,
			config.env === 'PROD' ? 'PROD' : 'DEV',
		);
		this.adapter = adapter;
		this.conversationState = conversationState;
		this.userState = userState;
		this.conversationRegister = conversationState.createProperty(CURRENT_USER_CONVERSATION);
		this.startTimeStamp = conversationState.createProperty(PROFILE_CONVERSATION_START);
		this.endTimeStamp = conversationState.createProperty(PROFILE_CONVERSATION_LAST);
		this.sendActivitiesHandler = this.sendActivitiesHandler.bind(this);
		this.updateQueryProfile = this.updateQueryProfile.bind(this);
		if (!BotLoggerMiddleware.userProfile)
			BotLoggerMiddleware.userProfile = userState.createProperty(CURRENT_USER);
		if (!BotLoggerMiddleware.queryProfile)
			BotLoggerMiddleware.queryProfile = conversationState.createProperty(QUERY_PARAMS);
	}
	public static getInstance(
		conversationState: ConversationState,
		userState: UserState,
		adapter: BotFrameworkAdapter,
	): BotLoggerMiddleware {
		if (this.botLoggerMiddleware) {
			return this.botLoggerMiddleware;
		} else {
			this.botLoggerMiddleware = new BotLoggerMiddleware(
				conversationState,
				userState,
				adapter,
			);
			return this.botLoggerMiddleware;
		}
	}
	async onTurn(turnContext: TurnContext, next: () => Promise<void>) {
		if (turnContext.activity.type === ActivityTypes.Message) {
			// Register User
			try {
				const user = await BotLoggerMiddleware.userProfile.get(turnContext, undefined);
				if (user != undefined) {
					// if logic will always execute faster than else and else requires branch instruction
				} else {
					await this.updateUserDetails(turnContext);
				}
			} catch (error) {
				error && logger.error({ location: 'onTurn Register User', error });
			}

			// Register Conversation
			try {
				const conversation = await this.conversationRegister.get(turnContext, undefined);
				if (conversation !== undefined && conversation !== false) {
					// if logic will always execute faster than else and else requires branch instruction
					this.endTimeStamp.set(turnContext, new Date().valueOf());
				} else {
					await this.conversationRegister.set(turnContext, true);
					this.updateConversationDetails(turnContext);
				}
			} catch (error) {
				logger.error({ location: 'onTurn Register Conversation', error });
			}

			// Handle Outgoing Messages
			turnContext.onSendActivities(this.sendActivitiesHandler);
			// Handle Incoming Messages
			this.updateUserMessageDocument(turnContext);
		} else if (turnContext.activity.type === ActivityTypes.Event) {
			if (turnContext.activity.name === 'updateFeedback') {
				this.chatLogger.updateFeedback(
					turnContext.activity.value.messageID,
					turnContext.activity.value.feedback,
					async (error: Error) => {
						if (error) {
							error &&
								logger.error({
									location: 'Update Feedback in bot.ts',
									error: error,
								});
						} else {
							const confirmFeedback = {
								type: ActivityTypes.Event,
								name: 'feedbackConfirm',
								value: {
									messageID: turnContext.activity.value.messageID,
									elementID: turnContext.activity.value.elementID,
									feedback: turnContext.activity.value.feedback,
								},
							};
							await turnContext.sendActivity(confirmFeedback);
							logger.debug({
								location: 'Confirming feedback update bot.js',
								event: confirmFeedback,
							});
						}
					},
				);
			}
		}

		await next();
	}

	private async updateUserDetails(turnContext: TurnContext) {
		const toWrite = await getUserInfo(turnContext);
		logger.debug({ location: 'updateUserDetails', toWrite });
		this.chatLogger.saveUserDocument(toWrite, (error: Error) => {
			if (error) logger.error({ location: 'chat-logger.ts updateUserDetails', error });
		});
		await BotLoggerMiddleware.userProfile.set(turnContext, toWrite);
		await this.userState.saveChanges(turnContext);
	}

	private async updateConversationDetails(turnContext: TurnContext) {
		const time = new Date().valueOf();
		this.startTimeStamp.set(turnContext, time);
		this.endTimeStamp.set(turnContext, time);
		const user = await BotLoggerMiddleware.userProfile.get(turnContext, {
			userID: 'default-user',
			email: 'unknown@walmart.com',
			userName: 'default-user',
		});
		const toWrite = {
			conversationID: turnContext.activity.conversation.id,
			timestamp: new Date().valueOf(),
			userID: user.userID,
			channel: turnContext.activity.channelId,
		};
		logger.debug({ location: 'updateConversationDetails', toWrite });
		this.chatLogger.saveConversationDocument(toWrite, (error: Error) => {
			if (error)
				logger.error({ location: 'chat-logger.ts updateConversationDetails', error });
		});

		const interval = setInterval(
			async activity => {
				try {
					const ctx = TurnContext.getConversationReference(activity);
					this.adapter.continueConversation(ctx, async (tctx: TurnContext) => {
						const lastMessage = await this.endTimeStamp.get(tctx);
						let diff = Date.now() - lastMessage;
						diff /= 60000;
						if (diff > config.checkChatDuration) {
							const start = await this.startTimeStamp.get(tctx);
							const toWrite = {
								startTimestamp: start,
								endTimestamp: lastMessage,
								abandon: start === lastMessage ? true : false,
								conversationID: tctx.activity.conversation.id,
							};
							logger.debug({
								location: 'updateConversationDetails setInterval',
								toWrite,
							});
							this.chatLogger.saveUsageDocument(toWrite, (error: Error) => {
								if (error)
									logger.error({
										location:
											'chat-logger.ts updateConversationDetails setinterval',
										error,
									});
							});
							await this.conversationRegister.set(tctx, false);
							await this.conversationState.saveChanges(tctx, true);
							clearInterval(interval);
						}
					});
				} catch (error) {
					error &&
						logger.error({ location: 'updateConversationDetails setInterval', error });
				}
			},
			config.checkChatActiveInterval,
			turnContext.activity,
		);
	}

	private async updateUserMessageDocument(turnContext: TurnContext) {
		const messageID = uuid.v4();
		const toWrite = {
			from: 'User',
			message: turnContext.activity.text,
			messageType: 'String',
			timestamp: new Date().valueOf(),
			messageID,
			conversationID: turnContext.activity.conversation.id,
		};
		BotLoggerMiddleware.queryProfile.set(turnContext, {
			userQuestion: turnContext.activity.text,
			messageID,
		});

		logger.debug({ location: 'updateUserMessageDocument', toWrite });
		try {
			await this.chatLogger.saveMessageDocument(toWrite);
		} catch (error) {
			error && logger.error({ location: 'updateUserMessageDocument saveMessagedoc', error });
		}
	}
	public async updateQueryProfile(
		turnContext: TurnContext,
		property: { key: string; value: string },
	) {
		try {
			const data = await BotLoggerMiddleware.queryProfile.get(turnContext, {});
			data[property.key] = property.value;
			await BotLoggerMiddleware.queryProfile.set(turnContext, data);
			return;
		} catch (error) {
			error && logger.error({ location: 'Update Query Profile', error: error });
			return error;
		}
	}
	public async sendActivitiesHandler(
		turnContext: TurnContext,
		activities: Partial<Activity>[],
		next: () => Promise<ResourceResponse[]>,
	): Promise<IBotLoggerResourceResponse[]> {
		const userMessage = await BotLoggerMiddleware.queryProfile.get(turnContext, {});
		let docID;
		for (const activity of activities) {
			if (activity.type === ActivityTypes.Message) {
				let toWrite = {
					...userMessage,
					message: activity.text,
					conversationID: turnContext.activity.conversation.id,
					messageType: 'String',
					timeStamp: new Date().valueOf(),
					from: 'bot',
					customData: {
						context: userMessage.outerLuisIntent,
						outerLuisIntent: userMessage.outerLuisIntent,
						outerLuisScore: userMessage.outerLuisScore,
						unanswered: userMessage['unanswered']
					}
				};
				if (activity.attachments && activity.attachments.length > 0) {
					toWrite = {
						...toWrite,
						messageType: 'RichData',
						card: activity.attachments[0],
					};
					if (!toWrite.message) {
						toWrite.message = activity.attachments[0].content.text;
					}
				}
				logger.debug({ location: 'sendActivitiesHandler', toWrite });
				try {
					docID = await this.chatLogger.saveMessageDocument(toWrite);
				} catch (error) {
					error &&
						logger.error({ location: 'sendActivitiedHandler saveMessagedoc', error });
				}
			}
		}
		try {
			const resourceResponse: IBotLoggerResourceResponse[] = await next();
			resourceResponse[0].documentID = docID;
			return resourceResponse;
		} catch (error) {
			logger.error({ location: 'chat-logger.ts sendactivities handler', error });
		}
	}
}
