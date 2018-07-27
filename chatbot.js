const fs = require("fs");
var privateRooms = {};

const { positiveResponses, negativeResponses, messages, questions } = require("./constants");

fs.readFile("./privateRooms.json", "utf8", function (err, data) {
  if (!err) {
    privateRooms = JSON.parse(data);
  }
});

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

    if (privateRooms[user] !== undefined && privateRooms[user].welcoming !== undefined && user != client.credentials.userId && room.roomId == privateRooms[user].room) {

      var greetingQuestions = messages[privateRooms[user].welcoming.room].internalMsg;
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
        sendInternalMessage(greetingQuestions[curQuestion].positive, user, client);
      } else if (negative) {
        sendInternalMessage(greetingQuestions[curQuestion].negative, user, client);
      }

      if (positive || negative) {
        if (greetingQuestions.length > curQuestion + 1) {
          sendNextQuestion(curQuestion, greetingQuestions, user, client, privateRooms[user].welcoming.room);
        } else {
          privateRooms[user].welcoming = undefined;
        }
      } else {
        sendInternalMessage("I didn't recognize that response :(", user, client);
      }
    } else if ((privateRooms[user] === undefined || privateRooms[user].welcoming === undefined) && user != client.credentials.userId) {
      if (privateRooms[user] !== undefined && privateRooms[user].room == room.roomId) {
        for (var key in questions) {
          if (questions.hasOwnProperty(key) && checkForRoomQuestions(msg, key, room.roomId, user, client)) {
            break;
          }
        }
      } else {
        checkForRoomQuestions(msg, room.roomId, room.roomId, user, client);
      }
    }
  } else if (event.getType() === "m.room.member" && event.event.membership === "leave") {
    var privateRoom = privateRooms[event.getSender()];
    if (privateRoom !== undefined && privateRoom.room == event.event.room_id) {
      privateRoom.room = undefined;
      privateRoom.welcoming = undefined;
      savePrivateRooms();
    }
  }
};

function checkForRoomQuestions(msg, roomForQuestions, roomToSendIn, user, client) {
  var questionsForRoom = questions[roomForQuestions];
  if (questionsForRoom !== undefined) {
    for (var i = 0; i < questionsForRoom.length; i++) {
      var question = questionsForRoom[i];
      var shouldAnswerQuestion = false;
      if (typeof question.trigger === "string") {
        shouldAnswerQuestion = msg.toLowerCase().includes(question.trigger.toLowerCase());
      } else {
        for (var t = 0; t < question.trigger.length; t++) {
          if (msg.toLowerCase().includes(question.trigger[t].toLowerCase())) {
            shouldAnswerQuestion = true;
            break;
          }
        }
      }
      if (shouldAnswerQuestion) {
        sendMessage(question.answer, user, client, roomToSendIn);
        return true;
      }
    }
  }
  return false;
}

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
      savePrivateRooms();
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

function savePrivateRooms() {
  fs.writeFile("./privateRooms.json", JSON.stringify(privateRooms, null, 2), "utf-8");
}