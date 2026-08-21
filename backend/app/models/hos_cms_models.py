import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, JSON, Text
from app.core.database import Base

class HOSCareRequest(Base):
    __tablename__ = "hos_care_requests"

    id = Column(String, primary_key=True, default=lambda: f"REQ-{uuid.uuid4().hex[:4].upper()}")
    patient_id = Column(String, nullable=False, index=True)
    patient_name = Column(String, nullable=False)
    dob = Column(String, nullable=True)
    mrn = Column(String, nullable=False, index=True)
    type = Column(String, nullable=False)  # Cardiology Consult, Imaging, Stat Labs, Discharge Order, etc.
    priority = Column(String, nullable=False, default="Standard")  # Urgent, Standard, Low
    status = Column(String, nullable=False, default="Pending")  # Pending, Approved, Urgent, Completed, Awaiting Triage, In Progress
    requested_ago = Column(String, nullable=True)
    primary_care = Column(String, nullable=True)
    insurance = Column(String, nullable=True)
    conditions = Column(JSON, nullable=True, default=list)
    recent_utilization = Column(JSON, nullable=True, default=list)
    ai_assessment = Column(JSON, nullable=True, default=dict)
    determination_notes = Column(Text, nullable=True)
    auth_duration_days = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class HOSCareAction(Base):
    __tablename__ = "hos_care_actions"

    id = Column(String, primary_key=True, default=lambda: f"ACT-{uuid.uuid4().hex[:4].upper()}")
    patient_name = Column(String, nullable=False)
    initials = Column(String, nullable=False)
    mrn = Column(String, nullable=False, index=True)
    action_required = Column(String, nullable=False)
    action_subtitle = Column(String, nullable=True)
    status = Column(String, nullable=False, default="Pending")  # Pending, In Progress, Completed, Overdue
    priority = Column(String, nullable=False, default="Medium")  # High, Medium, Low
    assigned_to = Column(JSON, nullable=True, default=dict)  # {"name": "...", "avatar": "...", "isUnassigned": False}
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class HOSRequestVolume(Base):
    __tablename__ = "hos_request_volume"

    id = Column(Integer, primary_key=True, autoincrement=True)
    day = Column(String, nullable=False, unique=True)  # Mon, Tue, Wed, Thu, Fri, Sat, Sun
    volume = Column(Integer, nullable=False, default=0)

class HOSEDTrend(Base):
    __tablename__ = "hos_ed_trends"

    id = Column(Integer, primary_key=True, autoincrement=True)
    day = Column(String, nullable=False, unique=True)
    total = Column(Integer, nullable=False, default=0)
    avoidable = Column(Integer, nullable=False, default=0)

class HOSAvoidableDiagnosis(Base):
    __tablename__ = "hos_avoidable_diagnoses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    code = Column(String, nullable=False, unique=True)
    name = Column(String, nullable=False)
    count = Column(Integer, nullable=False, default=0)
    percentage = Column(Integer, nullable=False, default=0)

# ----------------- CMS Models -----------------

class CMSMetricTrend(Base):
    __tablename__ = "cms_metric_trends"

    id = Column(Integer, primary_key=True, autoincrement=True)
    week = Column(String, nullable=False, unique=True)  # Week 1, Week 2, Week 3, Week 4
    ed_visits = Column(Integer, nullable=False, default=0)
    repeat_visits = Column(Integer, nullable=False, default=0)

class CMSVisitDistribution(Base):
    __tablename__ = "cms_visit_distributions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    visits = Column(String, nullable=False, unique=True)  # 2, 3, 4, 5+
    members = Column(Integer, nullable=False, default=0)
    color = Column(String, nullable=False, default="#2563EB")

class CMSEngagementTrend(Base):
    __tablename__ = "cms_engagement_trends"

    id = Column(Integer, primary_key=True, autoincrement=True)
    time = Column(String, nullable=False, unique=True)  # Q1, Q2, Q3, Q4, Current
    ed_visits = Column(Integer, nullable=False, default=0)
    pcp_visits = Column(Integer, nullable=False, default=0)

class CMSMemberRisk(Base):
    __tablename__ = "cms_member_risks"

    id = Column(String, primary_key=True)  # e.g., PT-1024
    ed_visits = Column(Integer, nullable=False, default=0)
    pcp_visits = Column(Integer, nullable=False, default=0)
    urgent_visits = Column(Integer, nullable=False, default=0)
    hosp_visits = Column(Integer, nullable=False, default=0)
    last_discharge = Column(String, nullable=True)
    pattern = Column(String, nullable=False, default="Repeated ED")
    priority = Column(String, nullable=False, default="High")  # High, Medium, Low
    created_at = Column(DateTime, default=datetime.utcnow)

class CMSProviderAnalytics(Base):
    __tablename__ = "cms_provider_analytics"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False, unique=True)  # e.g. City General Hospital
    code = Column(String, nullable=False)  # e.g. CG
    ed_visits = Column(String, nullable=False)  # 4,820
    repeat_rate = Column(String, nullable=False)  # 21%
    post_discharge = Column(String, nullable=False)  # 8%
    nav_rate = Column(String, nullable=False)  # 14%
    trend = Column(String, nullable=False, default="Steady")  # Up, Steady, Down
