from rubik_solver import utils

# Start with a solved cube
solved_state = "WWWWWWWWW" + "RRRRRRRRR" + "GGGGGGGGG" + "OOOOOOOOO" + "BBBBBBBBB" + "YYYYYYYYY"

# Example scramble (sequence of moves)
scramble = "R U R' U R U2 R'"

try:
    # Apply scramble to solved cube
    scrambled_state = utils.scramble(solved_state, scramble)
    print("✅ Scrambled Cube State:", scrambled_state)
except Exception as e:
    print("⚠️ Error while scrambling:", e)
