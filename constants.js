// Allowed users that can dish out points
// module.exports.userList = [
// ]

// Allowed point types
module.exports.point_types = [
  "GOV",
  "DAPP",
  "SC",
  "COMM",
  "UNICORN",
  "ARAGON",
  "FLURKEL",
  "ETHKAN",
  "DAPPNODE",
  "SIGNALING"
];

module.exports.domains = [
  "matrix.org",
  "status.im",
  "giveth.io",
  "gitter.im",
];

module.exports.max_points = 10000;

module.exports.sheet_id = process.env.NODE_ENV == "production" ? "12cblUYuYq4NwZX7JdRo0-NWnrOxlDy-XCbvF3ugzb2c" : "10sU4UNlCq8fZ3f4zouoq945zTScw27uUV1LU0siA1YA";
module.exports.sheet_tab_name = "PointsBot (DONT RENAME!)!A1:F1";


// CHATBOT

module.exports.positiveResponses = ["Yes", "Yup", "Yea"];
module.exports.negativeResponses = ["No"];

module.exports.messages = {
  // SOCIAL CODING
  "!kUeYRcrXObgGoJlFjn:matrix.org": {
    "internalMsg": "Now that you’re in [Social Coding] there are a few resources that will help you along the way:\
    [What are points](https://medium.com/giveth/how-rewarddao-works-aka-what-are-points-7388f70269a) and [What is Social Coding](https://steemit.com/blockchain4humanity/@giveth/what-is-the-social-coding-circle).\
   if you have any questions that are not covered in the literature please reach out to @Quazia or @YalorMewn and they will happily follow up with you in 24-48 hours",
    "externalMsg": "Welcome %USER% to #giveth-social-coding:matrix.org where your pragma can roam the wild steppe of the blockchain world"
  },

  // GENERAL
  "#giveth-general:matrix.org": {
    "internalMsg": [
      { "msg": "Hey %USER%, welcome to Giveth!! First a few tips if you are a new Riot user: [Download Riot](https://about.riot.im/downloads/) on your device for quick and easy access Limit notifications per room [by changing it](https://about.riot.im/need-help/#rooms-section) to mentions only" },
      {
        "msg": "Do you want to know which rooms you can join?", "positive": "[Here](https://riot.im/app/#/group/+giveth:matrix.org) you can find an overview of all our rooms.\
    Some more info about some of them:\
Do you aim to - or already are - united around **good causes**? Join the conversation & sign up for DApp testing in [Communities](https://riot.im/app/#/room/#giveth-communities:matrix.org).\
Do you have **time & energy**? Good. Every month we Give Eth to [Contributors](https://riot.im/app/#/room/#giveth-contributors:matrix.org)\
Up for some **real talk**? Share & care in [Blockchaintalk](https://riot.im/app/#/room/#giveth-blockchaintalk:matrix.org) \
Check our **product progress** in [Dapp Development](https://riot.im/app/#/room/#giveth-product-development:matrix.org) \
Help us **create** and connect in [Communication](https://riot.im/app/#/room/#giveth-communication:matrix.org)\
**Hack away** on projects you select in [Social Coding](https://riot.im/app/#/room/#giveth-social-coding:matrix.org)\
See how we are **decentralizing** us and everyone else in [Governance](https://riot.im/app/#/room/#giveth-governance:matrix.org)\
Here with **DAO questions**? Plz send a DM to @krrisis or @griffgreen - they’ll add you to the discussion.\
", "negative": "Sure! No worries, whenever you want this info, just ask me here."
      },
      {
        "msg": "Would you like some more info on Giveth?", "positive": "To get up to speed on what we do and who we are the best place to start is our [website](http://giveth.io/).\
          Next stop is our [wiki](https://wiki.giveth.io/), where you can find a number of useful guides, our roadmap and so much more.\
          [Medium](https://medium.com/giveth) is where we post most of our articles. The most relevant articles are pinned at the top!\
          And on youtube you can discover [some of our interviews and streams](http://youtube.com/givethio), including [most of our meetings](https://www.youtube.com/channel/UCdqmP4axeI1hNmX20aZsOwg?view_as=subscriber)!\
          ", "negative": "Sure! No worries, whenever you want this info, just ask me here."
      }
    ]
  },

  // CONTRIBUTORS
  "#giveth-contributors:matrix.org": {
    "externalMsg": "Welcome @user to the Contributors room! Feel free to introduce yourself or ask any question! If you want to help us build out the Giveth Galaxy, make sure to add your details [here](http://bit.ly/GivethMaker). I also sent you a direct message with some more info. ",
    "internalMsg": [
      { "msg": "Hey %USER%, welcome to the Contributors room! If you didn’t have time yet to fill out this [document](http://bit.ly/GivethMaker), you should! Even if you don’t have time right now, we might meet in the future!" },
      { "msg": "Every month Giveth Gives … eth! If you want to learn more about how you can earn some too, read [this article](https://medium.com/giveth/how-rewarddao-works-aka-what-are-points-7388f70269a)." },
      { "msg": "Have you earned some points (or are planning to!) and would like to know how to get your eth?", "positive": "Great! Well, to receive your eth, the process is easy, just make sure you document your work through a video on our Wall of Fame. More info [here](https://wiki.giveth.io/dac/contributors-guide/)!", "negative": "Sure, no problem! Whenever you want to know just ask me!" }
    ]
  },

  // COMMUNITIES
  "#giveth-communities:matrix.org": {
    "externalMsg": "Welcome %USER% to the Communities room! Feel free to introduce yourself or ask any question! If you want to help us test the DApp releases, please let us know right here! If you want to be or help us build one of the first Communities (DACs) or Campaigns on the DApp, please take a minute and fill out this [form](http://bit.ly/GivethCommunity)!",
    "internalMsg": [
      { "msg": "Hey %USER%, welcome to the Communities room! If you didn’t have time yet to fill out this [document](http://bit.ly/GivethCommunity), you should!" }
    ]
  },

  // COMMUNICATIONS
  "#giveth-communication:matrix.org": {
    "externalMsg": "Welcome %USER% to the Communications room! Feel free to introduce yourself or ask any question! If you have any specific communication skills and want to help out, make sure to add your details [here](http://bit.ly/GivethMaker)",
    "internalMsg": "Hey %USER%, welcome to the Communications room! If you want to actively participate and help us Build the Future of Giving make sure to join our Communications Circle Meeting [here](https://meet.jit.si/giveth-communication). This normally takes place every Wednesday at 5PM CET and is announced in the room."
  },


  // GOVERNANCE
  "#giveth-governance:matrix.org": {
    "externalMsg": "Welcome %USER% to the Governance room! Feel free to introduce yourself or ask any question",
    "internalMsg": "Hey %USER%, welcome to the Governance room! If you want to actively participate and help us Build the Future of Giving you are welcome to join our Governance Meeting [here](https://meet.jit.si/giveth-gov) . This normally takes place every Thursday at 5PM CET and is announced in the room."
  },

  // DApp DEVELOPMENT
  "#giveth-product-development:matrix.org": {
    "internalMsg": "It seems that you have just joined DApp Development channel! Here are some links to get you started.\
      \
      If you want to better understand what we are building:\
      The DApp [Product Definition](https://wiki.giveth.io/documentation/DApp/product-definition/) on our Wiki\
      Our [Development Roadmap](https://wiki.giveth.io/documentation/product-roadmap/)\
      [Medium posts](https://medium.com/giveth)\
      \
      If you want to actively participate\
      See our fundraising [DApp development campaign](https://alpha.giveth.io/campaigns/fzOahNwFVyY7qLTI) on the DApp\
      Checkout our DApp Github page and don’t hesitate to pick on of the help [wanted issues](https://github.com/Giveth/giveth-dapp/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22)\
      Our [Giveth Google Drive workspace](https://drive.google.com/drive/folders/0B2gzflwFITCBNGtDRHIyakJiaTA)\
      And all the events we are attending in our [calendar](https://calendar.google.com/calendar/embed?src=givethdotio%40gmail) most notably the DApp team meeting happening every Wednesday at 20:00 on https://meet.jit.si/giveth-devteam\
      \
      If you want to understand how we work\
      Check out our [DApp Github page](https://github.com/giveth/giveth-dapp) and don’t hesitate to pick on of the [help wanted](https://github.com/Giveth/giveth-dapp/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22) issues\\"
  }
}