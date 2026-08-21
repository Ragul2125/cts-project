# CSV to Database Mapping Document

## Patient Dataset (`patient.csv`)

| CSV Column | Target Table | Target Column | Transformation / Notes |
|---|---|---|---|
| `patient_id` | `patients`, `patient_data_records` | `patient_id`, `source_patient_id` | Stored as `VARCHAR` in `patients`, UUID generated for internal FK. |
| `age` | `patients`, `patient_data_records` | `age` | Integer |
| `gender` | `patients`, `patient_data_records` | `gender` | Integer in CSV, map to String ("1"->Male, "2"->Female, etc.) if needed |
| `history_diabetes` | `patient_data_records` | `history_diabetes` | Boolean |
| `history_hypertension` | `patient_data_records` | `history_hypertension` | Boolean |
| `history_heart_disease` | `patient_data_records` | `history_heart_disease` | Boolean |
| `history_copd` | `patient_data_records` | `history_copd` | Boolean |
| `history_asthma` | `patient_data_records` | `history_asthma` | Boolean |
| `history_kidney_disease` | `patient_data_records` | `history_kidney_disease` | Boolean |
| `history_stroke_or_tia` | `patient_data_records` | `history_stroke_or_tia` | Boolean |
| `history_cancer` | `patient_data_records` | `history_cancer` | Boolean |
| `recent_facility_name` | `patient_data_records` | `facility_name` | String |
| `last_hospital_visit_date` | `patient_data_records` | `hospital_visit_date` | Date parsing |
| `num_ed_visits_last_12m` | `patient_data_records` | `num_ed_visits_last_12m` | Integer |
| `days_since_last_discharge` | `patient_data_records` | `days_since_last_discharge` | Integer |
| `active_medication_count` | `patient_data_records` | `active_medication_count` | Integer |
| `on_immunosuppressants` | `patient_data_records` | `on_immunosuppressants` | Boolean |
| `on_blood_thinners` | `patient_data_records` | `on_blood_thinners` | Boolean |
| `on_cardiac_meds` | `patient_data_records` | `on_cardiac_meds` | Boolean |
| `on_insulin` | `patient_data_records` | `on_insulin` | Boolean |
| `on_metformin` | `patient_data_records` | `on_metformin` | Boolean |
| `on_albuterol_inhaler` | `patient_data_records` | `on_albuterol_inhaler` | Boolean |
| `on_opioids` | `patient_data_records` | `on_opioids` | Boolean |
| `last_lab_date` | `patient_data_records` | `last_lab_date` | Date parsing |
| `last_lab_fasting_glucose` | `patient_data_records` | `fasting_glucose` | Numeric |
| `last_lab_hba1c` | `patient_data_records` | `hba1c` | Numeric |
| `last_lab_systolic_bp` | `patient_data_records` | `systolic_bp` | Numeric |
| `last_lab_cholesterol_ldl` | `patient_data_records` | `cholesterol_ldl` | Numeric |
| `last_lab_bun` | `patient_data_records` | `bun` | Numeric |
| `last_lab_creatinine` | `patient_data_records` | `creatinine` | Numeric |

---

## Hospital Dataset (`hospital.csv`)

| CSV Column | Target Table | Target Column | Transformation / Notes |
|---|---|---|---|
| `visit_id` | `healthcare_encounters` | `source_record_key` (New/Mapped) | We need to map `visit_id` to encounter |
| `patient_id` | `healthcare_encounters` | `patient_id` | FK to `patients.id` via UUID lookup |
| `hospital_name` | `hospitals`, `healthcare_encounters` | `name`, `facility_name` | Create/Link hospital |
| `encounter_type` | `healthcare_encounters` | `encounter_type` | String |
| `admission_date` | `healthcare_encounters` | `encounter_date` | Map admission date to encounter_date |
| `discharge_date` | `healthcare_encounters` | `discharge_date` (New Column) | Will add to `healthcare_encounters` |
| `is_emergency_visit` | `healthcare_encounters` | `is_emergency` | Boolean |
| `ed_visits_last_12m` | `healthcare_encounters` | `ed_visits_last_12m` | Integer |
| `days_since_last_discharge` | `healthcare_encounters` | `days_since_last_discharge` | Integer |
| `primary_diagnosis` | `patient_conditions` | `condition` | String. Also added to `healthcare_encounters` |
| `diagnosis_icd10` | `patient_conditions` | `icd10_code` (New Column) | Will add `icd10_code` |
| `procedure_performed` | `patient_procedures` (New Table) | `procedure_name` | Normalized to new table |
| `procedure_cpt` | `patient_procedures` (New Table) | `cpt_code` | Normalized to new table |
| `attending_provider` | `providers` | `name` | Upsert provider and link FK |
| `active_medication_count` | `patient_data_records` / `healthcare_encounters` | `active_medication_count` | - |
| `on_insulin` ... `on_immunosuppressants` | `patient_medications` / `encounters` | | Map boolean fields to medication lists or encounter context |
| `lab_date` | `lab_results` | `lab_date` | Link to patient & encounter |
| `fasting_glucose` ... `creatinine` | `lab_results` | `fasting_glucose`... | Numeric values |
| `discharge_status` | `healthcare_encounters` | `status` | Map to status |

---

## CMS Dataset (`cms.csv`)

| CSV Column | Target Table | Target Column | Transformation / Notes |
|---|---|---|---|
| `claim_id` | `claims` (New Table) | `claim_id` | String |
| `patient_id` | `claims` (New Table) | `patient_id` | FK to `patients.id` |
| `visit_id` | `claims` (New Table) | `encounter_id` | FK to `healthcare_encounters.id` |
| `payer_name` | `claims` (New Table) | `payer_name` | Link to payer_organizations if needed |
| `claim_type` | `claims` (New Table) | `claim_type` | String |
| `service_date` | `claims` (New Table) | `service_date` | Date |
| `claim_date` | `claims` (New Table) | `claim_date` | Date |
| `diagnosis_icd10` | `claims` (New Table) | `diagnosis_icd10` | String |
| `procedure_cpt` | `claims` (New Table) | `procedure_cpt` | String |
| `billed_amount` | `claims` (New Table) | `billed_amount` | Numeric |
| `allowed_amount` | `claims` (New Table) | `allowed_amount` | Numeric |
| `paid_amount` | `claims` (New Table) | `paid_amount` | Numeric |
| `patient_responsibility` | `claims` (New Table) | `patient_responsibility` | Numeric |
| `claim_status` | `claims` (New Table) | `status` | String |
| `prior_authorization_required` | `claims` (New Table) | `prior_auth_required` | Boolean |
| `coverage_type` | `claims` (New Table) | `coverage_type` | String |
