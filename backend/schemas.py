from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class TipoPost(str, Enum):
    carrossel = "carrossel"
    reels = "reels"
    stories = "stories"
    estatico = "estatico"


class PilarPost(str, Enum):
    casas = "casas"
    educativo = "educativo"
    institucional = "institucional"
    bastidores = "bastidores"
    projeto_social = "projeto_social"
    outro = "outro"


class StatusPost(str, Enum):
    ideia = "ideia"
    criando = "criando"
    aprovado = "aprovado"
    agendado = "agendado"
    publicado = "publicado"
    cancelado = "cancelado"


class CriadoPor(str, Enum):
    victor = "victor"
    arthur = "arthur"


class PostCreate(BaseModel):
    titulo: str = Field(..., min_length=1, max_length=200)
    tipo: TipoPost
    pilar: PilarPost
    caption: Optional[str] = None
    link_canva: Optional[str] = None
    data_planejada: datetime
    status: StatusPost = StatusPost.ideia
    criado_por: CriadoPor
    notas: Optional[str] = None


class PostUpdate(BaseModel):
    titulo: Optional[str] = Field(None, min_length=1, max_length=200)
    tipo: Optional[TipoPost] = None
    pilar: Optional[PilarPost] = None
    caption: Optional[str] = None
    link_canva: Optional[str] = None
    data_planejada: Optional[datetime] = None
    status: Optional[StatusPost] = None
    criado_por: Optional[CriadoPor] = None
    notas: Optional[str] = None


class StatusUpdate(BaseModel):
    status: StatusPost


class PostResponse(BaseModel):
    id: int
    titulo: str
    tipo: TipoPost
    pilar: PilarPost
    caption: Optional[str] = None
    link_canva: Optional[str] = None
    data_planejada: datetime
    status: StatusPost
    criado_por: CriadoPor
    notas: Optional[str] = None
    created_at: datetime
    updated_at: datetime
