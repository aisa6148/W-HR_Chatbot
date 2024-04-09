if (!process.env.NODE_ENV) {
	require('dotenv').config();
}
const PRE_LUIS_LINK = process.env.LUIS_LINK_1;
const POST_LUIS_LINK = process.env.LUIS_LINK_2 + process.env.LUIS_SUBSCRIPTION_KEY + '&';
const config = {
	env: process.env.NODE_ENV ? process.env.NODE_ENV : 'LOCAL',
	slackBotName: process.env.SLACK_BOT_NAME,
	facebookBotName: process.env.FACEBOOK_BOT_NAME,
	emailOptionsTo: '',
	botID: process.env.BOT_ID,
	botName: process.env.BOT_NAME,
	linktogif: process.env.LINK_TO_GIF,
	imgWorkAnniversary: process.env.IMG_WORK_ANNIVERSARY,
	luis:
		PRE_LUIS_LINK +
		process.env.LUIS_DISPATCH_APP_ID +
		'?' +
		(process.env.NODE_ENV === 'PROD' ? '' : 'staging=true&') +
		POST_LUIS_LINK,
	generalLuis: PRE_LUIS_LINK + process.env.LUIS_GENERAL_APP_ID + POST_LUIS_LINK,
	outerluis: {
		Leave: {
			LuisEndpoint: PRE_LUIS_LINK + process.env.LUIS_LEAVE_APP_ID + POST_LUIS_LINK,
		},
		General: {
			LuisEndpoint: PRE_LUIS_LINK + process.env.LUIS_GENERAL_APP_ID + POST_LUIS_LINK,
		},
		HigherEducation: {
			LuisEndpoint: PRE_LUIS_LINK + process.env.LUIS_HIGHEREDUCATION_APP_ID + POST_LUIS_LINK,
		},
		Associate_Referral: {
			LuisEndpoint: PRE_LUIS_LINK + process.env.LUIS_REFERRAL_APP_ID + POST_LUIS_LINK,
		},
		UniversityRelocation: {
			LuisEndpoint:
				PRE_LUIS_LINK + process.env.LUIS_UNIVERSITYRELOCATION_APP_ID + POST_LUIS_LINK,
		},
		RewardsAndRecognition: {
			LuisEndpoint:
				PRE_LUIS_LINK + process.env.LUIS_REWARDSANDRECOGNITION_APP_ID + POST_LUIS_LINK,
		},
		Gym_Guidelines: {
			LuisEndpoint: PRE_LUIS_LINK + process.env.LUIS_GYM_GUIDELINES_APP_ID + POST_LUIS_LINK,
		},
		ShiftAllowance: {
			LuisEndpoint: PRE_LUIS_LINK + process.env.LUIS_SHIFTALLOWANCE_APP_ID + POST_LUIS_LINK,
		},
		Relocation: {
			LuisEndpoint: PRE_LUIS_LINK + process.env.LUIS_RELOCATION_APP_ID + POST_LUIS_LINK,
		}, OpenDoor: {
			LuisEndpoint: PRE_LUIS_LINK + process.env.LUIS_OPENDOOR_APP_ID + POST_LUIS_LINK,
		},
		MobileAndInternet: {
			LuisEndpoint:
				PRE_LUIS_LINK + process.env.LUIS_MOBILEANDINTERNET_APP_ID + POST_LUIS_LINK,
		},
		Gratuity: {
			LuisEndpoint: PRE_LUIS_LINK + process.env.LUIS_GRATUITY_APP_ID + POST_LUIS_LINK,
		},
		DressCode: {
			LuisEndpoint: PRE_LUIS_LINK + process.env.LUIS_DRESSCODE_APP_ID + POST_LUIS_LINK,
		},
		BYOD: {
			LuisEndpoint: PRE_LUIS_LINK + process.env.LUIS_BYOD_APP_ID + POST_LUIS_LINK,
		},
		MIP: {
			LuisEndpoint: PRE_LUIS_LINK + process.env.LUIS_MIP_APP_ID + POST_LUIS_LINK,
		},
		BackgroundChecks: {
			LuisEndpoint: PRE_LUIS_LINK + process.env.LUIS_BACKGROUNDCHECKS_APP_ID + POST_LUIS_LINK,
		},
		UnreportedAbsenteeism: {
			LuisEndpoint:
				PRE_LUIS_LINK + process.env.LUIS_UNREPORTEDABSENTEEISM_APP_ID + POST_LUIS_LINK,
		},
		Discrimination: {
			LuisEndpoint: PRE_LUIS_LINK + process.env.LUIS_DISCRIMINATION_APP_ID + POST_LUIS_LINK,
		},
		IJP: {
			LuisEndpoint:
				PRE_LUIS_LINK + process.env.LUIS_IJP_APP_ID + POST_LUIS_LINK,
		},
		AlcoholDrug: {
			LuisEndpoint: PRE_LUIS_LINK + process.env.LUIS_ALCOHOLDRUG_APP_ID + POST_LUIS_LINK,
		},
		Information: {
			LuisEndpoint: PRE_LUIS_LINK + process.env.LUIS_INFORMATION_APP_ID + POST_LUIS_LINK,
		},
		SafetyAndHealth: {
			LuisEndpoint: PRE_LUIS_LINK + process.env.LUIS_SAFETYANDHEALTH_APP_ID + POST_LUIS_LINK,
		},
		Volunteer: {
			LuisEndpoint: PRE_LUIS_LINK + process.env.LUIS_VOLUNTEER_APP_ID + POST_LUIS_LINK,
		},
		AssociateAssistance: {
			LuisEndpoint:
				PRE_LUIS_LINK + process.env.LUIS_ASSOCIATEASSISTANCE_APP_ID + POST_LUIS_LINK,
		},
		ViolenceFree: {
			LuisEndpoint: PRE_LUIS_LINK + process.env.LUIS_VIOLENCEFREE_APP_ID + POST_LUIS_LINK,
		},
		Travel: {
			LuisEndpoint: PRE_LUIS_LINK + process.env.LUIS_TRAVEL_APP_ID + POST_LUIS_LINK,
		},
		NPS: {
			LuisEndpoint: PRE_LUIS_LINK + process.env.LUIS_NPS_APP_ID + POST_LUIS_LINK,
		},
		RSU: {
			LuisEndpoint: PRE_LUIS_LINK + process.env.LUIS_RSU_APP_ID + POST_LUIS_LINK,
		},
		Outpatient: {
			LuisEndpoint: PRE_LUIS_LINK + process.env.LUIS_OUTPATIENT_APP_ID + POST_LUIS_LINK,
		},
		Creche: {
			LuisEndpoint: PRE_LUIS_LINK + process.env.LUIS_CRECHE_APP_ID + POST_LUIS_LINK,
		},
		Talent_Mart: {
			LuisEndpoint: PRE_LUIS_LINK + process.env.LUIS_TALENT_MART_APP_ID + POST_LUIS_LINK,
		},
		Tax_and_Payroll: {
			LuisEndpoint: PRE_LUIS_LINK + process.env.LUIS_TAX_AND_PAYROLL_APP_ID + POST_LUIS_LINK,
		},
		Tax_and_Payroll_Investment_Dec: {
			LuisEndpoint:
				PRE_LUIS_LINK +
				process.env.LUIS_TAX_AND_PAYROLL_INVESTMENT_DEC_APP_ID +
				POST_LUIS_LINK,
		},
		Tax_and_Payroll_CTC: {
			LuisEndpoint:
				PRE_LUIS_LINK + process.env.LUIS_TAX_AND_PAYROLL_CTC_APP_ID + POST_LUIS_LINK,
		},
		Tax_and_Payroll_Medical: {
			LuisEndpoint:
				PRE_LUIS_LINK + process.env.LUIS_TAX_AND_PAYROLL_MEDICAL_APP_ID + POST_LUIS_LINK,
		},
		Tax_and_Payroll_IPSF: {
			LuisEndpoint:
				PRE_LUIS_LINK + process.env.LUIS_TAX_AND_PAYROLL_IPSF_APP_ID + POST_LUIS_LINK,
		},
		Tax_and_Payroll_Flexi_Benefit: {
			LuisEndpoint:
				PRE_LUIS_LINK +
				process.env.LUIS_TAX_AND_PAYROLL_FLEXI_BENEFIT_APP_ID +
				POST_LUIS_LINK,
		},
		Tax_and_Payroll_Form_16: {
			LuisEndpoint:
				PRE_LUIS_LINK + process.env.LUIS_TAX_AND_PAYROLL_FORM_16_APP_ID + POST_LUIS_LINK,
		},
		Tax_and_Payroll_80C: {
			LuisEndpoint:
				PRE_LUIS_LINK + process.env.LUIS_TAX_AND_PAYROLL_80C_APP_ID + POST_LUIS_LINK,
		},
		Tax_and_Payroll_Housing_Loan: {
			LuisEndpoint:
				PRE_LUIS_LINK +
				process.env.LUIS_TAX_AND_PAYROLL_HOUSING_LOAN_APP_ID +
				POST_LUIS_LINK,
		},
		Tax_and_Payroll_HRA: {
			LuisEndpoint:
				PRE_LUIS_LINK + process.env.LUIS_TAX_AND_PAYROLL_HRA_APP_ID + POST_LUIS_LINK,
		},
		Tax_and_Payroll_PPF_PF_VPF: {
			LuisEndpoint:
				PRE_LUIS_LINK + process.env.LUIS_TAX_AND_PAYROLL_PPF_PF_VPF_APP_ID + POST_LUIS_LINK,
		},
		Tax_and_Payroll_LTA: {
			LuisEndpoint:
				PRE_LUIS_LINK + process.env.LUIS_TAX_AND_PAYROLL_LTA_APP_ID + POST_LUIS_LINK,
		},
		HR_Mart_Module: {
			LuisEndpoint: PRE_LUIS_LINK + process.env.LUIS_HR_MART_MODULE_APP_ID + POST_LUIS_LINK,
		},
		GoalSetting: {
			LuisEndpoint: PRE_LUIS_LINK + process.env.LUIS_GOALSETTING_APP_ID + POST_LUIS_LINK,
		},
		AnnualHealthReimbursement: {
			LuisEndpoint: PRE_LUIS_LINK + process.env.LUIS_ANNUALHEALTHREIMBURSEMENT_APP_ID + POST_LUIS_LINK,
		},
		COVID_Reimbursement: {
			LuisEndpoint: PRE_LUIS_LINK + process.env.LUIS_COVID_REIMBURSEMENT_APP_ID + POST_LUIS_LINK,
		},
		IT: {
			LuisEndpoint: PRE_LUIS_LINK + process.env.LUIS_IT_APP_ID + POST_LUIS_LINK,
		},
		E_Learning: {
			LuisEndpoint: PRE_LUIS_LINK + process.env.LUIS_E_LEARNING_APP_ID + POST_LUIS_LINK,
		},
		MESite: {
			LuisEndpoint: PRE_LUIS_LINK + process.env.LUIS_ME_SITE_APP_ID + POST_LUIS_LINK,
		},
		HealthAndWellness: {
			LuisEndpoint: PRE_LUIS_LINK + process.env.LUIS_HEALTH_AND_WELLNESS_APP_ID + POST_LUIS_LINK,
		},
		Onboarding: {
			LuisEndpoint: PRE_LUIS_LINK + process.env.LUIS_ONBOARDING_APP_ID + POST_LUIS_LINK,
		},
		insurance_new: {
			LuisEndpoint: PRE_LUIS_LINK + process.env.LUIS_INSURANCE_NEW_APP_ID + POST_LUIS_LINK,
		},
		FWO: {
			LuisEndpoint: PRE_LUIS_LINK + process.env.LUIS_FWO_APP_ID + POST_LUIS_LINK
		}
	},
	cosmosOptions: {
		host: process.env.COSMOS_OPTIONS_HOST,
		masterKey: process.env.COSMOS_DATABASE_MASTERKEY,
		database: process.env.DATABASE_NAME,
		collection: 'ContextData',
	},
	signinoptions: {
		apikey: process.env.SIGNIN_API_KEY,
		location: process.env.SIGN_IN_BOT,
		botname: process.env.BOT_NAME,
	},
	defaultmodel: {
		userId: '5rE5k0ObOGR',
		userName: 'You',
		botId: process.env.BOT_ID,
		botIconUrl: 'https://bot-framework.azureedge.net/bot-icons-v1/bot-framework-default.png',
		botName: process.env.BOT_NAME,
		secret: process.env.MICROSOFT_DIRECTLINE_SECRET,
		iconUrl: '//bot-framework.azureedge.net/bot-icons-v1/bot-framework-default.png',
		directLineUrl: 'https://webchat.botframework.com/v3/directline',
		webSocketEnabled: 'false',
		speechTokenEndpoint: process.env.SPEECH_TOKEN_ENDPOINT,
		useLatestWebChat: false,
	},
	slackRequest: {
		url: 'https://slack.com/api/users.info',
		method: 'GET',
		qs: {
			token: process.env.SLACK_ACCESS_TOKEN,
			user: 'userid',
		},
		headers: {
			'cache-control': 'no-cache',
			'Content-Type': 'application/json',
		},
	},
	emailOptions: {
		auth_user: '',
		auth_pass: '',
		from: '',
		to: '',
		cc: '',
	},
	appInsightsKey: process.env.APP_INSIGHTS_KEY,
	database: {
		endpoint: 'https://chatlogs.documents.azure.com:443/',
		primaryKey: process.env.COSMOS_DATABASE_MASTERKEY,
		database: {
			id: process.env.DATABASE_NAME,
		},
		chatlogdb: {
			id: 'ChatLogs',
		},
		collections: {
			ErrorData: {
				id: 'ErrorLogs',
			},
			ChatData: {
				id: 'ChatLogs',
			},
			AppData: {
				id: 'AppLogs',
			},
			UserData: {
				id: 'UserLogs',
			},
			LuisMap: {
				id: 'LuisMap',
			},
		},
	},
	redis: {
		auth_pass: process.env.REDIS_AUTH_PASS,
		tls: {
			servername: process.env.REDIS_SERVER_NAME,
		},
	},
	directLineRequest: {
		method: 'post',
		url: 'https://directline.botframework.com/api/conversations',
		headers: {
			Authorization: 'Bearer ' + process.env.MICROSOFT_DIRECTLINE_SECRET,
			'Content-Type': 'application/json',
		},
		json: true,
	},
	checkChatDuration: 10,
	checkChatActiveInterval: 900000,
	dashboard: {
		link: 'https://app.powerbi.com/groups/9440663a-25ef-40cf-b364-3a7605d65936/reports/bec30713-418b-4463-aba6-8e6c35ed9487/ReportSection4?ctid=3cbcc3d3-094d-4006-9849-0d11d61f484d',
	},
	chatlogs: {
		url: 'https://chatlogs.documents.azure.com:443/',
		key: process.env.COSMOS_DATABASE_MASTERKEY,
		botid: process.env.BOT_ID,
		env: process.env.NODE_ENV === 'PROD' ? 'PROD' : 'DEV',
	},
	facebookRequest: {
		url: '',
		qs: {
			fields: 'email,name',
			access_token: '',
		},
		method: 'GET',
	},
	slackBotId: process.env.SLACK_BOT_ID,
	notifyKey: process.env.NOTIFY_KEY,
	azureLogStorage: {
		account: {
			name: 'gtshrbotlogs',
			key: process.env.AZURE_STORAGE_ACCOUNT_KEY,
		},
		applicationName: process.env.BOT_NAME,
		containerName: process.env.CONTAINER_NAME,
		blobName: '',
		level: 'info',
	},
	facebookBotId: '',
	hrmart: {
		INDIVIDUALEMPLOYEESINFO: process.env.HRMART_INDIVIDUAL_EMPLOYEES_INFO_PASSWORD,
		MANAGERPENDINGAPPROVAL: process.env.HRMART_MANAGER_PENDING_APPROVAL_PASSWORD,
		EMPLEAVEBALANCE: process.env.HRMART_EMP_LEAVE_BALANCE_PASSWORD,
		EMPLEAVEAPPLY: process.env.HRMART_EMP_LEAVE_APPLY_PASSWORD,
		EMPLEAVEAPPROVE: process.env.HRMART_EMP_LEAVE_APPROVE_PASSWORD,
		GETALLEMPDETAILS: process.env.HRMART_GET_ALL_EMP_DETAILS_PASSWORD,
		GETMANAGERCANCELPENDINGAPPROVALS:
			process.env.HRMART_GET_MANAGER_CANCEL_PENDING_APPROVALS_PASSWORD,
		EMPLEAVECANCELAPPLY: process.env.HRMART_EMP_LEAVE_CANCEL_APPLY_PASSWORD,
		EMPLEAVECANCELAPPROVE: process.env.HRMART_EMP_LEAVE_CANCEL_APPROVE_PASSWORD,
	},
	zoom: {
		directLineSecret: process.env.ZOOM_DIRECTLINE_SECRET,
		maxUsersInMemory: 1000,
		directlineConversationUrl: 'https://directline.botframework.com/v3/directline/conversations/',
		getZoomTokenUrl: 'https://zoom.us/oauth/token?grant_type=client_credentials',
		sendMessageUrl: 'https://api.zoom.us/v2/im/chat/messages',
		zoomAccountDetailsUrl: 'https://api.zoom.us/v2//users/',
	},
	sendgridAPIKey: '',
	associateTableName: 'ASSOCIATEDATA',
	hrmartAppID: 'FHRCHATBOT',
	hrmartUserName: 'FHRADMIN',
	chatlogdbDev: 'ChatLogsDBDEV',
	chatlogdb: 'ChatLogsDB',
	enableLeaveApproval: process.env.ENABLE_LEAVE_APPROVAL === 'true' ? true : false,
	slackChannelUrl: `https://slack.com/api/chat.postMessage?token=${process.env.BOT_TOKEN}&channel=${process.env.CHANNEL_ID}&text=Hi there! Looking for support? Whether it's IDC benefits, policies, processes or resources, I'm trained to answer any question that you have.Just type 'Ask Me' on the Slack search bar and I've got you covered.`,
	outerLuisScore: 0.30,
	innerLuisScore: 0.20,
	botTeamEmail: 'idccustomapps@wal-mart.com',
	privacyLink: 'https://teamshare.walmart.com/india/IT/Documents/IT%20Security%20Policies/WMGTS%20Associate%20Privacy%20Policy%20(Aug%207%202020).pdf',
	healthCheck: {
		gtsId: 'GTS2727',
		email: 'aishwarya.satwani@walmart.com'
	}
};
export default config;
