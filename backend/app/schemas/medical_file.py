from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import date, datetime

class FileAISummaryResponse(BaseModel):
    id: UUID
    overview: str
    key_findings: str
    model_name: str
    status: str
    generated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class MedicalFileResponse(BaseModel):
    id: UUID
    name: str
    description: str | None = None
    category: str
    file_type: str
    file_size: str
    provider_name: str | None = None
    document_date: date | None = None
    status: str
    ai_summary: FileAISummaryResponse | None = None

    model_config = ConfigDict(from_attributes=True)
