const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");
const sdk = require("matrix-js-sdk");
const BigNumber = require("bignumber.js");
const dayjs = require("dayjs");
const { point_types, domains, max_points, sheet_id, sheet_tab_name } = require("./constants");
const pointsBot = require('./pointsbot.js');
const chatBot = require('./chatbot.js');

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
  const { client_secret, client_id, redirect_uris } = credentials.installed;
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
        pointsBot.handlePointGiving(event, room, toStartOfTimeline, client);
        chatBot.handleResponse(event, room, toStartOfTimeline, client);
      });

      client.once("sync", (syncState) => {
        if (syncState === "PREPARED") {
          client.on("RoomState.newMember", (event, state, member) => {
            chatBot.handleNewMember(event, state, member, client);
          });
        }
      });

      client.startClient(0);
    }
  );
}

// Zeit NOW workaround
const http = require("http");
http.createServer((req, res) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.end("Hello there!");
}).listen();
