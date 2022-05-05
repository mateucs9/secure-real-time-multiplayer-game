require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
const socket = require('socket.io');
const cors = require('cors');
const helmet = require('helmet')

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');

const app = express();

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(helmet.noSniff());
app.use(helmet.xssFilter());
app.use(helmet.noCache());
app.use(helmet.hidePoweredBy({ setTo: 'PHP 7.4.3' }));

//For FCC testing purposes and enables user to connect from outside the hosting platform
app.use(cors({ origin: '*' }));

// Index page (static HTML)
app.route('/')
  .get(function(req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

//For FCC testing purposes
fccTestingRoutes(app);

// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

const portNum = process.env.PORT || 3000;

// Set up server and tests
const server = app.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...');
    setTimeout(function() {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});

const Player = require('./public/Player.mjs')
const Collectible = require('./public/Collectible.mjs')
const {dimension} = require('./public/dimension.mjs')

const random = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

const getRandomPosition = () => {
  let x = random(dimension.minX + 50, dimension.maxX - 50)
  let y = random(dimension.minY + 50, dimension.maxY - 50)

  x = Math.floor(x / 10) * 10
  y = Math.floor(y / 10) * 10

  return [x, y]
}

let playersList = []
let [coinX, coinY] = getRandomPosition()
let coin = new Collectible({
  x: coinX,
  y: coinY,
  value: 1,
  id: Date.now()
})


let connections = []

const io = socket(server)
io.sockets.on('connection', socket => {
  
  connections.push(socket)
  // console.log(connections.map(x => x.conn.id))

  let [playerX, playerY] = getRandomPosition()

  let player = new Player({
    x: playerX,
    y: playerY,
    score: 0,
    id: socket.id
  })

  playersList.push(player)

  socket.emit('init', {
    id: socket.id,
    players: playersList,
    coin: coin
  })

  socket.on('update', updatedUser => {
    playersList.forEach(user => {
      if (user.id == socket.id) {
        user.x = updatedUser.x
        user.y = updatedUser.y
        user.score = updatedUser.score
        user.radius = updatedUser.radius
      }
    })
    io.emit('update', {
      players: playersList,
      coin: coin,
      player: null
    })
  })

  socket.on('disconnect', () => {
    console.log(socket.id)
    socket.broadcast.emit('remove-player', socket.id)
    connections.splice(connections.indexOf(socket), 1)
    playersList = playersList.filter(x => x.id != socket.id)
  })
})


let tick = () => {
  let playerUpdate = null
  playersList.forEach(player => {
    let p = new Player(player)
    if (p.collision(coin)) {
      player.score += 1
      player.radius += 10
      let [coinX, coinY] = getRandomPosition()
      coin = new Collectible({
        x: coinX,
        y: coinY,
        value: 1,
        id: new Date()
      })
      playerUpdate = player
    }
  })

  io.emit('update', {
    players: playersList,
    coin: coin,
    player: playerUpdate
  })
}

setInterval(tick, 1000 / 50)

module.exports = app; // For testing
