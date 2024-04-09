<a name="ChatLogger"></a>

## ChatLogger
**Kind**: global class  

* [ChatLogger](#ChatLogger)
    * [new ChatLogger(url, key, botID, env)](#new_ChatLogger_new)
    * [.saveMessageDocument(session, metadata, callback)](#ChatLogger+saveMessageDocument)
    * [.saveUserDocument(metadata, callback)](#ChatLogger+saveUserDocument)
    * [.queryUser(userID)](#ChatLogger+queryUser)
    * [.queryConversation(conversationID)](#ChatLogger+queryConversation)
    * [.saveUsageDocument(session, metadata, callback)](#ChatLogger+saveUsageDocument)
    * [.saveConversationDocument(session, metadata, callback)](#ChatLogger+saveConversationDocument)
    * [.updateFeedback(id, feedback, callback)](#ChatLogger+updateFeedback)

<a name="new_ChatLogger_new"></a>

### new ChatLogger(url, key, botID, env)
This class provides methods to connect the database and
create documents for telemetry purpose.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| url | <code>String</code> |  | of database |
| key | <code>String</code> |  | Read/Write key of database |
| botID | <code>String</code> |  | Unique ID to identify the bot |
| env | <code>String</code> | <code>DEV</code> | Should be either 'DEV' or 'PROD' |

<a name="ChatLogger+saveMessageDocument"></a>

### chatLogger.saveMessageDocument(session, metadata, callback)
Writes data related to a particular message

**Kind**: instance method of [<code>ChatLogger</code>](#ChatLogger)  

| Param | Type | Description |
| --- | --- | --- |
| session | <code>\*</code> | Current session object of the bot |
| metadata | <code>Object</code> | Json object containing the particular message Data |
| metadata.from | <code>String</code> |  |
| metadata.message | <code>String</code> |  |
| metadata.messageType | <code>String</code> |  |
| [metadata.timestamp] | <code>Number</code> |  |
| [metadata.userQuestion] | <code>String</code> |  |
| [metadata.card] | <code>JSON</code> |  |
| [metadata.conversationID] | <code>String</code> |  |
| [metadata.luisIntent] | <code>String</code> |  |
| [metadata.luisScore] | <code>Number</code> |  |
| [metadata.qnaScore] | <code>Number</code> |  |
| [metadata.qnaResponse] | <code>JSON</code> |  |
| [metadata.feedback] | <code>String</code> |  |
| [metadata.customData] | <code>JSON</code> |  |
| callback | <code>function</code> | executes after completion. First parameter is error(if any) followed by document ID |

<a name="ChatLogger+saveUserDocument"></a>

### chatLogger.saveUserDocument(metadata, callback)
Writes the user data onto the User Collection

**Kind**: instance method of [<code>ChatLogger</code>](#ChatLogger)  

| Param | Type | Description |
| --- | --- | --- |
| metadata | <code>Object</code> | Json object containing the user Data |
| metadata.userID | <code>String</code> |  |
| metadata.userName | <code>String</code> |  |
| metadata.email | <code>String</code> |  |
| metadata.countryCode | <code>String</code> |  |
| [metadata.customData] | <code>JSON</code> |  |
| callback | <code>function</code> | executes after completion, contains error as the parameter to callback |

<a name="ChatLogger+queryUser"></a>

### chatLogger.queryUser(userID)
returns the documents with the userID

**Kind**: instance method of [<code>ChatLogger</code>](#ChatLogger)  

| Param | Type |
| --- | --- |
| userID | <code>string</code> | 

<a name="ChatLogger+queryConversation"></a>

### chatLogger.queryConversation(conversationID)
returns the documents with the conversationID

**Kind**: instance method of [<code>ChatLogger</code>](#ChatLogger)  

| Param | Type |
| --- | --- |
| conversationID | <code>string</code> | 

<a name="ChatLogger+saveUsageDocument"></a>

### chatLogger.saveUsageDocument(session, metadata, callback)
saves the particular session usage of the bot

**Kind**: instance method of [<code>ChatLogger</code>](#ChatLogger)  

| Param | Type | Description |
| --- | --- | --- |
| session | <code>\*</code> | Current session object of the bot |
| metadata | <code>Object</code> | Json object containing a particular bot usage Data |
| metadata.startTimestamp | <code>Number</code> |  |
| metadata.abandon | <code>boolean</code> |  |
| metadata.endTimestamp | <code>Number</code> |  |
| [metadata.conversationID] | <code>String</code> |  |
| callback | <code>function</code> | executes after completion, contains error as the parameter to callback |

<a name="ChatLogger+saveConversationDocument"></a>

### chatLogger.saveConversationDocument(session, metadata, callback)
Saves data related to a particular conversation

**Kind**: instance method of [<code>ChatLogger</code>](#ChatLogger)  

| Param | Type | Description |
| --- | --- | --- |
| session | <code>\*</code> | Current session object of the bot |
| metadata | <code>Object</code> | Json object containing conversation related data |
| metadata.userID | <code>String</code> |  |
| [metadata.botname] | <code>String</code> |  |
| [metadata.timestamp] | <code>Number</code> |  |
| [metadata.conversationID] | <code>String</code> |  |
| [metadata.customData] | <code>JSON</code> |  |
| callback | <code>function</code> | executes after completion, contains error as the parameter to callback |

<a name="ChatLogger+updateFeedback"></a>

### chatLogger.updateFeedback(id, feedback, callback)
Function to update feedback of a message

**Kind**: instance method of [<code>ChatLogger</code>](#ChatLogger)  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> | ID of the message returned after calling saveMessageDocument |
| feedback | <code>String</code> | POSITIVE OR NEGATIVE |
| callback | <code>function</code> | executes after completion, contains error as the parameter to callback |

