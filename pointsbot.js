const dayjs = require('dayjs')
const {
  point_types,
  reason_seperators,
  domains,
  max_points,
  sheet_id,
  sheet_tab_name,
  dish_notification_msg,
  milestone_automation_trigger_users,
  milestone_notification_msg,
} = require('./constants')
const BigNumber = require('bignumber.js')
const { google } = require('googleapis')

exports.handlePointGiving = function(
  auth,
  event,
  room,
  toStartOfTimeline,
  client,
  privateRooms,
  notificationFunction
) {
  if (event.getType() === 'm.room.message' && toStartOfTimeline === false) {
    client.setPresence('online')
    let message = event.getContent().body
    const roomId = room.roomId
    const user = event.getSender()

    if (message.trim()[0] == '>') {
      // quoting another user, skip the quoted part
      message = message.split('\n\n')[1]
    }

    // Support for "! dish" command
    if (message[1] === ' ') {
      message = message.replace(' ', '')
    }

    const msg = message.split(' ')
    const command = msg[0].toLowerCase()

    if (command == '!help') {
      client.sendTextMessage(
        roomId,
        'dish points using the following format:\n!dish [#of points] [type of points] points to [handle, handle, handle] [' +
          reason_seperators.toString().replace(/,/g, '/') +
          '] [reason]'
      )
    } else if (command == '!dish') {
      handleDish(event, room, privateRooms, notificationFunction, client, auth)
    } else if (command == '!sheet') {
      client.sendTextMessage(
        roomId,
        `the rewardDAO sheet can be found here: https://docs.google.com/spreadsheets/d/${sheet_id}`
      )
    } else if (command == '!sendmilestones') {
      if (milestone_automation_trigger_users.includes(user)) {
        handleMilestoneAutomation(
          event,
          room,
          notificationFunction,
          client,
          privateRooms
        )
        client.sendTextMessage(
          roomId,
          `Sent notifications of milestone creation to all eligible users!`
        )
      } else {
        client.sendTextMessage(roomId, `Sorry, you're not allowed to do that.`)
      }
    }
  }
}

function handleMilestoneAutomation(
  event,
  room,
  notificationFunc,
  client,
  privateRooms
) {
  for (var user in privateRooms) {
    var values = privateRooms[user]
    console.log(user)
    console.log(values)
    var now = new Date()
    if (
      values.lastMonthNotified != now.getMonth() &&
      values.lastDishMonth == now.getMonth()
    ) {
      var startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      var month = now.toLocaleString('en-us', { month: 'long' })
      var title =
        'RewardDAO ' +
        now.toLocaleString('en-us', { month: 'long', year: 'numeric' }) +
        ': ' +
        user
      var url = `https://beta.giveth.io/campaigns/5b3d9746329bc64ae74d1424/milestones/propose?title=${encodeURI(
        title
      )}&date=${encodeURI(startOfMonth)}&isCapped=0&requireReviewer=0`
      var deadline = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        7
      ).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
      console.log(new Date(now.getFullYear(), 13, 7))
      notificationFunc(
        milestone_notification_msg
          .replace('%LINK%', url)
          .replace('%MONTH%', month)
          .replace('%DEADLINE%', deadline),
        user,
        client,
        privateRooms,
        null
      )
      privateRooms[user].lastMonthNotified = now.getMonth()
      //privateRooms[milestone[0]].lastMonthNotified = now.getMonth()
    }
  }
}

function handleDish(event, room, privateRooms, notificationFunc, client, auth) {
  let message = event.getContent().body
  let matched = false

  let regex = new RegExp(
    '!\\s*dish\\s+(\\S+)\\s+(\\S+)\\s+points\\s+to\\s+(.+?)\\s+(' +
      reason_seperators.toString().replace(/,/g, '|') +
      ')\\s+([^\\n]+)',
    'gi'
  )

  if (event.getSender() == `@${process.env.BOT_USER}:matrix.org`) {
    // we sent the message.
    return
  }

  if (event.getContent().formatted_body) {
    message = event.getContent().formatted_body
    if (message.includes('</blockquote>')) {
      message = message = message.split('</blockquote>')[1]
    }
  } else if (message.trim()[0] == '>') {
    // quoting another user, skip the quoted part
    message = message.split('\n\n')[1]
  }

  let match
  do {
    match = regex.exec(message)
    if (match) {
      tryDish(
        event,
        room,
        client,
        auth,
        privateRooms,
        notificationFunc,
        match[1],
        match[2],
        match[3],
        match[5]
      )
      matched = true
    }
  } while (match)
  if (!matched) {
    client.sendTextMessage(
      room.roomId,
      'ERROR, please use the following format:\n!dish [#of points] [type of points] points to [handle, handle, handle] for [reason]'
    )
  }
}

function tryDish(
  event,
  room,
  client,
  auth,
  privateRooms,
  notificationFunc,
  nPoints,
  type,
  users,
  reason
) {
  try {
    const sender = event.getSender()
    const amount = new BigNumber(nPoints)
    type = type.toUpperCase()

    if (amount.isNaN()) {
      const pointError = new Error(
        'Invalid number of points dished. Please enter a valid number and try again'
      )
      pointError.code = 'POINTS_NOT_NUMBER'
      throw pointError
    }

    if (amount.isLessThan(1)) {
      const pointError = new Error(
        "You can't dish negative or zero amount of points!"
      )
      pointError.code = 'POINTS_ARE_NEGATIVE_OR_ZERO'
      throw pointError
    }

    if (amount.isGreaterThan(max_points)) {
      const pointError = new Error(
        `You can't dish more than ${max_points} points each time!`
      )
      pointError.code = 'POINTS_OVER_MAXIMUM'
      throw pointError
    }

    if (!point_types.includes(type)) {
      const typeError = new Error(
        `Invalid point type '${type}'. Please use one of ${point_types}.`
      )
      typeError.code = 'POINT_TYPE_DOES_NOT_EXIST'
      throw typeError
    }

    users = users.split(',')

    const sheets = google.sheets({ version: 'v4', auth })
    var values = []

    users.forEach(user => {
      user = user.trim()
      let { userInRoom, receiver, display_name, multipleUsers } = findReceiver(
        room,
        user
      ) // try to find user

      // handle github users
      const BASE_GITHUB_URL = 'https://github.com/'
      if (user.split(BASE_GITHUB_URL)[1]) {
        receiver = user
        ;(userInRoom = true), (multipleUsers = false)
      }

      if (multipleUsers) {
        const userError = new Error(`There are multiple users with the name '${receiver}' in this room.
please specify the domain name of the user using the format @[userId]:[domain]`)
        userError.code = 'USER_MULTIPLE'
        throw userError
      }

      if (!userInRoom) {
        const userError = new Error(`Username '${receiver}' does not exist in this room.
either add this user to the room, or try again using the format @[userId]:[domain]`)
        userError.code = 'USER_DOES_NOT_EXIST'
        throw userError
      }
      const date = dayjs().format('DD-MMM-YYYY')
      const link = `https://riot.im/app/#/room/${room.roomId}/${event.getId()}`
      values.push([
        receiver,
        sender,
        reason,
        amount.toFormat(2),
        type,
        date,
        link,
        display_name,
      ])
    })

    const body = { values }
    sheets.spreadsheets.values.append(
      {
        spreadsheetId: sheet_id,
        range: sheet_tab_name,
        valueInputOption: 'USER_ENTERED',
        resource: body,
      },
      err => {
        if (err) {
          return console.log('The API returned an error: ' + err)
        }

        values.forEach(value => {
          client.sendTextMessage(
            room.roomId,
            `${value[1]} dished ${value[3].split('.')[0]} ${
              value[4]
            } points to ${value[0]}`
          )
          notificationFunc(
            dish_notification_msg
              .replace('%DISHER%', value[1])
              .replace('%ROOM%', value[6]),
            value[0],
            client,
            privateRooms,
            null
          )
          privateRooms[value[0]].lastDishMonth = new Date().getMonth()
        })
      }
    )
  } catch (err) {
    const MANUAL_ERROR_CODES = [
      'POINTS_NOT_NUMBER',
      'USER_DOES_NOT_EXIST',
      'POINT_TYPE_DOES_NOT_EXIST',
      'USER_MULTIPLE',
      'POINTS_ARE_NEGATIVE_OR_ZERO',
      'POINTS_OVER_MAXIMUM',
    ]
    console.log(err)
    if (MANUAL_ERROR_CODES.includes(err.code)) {
      client.sendTextMessage(
        room.roomId,
        'ERROR: ' + err.message + "\nType '!help' for more information."
      )
    } else {
      client.sendTextMessage(
        room.roomId,
        'ERROR, please use the following format:\n!dish [#of points] [type of points] points to [handle, handle, handle] for [reason]'
      )
    }
  }
}

// Try to intelligently format the receiver field
function findReceiver(room, receiver) {
  if (receiver.startsWith('<a href="https://matrix.to/#/')) {
    receiver = receiver.substring(29, receiver.indexOf('">'))
  }

  if (receiver[0] != '@') {
    receiver = `@${receiver}`
  }

  // defaults
  let userInRoom = false
  let multipleUsers = false
  let display_name = ''

  if (room.getMember(receiver) != null) {
    userInRoom = true
  }

  if (receiver.split(':').length < 2 && !userInRoom) {
    for (let domain of domains) {
      if (room.getMember(`${receiver}:${domain}`) != null) {
        receiver = `${receiver}:${domain}`
        display_name = room.getMember(receiver).name

        // if a user has already been found under a different domain
        if (userInRoom) {
          multipleUsers = true
          receiver = receiver.split(':')[0]
          break
        }

        // user under this domain was found.
        userInRoom = true
      }
    }
  }
  return {
    userInRoom,
    receiver,
    multipleUsers,
    display_name,
  }
}
