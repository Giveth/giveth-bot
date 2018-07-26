const privateRooms = {};

const positiveResponses = ["Yes", "Yup", "Yea"];
const negativeResponses = ["No"];

const messages = {
    "!kUeYRcrXObgGoJlFjn:matrix.org": {
        "internalMsg": "Now that you’re in [Social Coding] there are a few resources that will help you along the way:\
      [What are points](https://medium.com/giveth/how-rewarddao-works-aka-what-are-points-7388f70269a) and [What is Social Coding](https://steemit.com/blockchain4humanity/@giveth/what-is-the-social-coding-circle).\
     if you have any questions that are not covered in the literature please reach out to @Quazia or @YalorMewn and they will happily follow up with you in 24-48 hours",
        "externalMsg": "Welcome %USER% to #giveth-social-coding:matrix.org where your pragma can roam the wild steppe of the blockchain world"
    },

    "#giveth-general:matrix.org": {
        "internalMsg": [
            { "msg": "Hey %USER%, welcome to Giveth!! First a few tips if you are a new Riot user: [Download Riot](https://about.riot.im/downloads/) on your device for quick and easy access Limit notifications per room [by changing it](https://about.riot.im/need-help/#rooms-section) to mentions only" },
            { "msg": "Do you want to know which rooms you can join?", "positive": "POSITIVE", "negative": "Sure! No worries, whenever you want this info, just ask me here." }
        ]
    }
}

exports.handleNewMember = function (event, state, member, client) {
    const user = member.userId;

    roomMessages = messages[state.roomId];

    if (roomMessages !== undefined) {
        handleWelcome(state, user, client, roomMessages.externalMsg, roomMessages.internalMsg);
    }
};

exports.handleResponse = function (event, room, toStartOfTimeline, client) {
    if (event.getType() === "m.room.message" && toStartOfTimeline === false) {
        var msg = event.getContent().body;
        const user = event.getSender();

        if (privateRooms[user] !== undefined && privateRooms[user].welcoming !== undefined) {

            var questions = messages[privateRooms[user].welcoming.room].internalMsg;
            var curQuestion = privateRooms[user].welcoming.curQuestion;

            var positive = false;
            var negative = false;
            for (i = 0; i < positiveResponses.length; i++) {
                if (msg.includes(positiveResponses[i])) {
                    positive = true;
                    break;
                }
            }

            for (i = 0; i < negativeResponses.length; i++) {
                if (msg.includes(negativeResponses[i])) {
                    negative = true;
                    break;
                }
            }

            if (positive) {
                sendInternalMessage(questions[curQuestion].positive, user, client);
            } else if (negative) {
                sendInternalMessage(questions[curQuestion].negative, user, client);
            }

            if (positive || negative) {
                if (questions.length > curQuestion + 1) {
                    sendNextQuestion(curQuestion, questions, user, client);
                } else {
                    privateRooms[user].welcoming = undefined;
                }
            } else {
                sendInternalMessage("I didn't recognize that response :(", user, client);
            }
        }
    }
};

function handleWelcome(state, user, client, externalMsg, internalMsg) {
    if (typeof externalMsg === "string") {
        sendMessage(externalMsg, user, client, state.roomId);
    }
    if (typeof internalMsg === "string") {
        sendInternalMessage(internalMsg, user, client);
    } else if (typeof internalMsg === "object") {
        sendNextQuestion(-1, internalMsg, user, client, state.roomId);
    }
}

function sendNextQuestion(curQuestion, questions, user, client, room) {
    curQuestion++;
    if (privateRooms[user] !== undefined) {
        privateRooms[user].welcoming = { "room": room, "curQuestion": curQuestion };
    }
    var question = questions[curQuestion];
    sendInternalMessage(question.msg, user, client, () => {
        if (question.positive === undefined) {
            sendNextQuestion(curQuestion, questions, user, client, room);
        }
    });

}

function sendInternalMessage(msg, user, client, callback) {
    if (privateRooms[user] !== undefined && privateRooms[user].room !== undefined) {
        sendMessage(msg, user, client, privateRooms[user].room);
    } else {
        client.createRoom({ preset: "trusted_private_chat", invite: [user], is_direct: true }).then((res) => {
            privateRooms[user] = { "room": res.room_id };
            sendMessage(msg, user, client, privateRooms[user].room);
            callback();
        });
    }
}

function sendMessage(msg, user, client, room) {
    if (msg.length > 0) {
        msg = msg.replace("%USER%", user);
        client.sendTextMessage(room, msg);
    }
}