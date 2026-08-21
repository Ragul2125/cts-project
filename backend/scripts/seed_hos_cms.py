import os
import sys

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models.hos_cms_models import (
    HOSCareRequest, HOSCareAction, HOSRequestVolume, HOSEDTrend, HOSAvoidableDiagnosis,
    CMSMetricTrend, CMSVisitDistribution, CMSEngagementTrend, CMSMemberRisk, CMSProviderAnalytics
)

def seed_hos_data(db: Session):
    print("Seeding Hospital (HOS) database records...")
    
    # 1. HOS Care Requests
    if db.query(HOSCareRequest).count() == 0:
        requests = [
            HOSCareRequest(
                id="REQ-8492",
                patient_id="PT-8821A",
                patient_name="Robert J. Evans",
                dob="04/12/1945 (78y) • M",
                mrn="489-221-00",
                type="Cardiology Consult",
                priority="Urgent",
                status="Pending",
                requested_ago="10 mins ago",
                primary_care="Dr. Sarah Jenkins",
                insurance="Medicare Advantage",
                conditions=["CHF", "Type 2 Diabetes", "Hypertension"],
                recent_utilization=[
                    {"type": "ED Visit - Shortness of breath", "date": "Oct 12, 2026", "location": "Mercy General", "color": "#EF4444"},
                    {"type": "PCP Follow-up", "date": "Oct 05, 2026", "location": "Dr. Jenkins", "color": "#8B5CF6"},
                    {"type": "Home Health Assessment", "date": "Sep 28, 2026", "location": "VNA Care", "color": "#10B981"}
                ],
                ai_assessment={
                    "summary": "Request for Skilled Nursing Facility (SNF) placement. Patient exhibits increasing difficulty with ADLs and recent exacerbation of CHF resulting in an ED visit. AI analysis indicates a high probability of readmission without structured rehabilitation.",
                    "guidelineMatch": 92,
                    "readmissionRisk": "High",
                    "suggestedAction": "Approve Request"
                }
            ),
            HOSCareRequest(
                id="REQ-9042",
                patient_id="PT-9042C",
                patient_name="Eleanor James",
                dob="08/19/1962 (64y) • F",
                mrn="893-21A",
                type="Imaging - MRI",
                priority="Standard",
                status="Approved",
                requested_ago="1 hr ago",
                primary_care="Dr. Martinez",
                insurance="Blue Cross PPO",
                conditions=["Lumbar Radiculopathy", "Osteoarthritis"],
                recent_utilization=[],
                ai_assessment={"summary": "MRI Lumbar Spine request for chronic lower back pain.", "guidelineMatch": 85, "readmissionRisk": "Low", "suggestedAction": "Approve"}
            ),
            HOSCareRequest(
                id="REQ-7719",
                patient_id="PT-7719B",
                patient_name="Michael Kwan",
                dob="11/03/1975 (51y) • M",
                mrn="442-998",
                type="Stat Labs",
                priority="Urgent",
                status="Urgent",
                requested_ago="Just now",
                primary_care="Dr. Patel",
                insurance="United Healthcare",
                conditions=["Acute Pancreatitis", "Hyperlipidemia"],
                recent_utilization=[],
                ai_assessment={"summary": "Stat lipase and comprehensive metabolic panel.", "guidelineMatch": 98, "readmissionRisk": "High", "suggestedAction": "Expedite"}
            ),
            HOSCareRequest(
                id="REQ-3321",
                patient_id="PT-3321D",
                patient_name="Sarah Lopez",
                dob="02/14/1988 (38y) • F",
                mrn="118-42C",
                type="Discharge Order",
                priority="Low",
                status="Completed",
                requested_ago="3 hrs ago",
                primary_care="Dr. Lee",
                insurance="Aetna HMO",
                conditions=["Post-Op Appendectomy"],
                recent_utilization=[],
                ai_assessment={"summary": "Post-op discharge clearance and home care instructions.", "guidelineMatch": 100, "readmissionRisk": "Low", "suggestedAction": "Complete"}
            )
        ]
        db.add_all(requests)

    # 2. HOS Care Actions
    if db.query(HOSCareAction).count() == 0:
        actions = [
            HOSCareAction(
                id="ACT-101",
                patient_name="Eleanor Shellstrop",
                initials="ES",
                mrn="MRN-90210",
                action_required="Medication Reconciliation",
                action_subtitle="Review post-discharge medications...",
                status="Pending",
                priority="High",
                assigned_to={"name": "Dr. C. Chidi", "avatar": "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=80&auto=format&fit=crop&q=80", "isUnassigned": False}
            ),
            HOSCareAction(
                id="ACT-102",
                patient_name="Jianyu Li",
                initials="JM",
                mrn="MRN-88421",
                action_required="Schedule Follow-up",
                action_subtitle="Cardiology consultation appointment...",
                status="In Progress",
                priority="Medium",
                assigned_to={"name": "Unassigned", "isUnassigned": True}
            ),
            HOSCareAction(
                id="ACT-103",
                patient_name="Tahani Al-Jamil",
                initials="TA",
                mrn="MRN-11235",
                action_required="Lab Results Review",
                action_subtitle="Routine metabolic panel review...",
                status="Completed",
                priority="Low",
                assigned_to={"name": "Dr. M. Kamil", "avatar": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=80&auto=format&fit=crop&q=80", "isUnassigned": False}
            )
        ]
        db.add_all(actions)

    # 3. Request Volumes
    if db.query(HOSRequestVolume).count() == 0:
        volumes = [
            HOSRequestVolume(day="Mon", volume=45),
            HOSRequestVolume(day="Tue", volume=52),
            HOSRequestVolume(day="Wed", volume=48),
            HOSRequestVolume(day="Thu", volume=68),
            HOSRequestVolume(day="Fri", volume=85),
            HOSRequestVolume(day="Sat", volume=110),
            HOSRequestVolume(day="Sun", volume=142)
        ]
        db.add_all(volumes)

    # 4. ED Trends
    if db.query(HOSEDTrend).count() == 0:
        ed_trends = [
            HOSEDTrend(day="Mon", total=65, avoidable=22),
            HOSEDTrend(day="Tue", total=78, avoidable=31),
            HOSEDTrend(day="Wed", total=42, avoidable=18),
            HOSEDTrend(day="Thu", total=95, avoidable=42),
            HOSEDTrend(day="Fri", total=84, avoidable=36),
            HOSEDTrend(day="Sat", total=128, avoidable=62),
            HOSEDTrend(day="Sun", total=72, avoidable=28)
        ]
        db.add_all(ed_trends)

    # 5. Avoidable Diagnoses
    if db.query(HOSAvoidableDiagnosis).count() == 0:
        diagnoses = [
            HOSAvoidableDiagnosis(code="01", name="Upper Respiratory Infection", count=156, percentage=65),
            HOSAvoidableDiagnosis(code="02", name="Urinary Tract Infection", count=98, percentage=48),
            HOSAvoidableDiagnosis(code="03", name="Minor Lacerations", count=64, percentage=32),
            HOSAvoidableDiagnosis(code="04", name="Back Pain (Non-Traumatic)", count=42, percentage=22)
        ]
        db.add_all(diagnoses)

    db.commit()

def seed_cms_data(db: Session):
    print("Seeding CMS Health Plan Analytics database records...")

    # 1. CMS Metric Trends
    if db.query(CMSMetricTrend).count() == 0:
        trends = [
            CMSMetricTrend(week="Week 1", ed_visits=280, repeat_visits=45),
            CMSMetricTrend(week="Week 2", ed_visits=320, repeat_visits=52),
            CMSMetricTrend(week="Week 3", ed_visits=640, repeat_visits=98),
            CMSMetricTrend(week="Week 4", ed_visits=490, repeat_visits=76)
        ]
        db.add_all(trends)

    # 2. CMS Visit Distributions
    if db.query(CMSVisitDistribution).count() == 0:
        distributions = [
            CMSVisitDistribution(visits="2", members=60, color="#93C5FD"),
            CMSVisitDistribution(visits="3", members=160, color="#60A5FA"),
            CMSVisitDistribution(visits="4", members=310, color="#2563EB"),
            CMSVisitDistribution(visits="5+", members=200, color="#EF4444")
        ]
        db.add_all(distributions)

    # 3. CMS Engagement Trends
    if db.query(CMSEngagementTrend).count() == 0:
        engagements = [
            CMSEngagementTrend(time="Q1", ed_visits=200, pcp_visits=420),
            CMSEngagementTrend(time="Q2", ed_visits=310, pcp_visits=340),
            CMSEngagementTrend(time="Q3", ed_visits=520, pcp_visits=210),
            CMSEngagementTrend(time="Q4", ed_visits=680, pcp_visits=140),
            CMSEngagementTrend(time="Current", ed_visits=740, pcp_visits=110)
        ]
        db.add_all(engagements)

    # 4. CMS Member Risks
    if db.query(CMSMemberRisk).count() == 0:
        members = [
            CMSMemberRisk(id="PT-1024", ed_visits=5, pcp_visits=0, urgent_visits=1, hosp_visits=1, last_discharge="12 Aug 2026", pattern="Repeated ED", priority="High"),
            CMSMemberRisk(id="PT-2891", ed_visits=3, pcp_visits=1, urgent_visits=0, hosp_visits=0, last_discharge="05 Sep 2026", pattern="Low PCP", priority="Medium"),
            CMSMemberRisk(id="PT-4402", ed_visits=4, pcp_visits=0, urgent_visits=2, hosp_visits=1, last_discharge="22 Jul 2026", pattern="Repeated ED", priority="High"),
            CMSMemberRisk(id="PT-5120", ed_visits=6, pcp_visits=0, urgent_visits=3, hosp_visits=2, last_discharge="18 Aug 2026", pattern="Repeated ED", priority="High"),
            CMSMemberRisk(id="PT-6301", ed_visits=3, pcp_visits=2, urgent_visits=1, hosp_visits=0, last_discharge="30 Aug 2026", pattern="Post-Discharge", priority="Medium")
        ]
        db.add_all(members)

    # 5. CMS Provider Analytics
    if db.query(CMSProviderAnalytics).count() == 0:
        providers = [
            CMSProviderAnalytics(name="City General Hospital", code="CG", ed_visits="4,820", repeat_rate="21%", post_discharge="8%", nav_rate="14%", trend="Up"),
            CMSProviderAnalytics(name="Metro Care Hospital", code="MC", ed_visits="3,420", repeat_rate="17%", post_discharge="6%", nav_rate="18%", trend="Steady"),
            CMSProviderAnalytics(name="St. Mary's Medical Center", code="SM", ed_visits="2,180", repeat_rate="12%", post_discharge="4%", nav_rate="23%", trend="Down")
        ]
        db.add_all(providers)

    db.commit()

def run():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_hos_data(db)
        seed_cms_data(db)
        print("Successfully seeded HOS and CMS database records into PostgreSQL!")
    finally:
        db.close()

if __name__ == "__main__":
    run()
