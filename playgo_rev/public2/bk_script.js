const boardSize = 5; // Set board size to 5x5
const cellSize = 100; // Set the size of each cell (in pixels)
let board = Array.from({ length: boardSize }, () => Array(boardSize).fill(null)); // Initialize the 5x5 board
let currentPlayer = 'black'; // Start with black player
let socket; // Declare socket variable globally

function initWebSocket() {
    socket = new WebSocket('ws://localhost:5678'); // Connect to Python WebSocket server

    socket.onopen = function() {
        console.log("WebSocket connection established");
    };

    socket.onmessage = function(event) {
        const response = JSON.parse(event.data);
        console.log("Received response from Python server:", response); // Log the response

        // Process the response from the Python server
        if (response.action === 'placeStone') {
            const { row, col, color } = response;
            board[row][col] = color; // Place the stone received from Python
            console.log(`Placed ${color} stone at (${row}, ${col}) from Python`); // Log placement from Python
            drawBoard(); // Redraw the board

            // Show alert when receiving a response
            // alert(`Python placed a ${color} stone at (${row}, ${col})`);

            // Switch back to the black player after Python's move
            currentPlayer = 'black'; // Ensure the next turn is for black player
        }
    };

    socket.onerror = function(error) {
        console.error("WebSocket error:", error); // Log WebSocket errors
    };

    socket.onclose = function() {
        console.log("WebSocket connection closed"); // Log when WebSocket is closed
    };
}

function drawBoard() {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = ''; // Clear existing board

    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.style.width = `${cellSize}px`; // Use cellSize for width
            cell.style.height = `${cellSize}px`; // Use cellSize for height
            cell.dataset.row = row;
            cell.dataset.col = col;

            // Set the text content based on the board state
            if (board[row][col] === 'black') {
                cell.textContent = 'B'; // Use 'B' for black stones
                cell.style.color = 'black'; // Optional: color the letter black
            } else if (board[row][col] === 'white') {
                cell.textContent = 'W'; // Use 'W' for white stones
                cell.style.color = 'black'; // Optional: color the letter white
            } else {
                cell.textContent = ''; // Empty cell
            }

            // Add event listener to place stones
            cell.addEventListener('click', () => placeStone(row, col));
            boardElement.appendChild(cell);
        }
    }
}

function placeStone(row, col) {
    // Check if the cell is empty before placing a stone
    if (board[row][col] === null && currentPlayer === 'black') {
        board[row][col] = currentPlayer; // Place the stone
        console.log(`Placed ${currentPlayer} stone at (${row}, ${col})`); // Log placement
        drawBoard(); // Redraw the board
        sendBoardStateToPythonServer(); // Send the updated board state to the Python server

        // Switch to the white player after placing a black stone
        currentPlayer = 'white'; // Switch player to white after the black player has played
    }
}

function sendBoardStateToPythonServer() {
    const boardState = JSON.stringify(board);
    console.log("Sending board state to Python server:", boardState);
    
    // Send the board state via WebSocket
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(boardState);
        console.log("Sent board state to Python server, waiting for response..."); // Log sending
    } else {
        console.error("WebSocket is not open. Cannot send data.");
    }
}

// Call drawBoard when the page loads and initialize WebSocket
window.onload = () => {
    drawBoard();
    initWebSocket(); // Initialize the WebSocket connection
};
