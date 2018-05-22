
# Giveth bot
A matrix bot that handles everything from information to point dishing for the Giveth community.

## Development
Follow [this](https://developers.google.com/sheets/api/quickstart/nodejs) guide to get `client_secret.json`.
Install cross-env globally: `npm i -g cross-env`.
Start the bot with following parameters: `cross-env BOT_USER="name" BOT_PASSWORD="password" node index`

## Production
Zeit.co NOW is being used to host the bot.
`client_secret.json` and `credentials.json` are required files.
Remove both files from `.gitignore`.
You can run `now -e BOT_USER="name" -e BOT_PASSWORD="password"` to deploy the bot.
