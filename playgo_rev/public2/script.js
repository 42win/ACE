const boardSize = 5; // Set board size to 5x5
const cellSize = 100; // Set the size of each cell (in pixels)
let board = Array.from({ length: boardSize }, () => Array(boardSize).fill(null)); // Initialize the 5x5 board
let currentPlayer = 'black'; // Start with black player (human)
let capturedStones = { black: 0, white: 0 }; // Count of captured stones
let socket; // Declare WebSocket variable

function initWebSocket() {
    socket = new WebSocket('ws://localhost:5678'); // Connect to Python WebSocket server

    socket.onopen = function() {
        console.log("WebSocket connection established");
    };

    socket.onmessage = function(event) {
        const response = JSON.parse(event.data);
        console.log("Received response from Python server:", response);

        // Process the response from the Python server (White Player's move)
        if (response.action === 'placeStone') {
            const { row, col, color } = response;
            board[row][col] = color; // Place the white stone
            drawBoard(); // Redraw the board
            checkCapture(row, col, color); // Check for any captures
            updateScore(); // Update the score
            currentPlayer = 'black'; // Switch player back to black after the white move
            document.getElementById('status').textContent = `Current Player: Black`;
        }
    };

    socket.onerror = function(error) {
        console.error("WebSocket error:", error);
    };

    socket.onclose = function() {
        console.log("WebSocket connection closed");
    };
}

function drawBoard() {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = ''; // Clear existing board

    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.style.width = `${cellSize}px`;
            cell.style.height = `${cellSize}px`;
            cell.dataset.row = row;
            cell.dataset.col = col;

            if (board[row][col] === 'black') {
                cell.textContent = 'B'; // Use 'B' for black stones
                cell.style.color = 'black';
            } else if (board[row][col] === 'white') {
                cell.textContent = 'W'; // Use 'W' for white stones
                cell.style.color = 'black';
            } else {
                cell.textContent = ''; // Empty cell
            }

            cell.addEventListener('click', () => placeStone(row, col)); // Allow human player (black) to place stones
            boardElement.appendChild(cell);
        }
    }
}

function placeStone(row, col) {
    if (board[row][col] === null && currentPlayer === 'black') { // Black's turn
        board[row][col] = currentPlayer; // Place the stone
        drawBoard(); // Redraw the board
        checkCapture(row, col, currentPlayer); // Check for captures
        updateScore(); // Update the score

        // Send board state to Python server for White's move
        sendBoardStateToPythonServer();
        currentPlayer = 'white'; // Switch player to white (AI)
        document.getElementById('status').textContent = `Current Player: White (AI is thinking...)`;
    }
}

function sendBoardStateToPythonServer() {
    const boardState = JSON.stringify(board);
    console.log("Sending board state to Python server:", boardState);

    if (socket.readyState === WebSocket.OPEN) {
        socket.send(boardState); // Send the board state to the Python server (AI)
        console.log("Sent board state to Python server, waiting for response...");
    } else {
        console.error("WebSocket is not open. Cannot send data.");
    }
}

function checkCapture(row, col, color) {
    const opponent = color === 'black' ? 'white' : 'black';
    const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];

    directions.forEach(([dx, dy]) => {
        const r = row + dx;
        const c = col + dy;

        if (r >= 0 && r < boardSize && c >= 0 && c < boardSize && board[r][c] === opponent) {
            const captured = checkLiberty(r, c, opponent);
            if (captured) {
                removeGroup(r, c, opponent);
                capturedStones[color] += captured;
            }
        }
    });
}

function checkLiberty(row, col, color) {
    const visited = Array.from({ length: boardSize }, () => Array(boardSize).fill(false));
    let hasLiberty = false;

    function dfs(r, c) {
        if (r < 0 || r >= boardSize || c < 0 || c >= boardSize || visited[r][c]) return;
        if (board[r][c] === null) {
            hasLiberty = true;
            return;
        }
        if (board[r][c] === color) {
            visited[r][c] = true;
            [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => dfs(r + dx, c + dy));
        }
    }

    dfs(row, col);
    return !hasLiberty; // Return true if no liberty found (group is captured)
}

function removeGroup(row, col, color) {
    function dfsRemove(r, c) {
        if (r < 0 || r >= boardSize || c < 0 || c >= boardSize || board[r][c] !== color) return;
        board[r][c] = null; // Remove stone
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => dfsRemove(r + dx, c + dy));
    }

    dfsRemove(row, col);
    drawBoard(); // Redraw board after removing stones
}

function updateScore() {
    let blackScore = capturedStones.black;
    let whiteScore = capturedStones.white;

    const visited = Array.from({ length: boardSize }, () => Array(boardSize).fill(false));
    let blackTerritoryCount = 0;
    let whiteTerritoryCount = 0;
    const adjacentColors = new Set(); // Declare adjacentColors here

    function countTerritory(row, col) {
        let territory = 0;

        function exploreTerritory(r, c) {
            if (r < 0 || r >= boardSize || c < 0 || c >= boardSize || visited[r][c]) return;
            visited[r][c] = true;

            if (board[r][c] === null) {
                territory++; // Count empty spaces
                // Explore all four directions
                exploreTerritory(r + 1, c);
                exploreTerritory(r - 1, c);
                exploreTerritory(r, c + 1);
                exploreTerritory(r, c - 1);
            } else {
                adjacentColors.add(board[r][c]); // Add the color of the stone found
            }
        }

        exploreTerritory(row, col);

        // If there are both black and white stones adjacent, it's not a territory
        if (adjacentColors.size > 1) {
            return 0;
        }
        return territory; // Return the count of territory if valid
    }

    // Count territory for both players
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            if (board[row][col] === null && !visited[row][col]) {
                const territory = countTerritory(row, col);
                // If territory count is positive, check which color it belongs to
                if (territory > 0) {
                    if (adjacentColors.has('black')) {
                        blackScore += territory;
                        blackTerritoryCount++;
                    } else if (adjacentColors.has('white')) {
                        whiteScore += territory;
                        whiteTerritoryCount++;
                    }
                }
            }
        }
    }

    // Update the score in the UI
    document.getElementById('score').textContent = `Score - Black: ${blackScore}, White: ${whiteScore}`;
    
   
    // if (blackTerritoryCount > 0) {
    //     alert(`Player Black berhasil membuat ${blackTerritoryCount} wilayah!`);
    // }
    // if (whiteTerritoryCount > 0) {
    //     alert(`Player White berhasil membuat ${whiteTerritoryCount} wilayah!`);
    // }
}

// Call drawBoard when the page loads and initialize WebSocket
window.onload = () => {
    drawBoard();
    initWebSocket();
};
