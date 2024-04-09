/**
 * @author Madhav
 * @desc Enums Utility File
 */

import config from '../../configs/config';
const constUtil: any = {};
module.exports = constUtil;

constUtil.schemasEnum = {
	UsageSchema: 'Usage',
	User: 'User',
	ConversationDetails: 'ConversationDetails',
	Message: 'Message',
};

constUtil.database = {
	DEV: {
		id: config.chatlogdbDev,
	},
	PROD: {
		id: config.chatlogdb,
	},
};

constUtil.collection = {
	User: {
		id: 'COLL_USER',
	},
	Message: {
		id: 'COLL_MSG',
	},
	ConversationDetails: {
		id: 'COLL_CONV_DETAILS',
	},
	Usage: {
		id: 'COLL_USAGE',
	},
};

/**
 *
 * @param {String} text
 * @desc To check if the given schemaName is correct of not
 */
constUtil.checkSchemaName = function(text: string) {
	Object.keys(this.schemasEnum).forEach(key => {
		if (this.schemasEnum[key] == text) {
			return true;
		}
	});
	return false;
};
