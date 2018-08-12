const dayjs = require("dayjs");
const { point_types, domains, max_points, sheet_id, sheet_tab_name } = require("./constants");
const BigNumber = require("bignumber.js");
const { google } = require("googleapis");

exports.handlePointGiving = function (auth, event, room, toStartOfTimeline, client) {
  if (event.getType() === "m.room.message" && toStartOfTimeline === false) {
    client.setPresence("online");
    let message = event.getContent().body;
    const roomId = room.roomId;

    if (message[1] === " ") {
      message = message.replace(" ", "");
    }

    const command = message.toLowerCase().split(" ")[0];

    if (command == "!help") {
      client.sendTextMessage(roomId, "dish points using the following format:\n!dish [#of points] [type of points] points to [handle] for [reason]");
    } else if (command == "!dish") {
      handleDish(event, room, client, auth);
    } else if (command == "!sheet") {
      client.sendTextMessage(roomId, `the rewardDAO sheet can be found here: https://docs.google.com/spreadsheets/d/${sheet_id}`);
    }
  }
};

function handleDish(event, room, client, auth) {
  let message = event.getContent().body;
  let matched = false;
  if (event.getSender() == `@${process.env.BOT_USER}:matrix.org`) { // we sent the message.
    return;
  }
  if (message.trim()[0] == ">") { //quoting another user, skip the quoted part
    matched = true;
    message = message.split("\n\n")[1];
  }

  const re = /!\s*dish\s+(\S+)\s+(\S+)\s+points\s+to\s+(\S+)\s+for\s+([^\n]+)/gi;
  let match;
  do {
    match = re.exec(message);
    if (match) {
      tryDish(event, room, client, auth, match[1], match[2], match[3].trim(), match[4]);
      matched = true;
    }
  } while (match);
  if (!matched) {
    client.sendTextMessage(room.roomId, "ERROR, please use the following format:\n!dish [#of points] [type of points] points to [handle] for [reason]");
  }
}

function tryDish(event, room, client, auth, nPoints, type, user, reason) {
  try {
    const sender = event.getSender();
    const amount = new BigNumber(nPoints);
    type = type.toUpperCase();

    if (amount.isNaN()) {
      const pointError = new Error("Invalid number of points dished. Please enter a valid number and try again");
      pointError.code = "POINTS_NOT_NUMBER";
      throw pointError;
    }

    if (amount.isLessThan(1)) {
      const pointError = new Error("You can't dish negative or zero amount of points!");
      pointError.code = "POINTS_ARE_NEGATIVE_OR_ZERO";
      throw pointError;
    }

    if (amount.isGreaterThan(max_points)) {
      const pointError = new Error(`You can't dish more than ${max_points} points each time!`);
      pointError.code = "POINTS_OVER_MAXIMUM";
      throw pointError;
    }

    if (!point_types.includes(type)) {
      const typeError = new Error(`Invalid point type '${type}'. Please use one of ${point_types}.`);
      typeError.code = "POINT_TYPE_DOES_NOT_EXIST";
      throw typeError;
    }

    let { userInRoom, receiver, display_name, multipleUsers } = findReceiver(room, user); // try to find user

    // handle github users
    const BASE_GITHUB_URL = "https://github.com/";
    if (user.split(BASE_GITHUB_URL)[1]) {
      receiver = user;
      userInRoom = true, multipleUsers = false;
    }

    if (multipleUsers) {
      const userError = new Error(`There are multiple users with the name '${receiver}' in this room.
please specify the domain name of the user using the format @[userId]:[domain]`);
      userError.code = "USER_MULTIPLE";
      throw userError;
    }

    if (!userInRoom) {
      const userError = new Error(`Username '${receiver}' does not exist in this room.
either add this user to the room, or try again using the format @[userId]:[domain]`);
      userError.code = "USER_DOES_NOT_EXIST";
      throw userError;
    }
    const date = dayjs().format("DD-MMM-YYYY");
    const link = `https://riot.im/app/#/room/${room.roomId}/${event.getId()}`;

    const values = [[receiver, sender, reason, amount.toFormat(2), type, date, link, display_name]];
    const body = { values };
    const sheets = google.sheets({ version: "v4", auth });
    sheets.spreadsheets.values.append({
      spreadsheetId: sheet_id,
      range: sheet_tab_name,
      valueInputOption: "USER_ENTERED",
      resource: body
    }, (err) => {
      if (err) return console.log("The API returned an error: " + err);
      client.sendTextMessage(room.roomId, `${sender} dished ${amount} ${type} points to ${receiver}`);
    });
  }
  catch (err) {
    const MANUAL_ERROR_CODES = [
      "POINTS_NOT_NUMBER",
      "USER_DOES_NOT_EXIST",
      "POINT_TYPE_DOES_NOT_EXIST",
      "USER_MULTIPLE",
      "POINTS_ARE_NEGATIVE_OR_ZERO",
      "POINTS_OVER_MAXIMUM",
    ];
    console.log(err);
    if (MANUAL_ERROR_CODES.includes(err.code)) {
      client.sendTextMessage(room.roomId, "ERROR: " + err.message + "\nType '!help' for more information.");
    } else {
      client.sendTextMessage(room.roomId, "ERROR, please use the following format:\n!dish [#of points] [type of points] points to [handle] for [reason]");
    }
  }
}

// Try to intelligently format the receiver field
function findReceiver(room, receiver) {
  if (receiver[0] != "@") {
    receiver = `@${receiver}`;
  }

  //defaults
  let userInRoom = false;
  let multipleUsers = false;
  let display_name = "";

  if (room.getMember(receiver) != null) {
    userInRoom = true;
  }

  if (receiver.split(":").length < 2 && !userInRoom) {
    for (let domain of domains) {
      if (room.getMember(`${receiver}:${domain}`) != null) {
        receiver = `${receiver}:${domain}`;
        display_name = room.getMember(receiver).name;

        // if a user has already been found under a different domain
        if (userInRoom) {
          multipleUsers = true;
          receiver = receiver.split(":")[0];
          break;
        }

        // user under this domain was found.
        userInRoom = true;
      }
    }
  }
  return {
    userInRoom,
    receiver,
    multipleUsers,
    display_name,
  };
}
