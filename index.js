const fs =require("fs");
const readline = require("readline");
const {google} = require("googleapis");
const sdk = require("matrix-js-sdk");
const BigNumber = require("bignumber.js");
const dayjs = require("dayjs");
const { point_types, domains } = require("./constants");

// If modifying these scopes, delete credentials.json.
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const TOKEN_PATH = "credentials.json";

// Load client secrets from a local file.
fs.readFile("client_secret.json", (err, content) => {
  if (err) return console.log("Error loading client secret file:", err);
  // Authorize a client with credentials, then call the Google Sheets API.
  authorize(JSON.parse(content), authenticated);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question("Enter the code from that page here: ", (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return callback(err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log("Token stored to", TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

const client = sdk.createClient("https://matrix.org");

function authenticated(auth) {
  client.login(
    "m.login.password",
    {
      user: process.env.BOT_USER,
      password: process.env.BOT_PASSWORD
    },
    (err, data) => {
      if (err) {
        console.log("Error:", err);
      }

      console.log(`Logged in ${data.user_id} on device ${data.device_id}`);
      const client = sdk.createClient({
        baseUrl: "https://matrix.org",
        accessToken: data.access_token,
        userId: data.user_id,
        deviceId: data.device_id
      });

      client.on("Room.timeline", (event, room, toStartOfTimeline) => {
        if (event.getType() === "m.room.message" && toStartOfTimeline === false) {
          client.setPresence("online");
          const message = event.getContent().body;
          const roomId = room.roomId;
          const command = message.split(" ")[0];
          if (command == "!help"){
            client.sendTextMessage(roomId, "dish points using the following format:\n!dish [#of points] [type of points] points to [handle] for [reason]");
          } else if (command == "!dish"){
            handleDish(event, room, client, auth);
          } else if (command == "!sheet"){
            client.sendTextMessage(roomId, "the rewardDAO sheet can be found here: " + "https://docs.google.com/spreadsheets/d/12cbluyuyq4nwzx7jdro0-nwnroxldy-xcbvf3ugzb2c/edit?usp=sharing");
          }
        }
      });

      client.startClient(0);
    }
  );
}

function handleDish(event, room, client, auth){
  const sender = event.getSender();
  const message = event.getContent().body;
  try {
    const splitMsg = message.split(" ");
    const amount = new BigNumber(splitMsg[1]);
    if (amount.isNaN()){
      const pointError = new Error("Invalid number of points dished. Please enter a valid number and try again");
      pointError.code = "POINTS_NOT_NUMBER";
      throw pointError;
    }
    const type = splitMsg[2].toUpperCase();
    if (!point_types.includes(type)) {
      const typeError = new Error(`Invalid point type '${type}'. Please use one of ${point_types}.`);
      typeError.code = "POINT_TYPE_DOES_NOT_EXIST";
      throw typeError;
    }
    
    const {userInRoom, receiver, multipleUsers} = findReceiver(room, splitMsg[5]);
    
    if (multipleUsers){
      const userError = new Error(`There are multiple users with the name '${receiver}' in this room.
please specify the domain name of the user using the format @[userId]:[domain]`);
      userError.code = "USER_MULTIPLE";
      throw userError; 
    }

    if (!userInRoom){
      const userError = new Error(`Username '${receiver}' does not exist in this room.
either add this user to the room, or try again using the format @[userId]:[domain]`);
      userError.code = "USER_DOES_NOT_EXIST";
      throw userError;
    }
    
    const reason = "For" + message.split("for")[1];
    const date = dayjs().format("DD-MMM-YYYY");
    const link = `https://riot.im/app/#/room/${room.roomId}/${event.getId()}`;

    const values = [[receiver, sender, reason, amount.toFormat(2), type, date, link]];
    const body = { values };
    const sheets = google.sheets({version: "v4", auth});
    sheets.spreadsheets.values.append({
      spreadsheetId: "12cblUYuYq4NwZX7JdRo0-NWnrOxlDy-XCbvF3ugzb2c",
      range: "PointsBot (DONT RENAME!)!A1:F1",
      valueInputOption: "USER_ENTERED",
      resource: body
    }, (err) => {
      if (err) return console.log("The API returned an error: " + err);
      client.sendTextMessage(room.roomId, `${sender} dished ${amount} ${type} points to ${receiver}`);
    });
  }
  catch(err) {
    const MANUAL_ERROR_CODES = ["POINTS_NOT_NUMBER", "USER_DOES_NOT_EXIST", "POINT_TYPE_DOES_NOT_EXIST", "USER_MULTIPLE"];
    console.log(err);
    if (MANUAL_ERROR_CODES.includes(err.code)){
      client.sendTextMessage(room.roomId, "ERROR: " + err.message + "\nType '!help' for more information.");
    } else{
      client.sendTextMessage(room.roomId, "ERROR, please use the following format:\n!dish [#of points] [type of points] points to [handle] for [reason]");
    }
  }
}

// Try to intelligently format the receiver field
function findReceiver(room, receiver){
  if (receiver[0] != "@"){
    receiver = `@${receiver}`;
  }
  
  //defaults
  let userInRoom = false;
  let multipleUsers = false;
  
  if (room.getMember(receiver) != null){
    userInRoom = true;
  }
      
  if (receiver.split(":").length < 2 && !userInRoom) {
    for (let domain of domains){
      if (room.getMember(`${receiver}:${domain}`) != null){
        receiver = `${receiver}:${domain}`;
        
        // if a user has already been found under a different domain
        if (userInRoom){
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
  };
}

// Zeit NOW workaround
const http = require("http");
http.createServer((req, res) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.end("Hello there!");
}).listen();
