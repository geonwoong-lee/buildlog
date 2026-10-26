from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.dependencies import SESSION_COOKIE, get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import get_db
from app.models import User
from app.schemas.auth import LoginRequest, NicknameUpdateRequest, SignupRequest, UserResponse


router = APIRouter(prefix="/api/auth", tags=["auth"])


def as_user_response(user: User) -> UserResponse:
    return UserResponse.model_validate(user)


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, db: Session = Depends(get_db)) -> UserResponse:
    existing = db.scalar(
        select(User).where(or_(User.email == str(payload.email), User.nickname == payload.nickname))
    )
    if existing:
        detail = "이미 사용 중인 이메일입니다." if existing.email == str(payload.email) else "이미 사용 중인 닉네임입니다."
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detail)

    user = User(
        email=str(payload.email),
        password_hash=hash_password(payload.password),
        nickname=payload.nickname,
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="이미 사용 중인 이메일 또는 닉네임입니다.") from error
    db.refresh(user)
    return as_user_response(user)


@router.post("/login", response_model=UserResponse)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)) -> UserResponse:
    user = db.scalar(select(User).where(User.email == str(payload.email)))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="로그인 정보가 맞지 않습니다.")

    response.set_cookie(
        key=SESSION_COOKIE,
        value=create_access_token(user.id),
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=60 * 60,
    )
    return as_user_response(user)


@router.get("/me", response_model=UserResponse)
def current_user(user: User = Depends(get_current_user)) -> UserResponse:
    return as_user_response(user)


@router.patch("/nickname", response_model=UserResponse)
def update_nickname(
    payload: NicknameUpdateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> UserResponse:
    existing = db.scalar(select(User).where(User.nickname == payload.nickname, User.id != user.id))
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="이미 사용 중인 닉네임입니다.")
    user.nickname = payload.nickname
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="이미 사용 중인 닉네임입니다.") from error
    db.refresh(user)
    return as_user_response(user)
