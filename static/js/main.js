function playPageJavaScript(){
  const canvas = document.querySelector('canvas')
  context = canvas.getContext('2d')

  let paint
  let myPath = []
  let room = document.URL.split('/')[3]
  let drawSocket = new WebSocket(`ws://${window.location.host}/ws/draw/${room}/`)
  let usersSocket = new WebSocket(`ws://${window.location.host}/ws/${room}/users`)

  let colorsArray = ['#070404', '#df4b26', '#040507', '#32ED2C', '#13d9f3', '#f313f3', '#f3ef13']
  color = colorsArray[Math.floor(Math.random() * colorsArray.length)]

  let username = document.querySelector('.username').dataset.username
  let users = [username]

  usersSocket.onopen = function(event) {
    console.log(username)
    usersSocket.send(JSON.stringify({
      'username': username,
      'enter': true
    }))
    console.log('WebSocket connection successful.')
  }

  usersSocket.onmessage = function(event) {
    let data = JSON.parse(event.data)
    users = data['users']
    console.log(`Users updated.: ${users}`)
  }

  window.addEventListener('beforeunload', function(){
    console.log('closing!')
    usersSocket.send(JSON.stringify({
      'username': username,
      'enter': false
    }))
    usersSocket.close()
  })

  drawSocket.onmessage = function (event) {
    let data = JSON.parse(event.data)
    context.strokeStyle = data['color']
    context.shadowBlur = 4
    context.shadowColor = data['color']
    context.lineJoin = "round"
    context.lineWidth = 5
    context.beginPath()
    context.moveTo(data['path'][0][0], data['path'][0][1])
    context.lineTo(data['path'][1][0], data['path'][1][1])
    context.stroke()
  }

  canvas.addEventListener('mousedown', function(event) {
    var mouseX = event.pageX - this.offsetLeft;
    var mouseY = event.pageY - this.offsetTop;
    paint = true
    myPath.push([mouseX, mouseY])
  })

  canvas.addEventListener('mouseup', function(event) {
    paint = false
    myPath = []
  })

  canvas.addEventListener('mouseleave', function(event) {
    paint = false
    myPath = []
  })

  canvas.addEventListener('mousemove', function(event) {
    if (paint) {
      myPath.push([event.pageX - this.offsetLeft, event.pageY - this.offsetTop])
      drawSocket.send(JSON.stringify({
        'path': myPath,
        'color': color
      }))
      context.strokeStyle = color
      context.shadowBlur = 4
      context.shadowColor = color
      context.lineCap = "round"
      context.lineWidth = 5
      context.beginPath()
      context.moveTo(myPath[0][0], myPath[0][1])
      context.lineTo(myPath[1][0], myPath[1][1])
      context.stroke()
      myPath.shift()
    }
  })

  module.exports = {
  }
}

let onPlayPage = document.querySelector("#playPage");

if (onPlayPage){
  playPageJavaScript();
}
