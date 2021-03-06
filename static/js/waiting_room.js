function waitingRoomJS () {
/* Setting up personal info */
  let full = document.querySelector('.user_data').dataset.full
  let room = document.querySelector('.user_data').dataset.room
  let username = document.querySelector('.user_data').dataset.username
  let roomData = document.querySelector('#room_data').dataset.json.replace(/\\/g, '')
  let roomCap = document.querySelector('#room_data').dataset.roomCap
  roomData = `{${roomData}}`
  roomData = JSON.parse(roomData)
  let currentPlayers = document.querySelector('#current_players')
  let numberOfPlayers = document.querySelector('#number-of-players')
  let usersAtPing = {}

  let startSocket = new WebSocket(`wss://${window.location.host}/ws/${room}/start/`)

  startSocket.onopen = function (event) {
    let messageType
    if (full === 'True') {
      messageType = 'startgame'
    } else {
      messageType = 'ping'
    }
    startSocket.send(JSON.stringify({
      'messageType': messageType,
      'roomData': roomData,
      'username': username
    }))
  }

  startSocket.onmessage = function (event) {
    let data = JSON.parse(event.data)

    if (data['type'] === 'start') {
      // start the match!!!!
      window.location.href = `https://${window.location.host}/play/${room}/${username}/`
    } else if (data['type'] === 'ping') {
      roomData = data['roomData']
      // respond to a ping by updating the users in the room directly (using the html room_data)
      currentPlayers.innerHTML = ''
      let numPlayers = 0
      for (let player of Object.keys(roomData)) {
        let playerDiv = document.createElement('div')
        playerDiv.style.color = roomData[player]['color']
        playerDiv.innerText = player
        currentPlayers.appendChild(playerDiv)
        numPlayers += 1
      }
      numberOfPlayers.innerText = ''
      numberOfPlayers.innerText = `${numPlayers}/${roomCap} `

      // // respond to a ping message with a pong message that includes both usernames
      // startSocket.send(JSON.stringify({
      //   'messageType': 'pong',
      //   'ponger': username,
      //   'pinger': data['pinger']
      // }))
    } else if (data['type'] === 'pong') {
      // add the ponger name to the list of names for the specific pinger
      if (usersAtPing[data['pinger']]) {
        usersAtPing[data['pinger']].push(data['ponger'])
      } else {
        usersAtPing[data['pinger']] = [data['ponger']]
      }
    }
  }

  let roomTime = document.querySelector('.user_data').dataset.remainingTime

  let remainingTime = parseInt(roomTime, 10)

  // Update the count down every 1 second
  let x = setInterval(function () {
    // Time calculations for days, hours, minutes and seconds
    let minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60))
    let seconds = Math.floor(((remainingTime % (1000 * 60)) / 1000))

    remainingTime -= 1000

    // Display the result in the element with id="demo"
    if (seconds > 9) {
      document.getElementById('time').innerHTML = minutes + ':' + seconds
    } else {
      document.getElementById('time').innerHTML = minutes + ':0' + seconds
    }

    // If the count down is finished, write some text
    if (minutes + seconds <= 0) {
      startSocket.send(JSON.stringify({
        'messageType': 'startgame'
      }))
    }
  }, 1000)
}

document.addEventListener('DOMContentLoaded', function () {
  let inWaitingRoom = document.querySelector('#waitingroom')
  if (inWaitingRoom) {
    waitingRoomJS()
  }
})
