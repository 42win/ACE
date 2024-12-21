const canvas = document.getElementById('go-board');
const context = canvas.getContext('2d');
const resetButton = document.getElementById('reset');

// Initialize board (example 9x9 Go board)
const size = 9;
const board = Array.from({ length: size }, () => Array(size).fill(null));

// WebSocket setup
const socket = new WebSocket('ws://localhost:8080');

socket.onopen = () => {
    console.log('Connected to WebSocket server');
};

socket.onmessage = (event) => {
    const bestMove = JSON.parse(event.data);
    console.log('Best move from AI:', bestMove);
    makeMove(bestMove.x, bestMove.y, 'black');
};

function drawBoard() {
    const cellSize = canvas.width / size;
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    for (let i = 0; i <= size; i++) {
        context.beginPath();
        context.moveTo(i * cellSize, 0);
        context.lineTo(i * cellSize, canvas.height);
        context.moveTo(0, i * cellSize);
        context.lineTo(canvas.width, i * cellSize);
        context.stroke();
    }
}

function makeMove(x, y, player) {
    if (board[x][y] !== null) return;

    board[x][y] = player;
    drawBoard();
    const cellSize = canvas.width / size;
    const centerX = x * cellSize + cellSize / 2;
    const centerY = y * cellSize + cellSize / 2;

    context.beginPath();
    context.arc(centerX, centerY, cellSize / 2 - 5, 0, Math.PI * 2);
    context.fillStyle = player === 'black' ? 'black' : 'white';
    context.fill();
}

// Handle click event on canvas for player's move
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / (canvas.width / size));
    const y = Math.floor((event.clientY - rect.top) / (canvas.height / size));

    if (board[x][y] === null) {
        makeMove(x, y, 'white');  // Player's move
        socket.send(JSON.stringify({ board, player: 'white' }));
    }
});

// Reset button to clear the board
resetButton.addEventListener('click', () => {
    for (let i = 0; i < size; i++) {
        board[i].fill(null);
    }
    drawBoard();
});

drawBoard();
