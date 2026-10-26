def test_signup_login_me_and_nickname_update(client) -> None:
    signup = client.post(
        "/api/auth/signup",
        json={"email": "learner@example.com", "password": "safe-pass-123", "nickname": "공부왕"},
    )

    assert signup.status_code == 201
    assert signup.json()["email"] == "learner@example.com"
    assert "password" not in signup.json()

    login = client.post(
        "/api/auth/login",
        json={"email": "learner@example.com", "password": "safe-pass-123"},
    )
    assert login.status_code == 200
    assert login.json()["nickname"] == "공부왕"

    me = client.get("/api/auth/me")
    assert me.status_code == 200
    assert me.json()["email"] == "learner@example.com"

    nickname = client.patch("/api/auth/nickname", json={"nickname": "기록왕"})
    assert nickname.status_code == 200
    assert nickname.json()["nickname"] == "기록왕"


def test_signup_rejects_duplicate_email_and_invalid_nickname(client) -> None:
    first = client.post(
        "/api/auth/signup",
        json={"email": "same@example.com", "password": "safe-pass-123", "nickname": "첫사용자"},
    )
    assert first.status_code == 201

    duplicate = client.post(
        "/api/auth/signup",
        json={"email": "same@example.com", "password": "safe-pass-456", "nickname": "두번째"},
    )
    assert duplicate.status_code == 409

    invalid = client.post(
        "/api/auth/signup",
        json={"email": "invalid@example.com", "password": "short", "nickname": "bad nickname"},
    )
    assert invalid.status_code == 422


def test_login_and_protected_me_require_valid_credentials(client) -> None:
    assert client.get("/api/auth/me").status_code == 401

    client.post(
        "/api/auth/signup",
        json={"email": "person@example.com", "password": "safe-pass-123", "nickname": "사용자"},
    )
    wrong_login = client.post(
        "/api/auth/login",
        json={"email": "person@example.com", "password": "wrong-pass"},
    )
    assert wrong_login.status_code == 401
