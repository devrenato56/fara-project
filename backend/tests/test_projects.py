from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_join_project_requires_auth():
    response = client.post("/projects/some-id/join", json={"invite_token": "whatever"})
    assert response.status_code == 401


def test_get_invite_link_requires_auth():
    response = client.post("/projects/some-id/invite")
    assert response.status_code == 401


def test_create_project_requires_auth():
    response = client.post("/projects", json={"org_id": "some-org", "name": "Test project"})
    assert response.status_code == 401


def test_list_projects_requires_auth():
    response = client.get("/projects", params={"org_id": "some-org"})
    assert response.status_code == 401


def test_get_project_requires_auth():
    response = client.get("/projects/some-id")
    assert response.status_code == 401


def test_generate_problems_requires_auth():
    response = client.post("/projects/some-id/generate-problems")
    assert response.status_code == 401
