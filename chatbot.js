const fs = require("fs");
const markdown = require("markdown").markdown;
let privateRooms = {};

const { positiveResponses, negativeResponses, messages, questions } = require("./constants");

fs.readFile("./privateRooms.json", "utf8", function (err, data) {
  if (!err) {
    privateRooms = JSON.parse(data);
  }
});

exports.handleNewMember = function (event, state, member, client) {
  const user = member.userId;

  let roomMessages = messages[state.roomId];

  if (roomMessages && checkUser(user)) {
    handleWelcome(state, user, client, roomMessages.externalMsg, roomMessages.internalMsg);
  }
};

exports.handleResponse = function (event, room, toStartOfTimeline, client) {
  if (event.getType() === "m.room.message" && toStartOfTimeline === false) {
    let msg = event.getContent().body;
    const user = event.getSender();

    if (checkUser(user)) {

      if (privateRooms[user] && privateRooms[user].welcoming && user != client.credentials.userId && room.roomId == privateRooms[user].room) {

        let greetingQuestions = messages[privateRooms[user].welcoming.room].internalMsg;
        let curQuestion = privateRooms[user].welcoming.curQuestion;

        let positive = false;
        let negative = false;
        for (let p = 0; p < positiveResponses.length; p++) {
          if (msg.includes(positiveResponses[p].toLowerCase())) {
            positive = true;
            break;
          }
        }

        for (let n = 0; n < negativeResponses.length; n++) {
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
      } else if ((!privateRooms[user] || !privateRooms[user].welcoming) && user != client.credentials.userId) {
        if (privateRooms[user] && privateRooms[user].room == room.roomId) {
          for (let key in questions) {
            if (questions.hasOwnProperty(key) && checkForRoomQuestions(msg, key, room.roomId, user, client)) {
              break;
            }
          }
        } else {
          checkForRoomQuestions(msg, room.roomId, room.roomId, user, client);
        }
      }
    } else if (event.getType() === "m.room.member" && event.event.membership === "leave") {
      let privateRoom = privateRooms[event.getSender()];
      if (privateRoom && privateRoom.room == event.event.room_id) {
        privateRoom.room = undefined;
        privateRoom.welcoming = undefined;
        savePrivateRooms();
      }
    }
  }
};

function checkUser(user) {
  // Ignore Slack bridge users
  return !user.startsWith("slack_giveth_");
}

function checkForRoomQuestions(msg, roomForQuestions, roomToSendIn, user, client) {
  let questionsForRoom = questions[roomForQuestions];
  if (questionsForRoom) {
    for (let i = 0; i < questionsForRoom.length; i++) {
      let question = questionsForRoom[i];
      let shouldAnswerQuestion = false;
      if (typeof question.trigger === "string") {
        shouldAnswerQuestion = msg.toLowerCase().includes(question.trigger.toLowerCase());
      } else {
        for (let t = 0; t < question.trigger.length; t++) {
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
    if (!privateRooms[user] || (privateRooms[user] && !privateRooms[user].welcoming)) {
      sendNextQuestion(-1, internalMsg, user, client, state.roomId);
    }
  }
}

function sendNextQuestion(curQuestion, questions, user, client, room) {
  curQuestion++;
  if (privateRooms[user]) {
    privateRooms[user].welcoming = { "room": room, "curQuestion": curQuestion };
  }
  let question = questions[curQuestion];
  sendInternalMessage(question.msg, user, client, () => {
    if (!question.positive) {
      sendNextQuestion(curQuestion, questions, user, client, room);
    }
  });

}

function sendInternalMessage(msg, user, client, callback) {
  if (privateRooms[user] && privateRooms[user].room) {
    sendMessage(msg, user, client, privateRooms[user].room);
    if (callback) {
      callback();
    }
  } else {
    client.createRoom({ preset: "trusted_private_chat", invite: [user], is_direct: true }).then((res) => {
      privateRooms[user] = { "room": res.room_id };
      savePrivateRooms();
      sendMessage(msg, user, client, privateRooms[user].room);
      if (callback) {
        callback();
      }
    });
  }
}

function sendMessage(msg, user, client, room) {
  if (msg.length > 0) {
    msg = msg.replace(/^ +| +$/gm, "");
    let html = markdown.toHTML(msg);
    msg = msg.replace("%USER%", user);
    html = html.replace("%USER%", user);
    client.sendHtmlMessage(room, msg, html);
  }
}

function savePrivateRooms() {
  fs.writeFile("./privateRooms.json", JSON.stringify(privateRooms, null, 2), "utf-8");
}