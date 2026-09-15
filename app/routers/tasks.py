from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, schemas
from app.database import get_db
from app.deps import get_current_owner_id

router = APIRouter(prefix="/tasks", tags=["tasks"])


def _get_owned_task(db: Session, owner_id: int, task_id: int):
    task = crud.get_task(db, owner_id, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task non trovato")
    return task


@router.get("", response_model=list[schemas.TaskOut])
def list_tasks(
    status: schemas.Status | None = None,
    category_id: int | None = None,
    tag_id: int | None = None,
    priority: schemas.Priority | None = None,
    due_before: datetime | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
    owner_id: int = Depends(get_current_owner_id),
):
    return crud.list_tasks(
        db,
        owner_id,
        status=status,
        category_id=category_id,
        tag_id=tag_id,
        priority=priority,
        due_before=due_before,
        search=search,
    )


@router.post("", response_model=schemas.TaskOut, status_code=201)
def create_task(
    data: schemas.TaskCreate,
    db: Session = Depends(get_db),
    owner_id: int = Depends(get_current_owner_id),
):
    return crud.create_task(db, owner_id, data)


@router.get("/{task_id}", response_model=schemas.TaskOut)
def get_task(task_id: int, db: Session = Depends(get_db), owner_id: int = Depends(get_current_owner_id)):
    return _get_owned_task(db, owner_id, task_id)


@router.patch("/{task_id}", response_model=schemas.TaskOut)
def update_task(
    task_id: int,
    data: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    owner_id: int = Depends(get_current_owner_id),
):
    task = _get_owned_task(db, owner_id, task_id)
    return crud.update_task(db, task, data)


@router.delete("/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db), owner_id: int = Depends(get_current_owner_id)):
    task = _get_owned_task(db, owner_id, task_id)
    crud.delete_task(db, task)


@router.post("/{task_id}/subtasks", response_model=schemas.SubtaskOut, status_code=201)
def add_subtask(
    task_id: int,
    data: schemas.SubtaskCreate,
    db: Session = Depends(get_db),
    owner_id: int = Depends(get_current_owner_id),
):
    task = _get_owned_task(db, owner_id, task_id)
    return crud.add_subtask(db, task, data)


@router.patch("/{task_id}/subtasks/{subtask_id}", response_model=schemas.SubtaskOut)
def update_subtask(
    task_id: int,
    subtask_id: int,
    data: schemas.SubtaskUpdate,
    db: Session = Depends(get_db),
    owner_id: int = Depends(get_current_owner_id),
):
    task = _get_owned_task(db, owner_id, task_id)
    subtask = crud.get_subtask(db, task, subtask_id)
    if subtask is None:
        raise HTTPException(status_code=404, detail="Sottotask non trovato")
    return crud.update_subtask(db, subtask, data)


@router.delete("/{task_id}/subtasks/{subtask_id}", status_code=204)
def delete_subtask(
    task_id: int,
    subtask_id: int,
    db: Session = Depends(get_db),
    owner_id: int = Depends(get_current_owner_id),
):
    task = _get_owned_task(db, owner_id, task_id)
    subtask = crud.get_subtask(db, task, subtask_id)
    if subtask is None:
        raise HTTPException(status_code=404, detail="Sottotask non trovato")
    crud.delete_subtask(db, subtask)
