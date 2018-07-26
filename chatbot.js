console.log("Loading messages..");
const fs = require("fs");
const messages = JSON.parse(fs.readFileSync('messages.json', 'utf8'));

exports.handleNewMember = function (event, state, member, client) {
    const user = member.userId;

    roomMessages = messages[state.roomId];

    if (roomMessages !== undefined) {
        handleWelcome(state, user, client, roomMessages.externalMsg.replace("%USER%", user), roomMessages.internalMsg.replace("%USER%", user));
    }
};

function handleWelcome(state, user, client, externalMsg, internalMsg) {
    if (internalMsg.length > 0) {
        client.sendTextMessage(state.roomId, internalMsg);
    }
    if (externalMsg.length > 0) {
        client.createRoom({ preset: "trusted_private_chat", invite: [user], is_direct: true }).then((res) => {
            client.sendTextMessage(res.room_id, externalMsg);
        });
    }
}