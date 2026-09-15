from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, schemas
from app.database import get_db
from app.deps import get_current_owner_id

router = APIRouter(prefix="/tags", tags=["tags"])


@router.get("", response_model=list[schemas.TagOut])
def list_tags(db: Session = Depends(get_db), owner_id: int = Depends(get_current_owner_id)):
    return crud.list_tags(db, owner_id)


@router.post("", response_model=schemas.TagOut, status_code=201)
def create_tag(
    data: schemas.TagCreate,
    db: Session = Depends(get_db),
    owner_id: int = Depends(get_current_owner_id),
):
    return crud.create_tag(db, owner_id, data)


@router.delete("/{tag_id}", status_code=204)
def delete_tag(
    tag_id: int,
    db: Session = Depends(get_db),
    owner_id: int = Depends(get_current_owner_id),
):
    tag = crud.get_tag(db, owner_id, tag_id)
    if tag is None:
        raise HTTPException(status_code=404, detail="Tag non trovato")
    crud.delete_tag(db, tag)
