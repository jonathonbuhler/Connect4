def check_winner(A, c, t):
    r = -1
    for row in range(5,-1,-1):
        if A[row][c] == 0:
            A[row][c] = -1
            r = row
            break
    dirs = [
        (1, 0),
        (0, 1),
        (1, 1),
        (1, -1),
    ]

    for dr, dc in dirs:
        count = 1        
        rr, cc = r + dr, c + dc
        while 0 <= rr < 6 and 0 <= cc < 7 and A[rr][cc] == t:
            count += 1
            rr += dr
            cc += dc

        rr, cc = r - dr, c - dc
        while 0 <= rr < 6 and 0 <= cc < 7 and A[rr][cc] == t:
            count += 1
            rr -= dr
            cc -= dc

        if count >= 4:
            return True

    return False