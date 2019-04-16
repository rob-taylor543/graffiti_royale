const canvas = document.querySelector('canvas')
context = canvas.getContext('2d')
const clickX = []
const clickY = []
const clickDrag = []
let paint
let room = document.URL.split('/')[3]
console.log(room)
let drawSocket = new WebSocket(`wss://sleepy-earth-87641.herokuapp.com/ws/draw/${room}/`)
let colorsArray = ['#070404', '#df4b26', '#040507', '#32ED2C']
colorsArray = colorsArray[Math.floor(Math.random() * colorsArray.length)]

drawSocket.onmessage = function (e) {
  let data = JSON.parse(e.data)
  let X = data['X']
  let Y = data['Y']
  addClick(X, Y, true)
  redraw()
}

canvas.addEventListener('mousedown', function (e) {
  let mouseX = e.pageX - canvas.offsetLeft
  let mouseY = e.pageY - canvas.offsetTop
  drawSocket.send(JSON.stringify({
    'X': mouseX,
    'Y': mouseY
  }))
  paint = true
  addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop)
  redraw()
})

canvas.addEventListener('mousemove', function (e) {
  if (paint) {
    drawSocket.send(JSON.stringify({
      'X': e.pageX - this.offsetLeft,
      'Y': e.pageY - this.offsetTop
    }))
    addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true)
    redraw()
  }
})

canvas.addEventListener('mouseup', function () {
  paint = false
})

canvas.addEventListener('mouseleave', function () {
  paint = false
})

function addClick (x, y, dragging) {
  clickX.push(x)
  clickY.push(y)
  clickDrag.push(dragging)
}

function redraw () {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height)

  context.strokeStyle = colorsArray
  context.lineJoin = 'round'
  context.lineWidth = 5

  for (var i = 0; i < clickX.length; i++) {
    context.beginPath()
    if (clickDrag[i] && i) {
      context.moveTo(clickX[i - 1], clickY[i - 1])
    } else {
      context.moveTo(clickX[i] - 1, clickY[i])
    }
    context.lineTo(clickX[i], clickY[i])
    context.closePath()
    context.stroke()
  }
}

module.exports = {
}
