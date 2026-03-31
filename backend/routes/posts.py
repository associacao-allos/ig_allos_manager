from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from datetime import datetime

from schemas import PostCreate, PostUpdate, PostResponse, StatusUpdate, StatusPost
import database as db

router = APIRouter(prefix="/api/posts", tags=["posts"])


@router.get("", response_model=list[PostResponse])
def list_posts(
    mes: Optional[int] = Query(None, ge=1, le=12),
    ano: Optional[int] = Query(None, ge=2024),
    status: Optional[StatusPost] = None,
    pilar: Optional[str] = None,
    tipo: Optional[str] = None,
):
    query = db.table("posts").select("*")

    if mes and ano:
        start = f"{ano}-{mes:02d}-01T00:00:00"
        if mes == 12:
            end = f"{ano + 1}-01-01T00:00:00"
        else:
            end = f"{ano}-{mes + 1:02d}-01T00:00:00"
        query = query.gte("data_planejada", start).lt("data_planejada", end)

    if status:
        query = query.eq("status", status.value)
    if pilar:
        query = query.eq("pilar", pilar)
    if tipo:
        query = query.eq("tipo", tipo)

    query = query.order("data_planejada", desc=False)
    return query.execute()


@router.get("/{post_id}", response_model=PostResponse)
def get_post(post_id: int):
    result = db.table("posts").select("*").eq("id", post_id).execute()
    if not result:
        raise HTTPException(status_code=404, detail="Post não encontrado")
    return result[0]


@router.post("", response_model=PostResponse, status_code=201)
def create_post(post: PostCreate):
    now = datetime.utcnow().isoformat()
    data = post.model_dump(mode="json")
    data["data_planejada"] = post.data_planejada.isoformat()
    data["created_at"] = now
    data["updated_at"] = now

    result = db.table("posts").insert(data)
    return result[0]


@router.put("/{post_id}", response_model=PostResponse)
def update_post(post_id: int, post: PostUpdate):
    existing = db.table("posts").select("id").eq("id", post_id).execute()
    if not existing:
        raise HTTPException(status_code=404, detail="Post não encontrado")

    data = post.model_dump(exclude_unset=True, mode="json")
    if "data_planejada" in data and data["data_planejada"]:
        data["data_planejada"] = post.data_planejada.isoformat()
    data["updated_at"] = datetime.utcnow().isoformat()

    result = db.table("posts").select("*").eq("id", post_id).update(data)
    return result[0]


@router.delete("/{post_id}", status_code=204)
def delete_post(post_id: int):
    existing = db.table("posts").select("id, status").eq("id", post_id).execute()
    if not existing:
        raise HTTPException(status_code=404, detail="Post não encontrado")
    if existing[0]["status"] == "publicado":
        raise HTTPException(status_code=400, detail="Não é possível deletar post publicado")

    db.table("posts").eq("id", post_id).delete()


@router.patch("/{post_id}/status", response_model=PostResponse)
def update_status(post_id: int, body: StatusUpdate):
    existing = db.table("posts").select("id").eq("id", post_id).execute()
    if not existing:
        raise HTTPException(status_code=404, detail="Post não encontrado")

    data = {
        "status": body.status.value,
        "updated_at": datetime.utcnow().isoformat(),
    }
    result = db.table("posts").select("*").eq("id", post_id).update(data)
    return result[0]
