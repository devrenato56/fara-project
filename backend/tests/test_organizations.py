from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_list_organizations_requires_auth():
    response = client.get("/organizations")
    assert response.status_code == 401


def test_create_organization_requires_auth():
    response = client.post("/organizations", json={"name": "Renato's org"})
    assert response.status_code == 401
