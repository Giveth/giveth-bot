const ical = require('node-ical')
const markdown = require('markdown').markdown

const {
  positiveResponses,
  negativeResponses,
  messages,
  questions,
  hashtagMappings,
  calendarURL,
  calendarUpperLimitInMonths,
} = require('./constants')

exports.handleCalendar = function(event, room, toStartOfTimeline, client) {
  if (event.getType() === 'm.room.message' && toStartOfTimeline === false) {
    let message = event.getContent().body
    if (message[1] === ' ') {
      message = message.replace(' ', '')
    }
    message = message.split(' ')
    const cmd = message[0]
    let localHashtag = ''
    if (message.length > 1) {
      localHashtag = message[1].toLowerCase()
    }
    const user = event.getSender()
    const roomId = room.roomId
    if (cmd === '!calendar' || cmd === '!cal') {
      if (localHashtag.length == 0 && hashtagMappings.hasOwnProperty(roomId)) {
        localHashtag = hashtagMappings[roomId]
      }
      ical.fromURL(calendarURL, {}, function(err, data) {
        if (!err) {
          const today = new Date()
          const upperLimit = new Date()
          upperLimit.setDate(today.getDate() + calendarUpperLimitInMonths * 30)
          const globalFormattingOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }
          globals = []
          locals = []
          for (var key in data) {
            if (data.hasOwnProperty(key)) {
              globals.push(data[key])
              if (localHashtag.length > 0) {
                locals.push(data[key])
              }
            }
          }
          locals = locals.filter(
            entry =>
              entry.start &&
              entry.end &&
              entry.end >= today &&
              entry.end <= upperLimit &&
              entry.description &&
              entry.description.includes('#' + localHashtag)
          )
          globals = globals.filter(
            entry =>
              !locals.includes(entry) &&
              entry.start &&
              entry.end &&
              entry.end >= today &&
              entry.end <= upperLimit &&
              getDayOfYear(entry.start) != getDayOfYear(entry.end)
          )
          globals.sort(function(a, b) {
            if (getDayOfYear(a.start) == getDayOfYear(b.start)) {
              return a.end - b.end
            } else {
              return a.start - b.start
            }
          })
          locals.sort(function(a, b) {
            return a.start - b.start
          })
          var output =
            'Global events the next ' +
            calendarUpperLimitInMonths +
            ' months:\n\n'
          globals.forEach(entry => {
            output +=
              '- **' +
              entry.summary +
              '** - ' +
              entry.start.toLocaleDateString('en-US', globalFormattingOptions) +
              ' - ' +
              entry.end.toLocaleDateString('en-US', globalFormattingOptions) +
              '\n'
          })
          output += '\nFull Calendar: http://calendar.giveth.io'
          var localOutput =
            'Local events the next ' +
            calendarUpperLimitInMonths +
            ' months:\n\n'
          if (locals.length > 0) {
            locals.forEach(entry => {
              localOutput +=
                '- **' +
                entry.summary +
                '** - ' +
                entry.start.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                  timeZone: 'utc',
                }) +
                ' - ' +
                entry.end.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: 'numeric',
                  timeZone: 'utc',
                  timeZoneName: 'short',
                })
              ;('\n')
            })
            output = localOutput + '\n\n' + output
          }
          sendMessage(output, user, client, roomId)
        } else {
          client.sendTextMessage(roomId, 'Something went wrong :(')
        }
      })
    }
  }
}

exports.handleNewMember = function(
  event,
  room,
  toStartOfTimeline,
  client,
  privateRooms
) {
  if (
    event.event.membership === 'join' &&
    (!event.event.unsigned.prev_content ||
      event.event.unsigned.prev_content.membership === 'invite')
  ) {
    const user = event.getSender()
    const room = event.getRoomId()

    let roomMessages = messages[room]

    if (roomMessages && checkUser(user)) {
      handleWelcome(
        room,
        user,
        client,
        privateRooms,
        roomMessages.externalMsg,
        roomMessages.internalMsg
      )
    }
  }
}

exports.handleResponse = function(
  event,
  room,
  toStartOfTimeline,
  client,
  privateRooms
) {
  if (event.getType() === 'm.room.message' && toStartOfTimeline === false) {
    let msg = event.getContent().body
    const user = event.getSender()

    if (checkUser(user)) {
      if (
        privateRooms[user] &&
        privateRooms[user].welcoming &&
        user != client.credentials.userId &&
        room.roomId == privateRooms[user].room
      ) {
        let greetingQuestions =
          messages[privateRooms[user].welcoming.room].internalMsg
        let curQuestion = privateRooms[user].welcoming.curQuestion

        let positive = false
        let negative = false
        positiveResponses.some(response => {
          if (msg.includes(response.toLowerCase())) {
            positive = true
            return true
          }
          return false
        })

        negativeResponses.some(response => {
          if (msg.includes(response.toLowerCase())) {
            negative = true
            return true
          }
          return false
        })

        if (positive) {
          sendInternalMessage(
            greetingQuestions[curQuestion].positive,
            user,
            client
          )
        } else if (negative) {
          sendInternalMessage(
            greetingQuestions[curQuestion].negative,
            user,
            client
          )
        }

        if (positive || negative) {
          if (greetingQuestions.length > curQuestion + 1) {
            sendNextQuestion(
              curQuestion,
              greetingQuestions,
              user,
              client,
              privateRooms[user].welcoming.room
            )
          } else {
            privateRooms[user].welcoming = undefined
          }
        } else {
          sendInternalMessage(
            "I didn't recognize that response :(",
            user,
            client
          )
        }
      } else if (
        (!privateRooms[user] || !privateRooms[user].welcoming) &&
        user != client.credentials.userId
      ) {
        if (privateRooms[user] && privateRooms[user].room == room.roomId) {
          for (let key in questions) {
            if (
              questions.hasOwnProperty(key) &&
              checkForRoomQuestions(msg, key, room.roomId, user, client)
            ) {
              break
            }
          }
        } else {
          checkForRoomQuestions(msg, room.roomId, room.roomId, user, client)
        }
      }
    } else if (
      event.getType() === 'm.room.member' &&
      event.event.membership === 'leave'
    ) {
      let privateRoom = privateRooms[event.getSender()]
      if (privateRoom && privateRoom.room == event.event.room_id) {
        privateRoom.room = undefined
        privateRoom.welcoming = undefined
      }
    }
  }
}

function getDayOfYear(date) {
  var start = new Date(date.getFullYear(), 0, 0)
  var diff =
    date -
    start +
    (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000
  var oneDay = 1000 * 60 * 60 * 24
  return Math.floor(diff / oneDay)
}

function checkUser(user) {
  // Ignore Slack bridge users
  return !user.startsWith('@slack_giveth_')
}

function checkForRoomQuestions(
  msg,
  roomForQuestions,
  roomToSendIn,
  user,
  client
) {
  let questionsForRoom = questions[roomForQuestions]
  if (questionsForRoom) {
    questionsForRoom.forEach(question => {
      let shouldAnswerQuestion = false
      if (typeof question.trigger === 'string') {
        shouldAnswerQuestion = msg
          .toLowerCase()
          .includes(question.trigger.toLowerCase())
      } else {
        question.trigger.some(trigger => {
          if (msg.toLowerCase().includes(trigger.toLowerCase())) {
            shouldAnswerQuestion = true
            return true
          }
          return false
        })
      }
      if (shouldAnswerQuestion) {
        sendMessage(question.answer, user, client, roomToSendIn)
        return true
      }
    })
  }
  return false
}

function handleWelcome(
  room,
  user,
  client,
  privateRooms,
  externalMsg,
  internalMsg
) {
  if (typeof externalMsg === 'string') {
    sendMessage(externalMsg, user, client, room)
  }
  if (typeof internalMsg === 'string') {
    sendInternalMessage(internalMsg, user, client, privateRooms)
  } else if (typeof internalMsg === 'object') {
    if (
      !privateRooms[user] ||
      (privateRooms[user] && !privateRooms[user].welcoming)
    ) {
      sendNextQuestion(-1, internalMsg, user, privateRooms, client, room)
    }
  }
}

function sendNextQuestion(
  curQuestion,
  questions,
  user,
  privateRooms,
  client,
  room
) {
  curQuestion++
  if (privateRooms[user]) {
    privateRooms[user].welcoming = { room: room, curQuestion: curQuestion }
  }
  let question = questions[curQuestion]
  sendInternalMessage(question.msg, user, client, () => {
    if (!question.positive) {
      sendNextQuestion(curQuestion, questions, user, privateRooms, client, room)
    }
  })
}

exports.sendInternalMessage = function sendInternalMessage(
  msg,
  user,
  client,
  privateRooms,
  callback
) {
  if (privateRooms[user] && privateRooms[user].room) {
    sendMessage(msg, user, client, privateRooms[user].room)
    if (callback) {
      callback()
    }
  } else {
    client
      .createRoom({
        preset: 'trusted_private_chat',
        invite: [user],
        is_direct: true,
      })
      .then(res => {
        privateRooms[user] = { room: res.room_id }
        sendMessage(msg, user, client, privateRooms[user].room)
        if (callback) {
          callback()
        }
      })
  }
}

function sendMessage(msg, user, client, room) {
  if (msg.length > 0) {
    msg = msg.replace(/^ +| +$/gm, '')
    let html = markdown.toHTML(msg)
    msg = msg.replace('%USER%', user)
    html = html.replace('%USER%', user)
    client.sendHtmlMessage(room, msg, html)
  }
}
