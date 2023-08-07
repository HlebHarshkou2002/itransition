const crypto = require('crypto');

class Game {
  constructor(moves) {
    this.moves = moves;
    this.key = this.generateKey();
    this.computerMove = this.generateComputerMove();
    this.hmac = this.calculateHMAC(this.computerMove);
  }

  generateKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  generateComputerMove() {
    const randomIndex = Math.floor(Math.random() * this.moves.length);
    return this.moves[randomIndex];
  }

  calculateHMAC(message) {
    const hmac = crypto.createHmac('sha256', this.key);
    hmac.update(message);
    return hmac.digest('hex');
  }

  play(userMove) {
    const userIndex = parseInt(userMove);
    if (isNaN(userIndex) || userIndex < 0 || userIndex > this.moves.length) {
      console.log('Invalid move. Please enter a number between 0 and', this.moves.length);
      return;
    }

    if (userIndex === 0) {
      console.log('Exiting the game.');
      return;
    }

    const userMoveName = this.moves[userIndex - 1];
    const result = this.getResult(userIndex);

    console.log('HMAC:', this.hmac);
    console.log('Your move:', userMoveName);
    console.log('Computer move:', this.computerMove);
    console.log(result ? 'You win!' : 'You lose!');
    console.log('HMAC key:', this.key);
  }

  getResult(userIndex) {
    const mid = Math.floor(this.moves.length / 2);
    const computerIndex = (userIndex + mid) % this.moves.length;
    return computerIndex < mid;
  }
}

class MoveTable {
  constructor(moves) {
    this.moves = moves;
    this.table = this.generateTable();
  }

  generateTable() {
    const table = [['Moves', ...this.moves]];

    for (let i = 0; i < this.moves.length; i++) {
      const row = [this.moves[i]];
      for (let j = 0; j < this.moves.length; j++) {
        const result = this.getResult(i + 1, j + 1);
        row.push(result);
      }
      table.push(row);
    }

    return table;
  }

  getResult(userIndex, computerIndex) {
    const mid = Math.floor(this.moves.length / 2);
    const diff = (computerIndex - userIndex + this.moves.length) % this.moves.length;
    if (diff === 0) {
      return 'Draw';
    } else if (diff <= mid) {
      return 'Win';
    } else {
      return 'Lose';
    }
  }

  printTable() {
    for (let i = 0; i < this.table.length; i++) {
      console.log(this.table[i].join('\t'));
    }
  }
}

const moves = process.argv.slice(2);
const moveSet = new Set(moves);
const uniqueMoves = Array.from(moveSet);

const moveTable = new MoveTable(uniqueMoves);

if (uniqueMoves.length < 3 || uniqueMoves.length % 2 !== 1) {
  console.log('Invalid number of moves. Please provide an odd number of unique moves.');
  console.log('Example: node game.js rock paper scissors');
  process.exit(1);
}

const game = new Game(uniqueMoves);

if (process.argv.includes('help')) {
  moveTable.printTable();
} else {
  console.log('HMAC:', game.hmac);
  console.log('Available moves:');
  for (let i = 0; i < uniqueMoves.length; i++) {
    console.log(`${i + 1} - ${uniqueMoves[i]}`);
  }
  console.log('0 - exit');
  console.log('? - help');

  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Enter your move: ', (userMove) => {
    if (userMove === '?') {
      moveTable.printTable();
      rl.close();
    } else {
      game.play(userMove);
      rl.close();
    }
  });
}