/**
 * @author Madhav
 * @description Schema for Logging data for dashboards and analytics
 */

'use-strict';

const SchemaDefinition = {

    COLL_USAGE: {

        conversationID: {
            type: String,
            required: true,
            length: {
                min: 3,
                max: 18
            }
        },
        botID: {
            type: String,
            required: true
        },
        startTimeStamp: {

            type: String,
            required: true,
            test: /^[0-9]+$/gi

        },
        endTimeStamp: {
            type: String,
            test: /^[0-9]+$/gi
        },
        abandon: {
            type: Boolean,
        }
    },

    COLL_USER: {

        userID: {
            type: String,
            required: true,
            test: /^[a-z0-9A-Z]+$/gi

        },
        botID: {

            type: String,
            required: true
        },
        userName: {
            type: String,
            required: true
        },
        email: {
            type: String,

        },
        countryCode: {
            type: String,
            required: true
        },
        customdata: {
            type: Object,
            required: false
        }
    },

    COLL_CONV_DETAILS: {

        conversationID: {
            type: String,
            required: true
        },
        userID: {
            type: String,
            required: true
        },
        botID: {
            type: String,
            required: true
        },
        botName: {
            type: String,
            required: true
        },
        channel: {
            type: String,
            required: true
        },
        deviceType: {
            type: String
        }
    },

    COLL_MSG: {

        conversationID: {
            type: String,
            required: true
        },
        botID: {

            type: String,
            required: true
        },
        from: {
            type: String
        },
        timeStamp: {
            required: true
        },
        message: {
            type: String,
            required: true
        },
        messageType: {
            type: String,
            required: true
        },
        card: {
            type: String,
            required: true
        },
        dialog: {
            required:false,
            id: {
                type: Number,
                required: false
            },
            state: {
                type: String,
                required: false
            }
        },
        userQuestion: {
            type: String,
            required: false
        },
        luisIntent: {
            type: String
        },
        luisScore: {
            type: Number
        },
        qnAScore: {
            type: Number
        },
        qnAResponse: {
            type: JSON
        },
        feedback: {
            type: String
        },
        customdata: {
            type: Object,
            required: false
        }
    }
}
module.exports = SchemaDefinition;

