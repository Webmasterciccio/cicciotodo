from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, schemas
from app.database import get_db
from app.deps import get_current_owner_id

router = APIRouter(prefix="/api/categories", tags=["categories"])


@router.get("", response_model=list[schemas.CategoryOut])
def list_categories(db: Session = Depends(get_db), owner_id: int = Depends(get_current_owner_id)):
    return crud.list_categories(db, owner_id)


@router.post("", response_model=schemas.CategoryOut, status_code=201)
def create_category(
    data: schemas.CategoryCreate,
    db: Session = Depends(get_db),
    owner_id: int = Depends(get_current_owner_id),
):
    return crud.create_category(db, owner_id, data)


@router.patch("/{category_id}", response_model=schemas.CategoryOut)
def update_category(
    category_id: int,
    data: schemas.CategoryUpdate,
    db: Session = Depends(get_db),
    owner_id: int = Depends(get_current_owner_id),
):
    category = crud.get_category(db, owner_id, category_id)
    if category is None:
        raise HTTPException(status_code=404, detail="Categoria non trovata")
    return crud.update_category(db, category, data)


@router.delete("/{category_id}", status_code=204)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    owner_id: int = Depends(get_current_owner_id),
):
    category = crud.get_category(db, owner_id, category_id)
    if category is None:
        raise HTTPException(status_code=404, detail="Categoria non trovata")
    crud.delete_category(db, category)
