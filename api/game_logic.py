from typing import Optional

WIN_LINES = [
    (0, 1, 2), (3, 4, 5), (6, 7, 8),  # rows
    (0, 3, 6), (1, 4, 7), (2, 5, 8),  # cols
    (0, 4, 8), (2, 4, 6),            # diagonals
]

def check_winner(board: str) -> Optional[str]:
    # returns 'X', 'O', 'draw', or None
    cells = list(board)
    for a, b, c in WIN_LINES:
        if cells[a] != '-' and cells[a] == cells[b] == cells[c]:
            return cells[a]
    if '-' not in cells:
        return 'draw'
    return None
