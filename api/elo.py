from typing import Tuple

# Basic ELO with K-factor 32

def expected_score(rating_a: int, rating_b: int) -> float:
    return 1.0 / (1 + 10 ** ((rating_b - rating_a) / 400))


def calculate_elo(rating_a: int, rating_b: int, score_a: float, k: int = 32) -> Tuple[int, int]:
    ea = expected_score(rating_a, rating_b)
    eb = expected_score(rating_b, rating_a)
    new_a = round(rating_a + k * (score_a - ea))
    new_b = round(rating_b + k * ((1 - score_a) - eb))
    return new_a, new_b
