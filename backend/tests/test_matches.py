from fastapi.testclient import TestClient

from app.agents.versus import LEVELS
from app.main import app

client = TestClient(app)


def test_create_match_requires_auth():
    response = client.post("/matches", json={"problem_id": "some-id", "opponent_type": "ai"})
    assert response.status_code == 401


def test_join_match_requires_auth():
    response = client.post("/matches/some-id/join")
    assert response.status_code == 401


def test_match_submission_requires_auth():
    response = client.post(
        "/matches/some-id/submissions",
        json={"code": "print(1)", "language": "python", "version": "3.10.0"},
    )
    assert response.status_code == 401


def test_finish_match_requires_auth():
    response = client.post("/matches/some-id/finish")
    assert response.status_code == 401


def test_abandon_match_requires_auth():
    response = client.post("/matches/some-id/abandon")
    assert response.status_code == 401


def test_auth_is_checked_before_body_validation():
    # Un body invalido sin token sigue devolviendo 401: no se filtra si el
    # payload era valido o no antes de autenticar.
    response = client.post("/matches", json={"problem_id": "some-id", "opponent_type": "alien"})
    assert response.status_code == 401


def test_levels_are_calibrated_from_easy_to_hard():
    # A menor nivel, la IA va mas lenta y comete mas errores deliberados.
    assert LEVELS["easy"]["errores"] > LEVELS["hard"]["errores"]
    assert LEVELS["easy"]["segundos"] > LEVELS["hard"]["segundos"]
