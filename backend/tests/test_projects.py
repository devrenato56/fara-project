from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_join_project_requires_auth():
    response = client.post("/projects/some-id/join", json={"invite_token": "whatever"})
    assert response.status_code == 401


def test_get_invite_link_requires_auth():
    response = client.post("/projects/some-id/invite")
    assert response.status_code == 401
