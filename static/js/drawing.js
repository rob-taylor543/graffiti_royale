function drawingScript2 () {
  let roomData = document.querySelector('#room-data').dataset.roomData
  console.log(roomData)
  roomData = JSON.parse(roomData)
  const drawMap = document.querySelector('#drawMap')
  const miniMap = document.querySelector('#miniMap')
  const drawMapCxt = drawMap.getContext('2d')
  const miniMapCxt = miniMap.getContext('2d')
  const username = window.location.href.split('/')[5]
  drawMap.width = window.innerWidth
  drawMap.height = window.innerHeight
  miniMap.width = 600
  miniMap.height = 600

  let paint
  let zoomedOut = true
  const ZOOMFACTOR = 8
  miniMapCxt.scale(1 / ZOOMFACTOR, 1 / ZOOMFACTOR)
  let zoomCenter = []
  let xOffset = 0
  let yOffset = 0

  /* Setting up visuals */
  const bricks = document.querySelector('#bricks')
  console.log(bricks)
  const background = document.querySelector('#background')
  console.log(background)

  // Contains an array of colors that will be randomly assigned to a user when they join the game.
  let colorsArray = [
    '#FF6633', '#FFB399', '#FF33FF', '#00B3E6', '#3366E6',
    '#999966', '#99FF99', '#B34D4D', '#80B300', '#809900',
    '#E6B3B3', '#6680B3', '#66991A', '#FF99E6', '#FF1A66',
    '#E6331A', '#33FFCC', '#66994D', '#B366CC', '#4D8000',
    '#B33300', '#CC80CC', '#66664D', '#991AFF', '#E666FF',
    '#4DB3FF', '#1AB399', '#E666B3', '#33991A', '#CC9999',
    '#00E680', '#4D8066', '#809980', '#1AFF33', '#FF3380',
    '#66E64D', '#4D80CC', '#9900B3', '#E64D66', '#4DB380',
    '#FF4D4D', '#99E6E6', '#6666FF'
  ]

  const myColor = colorsArray[Math.floor(Math.random() * colorsArray.length)]
  let random_word = document.querySelector('.user_data').dataset.word
  let username = document.querySelector('.user_data').dataset.username
  let room = document.querySelector('.user_data').dataset.room
  let wordList = []

  let userPaths = {}
  let usersSocket = new WebSocket(`wss://${window.location.host}/ws/${room}/users/`)
  usersSocket.onopen = function (event) {
    console.log(username)
    usersSocket.send(JSON.stringify({
      'username': username,
      'enter': true,
      'color': myColor,
      'random_word': random_word
    }))
  }

  // Whenever a user joins the match, sets up all appropriate data for use in the game and adds their word to the
  // array of all active words.
  usersSocket.onmessage = function (event) {
    let data = JSON.parse(event.data)
    userPaths = data['users']
    document.querySelector('#playerlist').innerHTML = ''
    for (let user of Object.keys(userPaths)) {
      let player = document.createElement('div')
      player.classList.add('player')
      player.innerHTML = `${user}`
      player.style.color = `${userPaths[user]['color']}`
      document.querySelector('#playerlist').appendChild(player)
    }
    console.log(`Users updated:`)
    console.log(userPaths)
    console.log(data['room'])
    wordList = []
    for (let user of Object.values(userPaths)) {
      wordList.push(user['word'])
    }
    console.log(wordList)
  }

  // Returns appropriate Json data whenever a user leaves the match.
  window.addEventListener('beforeunload', function () {
    console.log('closing!')
    usersSocket.send(JSON.stringify({
      'username': username,
      'enter': false,
      'color': myColor,
      'random_word': random_word
    }))
    usersSocket.close()
  })

  // Determines which point the minimap is currently on when using a mouse.
  miniMap.addEventListener('mousemove', function (event) {
    if (zoomedOut) {
      let X = Math.min(
        Math.max(event.pageX - this.offsetLeft, drawMap.width / ZOOMFACTOR / 2), miniMap.width - drawMap.width / ZOOMFACTOR / 2
      ) * ZOOMFACTOR
      let Y = Math.min(
        Math.max(event.pageY - this.offsetTop, drawMap.height / ZOOMFACTOR / 2),
        miniMap.height - drawMap.height / ZOOMFACTOR / 2
      ) * ZOOMFACTOR
      zoomCenter = [Math.floor(X), Math.floor(Y)]
    }
  })

  // Determines which point the minimap is currently on when using a touch screen.
  miniMap.addEventListener('touchmove', function (event) {
    if (zoomedOut) {
      event.preventDefault()
      event.stopImmediatePropagation()

      let X = Math.min(
        Math.max(event.touches[0].pageX - this.offsetLeft, drawMap.width / ZOOMFACTOR / 2), miniMap.width - drawMap.width / ZOOMFACTOR / 2
      ) * ZOOMFACTOR
      let Y = Math.min(
        Math.max(event.touches[0].pageY - this.offsetTop, drawMap.height / ZOOMFACTOR / 2),
        miniMap.height - drawMap.height / ZOOMFACTOR / 2
      ) * ZOOMFACTOR
      zoomCenter = [Math.floor(X), Math.floor(Y)]
    }
  }, { passive: false })

  // When the user double clicks with a mouse, zooms IN on the canvas.
  miniMap.addEventListener('dblclick', function (event) {
    drawMap.style.zIndex = 4
    miniMap.style.zIndex = 1
    zoomedOut = false
    paint = false
    xOffset = zoomCenter[0] - drawMap.width / 2
    yOffset = zoomCenter[1] - drawMap.height / 2
    let moveX = -1 * (((zoomCenter[0] / ZOOMFACTOR) - (window.innerWidth / 2)) + miniMap.offsetLeft)
    let moveY = -1 * (((zoomCenter[1] / ZOOMFACTOR) - (window.innerHeight / 2)) + miniMap.offsetTop)
    let X = zoomCenter[0] * 100 / miniMap.width / ZOOMFACTOR
    let Y = zoomCenter[1] * 100 / miniMap.height / ZOOMFACTOR
    let coord = `${X}% ${Y}%`
    bricks.style.transform = `translate(${moveX}px, ${moveY}px) scale(${ZOOMFACTOR}, ${ZOOMFACTOR})`
    bricks.style.transformOrigin = coord
  })

  // When the user double clicks with a mouse, zooms OUT of the canvas.
  drawMap.addEventListener('dblclick', function (event) {
    drawMap.style.zIndex = 1
    miniMap.style.zIndex = 4
    zoomedOut = true
    paint = false
    bricks.style.transform = 'scale(1, 1)'
    drawMapCxt.clearRect(0, 0, drawMap.width, drawMap.height)
  })

  // When the user double taps, zooms IN on the canvas.
  var timeout
  var lastTap = 0
  miniMap.addEventListener('touchend', function (event) {
    var currentTime = new Date().getTime()
    var tapLength = currentTime - lastTap
    clearTimeout(timeout)
    if (tapLength < 300 && tapLength > 0) {
      zoomedOut = false
      xOffset = zoomCenter[0] - drawMap.width / 2
      yOffset = zoomCenter[1] - drawMap.height / 2
      drawMap.style.zIndex = 4
      miniMap.style.zIndex = 1
      let moveX = -1 * (((zoomCenter[0] / ZOOMFACTOR) - (window.innerWidth / 2)) + miniMap.offsetLeft)
      let moveY = -1 * (((zoomCenter[1] / ZOOMFACTOR) - (window.innerHeight / 2)) + miniMap.offsetTop)
      X = zoomCenter[0] * 100 / miniMap.width / ZOOMFACTOR
      Y = zoomCenter[1] * 100 / miniMap.height / ZOOMFACTOR
      let coord = `${X}% ${Y}%`
      console.log(coord)
      bricks.style.transform = `translate(${moveX}px, ${moveY}px) scale(${ZOOMFACTOR}, ${ZOOMFACTOR})`
      bricks.style.transformOrigin = coord
      console.log(bricks.style)
      event.preventDefault()
    } else {
      // This will trigger if it is a single tap.
      clearTimeout(timeout)
    }
    lastTap = currentTime
  })

  const room = document.querySelector('#room-data').dataset.roompk
  let drawSocket = new WebSocket(`wss://${window.location.host}/ws/${room}/draw/`)

  drawSocket.onmessage = function (event) {
    let data = JSON.parse(event.data)
    if (data['username'] !== username) {
      if (data['new_path']) {
        roomData[data['username']]['paths'].push(data['point'])
      } else {
        roomData[data['username']]['paths'][roomData[data['username']]['paths'].length - 1].push(data['point'])
      }
    }
  }

  // When the user clicks with a mouse, this begins tracking the movement of the mouse.
  drawMap.addEventListener('mousedown', function (event) {
    paint = true
    roomData[username]['paths'].push([[
      event.pageX + xOffset,
      event.pageY + yOffset
    ]])
    drawSocket.send(JSON.stringify({
      'username': username,
      'point': [
        event.pageX + xOffset,
        event.pageY + yOffset
      ],
      'new_path': true
    }))
  })

  // This will detect when a user touches their screen and will begin tracking the movement of their
  // big, ugly, smelly fingers.
  drawMap.addEventListener('touchstart', function (event) {
    paint = true
    userPaths[username]['paths'].push([[
      Math.floor(event.touches[0].pageX) + xOffset,
      Math.floor(event.touches[0].pageY) + yOffset
    ]])
    drawSocket.send(JSON.stringify({
      'username': username,
      'point': [
        Math.floor(event.touches[0].pageX) + xOffset,
        Math.floor(event.touches[0].pageY) + yOffset
      ],
      'new_path': true
    }))
  })

  // When the user drags their mouse while the button is clicked, this will draw the path of the user's mouse.
  drawMap.addEventListener('mousemove', function (event) {
    if (paint) {
      roomData[username]['paths'][roomData[username]['paths'].length - 1].push([
        event.pageX + xOffset,
        event.pageY + yOffset
      ])
      drawSocket.send(JSON.stringify({
        'username': username,
        'point': [
          event.pageX + xOffset,
          event.pageY + yOffset
        ],
        'new_path': false
      }))
    }
  })

  // UNFINISHED

  // This will control the drawing when the user moves their smelly fingers.
  drawMap.addEventListener('touchmove', function (event) {
    if (paint) {
      event.preventDefault()
      event.stopImmediatePropagation()

      userPaths[username]['paths'][userPaths[username]['paths'].length - 1].push([
        Math.floor(event.touches[0].pageX) + xOffset,
        Math.floor(event.touches[0].pageY) + yOffset
      ])
      drawSocket.send(JSON.stringify({
        'username': username,
        'point': [
          Math.floor(event.touches[0].pageX) + xOffset,
          Math.floor(event.touches[0].pageY) + yOffset
        ],
        'new_path': false
      }))
    }
  }, { passive: false })

  // Stops drawing when the user lets go of their mouse button.
  drawMap.addEventListener('mouseup', function () {
    paint = false
  })

  // Stops drawing when a user mouses off of the canvas.
  drawMap.addEventListener('mouseleave', function () {
    paint = false
  })

  /* Redraw function */
  function redraw () {
    miniMapCxt.clearRect(0, 0, miniMap.width * ZOOMFACTOR, miniMap.height * ZOOMFACTOR)
    for (let user of Object.values(roomData)) {
      let color = user['color']
      let paths = user['paths']
      miniMapCxt.strokeStyle = color
      miniMapCxt.shadowColor = color
      miniMapCxt.shadowBlur = 2
      miniMapCxt.lineCap = 'round'
      miniMapCxt.lineWidth = 4

      for (let path of paths) {
        miniMapCxt.beginPath()
        miniMapCxt.moveTo(path[0][0], path[0][1])
        for (i = 1; i < path.length; i++) {
          miniMapCxt.moveTo(path[i][0], path[i][1])
          miniMapCxt.lineTo(path[i - 1][0], path[i - 1][1])
        }
        miniMapCxt.stroke()
      }
    }
    if (zoomCenter) {
      miniMapCxt.shadowBlur = 0
      miniMapCxt.lineCap = 'round'
      miniMapCxt.lineWidth = 4
      miniMapCxt.strokeStyle = '#000000'
      miniMapCxt.strokeRect(
        zoomCenter[0] - drawMap.width / 2,
        zoomCenter[1] - drawMap.height / 2,
        drawMap.width,
        drawMap.height
      )
    }

    if (!zoomedOut) {
      drawMapCxt.clearRect(0, 0, drawMap.width, drawMap.height)
      for (let user of Object.values(roomData)) {
        let color = user['color']
        let paths = user['paths']
        drawMapCxt.strokeStyle = color
        drawMapCxt.shadowColor = color
        drawMapCxt.shadowBlur = 4
        drawMapCxt.lineCap = 'round'
        drawMapCxt.lineWidth = 6

        for (let path of paths) {
          drawMapCxt.beginPath()
          drawMapCxt.moveTo(
            (path[0][0] - xOffset),
            (path[0][1] - yOffset)
          )
          for (i = 1; i < path.length; i++) {
            drawMapCxt.moveTo(
              (path[i][0] - xOffset),
              (path[i][1] - yOffset)
            )
            drawMapCxt.lineTo(
              (path[i - 1][0] - xOffset),
              (path[i - 1][1] - yOffset)
            )
          }
          drawMapCxt.stroke()
        }
      }
    }
  }

  var start = null
  function step (timestamp) {
    redraw()
    window.requestAnimationFrame(step)
  }
  window.requestAnimationFrame(step)
}

let onPlayPage = document.querySelector('#playPage')

if (onPlayPage) {
  document.addEventListener('DOMContentLoaded', function () {
    drawingScript2()
  })
}

module.exports = { drawingScript2: drawingScript2 }
