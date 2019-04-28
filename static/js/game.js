const { drawingScript2 } = require('./drawing')

function checkScores (roomData, username) {
  let names = []
  let index
  for (let user of Object.keys(roomData)) {
    names.push([user, roomData[user]['score']])
  }
  let orderedNames = names.sort(function (a, b) {
    return b[1] - a[1]
  })
  for (let i = 0; i < orderedNames.length; i++) {
    if (orderedNames[i][0] === username) {
      index = i
      console.log('username', username)
      console.log('name at index', orderedNames[i])
      console.log('index', index)
    }
  }
  console.log('ordered users', orderedNames)
  if (index >= Math.floor(orderedNames.length / 2)) {
    return false
  }
  return true
}

// Timer
const onPlayPage = document.querySelector('#playPage')

if (onPlayPage) {
  document.addEventListener('DOMContentLoaded', function () {
    // Setting up constants
    const username = window.location.href.split('/')[5]
    const rawRoomData = document.querySelector('#room-data').dataset.roomData.replace(/\\/g, '')
    const roomData = JSON.parse(rawRoomData)
    const rawStartTime = document.querySelector('#room-data').dataset.starttime
    const startTime = parseInt(rawStartTime, 10)
    const roundOneEnd = startTime + ((1000 * 120) + 10000)
    const roundOneStart = startTime + 10000
    const rounds = document.querySelector('#room-data').dataset.rounds
    const targetTimes = []
    for (let i = 1; i <= rounds; i++) {
      if (i % 2) {
        targetTimes.push(startTime + (10000 * i))
      } else {
        targetTimes.push(startTime + (((1000 * 120) + 10000)) * i)
      }
    }
    let score = document.querySelector('.score')

    console.log(roomData)

    htmlSetup(roomData, score, username)
    connectScoreSocket(roomData, score, username)
    roundTimer(roundOneEnd)
    startTimer(roundOneStart)
    drawingScript2()
    console.log(rounds)
  })
}

function htmlSetup (roomData, score, username) {
  const playerList = document.querySelector('#playerlist')
  const popup = document.querySelector('#playerspopup')

  document.querySelector('.random-word').innerHTML = `WORD: ${roomData[username]['word'].toUpperCase()}`
  score.style.color = roomData[username]['color']

  for (let user of Object.keys(roomData)) {
    let userDiv = document.createElement('div')
    userDiv.style.color = roomData[user]['color']
    userDiv.id = user
    userDiv.innerHTML = `${user}: 0`
    playerList.appendChild(userDiv)
  }

  popup.addEventListener('click', function (e) {
    if (!playerList.style.display || playerList.style.display === 'none') {
      playerList.style.display = 'flex'
    } else {
      playerList.style.display = 'none'
    }
  })
}

function connectScoreSocket (roomData, score, username) {
  const room = document.querySelector('#room-data').dataset.roompk
  const scoreSocket = new WebSocket(`wss://${window.location.host}/ws/${room}/score/`)
  const guessInputField = document.querySelector('#wordGuessed')

  let guessedWords = []

  document.querySelector('.submitguess-button').addEventListener('click', function () {
    let word = guessInputField.value.toLowerCase()
    let result = checkGuess(word, guessedWords, roomData, username)
    console.log(result)
    if (result) {
      guessInputField.style.border = '.2rem solid lightgreen'
      guessedWords.push(word)
      scoreSocket.send(JSON.stringify({
        'user1': result[0],
        'user2': result[1]
      }))
    } else { guessInputField.style.border = '.2rem solid red' }
  })

  scoreSocket.onmessage = function (event) {
    let data = JSON.parse(event.data)
    roomData[data['user1']]['score'] += 1
    roomData[data['user2']]['score'] += 1
    document.querySelector(`#${data['user1']}`).innerHTML = `${data['user1']}: ${roomData[data['user1']]['score']}`
    document.querySelector(`#${data['user2']}`).innerHTML = `${data['user2']}: ${roomData[data['user2']]['score']}`
    score.innerHTML = `${roomData[username]['score']}`
    console.log(checkScores(roomData, username))
  }
}

function startTimer (targetTime, roundTimer, roundEndTime) {
  let startCountDown = document.querySelector('#start-count-down')
  let countDownHolder = document.querySelector('#count-down-holder')
  startCountDown.style.display = 'block'
  countDownHolder.style.display = 'block'
  // startCountDown.style.height = window.innerHeight
  let x = setInterval(function () {
    // Get todays date and time
    let now = new Date().getTime()

    // Find the distance between now and the count down date
    let distance = (targetTime - now)

    // Time calculations for days, hours, minutes and seconds
    let seconds = Math.floor(((distance % (1000 * 60)) / 1000))
    console.log(seconds)

    // Display the result in the element with id="demo"
    startCountDown.innerHTML = seconds
    if (startCountDown.innerHTML === '0') {
      startCountDown.innerHTML = 'DRAW!'
    } else if (startCountDown.innerHTML === '59') {
      startCountDown.style.display = 'none'
      countDownHolder.style.display = 'none'
      roundTimer(roundEndTime)
      clearInterval(x)
    }
  }, 1000)
}

function roundTimer (targetTime) {
  const timerDiv = document.querySelector('#timer')
  timerDiv.style.display = 'block'

  // Update the count down every 1 second
  let x = setInterval(function () {
    // Get todays date and time
    let now = new Date().getTime()

    // Find the distance between now and the count down date
    let distance = (targetTime - now)

    // Time calculations for days, hours, minutes and seconds
    let minutes = Math.floor(((distance % (1000 * 60 * 60)) / (1000 * 60)))
    let seconds = Math.floor(((distance % (1000 * 60)) / 1000))

    if (minutes === 59) {
      timerDiv.style.display = 'none'
      clearInterval(x)
    }

    // Display the result in the element with id="demo"
    if (seconds > 9) {
      timerDiv.innerHTML = minutes + ':' + seconds
    } else {
      timerDiv.innerHTML = minutes + ':0' + seconds
    }
  }, 1000)
}

function checkGuess (guess, guessedWords, roomData, username) {
  if (!guessedWords.includes(guess)) {
    for (let user of Object.keys(roomData)) {
      if (guess === roomData[user]['word'] && username !== user) {
        return [username, user]
      }
    }
  }
  return false
}

module.exports = {}
