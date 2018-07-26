
exports.handleNewMember = function (event, state, member, client) {
    const SC_ROOM_ID = "!kUeYRcrXObgGoJlFjn:matrix.org";

    const user = member.userId;
    var externalMsg;
    var internalMsg;

    switch (state.roomId) {
        case SC_ROOM_ID:
            externalMsg = `Now that you’re in [Social Coding] there are a few resources that will help you along the way:\
        [What are points](https://medium.com/giveth/how-rewarddao-works-aka-what-are-points-7388f70269a) and [What is Social Coding](https://steemit.com/blockchain4humanity/@giveth/what-is-the-social-coding-circle).\
       if you have any questions that are not covered in the literature please reach out to @Quazia or @YalorMewn and they will happily follow up with you in 24-48 hours`;
            internalMsg = `Welcome ${user} to #giveth-social-coding:matrix.org where your pragma can roam the wild steppe of the blockchain world`
            break;

    }
    handleWelcome(state, user, client, externalMsg, internalMsg);
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