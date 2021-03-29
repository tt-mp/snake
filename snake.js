const BOARD_SIZE = 600;
const BOARD_MIDDLE = BOARD_SIZE / 2;
const LOOP_INTERVAL = 75;
const SQUARE_SIZE = 15;
const VELOCITY = 1;

const SNAKE_COLOR = 'black';
const GOOD_COLOR = 'green';
const EVIL_COLOR = 'red';

const SCORE_ID = 'score';
const MESSAGE_ID = 'message';

let ctx;
let isRunning;
let isPaused;
let timer;
let score;

let goodSquare;
let snakeSquares;
let evilSquares;
let direction;

class Square {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
    }
}

class Direction {

    // Goes right by default
    constructor(dx = VELOCITY, dy = 0) {
        console.assert(
            dx != 0 ? dy == 0 : dy != 0, 
            'One and only one value can be zero.');

        this.dx = dx;
        this.dy = dy;
    }

    setLeft() {
        this.dx = -VELOCITY;
        this.dy = 0;
    }

    setRight() {
        this.dx = VELOCITY;
        this.dy = 0;
    }

    setUp() {
        this.dx = 0;
        this.dy = -VELOCITY; // y-axis runs top to bottom
    }

    setDown() {
        this.dx = 0;
        this.dy = VELOCITY;
    }

    getNextSquare(square) {
        // Multiply by SQUARE_SIZE to stay in grid format
        let x = square.x + this.dx * SQUARE_SIZE;
        let y = square.y + this.dy * SQUARE_SIZE;

        return new Square(x, y, SNAKE_COLOR);
    }
}

function init() {
    let board = document.getElementById('board');
    ctx = board.getContext('2d');
    document.addEventListener('keydown', getUserInput);
}

function getUserInput(event) {
    const keys = {
        space: ' ',
        left: 'ArrowLeft',
        right: 'ArrowRight',
        up: 'ArrowUp',
        down: 'ArrowDown'
    };

    switch(event.key) {
        case keys.space:
            updateGameState();
            break;
        case keys.left:
            direction.setLeft();
            break;
        case keys.right:
            direction.setRight();
            break;
        case keys.up:
            direction.setUp();
            break;
        case keys.down:
            direction.setDown();
            break;
    }
}

function updateGameState() {
    if (isRunning) pauseGame();
    else if (!isRunning && isPaused) resumeGame();
    else startGame();
}

function startGame() {
    snakeSquares = [ new Square(BOARD_MIDDLE, BOARD_MIDDLE, SNAKE_COLOR) ];

    score = 0;
    updateScore();
    updateStatus();

    direction = new Direction();
    evilSquares = [];
    goodSquare = getRandomSquare(GOOD_COLOR);

    timer = setInterval(updateBoard, LOOP_INTERVAL);
    isRunning = true;
}

function resumeGame() {
    timer = setInterval(updateBoard, LOOP_INTERVAL);
    isRunning = true;
    isPaused = false;
    updateStatus();
}

function pauseGame() {
    clearInterval(timer);
    isRunning = false;
    isPaused = true;
    updateStatus('PAUSED');
}

function stopGame() {
    clearInterval(timer);
    isRunning = false;
    isPaused = false;
    updateStatus('GAME OVER');
}

function updateBoard() {
    if (isRunning) {
        let goodFound = isGoodFound();
        if (goodFound) {
            score++;
            updateScore();
        }

        // Re-draw board for each loop
        clearBoard();
        updateGood(goodFound);
        updateEvil(goodFound);
        updateSnake(goodFound);
    }
}

function isGoodFound() {
    return isSquareFilled(goodSquare, snakeSquares);
}

function updateGood(goodFound) {
    if (goodFound) {
        goodSquare = getRandomSquare(GOOD_COLOR);
    }

    drawSquare(goodSquare);
}

function updateSnake(goodFound) {
    let head = snakeSquares[0];
    let nextSquare = direction.getNextSquare(head);

    if (isSquareInvalid(nextSquare)) {
        stopGame();
        return;
    }

    snakeSquares.unshift(nextSquare);

    // Snake grows when good is found
    if (!goodFound) snakeSquares.pop();

    drawSquares(snakeSquares);
}

function updateEvil(goodFound) {
    if (goodFound) {
        let evil = getRandomSquare(EVIL_COLOR);
        evilSquares.push(evil);
    }

    drawSquares(evilSquares);
}

function drawSquares(squares) {
    squares.forEach(
        square => drawSquare(square));
}

function drawSquare(square) {
    ctx.fillStyle = square.color;
    ctx.fillRect(square.x, square.y, SQUARE_SIZE, SQUARE_SIZE);
}

function isSquareInvalid(square) {
    return isSquareOutOfBounds(square) || isSquareFilled(square, snakeSquares) || isSquareFilled(square, evilSquares);
}

function isSquareOutOfBounds(square) {
    return square.x < 0 || square.x >= BOARD_SIZE || square.y < 0 || square.y >= BOARD_SIZE;
}

function isSquareFilled(square, squares) {
    for (let i = 0; i < squares.length; i++) {
        if (squares[i].x === square.x && squares[i].y === square.y) {
            return true;
        }
    }

    return false;
}

function getRandomSquare(color) {
    let x = getRandomSpot();
    let y = getRandomSpot();

    let randomSquare = new Square(x, y, color);
    
    if (isSquareInvalid(randomSquare)) {
        return getRandomSquare(color);
    }

    return randomSquare;
}

function getRandomSpot() {
    let spot = Math.random() * BOARD_SIZE;

    // Round to next multiple of SQUARE_SIZE to keep grid format
    return Math.ceil(spot / SQUARE_SIZE) * SQUARE_SIZE;
}

function updateStatus(message = '') {
    document.getElementById(MESSAGE_ID).innerHTML = message;
}

function updateScore() {
    document.getElementById(SCORE_ID).innerHTML = `SCORE ${score}`;
}

function clearBoard() {
    ctx.clearRect(0, 0, BOARD_SIZE, BOARD_SIZE);
}
