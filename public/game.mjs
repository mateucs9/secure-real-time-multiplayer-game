import Player from '../public/Player.mjs';
import Collectible from '../public/Collectible.mjs';
import {dimension} from '../public/dimension.mjs'

const socket = io();

let tick;
let playersList = [];
let coinEntity;
let playerEntity;

const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');


let coinImage = new Image()
let playerImage = new Image()
let otherImage = new Image()

let init = () => {
  coinImage.src = '../public/img/coin.png'
  playerImage.src = '../public/img/player.png'
  otherImage.src = '../public/img/other.png'


  socket.on('init', ({id, players, coin}) => {
    // console.log({id: id, players: players, coin:coin})
    coinEntity = new Collectible(coin)
    playerEntity = players.filter(x => x.id == id)[0]
    playerEntity = new Player(playerEntity)

    playersList = players

    document.onkeydown = e => {
      let dir = null
      switch(e.keyCode){
        case 87:
          dir= 'up';
          break;
        case 38:
          dir= 'up';
          break;
        case 83:
          dir = 'down'
          break
        case 40:
          dir = 'down'
          break
        case 65:
          dir = 'left'
          break
        case 37:
          dir = 'left'
          break
        case 68:
          dir = 'right'
          break;
        case 39:
          dir = 'right'
          break;
      }
      if (dir) {
        playerEntity.movePlayer(dir, 10)
        socket.emit('update', playerEntity)
      }
    }
    socket.on('update', ({players:players, coin: coin, player:player}) => {
      coinEntity = new Collectible(coin)
      if(player){
        if(player.id == playerEntity.id){
          playerEntity = new Player(player)
        }
      }
    })
  })
  window.requestAnimationFrame(update);
}

let update = () => {
  context.clearRect(0, 0, canvas.width, canvas.height)

  // Fill background
  context.fillStyle = 'green'
  context.fillRect(0, 0, canvas.width, canvas.height)

  // Border for playable area

  context.strokeStyle = 'white'
  context.strokeRect(dimension.minX, dimension.minY, dimension.playableAreaX, dimension.playableAreaY)

  // Controls text

  context.fillStyle = 'white'
  context.font = `13px 'Press Start 2P'`;
  context.textAlign = 'center'
  context.fillText('Controls', 80, 20)
  context.textAlign = 'center'
  context.fillText('WASD', 80, 40)

  // Game title

  context.font = `40px 'Modak'`;
  context.fillText("Catch'em all", 300, 40)

  if(playerEntity){
    playerEntity.draw(context, playerImage)
    context.font = `20px 'Modak'`;
    context.fillText(playerEntity.calculateRank(playersList), 550, 40)
    playersList.forEach(player => {
      if(player.id != playerEntity.id){
        let p = new Player(player)
        p.draw(context, otherImage)
      }
    })
    if(coinEntity){
      coinEntity.draw(context, coinImage)
    }

  }
  tick  = requestAnimationFrame(update);
}

init()