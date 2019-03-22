// Allowed users that can dish out points
// module.exports.userList = [
// ]

// Allowed point types
module.exports.point_types = [
  'GOV',
  'DAPP',
  'SC',
  'COMM',
  'UNICORN',
  'ARAGON',
  'FLURKEL',
  'ETHKAN',
  'DAPPNODE',
  'SIGNALING',
]

module.exports.reason_seperators = ['for', 'over', 'because']

module.exports.domains = ['matrix.org', 'status.im', 'giveth.io', 'gitter.im']

module.exports.max_points = 10000

module.exports.sheet_id =
  process.env.NODE_ENV === 'production'
    ? '12cblUYuYq4NwZX7JdRo0-NWnrOxlDy-XCbvF3ugzb2c'
    : '10sU4UNlCq8fZ3f4zouoq945zTScw27uUV1LU0siA1YA'
module.exports.sheet_tab_name = 'PointsBot (DONT RENAME!)!A1:F1'

module.exports.dish_notification_msg =
  "Congratulations! Your contribution to Giveth has been recognized by %DISHER% [here](%ROOM%) and you have received Reward Points that can be collected as Eth.\
\n\nPlease join the [Contributors](https://riot.im/app/#/room/#giveth-contributors:matrix.org) Room and see the [Contributors Guide](https://wiki.giveth.io/dac/contributors-guide/) on our Wiki to learn more\
\n\nDo act soon, these points don’t last forever. Unclaimed ETH rolls over at month end! To make a milestone and get that Eth, go to the [RewardDAO Campaign](https://beta.giveth.io/campaigns/5b3d9746329bc64ae74d1424) for the next steps and create a Profile on our Beta platform if you haven't already.\
\n\nTHANK YOU for being here from the Giveth Unicorns (and our fabulous PointsBot)!"

module.exports.milestone_automation_trigger_users = [
  '@danibelle:matrix.org',
]

module.exports.milestone_notification_msg =
  "You've got Love from Giveth!\
  We appreciate your contributions and the [RewardDAO](https://beta.giveth.io/campaigns/5b3d9746329bc64ae74d1424) is here to thank you.\
\nYou were [dished points](https://docs.google.com/spreadsheets/d/12cblUYuYq4NwZX7JdRo0-NWnrOxlDy-XCbvF3ugzb2c/edit#gid=0) in the month of %MONTH%, which means you have ETH waiting for you to collect it. To do so you'll need to create a Milestone by %DEADLINE%.\
\n\n[Prepare to record or upload a video](https://wiki.giveth.io/dapp/milestones/) to claim your monthly reward, and [use this link when you're ready to create the milestone](%LINK%) - it will automatically populate important details. Join the conversation in our [#contributors](https://riot.im/app/#/room/#giveth-contributors:matrix.org) room for more information and updates please, see you there!"

// CHATBOT

module.exports.hashtagMappings = {
  '!kUeYRcrXObgGoJlFjn:matrix.org': 'sc',
}

module.exports.calendarURL =
  'https://calendar.google.com/calendar/ical/givethdotio%40gmail.com/public/basic.ics'

module.exports.calendarUpperLimitInMonths = 2

module.exports.positiveResponses = ['yes', 'yup', 'yea']
module.exports.negativeResponses = ['no']

module.exports.messages = {
  // SOCIAL CODING
  '!kUeYRcrXObgGoJlFjn:matrix.org': {
    internalMsg:
      'Now that you’re in Social Coding there are a few resources that will help you along the way:\
    [What are points](https://medium.com/giveth/how-rewarddao-works-aka-what-are-points-7388f70269a) and [What is Social Coding](https://medium.com/giveth/what-is-social-coding-fa81feacfa32).\
   if you have any questions that are not covered in the literature please reach out to @parker_williams:matrix.org or @yalormewn:matrix.org and they will happily follow up with you in 24-48 hours',
    externalMsg:
      'Welcome %USER% to Social Coding where your pragma can roam the wild steppe of the blockchain world. I’ve also sent you a direct message with more info.',
  },

  // GENERAL
  '!vwFGsktMNkdorFWJRi:matrix.org': {
    externalMsg:
      'Welcome %USER% to Giveth! Feel free to introduce yourself or ask any question! You can find an overview of all our rooms by tapping/clicking on the flair next to my name, I also sent you a direct message with more info.',
    internalMsg: [
      {
        msg:
          'Hey %USER%, welcome to Giveth!! First a few tips if you are a new Riot user:\n\
      \n* [Download Riot](https://about.riot.im/downloads/) on your device for quick and easy access\n\
      \n* Limit notifications per room [by changing it](https://about.riot.im/need-help/#rooms-section) to mentions only',
      },
      {
        msg: 'Do you want to know which rooms you can join?',
        positive:
          'You can find an overview of all our rooms by tapping/clicking on the flair next to my name.\
    Some more info about some of them:\n\
\n* Do you aim to - or already are - united around **good causes**? Join the conversation & sign up for DApp testing in [Communities](https://riot.im/app/#/room/#giveth-communities:matrix.org).\
\n* Do you have **time & energy**? Good. Every month we Give Eth to [Contributors](https://riot.im/app/#/room/#giveth-contributors:matrix.org)\
\n* Up for some **real talk**? Share & care in [Blockchaintalk](https://riot.im/app/#/room/#giveth-blockchaintalk:matrix.org) \
\n* Check our **product progress** in [Dapp Development](https://riot.im/app/#/room/#giveth-product-development:matrix.org) \
\n* Help us **create** and connect in [Communication](https://riot.im/app/#/room/#giveth-communication:matrix.org)\
\n* **Hack away** on projects you select in [Social Coding](https://riot.im/app/#/room/#giveth-social-coding:matrix.org)\
\n* See how we are **decentralizing** us and everyone else in [Governance](https://riot.im/app/#/room/#giveth-governance:matrix.org)\
\n* Here with **DAO questions**? Plz send a DM to @krrisis or @griffgreen - they’ll add you to the discussion.\
',
        negative:
          'Sure! No worries, whenever you want this info, just ask me here.',
      },
      {
        msg: 'Would you like some more info on Giveth?',
        positive:
          'To get up to speed on what we do and who we are the best place to start is our [website](http://giveth.io/).\
          Next stop is our [wiki](https://wiki.giveth.io/), where you can find a number of useful guides, our roadmap and so much more.\
          [Medium](https://medium.com/giveth) is where we post most of our articles. The most relevant articles are pinned at the top!\
          And on youtube you can discover [some of our interviews and streams](http://youtube.com/givethio), including [most of our meetings](https://www.youtube.com/channel/UCdqmP4axeI1hNmX20aZsOwg?view_as=subscriber)!\
          ',
        negative:
          'Sure! No worries, whenever you want this info, just ask me here.',
      },
    ],
  },

  // CONTRIBUTORS
  '!OQTaDMKEJXLvTpYoCe:matrix.org': {
    externalMsg:
      'Welcome %USER% to the Contributors room! Feel free to introduce yourself or ask any question! If you want to help us build out the Giveth Galaxy, make sure to add your details in the Maker form I just sent you, together with some extra info!',
    internalMsg: [
      {
        msg:
          'Hey %USER%, welcome to the Contributors room! Please fill out this [document](http://bit.ly/GivethMaker) if you want to build out the Giveth Galaxy with us. Even if you don’t have time right now, we might meet in the future! Every month Giveth Gives … eth! If you want to learn more about how you can earn some too, read [this article](https://medium.com/giveth/how-rewarddao-works-aka-what-are-points-7388f70269a).',
      },
      {
        msg:
          'Have you earned some points (or are planning to!) and would like to know how to get your eth?',
        positive:
          'Great! Well, to receive your eth, the process is easy, just make sure you document your work through a video on our Wall of Fame. More info [here](https://wiki.giveth.io/dac/contributors-guide/)!',
        negative: 'Sure, no problem! Whenever you want to know just ask me!',
      },
    ],
  },

  // COMMUNITIES
  '!FBZLHmkNLmabnszigV:matrix.org': {
    externalMsg:
      'Welcome %USER% to the Communities room! Feel free to introduce yourself or ask any question! If you want to be or help us build one of the first Communities (DACs) or Campaigns on the DApp, please introduce yourself here and take a minute to fill out the form I just sent you!',
    internalMsg: [
      {
        msg:
          'Hey %USER%, welcome to the Communities room! Take a minute to fill out this [document](http://bit.ly/GivethCommunity), so we know who you are and how we can help you create a Community on the DApp!',
      },
    ],
  },

  // COMMUNICATIONS
  '!mbUGUXUxvuGxvjQJtL:matrix.org': {
    externalMsg:
      'Welcome %USER% to the Communications room! Feel free to introduce yourself or ask any question! I’ve also sent you a direct message with more info.',
    internalMsg:
      'Hey %USER%, welcome to the Communications room! If you want to actively participate and help us Build the Future of Giving make sure to join our Communications Circle Meeting [here](https://meet.jit.si/giveth-communication). This normally takes place every Wednesday at 6PM CE(S)T and is announced in the room. If you have any specific communication skills and want to help out, make sure to add your details [here](http://bit.ly/GivethMaker)',
  },

  // GOVERNANCE
  '!qsjCsmTVnObJyCZkqq:matrix.org': {
    externalMsg:
      'Welcome %USER% to the Governance room! Feel free to introduce yourself or ask any question',
    internalMsg:
      'Hey %USER%, welcome to the Governance room! If you want to actively participate and help us Build the Future of Giving you are welcome to join our Governance Meeting [here](https://meet.jit.si/giveth-gov) . This normally takes place every Thursday at 6PM CE(S)T and is announced in the room.',
  },

  // DApp DEVELOPMENT
  '!pJNSuPMvcrDttmJFvV:matrix.org': {
    internalMsg:
      "It seems that you have just joined DApp Development channel! Here are some links to get you started.\n\
      \n\
      If you want to better understand what we are building:\n\
      \n* The DApp [Product Definition](https://wiki.giveth.io/documentation/DApp/product-definition/) on our Wiki\n\
      \n* Our [Development Roadmap](https://wiki.giveth.io/documentation/product-roadmap/)\n\
      \n* [Medium posts](https://medium.com/giveth)\n\
      \n\
      If you want to actively participate:\n\
      \n* See our fundraising [DApp development campaign](https://alpha.giveth.io/campaigns/fzOahNwFVyY7qLTI) on the DApp\n\
      \n* Checkout our DApp Github page and don’t hesitate to pick on of the ['help wanted'](https://github.com/Giveth/giveth-dapp/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22) issues\n\
      \n* Our [Giveth Google Drive workspace](https://drive.google.com/drive/folders/0B2gzflwFITCBNGtDRHIyakJiaTA)\n\
      \n* Check out the events we are attending or organizing in our [calendar](https://calendar.google.com/calendar/embed?src=givethdotio%40gmail) most notably the DApp team meeting happening every Wednesday at 20:00 on https://meet.jit.si/giveth-devteam",
  },
}

module.exports.questions = {
  // SOCIAL CODING
  '!kUeYRcrXObgGoJlFjn:matrix.org': [
    {
      trigger: [
        'When is the next',
        'Sync',
        'Sync Meeting',
        'Social Coding Sync',
      ],
      answer:
        'The Social Coding Sync is every other week on Tuesday at 06.00PM CET, 09:00 PST, 05:00PM UTC) right [here](https://meet.jit.si/socialcoding)',
    },
  ],

  // GENERAL
  '!vwFGsktMNkdorFWJRi:matrix.org': [
    {
      trigger: 'download riot',
      answer:
        '[Download Riot](https://about.riot.im/downloads/) on your device for quick and easy access',
    },
    {
      trigger: 'too many notifications',
      answer:
        'Limit notifications per room [by changing it](https://about.riot.im/need-help/#rooms-section) to mentions only',
    },
    {
      trigger: 'more info on Giveth',
      answer:
        'To get up to speed on what we do and who we are the best place to start is our [website](http://giveth.io/).\
      Next stop is our [wiki](https://wiki.giveth.io/), where you can find a number of useful guides, our roadmap and so much more.\
      [Medium](https://medium.com/giveth) is where we post most of our articles. The most relevant articles are pinned at the top!\
      And on youtube you can discover [some of our interviews and streams](http://youtube.com/givethio), including [most of our meetings](https://www.youtube.com/channel/UCdqmP4axeI1hNmX20aZsOwg?view_as=subscriber)!',
    },
    {
      trigger: 'which rooms',
      answer:
        'You can find an overview of all our rooms by tapping/clicking on the flair next to my name.',
    },
  ],

  // CONTRIBUTORS
  '!OQTaDMKEJXLvTpYoCe:matrix.org': [
    {
      trigger: 'get my eth',
      answer:
        'To receive your eth, the process is easy, just make sure you document your work through a video on our Wall of Fame. More info [here](https://wiki.giveth.io/dac/contributors-guide/)!',
    },
    {
      trigger: 'not received my eth',
      answer:
        'It takes a while to create the Milestones for all contributors and pay these out. If it is taking longer than a month, please send a message to @ljg583:matrix.org',
    },
  ],

  // COMMUNITIES
  '!FBZLHmkNLmabnszigV:matrix.org': [
    {
      trigger: [
        'I want to be a tester',
        'I want to test the dapp',
        'how can I test',
      ],
      answer:
        'Great that you want to test the DApp with us! @vojtech:matrix.org will be in touch! If he isn’t, stalk him :-)',
    },
    {
      trigger: 'form for communities',
      answer:
        'If you want to be or help us build one of the first Communities (DACs) or Campaigns on the DApp, please take a minute and fill out this [form](http://bit.ly/GivethCommunity)!',
    },
  ],

  // COMMUNICATIONS
  '!mbUGUXUxvuGxvjQJtL:matrix.org': [
    {
      trigger: [
        'join the Communication Meeting',
        'join the comms meeting',
        'join our comms meeting',
        'Weekly Comms Circle meeting in',
      ],
      answer:
        'The Comms meeting takes place on Wednesday at 06.00PM CE(S)T, (= 12PM EDT - 05PM UTC - 09AM PT -- 12AM ICT) - Join us [here](https://meet.jit.si/giveth-communication)',
    },
    {
      trigger: ['Comms Meeting notes', 'Our meeting notes'],
      answer:
        'All Communication Circle meeting notes can be found [here](https://github.com/Giveth/Communication) in the form of issues - if you want to view these in a more ordered and visual form, please install the zenhub extension first (see link on the homepage)',
    },
  ],

  // GOVERNANCE
  '!qsjCsmTVnObJyCZkqq:matrix.org': [
    {
      trigger: 'join the Governance Meeting',
      answer:
        'The Governance meeting takes place on Thursday at 06.00PM CE(S)T, (= 12PM EDT - 05PM UTC/GMT+1 -- 9AM PT -- 11PM ICT) - Join us [here](https://meet.jit.si/giveth-gov)',
    },
  ],

  // DApp DEVELOPMENT
  /** "!pJNSuPMvcrDttmJFvV:matrix.org": [
   ]**/
}
