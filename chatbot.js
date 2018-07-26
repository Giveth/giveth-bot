const privateRooms = {};

const { positiveResponses, negativeResponses, messages } = require("./constants");

exports.handleNewMember = function (event, state, member, client) {
  const user = member.userId;

  var roomMessages = messages[state.roomId];

  if (roomMessages !== undefined) {
    handleWelcome(state, user, client, roomMessages.externalMsg, roomMessages.internalMsg);
  }
};

exports.handleResponse = function (event, room, toStartOfTimeline, client) {
  if (event.getType() === "m.room.message" && toStartOfTimeline === false) {
    var msg = event.getContent().body;
    const user = event.getSender();

    if (privateRooms[user] !== undefined && privateRooms[user].welcoming !== undefined) {

      if (user != client.credentials.userId && room.roomId == privateRooms[user].room) {

        var questions = messages[privateRooms[user].welcoming.room].internalMsg;
        var curQuestion = privateRooms[user].welcoming.curQuestion;

        var positive = false;
        var negative = false;
        for (var p = 0; p < positiveResponses.length; p++) {
          if (msg.includes(positiveResponses[p].toLowerCase())) {
            positive = true;
            break;
          }
        }

        for (var n = 0; n < negativeResponses.length; n++) {
          if (msg.includes(negativeResponses[n].toLowerCase())) {
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
            sendNextQuestion(curQuestion, questions, user, client, privateRooms[user].welcoming.room);
          } else {
            privateRooms[user].welcoming = undefined;
          }
        } else {
          sendInternalMessage("I didn't recognize that response :(", user, client);
        }
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
    if (privateRooms[user] === undefined || (privateRooms[user] !== undefined && privateRooms[user].welcoming === undefined)) {
      sendNextQuestion(-1, internalMsg, user, client, state.roomId);
    }
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
    if (callback !== undefined) {
      callback();
    }
  } else {
    client.createRoom({ preset: "trusted_private_chat", invite: [user], is_direct: true }).then((res) => {
      privateRooms[user] = { "room": res.room_id };
      sendMessage(msg, user, client, privateRooms[user].room);
      if (callback !== undefined) {
        callback();
      }
    });
  }
}

function sendMessage(msg, user, client, room) {
  if (msg.length > 0) {
    msg = msg.replace("%USER%", user);
    client.sendTextMessage(room, msg);
  }
}