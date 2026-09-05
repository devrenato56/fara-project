from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_submit_solution_requires_auth():
    response = client.post(
        "/problems/some-id/submissions",
        json={"code": "print(1)", "language": "python", "version": "3.10.0"},
    )
    assert response.status_code == 401
