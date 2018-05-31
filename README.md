
# Giveth bot
A matrix bot that handles everything from information to point dishing for the Giveth community.

## Development
1. Follow [this](https://developers.google.com/sheets/api/quickstart/nodejs) guide to get `client_secret.json`.
2. Install cross-env globally: `npm i -g cross-env`.
3. install dependenceis: `npm install`
4. Create a matrix account using [riot.im](https://riot.im/app/)
5. Start the bot with following parameters: `cross-env BOT_USER="YOUR_BOT_USER_NAME" BOT_PASSWORD="YOUR_BOT_PASSWORD" node index`

## Production
Zeit.co NOW is being used to host the bot.

`client_secret.json` and `credentials.json` are required files.

Remove both files from `.gitignore`.

You can run `now -e BOT_USER="name" -e BOT_PASSWORD="password"` to deploy the bot.

## Usage
Invite your bot to a room and use one of the folowing commands:
* `!dish [# of points] [type of points] points to [handle] for [reason explaining why].`
* `!help` for more information.
* `!sheet` to see the current [rewardDAO](https://medium.com/giveth/how-rewarddao-works-aka-what-are-points-7388f70269a) sheet

Pull requests are welcome!
Please run `eslint index.js` before submitting a PR to ensure that you have not introduced any errors.
