from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app import models, schemas

DEFAULT_USER_ID = 1


def seed_default_user(db: Session) -> models.User:
    user = db.get(models.User, DEFAULT_USER_ID)
    if user is None:
        user = models.User(id=DEFAULT_USER_ID, name="Ciccio", is_admin=True)
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


# --- Categories -------------------------------------------------------------

def list_categories(db: Session, owner_id: int) -> list[models.Category]:
    stmt = select(models.Category).where(models.Category.owner_id == owner_id).order_by(models.Category.name)
    return list(db.scalars(stmt))


def create_category(db: Session, owner_id: int, data: schemas.CategoryCreate) -> models.Category:
    category = models.Category(owner_id=owner_id, **data.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def get_category(db: Session, owner_id: int, category_id: int) -> models.Category | None:
    stmt = select(models.Category).where(
        models.Category.id == category_id, models.Category.owner_id == owner_id
    )
    return db.scalars(stmt).first()


def update_category(db: Session, category: models.Category, data: schemas.CategoryUpdate) -> models.Category:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(category, field, value)
    db.commit()
    db.refresh(category)
    return category


def delete_category(db: Session, category: models.Category) -> None:
    db.delete(category)
    db.commit()


# --- Tags ---------------------------------------------------------------

def list_tags(db: Session, owner_id: int) -> list[models.Tag]:
    stmt = select(models.Tag).where(models.Tag.owner_id == owner_id).order_by(models.Tag.name)
    return list(db.scalars(stmt))


def create_tag(db: Session, owner_id: int, data: schemas.TagCreate) -> models.Tag:
    tag = models.Tag(owner_id=owner_id, **data.model_dump())
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag


def get_tag(db: Session, owner_id: int, tag_id: int) -> models.Tag | None:
    stmt = select(models.Tag).where(models.Tag.id == tag_id, models.Tag.owner_id == owner_id)
    return db.scalars(stmt).first()


def delete_tag(db: Session, tag: models.Tag) -> None:
    db.delete(tag)
    db.commit()


# --- Tasks ----------------------------------------------------------------

def _resolve_tags(db: Session, owner_id: int, tag_ids: list[int]) -> list[models.Tag]:
    if not tag_ids:
        return []
    stmt = select(models.Tag).where(models.Tag.owner_id == owner_id, models.Tag.id.in_(tag_ids))
    return list(db.scalars(stmt))


def list_tasks(
    db: Session,
    owner_id: int,
    status: str | None = None,
    category_id: int | None = None,
    tag_id: int | None = None,
    priority: str | None = None,
    due_before: datetime | None = None,
    search: str | None = None,
) -> list[models.Task]:
    stmt = select(models.Task).where(models.Task.owner_id == owner_id)

    if status:
        stmt = stmt.where(models.Task.status == status)
    if category_id is not None:
        stmt = stmt.where(models.Task.category_id == category_id)
    if priority:
        stmt = stmt.where(models.Task.priority == priority)
    if due_before is not None:
        stmt = stmt.where(models.Task.due_date.is_not(None), models.Task.due_date <= due_before)
    if search:
        like = f"%{search}%"
        stmt = stmt.where(models.Task.title.ilike(like))
    if tag_id is not None:
        stmt = stmt.join(models.TaskTag).where(models.TaskTag.tag_id == tag_id)

    stmt = stmt.order_by(models.Task.due_date.is_(None), models.Task.due_date, models.Task.priority.desc())
    return list(db.scalars(stmt).unique())


def get_task(db: Session, owner_id: int, task_id: int) -> models.Task | None:
    stmt = select(models.Task).where(models.Task.id == task_id, models.Task.owner_id == owner_id)
    return db.scalars(stmt).first()


def create_task(db: Session, owner_id: int, data: schemas.TaskCreate) -> models.Task:
    payload = data.model_dump(exclude={"tag_ids"})
    task = models.Task(owner_id=owner_id, **payload)
    task.tags = _resolve_tags(db, owner_id, data.tag_ids)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def update_task(db: Session, task: models.Task, data: schemas.TaskUpdate) -> models.Task:
    updates = data.model_dump(exclude_unset=True, exclude={"tag_ids"})
    previous_status = task.status
    for field, value in updates.items():
        setattr(task, field, value)

    if data.tag_ids is not None:
        task.tags = _resolve_tags(db, task.owner_id, data.tag_ids)

    if "status" in updates:
        if task.status == "done" and previous_status != "done":
            task.completed_at = datetime.now(timezone.utc)
        elif task.status != "done":
            task.completed_at = None

    db.commit()
    db.refresh(task)
    return task


def delete_task(db: Session, task: models.Task) -> None:
    db.delete(task)
    db.commit()


# --- Subtasks ---------------------------------------------------------------

def add_subtask(db: Session, task: models.Task, data: schemas.SubtaskCreate) -> models.Subtask:
    position = len(task.subtasks)
    subtask = models.Subtask(task_id=task.id, title=data.title, position=position)
    db.add(subtask)
    db.commit()
    db.refresh(subtask)
    return subtask


def get_subtask(db: Session, task: models.Task, subtask_id: int) -> models.Subtask | None:
    for subtask in task.subtasks:
        if subtask.id == subtask_id:
            return subtask
    return None


def update_subtask(db: Session, subtask: models.Subtask, data: schemas.SubtaskUpdate) -> models.Subtask:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(subtask, field, value)
    db.commit()
    db.refresh(subtask)
    return subtask


def delete_subtask(db: Session, subtask: models.Subtask) -> None:
    db.delete(subtask)
    db.commit()
