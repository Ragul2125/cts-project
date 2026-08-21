from pydantic import BaseModel, ConfigDict
from uuid import UUID

class ProviderResponse(BaseModel):
    id: UUID
    name: str
    provider_type: str
    specialty: str
    facility_name: str
    phone: str | None = None
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    available: bool
    status: str

    model_config = ConfigDict(from_attributes=True)
