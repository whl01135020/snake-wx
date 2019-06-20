
let startX = 0;
let startY = 0;

let moveX = 0;
let moveY = 0;

let diffX = 0;
let diffY = 0;

//圆的直径是20
let snakeHeadWH = 20

//默认向右移动
let direction = 'right'
let drctTemp = ''

//定时器
let timer = null
//snake数组
let snakeArr = []

let food = null
//获取画布上下文
let context = wx.createContext()
//蛇尾
let snakeTail = null
let isGameOver = false
let that
let score = 0
//窗口宽高
let windowWidth = 0;
let windowHeight = 0;
let canvasHeight = null;

let res = wx.getSystemInfoSync()
windowWidth = res.windowWidth;
windowHeight = res.windowHeight;

function Node(x, y) {
  this.x = x;
  this.y = y;
}
//初始蛇常度为5
function createSnake() {
  snakeArr.splice(0, snakeArr.length)
  for (var i = 4; i >= 0; i--) {
    var node = new Node(snakeHeadWH * (i + 0.5), snakeHeadWH * 0.5)
    snakeArr.push(node);
  }
}

//初始化食物(创建)
function createFood() {
  let x = parseInt(Math.random() * windowWidth/20) * snakeHeadWH + snakeHeadWH * 0.5
  let y = parseInt(Math.random() * windowHeight/20) * snakeHeadWH + snakeHeadWH * 0.5

  //如果食物的坐标在蛇身上，则重新创建
  for (var i = 0; i < snakeArr.length; i++) {
    var node = snakeArr[i]
    if (node.x == x && node.y == y) {
      createFood()
      return
    }
  }
  food = new Node(x, y)
}

//绘制蛇与食物(画布上显示出来)
function draw() {
  for (var i = 0; i < snakeArr.length; i++) {
    var node = snakeArr[i]
    if (i == 0) {
      //蛇头
      context.setFillStyle('#ff0000')
    } else {
      //蛇身
      context.setFillStyle('#000000')
    }
    //填充蛇
    context.beginPath()
    context.arc(node.x, node.y, snakeHeadWH / 2, 0, Math.PI * 2, true);
    context.closePath()
    context.fill()
  }
  //填充食物
  context.setFillStyle('#00ff00')
  context.beginPath()
  context.arc(food.x, food.y, snakeHeadWH / 2, 0, Math.PI * 2, true);
  context.closePath()
  context.fill()
  //渲染在画布上
  wx.drawCanvas({
    canvasId: 'snakeCanvas',
    actions: context.getActions()
  })
}

//游戏结束
function gameOver() {
  isGameOver = true
  clearInterval(timer)
  wx.showModal({
    title: "总得分:" + score + "分--蛇身总长:" + snakeArr.length + "",
    content: 'Game Over, 重新开始?',
    confirmText: '确定',
    success: function (e) {
      if (e.confirm == true) {
        startGame()
      } else {
        console.log('cancel')
        that.setData({
          btnTitle: '开始'
        })
      }
    }
  })
}

//是否吃到食物(头部坐标和食物坐标是否相等)
function isEatedFood() {
  let head = snakeArr[0]
  if (head.x == food.x && head.y == food.y) {
    score++
    snakeArr.push(snakeTail)
    wx.showToast({
      title: "+" + 1 + "分",
      icon: 'succes'
    })
    createFood()
  }
}

//是否撞到墙壁或者撞到自己的身体
function isDestroy() {
  let head = snakeArr[0]
  for (var i = 1; i < snakeArr.length; i++) {
    let bodys = snakeArr[i]
    if (head.x == bodys.x && head.y == bodys.y) {
      gameOver()
    }
  }
  
  if (head.x < 10 || head.x > windowWidth-10) {
    gameOver()
  }
 
  if (head.y < 10 || head.y > windowHeight-10) {
    gameOver()
  }
}

function moveEnd() {
  isEatedFood()
  isDestroy()
  draw()
}

function move() {
  //蛇尾
  snakeTail = snakeArr[snakeArr.length - 1]
  var node = snakeArr[0]
  var newNode = {
    x: node.x,
    y: node.y
  }
  switch (direction) {
    case 'up':
      newNode.y -= snakeHeadWH;
      break;
    case 'left':
      newNode.x -= snakeHeadWH;
      break;
    case 'right':
      newNode.x += snakeHeadWH;
      break;
    case 'down':
      newNode.y += snakeHeadWH;
      break;
  }
  //pop()删除并返回数组的最后一个元素 
  snakeArr.pop()
  //unshift() 方法可向数组的开头添加一个或更多元素，并返回新的长度
  snakeArr.unshift(newNode)
  moveEnd()
}

function startGame() {
  if (isGameOver) {
    direction = 'right'
    createSnake()
    createFood()
    score = 0
    isGameOver = false
  }
  timer = setInterval(move, 300)
}

Page({
  data: {
    btnTitle: '开始'
  },
  touchstart: function (e) {
    startX = e.touches[0].x;
    startY = e.touches[0].y;
  },
  touchmove: function (e) {
    moveX = e.touches[0].x;
    moveY = e.touches[0].y;
    diffX = moveX - startX;
    diffY = moveY - startY;
    if (Math.abs(diffX) > Math.abs(diffY) && diffX > 0) {
      drctTemp = "right"
    } else if (Math.abs(diffX) > Math.abs(diffY) && diffX < 0) {
      drctTemp = "left"
    } else if (Math.abs(diffY) > Math.abs(diffX) && diffY > 0) {
      drctTemp = "down"
    } else if (Math.abs(diffY) > Math.abs(diffX) && diffY < 0) {
      drctTemp = "up"
    }
    direction = drctTemp;
  },
  onLoad: function () {
    that = this
    createSnake()
    createFood()
    draw()
    startGame()
  },
  changeDirection: function (e) {
    if ('开始' == this.data.btnTitle) return
    let title = e.target.id
    if (title == 'down' || title == 'up') {
      if (direction == 'up' || direction == 'down') return
    } else if (direction == 'left' || direction == 'right') return
    direction = title;
  },
  //游戏开始
  startGame: function () {
    if (isGameOver) {
      clearInterval(timer)
    } else {
      startGame()
    }
  }
  
})