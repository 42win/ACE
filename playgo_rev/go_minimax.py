import asyncio
import websockets
import json
import logging
import random

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def minimax(board, depth, maximizingPlayer):
    empty_cells = [(i, j) for i in range(len(board)) for j in range(len(board[i])) if board[i][j] is None]

    # Kondisi akhir rekursi: jika kedalaman = 0 atau tidak ada langkah yang mungkin
    if depth == 0 or not empty_cells:
        return evaluate_board(board), None

    # Pemain AI (batu putih) memaksimalkan skor
    if maximizingPlayer:  # White (AI) is maximizing player
        best_value = float('-inf')
        best_move = None

        for move in empty_cells:
            new_board = [row[:] for row in board]
            new_board[move[0]][move[1]] = 'white'
            value, _ = minimax(new_board, depth - 1, False)
            if value > best_value:
                best_value = value
                best_move = move

        return best_value, best_move
    else:  # Black (human) is minimizing player
        best_value = float('inf')
        best_move = None

        for move in empty_cells:
            new_board = [row[:] for row in board]
            new_board[move[0]][move[1]] = 'black'
            value, _ = minimax(new_board, depth - 1, True)
            if value < best_value:
                best_value = value
                best_move = move

        return best_value, best_move

def evaluate_board(board):
    """Evaluate the board for the AI (white) with a more complex strategy."""
    white_score = sum(row.count('white') for row in board)
    black_score = sum(row.count('black') for row in board)

    # Count captures
    captures = count_captures(board, 'white') - count_captures(board, 'black')

    # Score based on territories (or surrounded areas)
    territory_score = count_territories(board, 'white') - count_territories(board, 'black')

    return (white_score + captures + territory_score) - (black_score)

def count_captures(board, color):
    """Count the number of captures for a given color."""
    opponent = 'black' if color == 'white' else 'white'
    captured = 0
    for row in range(len(board)):
        for col in range(len(board[row])):
            if board[row][col] == opponent:
                if not check_liberty(board, row, col, opponent):
                    captured += 1
    return captured

def check_liberty(board, row, col, color):
    """Check if a group has liberty."""
    visited = [[False] * len(board) for _ in range(len(board))]
    has_liberty = False

    def dfs(r, c):
        nonlocal has_liberty
        if r < 0 or r >= len(board) or c < 0 or c >= len(board) or visited[r][c]:
            return
        if board[r][c] is None:
            has_liberty = True
            return
        if board[r][c] == color:
            visited[r][c] = True
            for dx, dy in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
                dfs(r + dx, c + dy)

    dfs(row, col)
    return has_liberty

def count_territories(board, color):
    """Count the territories controlled by a given color."""
    visited = [[False] * len(board) for _ in range(len(board))]
    territory = 0

    for row in range(len(board)):
        for col in range(len(board[row])):
            if board[row][col] is None and not visited[row][col]:  # Empty cell and not visited
                if check_territory(board, row, col, color, visited):
                    territory += 1

    return territory

def check_territory(board, row, col, color, visited):
    """Check if a territory is controlled by a given color."""
    directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]
    queue = [(row, col)]
    visited[row][col] = True
    is_territory = True

    while queue:
        r, c = queue.pop(0)
        for dr, dc in directions:
            nr, nc = r + dr, c + dc
            if nr < 0 or nr >= len(board) or nc < 0 or nc >= len(board) or visited[nr][nc]:
                continue
            if board[nr][nc] is None:
                visited[nr][nc] = True
                queue.append((nr, nc))
            elif board[nr][nc] != color:
                is_territory = False

    return is_territory

async def handler(websocket):
    async for message in websocket:
        logger.info(f"Received message: {message}")
        board = json.loads(message)

        # Call minimax algorithm to determine the best move
        _, best_move = minimax(board, 3, True)  # Adjust depth as needed

        if best_move is not None:
            row, col = best_move
            logger.info(f"AI (White) plays at: ({row}, {col})")
            response = {
                'action': 'placeStone',
                'row': row,
                'col': col,
                'color': 'white'
            }
            await websocket.send(json.dumps(response))  # Send move back to the client

async def main():
    async with websockets.serve(handler, "localhost", 5678):
        logger.info("WebSocket server berjalan di ws://localhost:5678")
        await asyncio.Future()  # Menjaga server tetap berjalan

if __name__ == "__main__":
    asyncio.run(main())
