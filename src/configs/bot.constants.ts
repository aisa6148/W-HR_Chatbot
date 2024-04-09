export const BOT_DIALOG_NAMES = {
	LUIS_MAP_DIALOG: 'luis-map-dialog',
	LUIS_HANDLER_DIALOG: 'luis-handler-dialog',
	LUIS_HANDLER_RELOCATION_WATERFALL_DIALOG: 'luis-handler-relocation-dialog',
	LUIS_HANDLER_COLLECT_RESULT_WATERFALL_DIALOG: 'luis-handler-collect-result-dialog',
	TEXT_PROMPT: 'text-prompt',
	UNKNOWN_WATERFALL_DIALOG: 'unknownContextHandler',
	REDIRECT_DIALOG: 'redirect-dialog',
	AFFIRMATION_DIALOG: '/Affirmation',
	ELIGIBILITY_DIALOG: '/eligibility',
	ELIGIBILITY_FTE_DIALOG: '/eligibilityfte',
	ELIGIBILITY_ADHOC: '/adhoc',
	ELIGIBILITY_CONTINUOUS: '/cont',
	// ELIGIBILITY_SHORT_DURATION: "shortduration",
	// ELIGIBILITY_LONG_DURATION: "extendedperiod",
	GREETINGS_DIALOG: '/Greetings',
	HR_DATA_DIALOG: '/HRData',
	FEEDBACK_HANDLER_DIALOG: '/feedback',
	LEAVE_MANAGEMENT_DIALOG: 'handle_context_switch_to_leavemanagement',
	LEAVE_BALANCE_DIALOG: 'handle_context_switch_to_leavebalance',
	LEAVE_APPLY_DIALOG: 'handle_context_switch_to_applyleave',
	LEAVE_CANCEL_DIALOG: 'handle_context_switch_to_cancelleave',
	LEAVE_APPROVAL_DIALOG: 'handle_context_switch_to_approveleave',
	UPCOMING_TEAM_LEAVES_DIALOG: 'handle_context_switch_to_upcomingteamleaves',
	OPTION_VALIDATE_PROMPT: 'optionValidationPrompt',
	MULTI_SELECT_PROMPT: 'multiSelectPrompt',
	APPROVAL_OPTIONS: 'leaveApprovalOptions',
	APPROVE_SELECTED_ASSOCIATES: 'approveSelectedAssociates',
	SELECTED_LEAVE_APPROVE_OPTION: 'selectedLeaveApproveOption',
	LEAVE_APPROVE_NEXT: 'leaveApprovalNext',
	LEAVE_APPROVE_ALL: 'leaveApproveAll',
	DATE_VALIDATE_PROMPT: 'dateValidationPrompt',
	HR_MART_APPLY: 'hrMartApply',
	HR_MART_CANCEL: 'hrMartCancel',
	HR_MART_APPROVE: 'hrMartApprove',
	LEAVE_APPROVE_OPTION: 'leaveApprovalOption',
	UPCOMING_LEAVE_SUMMARY_AND_APPROVAL_LIST: 'upcomingLeaveSummaryAndApprovalList',
	LEAVE_APPROVAL_ALL_INDIVIDUAL_OPTION: 'summaryAndApproveAllApproveIndividuallyOption',
	LEAVE_APPROVAL_LIST: 'leaveApprovalList',
	REJECT_LEAVE_REMARKS: 'rejectLeaveRemarks',
	HR_MART_LEAVE_APPROVE: 'hrMartApprove',
	BYOD_SERVICE_NOW_NEW_REQUEST: 'byodServiceNowNewRequest',
	BYOD_SERVICE_NOW_REQUEST_STATUS: 'byodServiceNowRequestStatus',
	CUSTOM_SURVEY_DIALOG: 'customSurveyDialog',
	SURVEY_QUESTION_LOOP: 'surevyQuestionLoop',
	SURVEY_ALREADY_ANSWERED: 'surveyAlreadyAnswered',
	ASK_USER_QUESTION: 'askUserQuestion',
	SURVEY_QUESTION: 'surevyQuestion',
	CONFIRM_SUBMIT: 'confirmSubmit'
};
export const STATE_PROPERTY_NAMES = {
	CURRENT_USER: 'current-user',
	POLICY_CONTEXT_USER: 'policy-user-context',
	DIALOG_STATE_PROPERTY: 'dialogState',
	CURRENT_USER_CONVERSATION: 'current-user-conversation',
	PROFILE_CONVERSATION_START: 'profile-conversation-start',
	PROFILE_CONVERSATION_LAST: 'profile-conversation-last',
	QUERY_PARAMS: 'query-profile',
	CONTEXT: 'user-chat-context',
	MULTI_SELECT_ARRAY: 'multi-select-array',
	LUIS_HANDLER_DIALOG_STATE: 'luis-handler-dialog-state',
	FIRST_TIME_GREETING: 'first-time-greeting',
	WFH_ELIGIBILITY_DATA: 'wfh-eligibility-data',
	LEAVE_APPLY_HR_MART_DATA: 'leave-apply-hr-mart-data',
	LEAVE_CANCEL_DATA: 'leave-cancel-data',
	LEAVE_APPROVE_DATA: 'leave-approve-data',
	BYOD_SERVICE_NOW_NEW_REQUEST: 'handle_context_switch_to_serviceNow',
	BYOD_SERVICE_NOW_REQUEST_STATUS: 'handle_context_switch_to_serviceNowReq',
	CUSTOM_SURVEY_DATA: 'custom-survey-data'
};

export const REPLY_TEXTS = {
	QUIT: 'quit',
	PROCESS_DISCARDED:
		"Process successfully cancelled. Even though I am not human, I do have a lot of answers to your queries, go on, challenge me. Just say 'Hi' to begin :)",
	CONVERSATION_END: {
		ASK_ME_MORE: [
			'Even though I am not human, I do have a lot of answers to HR queries, go on, challenge me :)  ',
			'Whats better than challenging a Bot to some Human Resource queries :) ',
		],
		NO_MORE_QUESTIONS: ['Have a great day!', 'Have a great day!'],
	},
	VALIDATE_BUTTONS:
		'Sorry the click is allowed only for the latest option, kindly click on the buttons given above or click/type *Quit* to end the process.',
	GREETINGS: [
		"Hey there, how's it going?",
		'Hi! Think of me as a friendly genie who is at your service :)',
		"Hi there, in doubt? I'm the one to talk to!",
	],
	FIRST_INTRO_TEXT: '! Good to see you here. :)\nI can help you with queries related to your leaves, benefits, policies and more in an instant. \n\nClick on the following to know more:',
};

export const ELIGIBILITY_DIALOG = {
	TEXT:
		'You will have to apply for the Extended Flexible Work Option provided you meet the following criteria',
	BUTTONS: [{ display: 'Eligibility Criteria', value: 'extended_wfh_eligibility_criteria' }],
};

export const CUSTOM_SURVEY =  {
	ALREADY_RECORDED: 'Your response has already been recorded for this survey. Thank you!',
	SUBMIT: {
		TEXT: 'Would you like to submit you responses?',
		BUTTONS: [
			{ display: 'Yes, submit', value: 'yes' },
			{ display: 'Quit', value: 'quit' },
		],
		OPTIONS: ['yes', 'quit']
	},
	RESPONSE_RECORDED: 'Your response has been recorded for this survey. Thank you!',
	RESPONSE_RECORDED_ERROR: 'Looks like we ran into an error in recording you response. Kindly reach out to  your manager.',
	END_MESSAGE: 'Thank you for your input! \n\nKeep in mind, I can also help you out with queries related to your leaves, benefits, policies and more in an instant! :)'
};

export const LEAVE_MANAGEMENT = {
	LEAVE_TYPES: {
		AL: 'Annual Leave',
		SL: 'Sick/Casual Leave',
		COFF: 'Compensatory Leave',
		FL: 'Floater Leave',
		LOA: 'Leave of Absence',
		MAL: 'Maternity Leave',
		ML: 'Marriage Leave',
		ADL: 'Adoption Leave',
		BER: 'Bereavement Leave',
		MIS: 'Miscararriage Leave',
		PER: 'Personal Leave',
		VOL: 'Volunteer Leave',
		EFWO: 'Extended Flexible Work Option',
		PAT: 'Paternity Leave',
	},
	LEAVE_MANAGEMENT_DIALOG: {
		UNABLE_TO_GET_USER_DETAILS_FROM_HR_MART:
			"I'm afraid I cannot get your details. Must be a technical glitch :(",
		LEAVE_MANAGEMENT_OPTIONS_TEXT: 'What can I help you with?',
		LEAVE_MANAGEMENT_OPTIONS_FOR_MANAGER_TEXT: 'What can I help you with?',
		LEAVE_MANAGEMENT_OPTIONS_BUTTONS: [
			{ display: 'Leave Balance', value: '#Leave#LeaveBalance' },
			{ display: 'Apply Leaves', value: '#Leave#ApplyLeave' },
			{ display: 'Cancel Leaves', value: '#Leave#CancelLeave' },
		],
		LEAVE_MANAGEMENT_FOR_MANAGER_OPTIONS_BUTTONS: [
			{ display: 'Leave Balance', value: '#Leave#LeaveBalance' },
			{ display: 'Apply Leaves', value: '#Leave#ApplyLeave' },
			{ display: 'Cancel Leaves', value: '#Leave#CancelLeave' },
			{ display: 'Upcoming Team Leaves', value: '#Leave#UpcomingTeamLeaves' },
			{ display: 'Approve/Reject Leaves', value: '#Leave#ApproveLeave' },
		],
		LEAVE_MANAGEMENT_BUTTONS: [
			{ display: 'Leave Management', value: '#Leave#LeaveManagement' },
		],
		USER_UNAVAILABLE_EMAIL_TO_DEV:
			"<font color='black'>This user is unavailable in our db/hr-mart: %s <br /><br /><br />Best Regards, <br />Ask ME</font>",
	},
	LEAVE_BALANCE_DIALOG: {
		LIST_OF_LEAVES: 'Here’s your leave balance to date.\n\n',
		LEAVE_BALANCE_TEXT: '%s: *%s*\n\n',
	},
	LEAVE_APPLY_DIALOG: {
		LEAVE_TYPE: {
			PROMPT: 'Select the leave type you want to apply.',
			BUTTONS: [
				{ display: 'Casual/Sick Leave', value: 'SL' },
				{ display: 'Annual Leave', value: 'AL' },
				{ display: 'Quit', value: 'quit' },
			],
			OPTIONS: ['SL', 'AL'],
		},
		LEAVE_FROM_DATE: {
			PROMPT:
				'Leave Type Entered: %s \n\nEnter the From-Date of leave. (For eg: 1st Jan)\n\nOr click on quit to end the process',
			BUTTONS: [{ display: 'Quit', value: 'quit' }],
		},
		LEAVE_FROM_PERIOD: {
			PROMPT: 'Very well, now select leave duration on %s.',
			BUTTONS: [
				{ display: 'Full day', value: 'FD' },
				{ display: 'First Half', value: 'FH' },
				{ display: 'Second half', value: 'SH' },
				{ display: 'Quit', value: 'quit' },
			],
			OPTIONS: ['FD', 'FH', 'SH'],
		},
		LEAVE_TO_DATE: {
			PROMPT:
				'Almost there! Enter the To-Date of leave. (For eg: 1st Jan)\n\nOr click on quit to end the process',
			IF_FROM_DATE_AFTER_TO_DATE:
				'The entered From-Date is after the To-Date. Kindly, re-apply with the appropriate dates.',
			BUTTONS: [{ display: 'Quit', value: 'quit' }],
		},
		LEAVE_TO_PERIOD: {
			PROMPT: 'Got it. The leave ends on %s. Pick an option to proceed',
			SEND: 'Got it. The leave ends on %s.',
			BUTTONS: [
				{ display: 'Full day', value: 'FD' },
				{ display: 'First Half', value: 'FH' },
				{ display: 'Second half', value: 'SH' },
				{ display: 'Quit', value: 'quit' },
			],
			OPTIONS: ['FD', 'FH', 'SH'],
		},
		LEAVE_REASON: {
			PROMPT: 'Well done! Enter the reason for leave to complete application ( Ex: Personal)',
			BUTTONS: [{ display: 'Quit', value: 'quit' }],
		},
		LEAVE_HR_MART_APPLY: {
			LEAVES_EXHAUSTED:
				"Unfortunately You've exhausted your %s\n\nClick on the following to re-apply",
			SUCCESS_MESSAGE:
				'Voila! Your %s request \n\nFrom-date: %s \n\nTo-date: %s \n\nhas been sent to your manager for approval.',
			ADDITIONAL_OPTION_PROMPT:
				'If you wish to check your balance, cancel your applied leaves or apply for some more leaves -- Click on the following',
			ERROR_FROM_API: "Oops, there's been an error in processing your request.\n\n%s",
		},
	},
	LEAVE_CANCEL_DIALOG: {
		LIST_OF_PENDING_LEAVES: {
			NO_PENDING_LEAVES: 'You have no pending leaves.',
			CANCEL_INTRO: 'Click on the *Req Id* to cancel the leave:',
			PENDING_LEAVES:
				'*%s*\n\nLeave From: %s\n\nLeave To: %s\n\nRequested On: %s\n\nNo. of days: %s\n\nLeave Reason: %s\n\nStatus: %s',
			PROMPT:
				'Click on the Request Id to cancel the applied leave.\n\nIn order to quit this process, click on the following:',
			BUTTONS: [{ display: 'Quit', value: 'quit' }],
		},
		CANCEL_REASON: {
			PROMPT:
				'Please enter your reason for the cancellation.\n\n Or click on quit to end the process.',
			BUTTONS: [{ display: 'Quit', value: 'quit' }],
		},
		CANCEL_CONFIRMATION: {
			PROMPT:
				'Are you sure you want to cancel the following leave: \n\nRequest ID: %s\n\nReason for cancellation: %s',
			BUTTONS: [
				{ display: 'Yes, cancel', value: 'yes' },
				{ display: "No, Don't Cancel", value: 'quit' },
			],
			OPTIONS: ['yes', 'Yes', 'No', 'no', 'quit', 'Quit'],
		},
		LEAVE_HR_MART_CANCEL: {
			LEAVES_EXHAUSTED:
				"Unfortunately You've exhausted your %s\n\nClick on the following to re-apply",
			SUCCESS_MESSAGE: 'Your leave has been successfully cancelled!',
			ADDITIONAL_OPTION_PROMPT:
				'If you wish to check your balance, cancel your applied leaves or apply for some more leaves -- Click on the following',
			ERROR_FROM_API: "Oops, there's been an error in processing your request.\n\n%s",
		},
	},
	LEAVE_APPROVE_DIALOG1: {
		LEAVE_APPROVE_OPTION: {
			PROMPT:
				'*Upcoming Leaves*: Provides you with a summary of upcoming leaves.\n\n*Approve/Reject Leaves*: Provides you an option to Approve and Reject leaves. ',
			BUTTONS: [
				{ display: 'Upcoming Leaves', value: 'UpcomingLeaves' },
				{ display: 'Approve/Reject Leaves', value: 'ApproveRejectLeaves' },
				{ display: 'Quit', value: 'quit' },
			],
			OPTIONS: ['UpcomingLeaves', 'ApproveRejectLeaves', 'quit', 'Quit'],
			NO_PENDING_APPROVALS: 'You do not have any pending leaves to view.',
			NO_MORE_SELECTED_APPROVALS: 'End of selected leaves.',
		},
		UPCOMING_LEAVES: {
			LIST: '*List of Upcoming Leaves*\n\n',
			MESSAGE: '*%s*: From %s to %s \nReason: %s\n\n',
			MESSAGE2: 'From %s to %s \nReason: %s',
			TOTAL: '%s\n\nTotal: %s',
			PROMPT: 'Would you like to Appprove/Reject Leaves? Click on the following:',
			BUTTONS: [{ display: 'Approve/Reject Leaves', value: 'ApproveRejectLeaves' }],
			OPTIONS: ['ApproveRejectLeaves'],
		},
		LEAVE_APPROVE: {
			TEXT: 'Name: *%s*\nLeave: From %s to %s\nReason: %s\nNo. of Days: %s',
			BUTTONS: [
				{ display: 'Approve', value: '#A#' },
				{ display: 'Reject', value: '#R#' },
				{ display: 'Next', value: 'Next' },
				{ display: 'Quit', value: 'quit' },
			],
			OPTIONS: ['#A#', '#R#', 'Next', 'quit'],
			APPROVE: 'Approved.',
			REJECTED: 'Rejected: ',
		},
		LEAVE_HR_MART_APPROVE: {
			SUCCESS_MESSAGE: "*%s*'s leave from %s to %s is %s",
			A: 'Approved!',
			R: 'Rejected.',
		},
		LEAVE_APPROVAL_INDIVIDUAL_OR_ALL: {
			TEXT: 'Done!',
			BUTTONS: [
				{ display: 'Approve All Leaves', value: 'ApproveAll' },
				{ display: 'Approve Leaves Individually', value: 'ApproveIndividually' },
			],
		},
		LEAVE_SUMMARY_AND_MULTISELECT_PROMPT:
			'Following is a multi-select list, click on \'Proceed\' after the selection.\n\n',
		REJECT_LEAVE_REMARK: {
			TEXT: 'Would you like to add a reason for the rejection?',
			BUTTONS: [
				{ display: 'Yes', value: 'yes' },
				{ display: 'No', value: 'no' },
			],
			OPTIONS: ['Yes', 'yes', 'No', 'no'],
		},
		REJECT_LEAVE_REMARK_IF_YES: {
			TEXT: 'Kindly, type in the remark:',
		},
	},
	LEAVE_APPROVE_DIALOG: {
		LEAVE_APPROVE_OPTION: {
			PROMPT:
				'*Upcoming Leaves*: Provides you with a summary of upcoming leaves.\n\n*Approve/Reject Leaves*: Provides you an option to Approve and Reject leaves. ',
			BUTTONS: [
				{ display: 'Upcoming Leaves', value: 'UpcomingLeaves' },
				{ display: 'Approve/Reject Leaves', value: 'ApproveRejectLeaves' },
				{ display: 'Quit', value: 'quit' },
			],
			OPTIONS: ['UpcomingLeaves', 'ApproveRejectLeaves', 'quit', 'Quit'],
			NO_PENDING_APPROVALS: 'You do not have any pending leaves to view.',
			NO_MORE_SELECTED_APPROVALS: 'End of selected leaves.',
			NO_MORE_LEAVES_TO_VIEW: '*No more leaves to view. The approval process has ended. I can also assist you with the following:*',
			MESSAGE_AFTER_APPROVE_ALL: '*The leave approval process has ended. I can also assist you with the following:*'
		},
		UPCOMING_LEAVES: {
			LIST: '*List of Upcoming Leaves*\n\n',
			MESSAGE: '*%s*: From %s to %s \nReason: %s\n\n',
			MESSAGE2: 'From %s to %s \nReason: %s',
			TOTAL: '%s\n\nTotal: %s',
			PROMPT: 'Would you like to Appprove/Reject Leaves? Click on the following:',
			BUTTONS: [{ display: 'Approve/Reject Leaves', value: 'ApproveRejectLeaves' }],
			BUTTONS_WITH_HASH: [{ display: 'Approve/Reject Leaves', value: '#Leave#ApproveLeave' }],
			OPTIONS: ['ApproveRejectLeaves'],
		},
		LEAVE_APPROVE: {
			TEXT: 'Name: *%s*\nLeave: From %s to %s\nReason: %s\nNo. of Days: %s',
			BUTTONS: [
				{ display: 'Approve', value: '#A#' },
				{ display: 'Reject', value: '#R#' },
				{ display: 'Next', value: 'Next' },
				{ display: 'Quit', value: 'quit' },
			],
			OPTIONS: ['#A#', '#R#', 'Next', 'quit'],
			APPROVE: 'Approved.',
			REJECTED: 'Rejected: ',
		},
		LEAVE_HR_MART_APPROVE: {
			SUCCESS_MESSAGE: "*%s*'s leave from %s to %s is %s",
			A: 'Approved!',
			R: 'Rejected.',
		},
		LEAVE_APPROVAL_INDIVIDUAL_OR_ALL: {
			TEXT: '',
			BUTTONS: [
				{ display: 'Approve All Leaves', value: 'ApproveAll' },
				{ display: 'Approve Leaves Individually', value: 'ApproveIndividually' },
				{ display: 'Quit', value: 'quit' }
			],
			OPTIONS_TO_VALIDATE: ['ApproveAll', 'ApproveIndividually', 'quit']
		},
		LEAVE_SUMMARY_AND_MULTISELECT_PROMPT:
			'Following is a multi-select list, click on \'Proceed\' after the selection.\n\n',
		REJECT_LEAVE_REMARK: {
			TEXT: 'Would you like to add a reason for the rejection?',
			BUTTONS: [
				{ display: 'Yes', value: 'yes' },
				{ display: 'No', value: 'no' },
			],
			OPTIONS: ['Yes', 'yes', 'No', 'no'],
		},
		REJECT_LEAVE_REMARK_IF_YES: {
			TEXT: 'Kindly, type in the remark:',
		},
	},
};

export const BYOD_AD_SERVICE_NOW = {
	BYOD_SERVICE_NOW_DIALOG: {
		USER_TO_MODIFY: {
			PROMPT:
				"*User to modify:*\n\nEnter User to Modify (Eg: vn08k9i) or Click on 'Quit' button to start a new conversation",
			BUTTONS: [{ display: 'Quit', value: 'quit' }],
		},
		GROUPS_ADD_OR_REMOVE: {
			PROMPT:
				"*Groups to add or remove:*\n\nChoose groups to add to or remove from the user from the below list (Eg: $2003000ijkl) or Click on 'Quit' button to start a new conversation",
			BUTTONS: [{ display: 'Quit', value: 'quit' }],
		},
		BUSINESS_JUSTIFICATION: {
			PROMPT:
				"*Business Justification:*\n\nA valid justification is required for your request to be approved and processed. If you have any additional details to add, please do so here or Click on 'Quit' button to start a new conversation",
			BUTTONS: [{ display: 'Quit', value: 'quit' }],
		},
	},
	BYOD_SERVICE_NOW_STATUS_DIALOG: {
		REQUEST_ID: {
			PROMPT:
				'*Request Id:*\n\nYou can check the status of your ticket in the [Walmart Service Now Portal](https://walmartglobal.service-now.com/wm_sp) or you can enter your incident ID  (Eg: RITM3630796) for an instant response.',
			BUTTONS: [{ display: 'Quit', value: 'quit' }],
		},
	},
	BYOD_SERVICE_NOW_RESTART_DIALOG: {
		RAISE_REQUEST: {
			PROMPT:
				"Oops, you have entered an incorrect ID. Please click on the below button to enter the correct ID or Click on 'Quit' button to start a new conversation",
			BUTTONS: [
				{
					display: 'Raise Service Request',
					value: '#BYOD#BYOD_ServiceNow_Raise_Req',
				},
			],
			BUSINESS_JUSTIFICATION: {
				PROMPT:
					"*Business Justification:*\n\nA valid justification is required for your request to be approved and processed. If you have any additional details to add, please do so here or Click on 'Quit' button to start a new conversation",
				BUTTONS: [{ display: 'Quit', value: 'quit' }],
			},
		},
		BYOD_SERVICE_NOW_STATUS_DIALOG: {
			REQUEST_ID: {
				PROMPT:
					'*Request Id:*\n\nYou can check the status of your ticket in the [Walmart Service Now Portal](https://walmartglobal.service-now.com/wm_sp) or you can enter your incident ID  (Eg: RITM3630796) for an instant response.',
				BUTTONS: [{ display: 'Quit', value: 'quit' }],
			},
		},
		BYOD_SERVICE_NOW_RESTART_DIALOG: {
			RAISE_REQUEST: {
				PROMPT:
					"Oops, you have entered an incorrect ID. Please click on the below button to enter the correct ID or Click on 'Quit' button to start a new conversation",
				BUTTONS: [
					{ display: 'Raise Service Request', value: '#BYOD#BYOD_ServiceNow_Raise_Req' },
					{ display: 'Quit', value: 'quit' },
				],
			},
		},
	},
};

export const GREETING_BUTTONS = [
	{ display: 'Benefits', value: '#General#Benefits' },
	{ display: 'Leave Management', value: '#Leave#LeaveManagement' },
	{ display: 'COVID-19 Care', value: '#General#Covid_Care' },
	{ display: 'Associate Tools', value: '#General#WM_Portals'},
	{ display: 'Contact Us', value: '#General#NewJoinee_Contact' },
];

export const SHOW_MORE = [
	{ display: 'And More...', value: '#General#Policies_List'}
];

export const GREETING_BUTTONS_NOTIFICATIONS = [
	{ display: 'Benefits', value: '#General#Benefits' },
	{ display: 'Leave Management', value: '#Leave#LeaveManagement' },
	{ display: 'COVID-19 Care', value: '#General#Covid_Care' },
	{ display: 'Associate Tools', value: '#General#WM_Portals'},
	{ display: 'Contact Us', value: '#General#NewJoinee_Contact' },
	{ display: 'And More...', value: '#General#Policies_List'},
];

export const MAILER = {
	UNANSWERED: {
		SUBJECT: 'Ask ME: Unanswered Question',
		CONTENT:
			"<font color='black'>Hi!<br /><br />This is the Ask ME Bot! I wasn't able to answer the following question:<br /><b>%s</b><br /><br />To view the chat history of the user: <br /><br />1) Please click on the following link that will redirect you to the Chat bot Dashboard<br />%s<br />2) Enter the following details onto the dashboard:<br />User ID: <br />Conversation ID: %s<br />Slack user ID: %s<br /><br /><br />Best Regards, <br />The Ask ME Team</font>",
	},
};

export const POLICY_ARRAY = [
	{
		display: 'Alcohol and Drugs',
		value: '#AlcoholDrug#AD_Intro',
	},
	{
		display: 'Associate Assistance Program',
		value: '#AssociateAssistance#AAP_Intro',
	},
	{
		display: 'Background Checks',
		value: '#BackgroundChecks#BG_Intro',
	},
	{
		display: 'Discrimination',
		value: '#Discrimination#DP_Intro',
	},
	{
		display: 'Dress Code',
		value: '#DressCode#DP_DressCode',
	},
	{
		display: 'E-Learning',
		value: '#E_Learning#E_Learning_Intro'
	},
	{
		display: 'Flexible Work from Home',
		value: '#WFH#intro',
	},
	{
		display: 'Global Ethics Office',
		value: '#General#GlobalEthicsOffice',
	},
	{
		display: 'Gratuity',
		value: '#Gratuity#GP_Intro',
	},
	{
		display: 'Fitness Reimbursement',
		value: '#Gym_Guidelines#Fitness_Intro',
	},
	{
		display: 'Creche',
		value: '#Creche#Creche_Intro',
	},
	{
		display: 'Talent Mart',
		value: 'Talent_Mart',
	},
	{
		display: 'FAQ',
		value: 'Tax_and_Payroll',
	},
	{
		display: 'Investment Declarations',
		value: 'Tax_and_Payroll_Investment_Dec',
	},
	{
		display: 'CTC',
		value: 'Tax_and_Payroll_CTC',
	},
	{
		display: 'Medical',
		value: 'Tax_and_Payroll_Medical',
	},
	{
		display: 'IPSF',
		value: 'Tax_and_Payroll_IPSF',
	},
	{
		display: 'Flexi Benefit',
		value: 'Tax_and_Payroll_Flexi_Benefit',
	},
	{
		display: 'Form 16',
		value: 'Tax_and_Payroll_Form_16',
	},
	{
		display: '80C',
		value: 'Tax_and_Payroll_80C',
	},
	{
		display: 'Housing Loan',
		value: 'Tax_and_Payroll_Housing_Loan',
	},
	{
		display: 'HRA',
		value: 'Tax_and_Payroll_HRA',
	},
	{
		display: 'PPF PF VPF',
		value: 'Tax_and_Payroll_PPF_PF_VPF',
	},
	{
		display: 'LTA',
		value: 'Tax_and_Payroll_LTA',
	},
	{
		display: 'Goal Setting',
		value: 'GoalSetting',
	},
	{
		display: 'Annual Health Reimbursement',
		value: 'AnnualHealthReimbursement',
	},
	{
		display: 'HR Mart Module',
		value: 'HR_Mart_Module',
	},
	{
		display: 'Higher-Education',
		value: '#HigherEducation#HEIntro',
	},
	{
		display: 'Information',
		value: '#Information#WI_Intro',
	},
	{
		display: 'Insurance',
		value: '#Insurance#IN_intro',
	},
	{
		display: 'Outpatient',
		value: '#Outpatient#Outpatient_Intro',
	},
	{
		display: 'Internal Job Posting',
		value: '#IJP#IJP_Intro',
	},
	{
		display: 'Leave',
		value: '#Leave#LeaveIntro',
	},
	{
		display: 'Leave Of Absence',
		value: '#LeaveOfAbsence#LoA_Intro',
	},
	{
		display: 'ME Site',
		value: '#MESite#ME_Intro',
	},
	{
		display: 'Mobile And Internet',
		value: '#MobileAndInternet#MI_Intro',
	},
	{
		display: 'Open Door',
		value: '#OpenDoor#OD_Intro',
	},
	{
		display: 'Referral',
		value: '#Associate_Referral#AR_Intro',
	},
	{
		display: 'Relocation',
		value: '#Relocation#RG_Intro',
	},
	{
		display: 'Rewards and Recognition',
		value: '#RewardsAndRecognition#RRIntro',
	},
	{
		display: 'Safety and Health',
		value: '#SafetyAndHealth#SH_Intro',
	},
	{
		display: 'Shift Allowance',
		value: '#ShiftAllowance#SAIntro',
	},
	{
		display: 'Travel',
		value: '#Travel#GTE_Intro',
	},
	{
		display: 'University Relocation',
		value: '#UniversityRelocation#URIntro',
	},
	{
		display: 'Unreported Absenteeism',
		value: '#UnreportedAbsenteeism#UA_Intro',
	},
	{
		display: 'Violence Free',
		value: '#ViolenceFree#VF_Intro',
	},
	{
		display: 'Volunteer Guidelines',
		value: '#Volunteer#VP_Intro',
	},
];
