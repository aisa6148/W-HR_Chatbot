# Bot-logger

## Usage

The bot-logger module is a nodejs module that can be used for telemetry services with the Microsoft Bot-Framework.

## Installation
The module can be used by: 
- Directly cloning the repository followed by deleting the .git folder in the cloned folder and then require the cloned folder in the code.
- Run the *npm install @walmart/botlogger*, in which case the bot should be deployed on an on-premise server.


## Setting up the code


#### Initializing the module

Create a file which instantiates an object of type chatlogger

chatlogs.js
```javascript
const dashboard = require('@walmart/bot-logger');
module.exports = new dashboard("url","***key***","botID","DEV");
```

#### Bot side code

``` javascript
bot.use(middleware);
```

#### middleware

``` javascript
const chatlogs = require('./chatlogs');
var datediff = require('date-diff');
middleware = {
    botbuilder : function (session, next) {
        if(session.message.text) {
            session.conversationData.lastMessage = new Date().valueOf();
            var toWrite = {
                from: 'User',
                message: session.message.text,
                messageType: "String",
                timestamp: new Date().valueOf()
            };
            chatlogs.saveMessageDocument(session, toWrite, (err) => console.log(err));
            // Add line to store user question
            session.conversationData.bot = {
                userQuestion: session.message.text
            }
        }
        if (!session.conversationData.register) {
            session.conversationData.register = true;
            session.conversationData.initialTime = new Date().valueOf();
            session.conversationData.lastMessage = new Date().valueOf();
            setTimeout((address) => {
                const bot = require('../app/bot.js').bot;
                bot.loadSession(address, (err, tsession) => {
                    if(err) {
                        console.log(err);
                    }
                    let toWrite = {
                        timestamp: tsession.conversationData.initialTime
                    }
                    if (tsession.conversationData.userID) {
                        toWrite.userID = tsession.conversationData.userID;
                    }
                    // condition for abandon can be different based on bot
                    chatlogs.saveConversationDocument(tsession, toWrite, (err) => console.log(err));
                });
            }, config.abandonTimeout, session.message.address);
            let interval = setInterval((address) => {            
                const bot = require('../app/bot.js').bot;
                bot.loadSession(address, (err, tsession) => {
                    if(err) {
                        clearInterval(interval);
                        console.log(err);
                    }
                    let now = new Date().valueOf();
                    let diff = new datediff(new Date(now), new Date(tsession.conversationData.lastMessage));                
                    if (diff.minutes() > config.checkChatDuration) {
                        clearInterval(interval);
                        chatlogs.saveUsageDocument(tsession, {
                            startTimestamp: tsession.conversationData.initialTime,
                            endTimestamp: tsession.conversationData.lastMessage,
                            abandon = tsession.conversationData.userAskedQuestion ? false : true
                        }, (err) => console.log(err));
                        tsession.conversationData.register = false;
                        tsession.save();
                    }
                });
            }, config.checkChatActiveInterval, session.message.address);
        }    
        next();
    }
}
```

#### Sending a message 

Use Helper.send(session,text) instead of session.send(text). This helps to direct all messages through a particular function, hence handling all messages being sent similarly

``` javascript
Helper.send = function (session, text) {
    session.send(text);
    try {
        if (text != null && typeof text == 'object') {
            text = text.toMessage();
        }
        var toWrite = {
            from: 'bot',
            message: text,
            messageType: "string",
            timestamp: new Date().valueOf(),
        };
        // Fill luis and qna data in the dialogs
        if (session.conversationData.bot.luisIntent) 
            toWrite.luisIntent = session.privateConversationData.bot.luisIntent;
        if (session.conversationData.bot.luisScore) 
            toWrite.luisScore = session.privateConversationData.bot.luisScore;
        if (session.conversationData.bot.luisEntities) 
            toWrite.luisEntities = session.privateConversationData.bot.luisEntities;
        if (session.conversationData.bot.qnaScore) 
            toWrite.qnaScore = session.privateConversationData.bot.qnaScore;
        if (session.conversationData.bot.qnaResponse) 
            toWrite.qnaResponse = session.privateConversationData.bot.qnaResponse;
        if (session.conversationData.bot.userQuestion) 
            toWrite.userQuestion = session.privateConversationData.bot.userQuestion;
        chatlogs.saveMessageDocument(session, toWrite, (err) => console.log(err));
    } catch (e) {
        console.log(e);
    }
}
```

## Contacts
Girimurugan.Natarajan@walmart.com

Madhav.Khaddar@walmartlabs.com

Jatin.Mohan@walmartlabs.com