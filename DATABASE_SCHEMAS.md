# Complete Field-by-Field Database Schema Reference (40 Tables)

This document contains the exact field-by-field column definitions, data types, nullability, primary keys, and foreign key references for all **40 PostgreSQL tables** in **PgAdmin**.

---

## Table: `alembic_version`

| Column Name | Data Type | Nullable | Primary Key | Foreign Key Reference |
|---|---|---|---|---|
| `version_num` | `VARCHAR(32)` | NO | YES | `-` |

---

## Table: `assessment_medical_context`

| Column Name | Data Type | Nullable | Primary Key | Foreign Key Reference |
|---|---|---|---|---|
| `id` | `UUID` | NO | YES | `-` |
| `assessment_id` | `UUID` | NO | NO | `assessments.id` |
| `context_type` | `VARCHAR` | NO | NO | `-` |
| `context_key` | `VARCHAR` | NO | NO | `-` |
| `context_value` | `TEXT` | NO | NO | `-` |
| `confirmed` | `BOOLEAN` | YES | NO | `-` |
| `created_at` | `TIMESTAMP` | YES | NO | `-` |

---

## Table: `assessment_safety_questions`

| Column Name | Data Type | Nullable | Primary Key | Foreign Key Reference |
|---|---|---|---|---|
| `id` | `UUID` | NO | YES | `-` |
| `assessment_id` | `UUID` | NO | NO | `assessments.id` |
| `question_code` | `VARCHAR` | NO | NO | `-` |
| `question_text` | `TEXT` | NO | NO | `-` |
| `answer` | `BOOLEAN` | NO | NO | `-` |
| `created_at` | `TIMESTAMP` | YES | NO | `-` |

---

## Table: `assessment_symptoms`

| Column Name | Data Type | Nullable | Primary Key | Foreign Key Reference |
|---|---|---|---|---|
| `id` | `UUID` | NO | YES | `-` |
| `assessment_id` | `UUID` | NO | NO | `assessments.id` |
| `symptom` | `VARCHAR` | NO | NO | `-` |
| `symptom_code` | `VARCHAR` | YES | NO | `-` |
| `selected` | `BOOLEAN` | YES | NO | `-` |
| `created_at` | `TIMESTAMP` | YES | NO | `-` |

---

## Table: `assessments`

| Column Name | Data Type | Nullable | Primary Key | Foreign Key Reference |
|---|---|---|---|---|
| `id` | `UUID` | NO | YES | `-` |
| `patient_id` | `UUID` | NO | NO | `patients.id` |
| `status` | `VARCHAR` | NO | NO | `-` |
| `primary_symptom` | `VARCHAR` | NO | NO | `-` |
| `duration` | `VARCHAR` | NO | NO | `-` |
| `severity` | `INTEGER` | NO | NO | `-` |
| `worsening` | `VARCHAR` | NO | NO | `-` |
| `additional_notes` | `TEXT` | YES | NO | `-` |
| `medical_context_confirmed` | `BOOLEAN` | YES | NO | `-` |
| `started_at` | `TIMESTAMP` | YES | NO | `-` |
| `submitted_at` | `TIMESTAMP` | YES | NO | `-` |
| `completed_at` | `TIMESTAMP` | YES | NO | `-` |
| `created_at` | `TIMESTAMP` | YES | NO | `-` |
| `updated_at` | `TIMESTAMP` | YES | NO | `-` |

---

## Table: `care_plan_actions`

| Column Name | Data Type | Nullable | Primary Key | Foreign Key Reference |
|---|---|---|---|---|
| `id` | `UUID` | NO | YES | `-` |
| `care_plan_id` | `UUID` | NO | NO | `care_plans.id` |
| `title` | `VARCHAR` | NO | NO | `-` |
| `description` | `TEXT` | YES | NO | `-` |
| `action_type` | `VARCHAR` | NO | NO | `-` |
| `frequency` | `VARCHAR` | YES | NO | `-` |
| `status` | `VARCHAR` | NO | NO | `-` |
| `due_date` | `DATE` | YES | NO | `-` |
| `sort_order` | `INTEGER` | YES | NO | `-` |
| `completed_at` | `TIMESTAMP` | YES | NO | `-` |
| `created_at` | `TIMESTAMP` | YES | NO | `-` |
| `updated_at` | `TIMESTAMP` | YES | NO | `-` |

---

## Table: `care_plan_providers`

| Column Name | Data Type | Nullable | Primary Key | Foreign Key Reference |
|---|---|---|---|---|
| `id` | `UUID` | NO | YES | `-` |
| `care_plan_id` | `UUID` | NO | NO | `care_plans.id` |
| `provider_id` | `UUID` | NO | NO | `providers.id` |
| `role` | `VARCHAR` | NO | NO | `-` |
| `recommended` | `BOOLEAN` | YES | NO | `-` |
| `created_at` | `TIMESTAMP` | YES | NO | `-` |

---

## Table: `care_plans`

| Column Name | Data Type | Nullable | Primary Key | Foreign Key Reference |
|---|---|---|---|---|
| `id` | `UUID` | NO | YES | `-` |
| `patient_id` | `UUID` | NO | NO | `patients.id` |
| `assessment_id` | `UUID` | NO | NO | `assessments.id` |
| `recommendation_id` | `UUID` | NO | NO | `care_recommendations.id` |
| `title` | `VARCHAR` | NO | NO | `-` |
| `category` | `VARCHAR` | NO | NO | `-` |
| `subtitle` | `VARCHAR` | YES | NO | `-` |
| `description` | `TEXT` | NO | NO | `-` |
| `status` | `VARCHAR` | NO | NO | `-` |
| `active` | `BOOLEAN` | YES | NO | `-` |
| `start_date` | `DATE` | YES | NO | `-` |
| `end_date` | `DATE` | YES | NO | `-` |
| `created_at` | `TIMESTAMP` | YES | NO | `-` |
| `updated_at` | `TIMESTAMP` | YES | NO | `-` |

---

## Table: `care_recommendations`

| Column Name | Data Type | Nullable | Primary Key | Foreign Key Reference |
|---|---|---|---|---|
| `id` | `UUID` | NO | YES | `-` |
| `assessment_id` | `UUID` | NO | NO | `assessments.id` |
| `recommendation_type` | `VARCHAR` | NO | NO | `-` |
| `title` | `VARCHAR` | NO | NO | `-` |
| `timeframe` | `VARCHAR` | NO | NO | `-` |
| `priority_level` | `VARCHAR` | NO | NO | `-` |
| `emergency_flag` | `BOOLEAN` | YES | NO | `-` |
| `reason` | `TEXT` | NO | NO | `-` |
| `explanation` | `TEXT` | NO | NO | `-` |
| `safety_advisory` | `TEXT` | NO | NO | `-` |
| `model_name` | `VARCHAR` | NO | NO | `-` |
| `status` | `VARCHAR` | NO | NO | `-` |
| `generated_at` | `TIMESTAMP` | YES | NO | `-` |
| `created_at` | `TIMESTAMP` | YES | NO | `-` |

---

## Table: `cms_engagement_trends`

| Column Name | Data Type | Nullable | Primary Key | Foreign Key Reference |
|---|---|---|---|---|
| `id` | `INTEGER` | NO | YES | `-` |
| `time` | `VARCHAR` | NO | NO | `-` |
| `ed_visits` | `INTEGER` | NO | NO | `-` |
| `pcp_visits` | `INTEGER` | NO | NO | `-` |

---

## Table: `cms_member_risks`

| Column Name | Data Type | Nullable | Primary Key | Foreign Key Reference |
|---|---|---|---|---|
| `id` | `VARCHAR` | NO | YES | `-` |
| `ed_visits` | `INTEGER` | NO | NO | `-` |
| `pcp_visits` | `INTEGER` | NO | NO | `-` |
| `urgent_visits` | `INTEGER` | NO | NO | `-` |
| `hosp_visits` | `INTEGER` | NO | NO | `-` |
| `last_discharge` | `VARCHAR` | YES | NO | `-` |
| `pattern` | `VARCHAR` | NO | NO | `-` |
| `priority` | `VARCHAR` | NO | NO | `-` |
| `created_at` | `TIMESTAMP` | YES | NO | `-` |

---

## Table: `cms_metric_trends`

| Column Name | Data Type | Nullable | Primary Key | Foreign Key Reference |
|---|---|---|---|---|
| `id` | `INTEGER` | NO | YES | `-` |
| `week` | `VARCHAR` | NO | NO | `-` |
| `ed_visits` | `INTEGER` | NO | NO | `-` |
| `repeat_visits` | `INTEGER` | NO | NO | `-` |

---

## Table: `cms_provider_analytics`

| Column Name | Data Type | Nullable | Primary Key | Foreign Key Reference |
|---|---|---|---|---|
| `id` | `INTEGER` | NO | YES | `-` |
| `name` | `VARCHAR` | NO | NO | `-` |
| `code` | `VARCHAR` | NO | NO | `-` |
| `ed_visits` | `VARCHAR` | NO | NO | `-` |
| `repeat_rate` | `VARCHAR` | NO | NO | `-` |
| `post_discharge` | `VARCHAR` | NO | NO | `-` |
| `nav_rate` | `VARCHAR` | NO | NO | `-` |
| `trend` | `VARCHAR` | NO | NO | `-` |

---

## Table: `cms_users`

| Column Name | Data Type | Nullable | Primary Key | Foreign Key Reference |
|---|---|---|---|---|
| `id` | `UUID` | NO | YES | `-` |
| `user_id` | `UUID` | NO | NO | `users.id` |
| `payer_id` | `UUID` | NO | NO | `payer_organizations.id` |
| `role` | `VARCHAR` | NO | NO | `-` |
| `created_at` | `TIMESTAMP` | YES | NO | `-` |
| `updated_at` | `TIMESTAMP` | YES | NO | `-` |

---

## Table: `cms_visit_distributions`

| Column Name | Data Type | Nullable | Primary Key | Foreign Key Reference |
|---|---|---|---|---|
| `id` | `INTEGER` | NO | YES | `-` |
| `visits` | `VARCHAR` | NO | NO | `-` |
| `members` | `INTEGER` | NO | NO | `-` |
| `color` | `VARCHAR` | NO | NO | `-` |

---

## Table: `daily_goals`

| Column Name | Data Type | Nullable | Primary Key | Foreign Key Reference |
|---|---|---|---|---|
| `id` | `UUID` | NO | YES | `-` |
| `care_plan_id` | `UUID` | NO | NO | `care_plans.id` |
| `goal_text` | `VARCHAR` | NO | NO | `-` |
| `frequency` | `VARCHAR` | NO | NO | `-` |
| `completed` | `BOOLEAN` | YES | NO | `-` |
| `goal_date` | `DATE` | NO | NO | `-` |
| `created_at` | `TIMESTAMP` | YES | NO | `-` |
| `updated_at` | `TIMESTAMP` | YES | NO | `-` |

---

## Table: `emergency_contacts`

| Column Name | Data Type | Nullable | Primary Key | Foreign Key Reference |
|---|---|---|---|---|
| `id` | `UUID` | NO | YES | `-` |
| `patient_id` | `UUID` | NO | NO | `patients.id` |
| `name` | `VARCHAR` | NO | NO | `-` |
| `relationship` | `VARCHAR` | NO | NO | `-` |
| `phone` | `VARCHAR` | NO | NO | `-` |
| `email` | `VARCHAR` | YES | NO | `-` |
| `is_primary` | `BOOLEAN` | YES | NO | `-` |
| `created_at` | `TIMESTAMP` | YES | NO | `-` |
| `updated_at` | `TIMESTAMP` | YES | NO | `-` |

---

## Table: `emergency_requests`

| Column Name | Data Type | Nullable | Primary Key | Foreign Key Reference |
|---|---|---|---|---|
| `id` | `UUID` | NO | YES | `-` |
| `patient_id` | `UUID` | NO | NO | `patients.id` |
| `assessment_id` | `UUID` | NO | NO | `assessments.id` |
| `recommendation_id` | `UUID` | YES | NO | `care_recommendations.id` |
| `priority` | `VARCHAR` | NO | NO | `-` |
| `status` | `VARCHAR` | NO | NO | `-` |
| `request_type` | `VARCHAR` | NO | NO | `-` |
| `notes` | `TEXT` | YES | NO | `-` |
| `created_at` | `TIMESTAMP` | YES | NO | `-` |
| `updated_at` | `TIMESTAMP` | YES | NO | `-` |

---

## Table: `file_ai_summaries`

| Column Name | Data Type | Nullable | Primary Key | Foreign Key Reference |
|---|---|---|---|---|
| `id` | `UUID` | NO | YES | `-` |
| `medical_file_id` | `UUID` | NO | NO | `medical_files.id` |
| `overview` | `TEXT` | NO | NO | `-` |
| `key_findings` | `TEXT` | NO | NO | `-` |
| `model_name` | `VARCHAR` | NO | NO | `-` |
| `status` | `VARCHAR` | NO | NO | `-` |
| `generated_at` | `TIMESTAMP` | YES | NO | `-` |
| `updated_at` | `TIMESTAMP` | YES | NO | `-` |

---

## Table: `healthcare_encounters`

| Column Name | Data Type | Nullable | Primary Key | Foreign Key Reference |
|---|---|---|---|---|
| `id` | `UUID` | NO | YES | `-` |
| `patient_id` | `UUID` | NO | NO | `patients.id` |
| `provider_id` | `UUID` | YES | NO | `providers.id` |
| `source_record_id` | `UUID` | YES | NO | `patient_data_records.id` |
| `encounter_type` | `VARCHAR` | NO | NO | `-` |
| `facility_name` | `VARCHAR` | NO | NO | `-` |
| `encounter_date` | `DATE` | NO | NO | `-` |
| `status` | `VARCHAR` | NO | NO | `-` |
| `is_emergency` | `BOOLEAN` | YES | NO | `-` |
| `ed_visits_last_12m` | `INTEGER` | YES | NO | `-` |
| `days_since_last_discharge` | `INTEGER` | YES | NO | `-` |
| `notes` | `TEXT` | YES | NO | `-` |
| `created_at` | `TIMESTAMP` | YES | NO | `-` |
| `updated_at` | `TIMESTAMP` | YES | NO | `-` |

---

## Table: `hos_avoidable_diagnoses`

| Column Name | Data Type | Nullable | Primary Key | Foreign Key Reference |
|---|---|---|---|---|
| `id` | `INTEGER` | NO | YES | `-` |
| `code` | `VARCHAR` | NO | NO | `-` |
| `name` | `VARCHAR` | NO | NO | `-` |
| `count` | `INTEGER` | NO | NO | `-` |
| `percentage` | `INTEGER` | NO | NO | `-` |

---

## Table: `hos_care_actions`

| Column Name | Data Type | Nullable | Primary Key | Foreign Key Reference |
|---|---|---|---|---|
| `id` | `VARCHAR` | NO | YES | `-` |
| `patient_name` | `VARCHAR` | NO | NO | `-` |
| `initials` | `VARCHAR` | NO | NO | `-` |
| `mrn` | `VARCHAR` | NO | NO | `-` |
| `action_required` | `VARCHAR` | NO | NO | `-` |
| `action_subtitle` | `VARCHAR` | YES | NO | `-` |
| `status` | `VARCHAR` | NO | NO | `-` |
| `priority` | `VARCHAR` | NO | NO | `-` |
| `assigned_to` | `JSON` | YES | NO | `-` |
| `created_at` | `TIMESTAMP` | YES | NO | `-` |
| `updated_at` | `TIMESTAMP` | YES | NO | `-` |

---

## Table: `hos_care_requests`

| Column Name | Data Type | Nullable | Primary Key | Foreign Key Reference |
|---|---|---|---|---|
| `id` | `VARCHAR` | NO | YES | `-` |
| `patient_id` | `VARCHAR` | NO | NO | `-` |
| `patient_name` | `VARCHAR` | NO | NO | `-` |
| `dob` | `VARCHAR` | YES | NO | `-` |
| `mrn` | `VARCHAR` | NO | NO | `-` |
| `type` | `VARCHAR` | NO | NO | `-` |
| `priority` | `VARCHAR` | NO | NO | `-` |
| `status` | `VARCHAR` | NO | NO | `-` |
| `requested_ago` | `VARCHAR` | YES | NO | `-` |
| `primary_care` | `VARCHAR` | YES | NO | `-` |
| `insurance` | `VARCHAR` | YES | NO | `-` |
| `conditions` | `JSON` | YES | NO | `-` |
| `recent_utilization` | `JSON` | YES | NO | `-` |
| `ai_assessment` | `JSON` | YES | NO | `-` |
| `determination_notes` | `TEXT` | YES | NO | `-` |
| `auth_duration_days` | `INTEGER` | YES | NO | `-` |
| `created_at` | `TIMESTAMP` | YES | NO | `-` |
| `updated_at` | `TIMESTAMP` | YES | NO | `-` |

---

## Table: `hos_ed_trends`

| Column Name | Data Type | Nullable | Primary Key | Foreign Key Reference |
|---|---|---|---|---|
| `id` | `INTEGER` | NO | YES | `-` |
| `day` | `VARCHAR` | NO | NO | `-` |
| `total` | `INTEGER` | NO | NO | `-` |
| `avoidable` | `INTEGER` | NO | NO | `-` |

---

## Table: `hos_request_volume`

| Column Name | Data Type | Nullable | Primary Key | Foreign Key Reference |
|---|---|---|---|---|
| `id` | `INTEGER` | NO | YES | `-` |
| `day` | `VARCHAR` | NO | NO | `-` |
| `volume` | `INTEGER` | NO | NO | `-` |

---

## Table: `hospital_staff`

| Column Name | Data Type | Nullable | Primary Key | Foreign Key Reference |
|---|---|---|---|---|
| `id` | `UUID` | NO | YES | `-` |
| `user_id` | `UUID` | NO | NO | `users.id` |
| `hospital_id` | `UUID` | NO | NO | `hospitals.id` |
| `staff_role` | `VARCHAR` | NO | NO | `-` |
| `department` | `VARCHAR` | NO | NO | `-` |
| `created_at` | `TIMESTAMP` | YES | NO | `-` |
| `updated_at` | `TIMESTAMP` | YES | NO | `-` |

---

## Table: `hospitals`

| Column Name | Data Type | Nullable | Primary Key | Foreign Key Reference |
|---|---|---|---|---|
| `id` | `UUID` | NO | YES | `-` |
| `name` | `VARCHAR` | NO | NO | `-` |
| `facility_type` | `VARCHAR` | NO | NO | `-` |
| `address` | `VARCHAR` | YES | NO | `-` |
| `city` | `VARCHAR` | YES | NO | `-` |
| `state` | `VARCHAR` | YES | NO | `-` |
| `status` | `VARCHAR` | NO | NO | `-` |
| `created_at` | `TIMESTAMP` | YES | NO | `-` |
| `updated_at` | `TIMESTAMP` | YES | NO | `-` |

---

## Table: `lab_results`

| Column Name | Data Type | Nullable | Primary Key | Foreign Key Reference |
|---|---|---|---|---|
| `id` | `UUID` | NO | YES | `-` |
| `patient_id` | `UUID` | NO | NO | `patients.id` |
| `source_record_id` | `UUID` | YES | NO | `patient_data_records.id` |
| `lab_date` | `DATE` | NO | NO | `-` |
| `fasting_glucose` | `NUMERIC` | YES | NO | `-` |
| `hba1c` | `NUMERIC` | YES | NO | `-` |
| `systolic_bp` | `NUMERIC` | YES | NO | `-` |
| `cholesterol_ldl` | `NUMERIC` | YES | NO | `-` |
| `bun` | `NUMERIC` | YES | NO | `-` |
| `creatinine` | `NUMERIC` | YES | NO | `-` |
| `created_at` | `TIMESTAMP` | YES | NO | `-` |

---

## Table: `medical_files`

| Column Name | Data Type | Nullable | Primary Key | Foreign Key Reference |
|---|---|---|---|---|
| `id` | `UUID` | NO | YES | `-` |
| `patient_id` | `UUID` | NO | NO | `patients.id` |
| `provider_id` | `UUID` | YES | NO | `providers.id` |
| `name` | `VARCHAR` | NO | NO | `-` |
| `description` | `TEXT` | YES | NO | `-` |
| `category` | `VARCHAR` | NO | NO | `-` |
| `file_url` | `VARCHAR` | YES | NO | `-` |
| `file_type` | `VARCHAR` | NO | NO | `-` |
| `file_size` | `VARCHAR` | NO | NO | `-` |
| `icon_type` | `VARCHAR` | YES | NO | `-` |
| `status` | `VARCHAR` | NO | NO | `-` |
| `document_date` | `DATE` | YES | NO | `-` |
| `uploaded_at` | `TIMESTAMP` | YES | NO | `-` |
| `updated_at` | `TIMESTAMP` | YES | NO | `-` |

---

## Table: `patient_activity_log`

| Column Name | Data Type | Nullable | Primary Key | Foreign Key Reference |
|---|---|---|---|---|
| `id` | `UUID` | NO | YES | `-` |
| `patient_id` | `UUID` | NO | NO | `patients.id` |
| `activity_type` | `VARCHAR` | NO | NO | `-` |
| `reference_type` | `VARCHAR` | YES | NO | `-` |
| `reference_id` | `UUID` | YES | NO | `-` |
| `title` | `VARCHAR` | NO | NO | `-` |
| `description` | `TEXT` | YES | NO | `-` |
| `activity_date` | `TIMESTAMP` | YES | NO | `-` |
| `created_at` | `TIMESTAMP` | YES | NO | `-` |

---

## Table: `patient_allergies`

| Column Name | Data Type | Nullable | Primary Key | Foreign Key Reference |
|---|---|---|---|---|
| `id` | `UUID` | NO | YES | `-` |
| `patient_id` | `UUID` | NO | NO | `patients.id` |
| `allergen` | `VARCHAR` | NO | NO | `-` |
| `reaction` | `VARCHAR` | YES | NO | `-` |
| `severity` | `VARCHAR` | YES | NO | `-` |
| `active` | `BOOLEAN` | YES | NO | `-` |
| `created_at` | `TIMESTAMP` | YES | NO | `-` |
| `updated_at` | `TIMESTAMP` | YES | NO | `-` |

---

## Table: `patient_conditions`

| Column Name | Data Type | Nullable | Primary Key | Foreign Key Reference |
|---|---|---|---|---|
| `id` | `UUID` | NO | YES | `-` |
| `patient_id` | `UUID` | NO | NO | `patients.id` |
| `condition` | `VARCHAR` | NO | NO | `-` |
| `status` | `VARCHAR` | NO | NO | `-` |
| `first_seen_date` | `DATE` | YES | NO | `-` |
| `last_seen_date` | `DATE` | YES | NO | `-` |
| `source_record_id` | `UUID` | YES | NO | `patient_data_records.id` |
| `created_at` | `TIMESTAMP` | YES | NO | `-` |
| `updated_at` | `TIMESTAMP` | YES | NO | `-` |

---

## Table: `patient_data_records`

| Column Name | Data Type | Nullable | Primary Key | Foreign Key Reference |
|---|---|---|---|---|
| `id` | `UUID` | NO | YES | `-` |
| `patient_id` | `UUID` | NO | NO | `patients.id` |
| `source_record_key` | `VARCHAR` | NO | NO | `-` |
| `source_patient_id` | `INTEGER` | NO | NO | `-` |
| `age` | `INTEGER` | NO | NO | `-` |
| `gender` | `VARCHAR` | NO | NO | `-` |
| `history_diabetes` | `BOOLEAN` | YES | NO | `-` |
| `history_hypertension` | `BOOLEAN` | YES | NO | `-` |
| `history_heart_disease` | `BOOLEAN` | YES | NO | `-` |
| `history_copd` | `BOOLEAN` | YES | NO | `-` |
| `history_asthma` | `BOOLEAN` | YES | NO | `-` |
| `history_kidney_disease` | `BOOLEAN` | YES | NO | `-` |
| `history_stroke_or_tia` | `BOOLEAN` | YES | NO | `-` |
| `history_cancer` | `BOOLEAN` | YES | NO | `-` |
| `facility_name` | `VARCHAR` | NO | NO | `-` |
| `hospital_visit_date` | `DATE` | NO | NO | `-` |
| `num_ed_visits_last_12m` | `INTEGER` | YES | NO | `-` |
| `days_since_last_discharge` | `INTEGER` | YES | NO | `-` |
| `active_medication_count` | `INTEGER` | YES | NO | `-` |
| `on_immunosuppressants` | `BOOLEAN` | YES | NO | `-` |
| `on_blood_thinners` | `BOOLEAN` | YES | NO | `-` |
| `on_cardiac_meds` | `BOOLEAN` | YES | NO | `-` |
| `on_insulin` | `BOOLEAN` | YES | NO | `-` |
| `on_metformin` | `BOOLEAN` | YES | NO | `-` |
| `on_albuterol_inhaler` | `BOOLEAN` | YES | NO | `-` |
| `on_opioids` | `BOOLEAN` | YES | NO | `-` |
| `last_lab_date` | `DATE` | YES | NO | `-` |
| `fasting_glucose` | `NUMERIC` | YES | NO | `-` |
| `hba1c` | `NUMERIC` | YES | NO | `-` |
| `systolic_bp` | `NUMERIC` | YES | NO | `-` |
| `cholesterol_ldl` | `NUMERIC` | YES | NO | `-` |
| `bun` | `NUMERIC` | YES | NO | `-` |
| `creatinine` | `NUMERIC` | YES | NO | `-` |
| `imported_at` | `TIMESTAMP` | YES | NO | `-` |

---

## Table: `patient_medications`

| Column Name | Data Type | Nullable | Primary Key | Foreign Key Reference |
|---|---|---|---|---|
| `id` | `UUID` | NO | YES | `-` |
| `patient_id` | `UUID` | NO | NO | `patients.id` |
| `medication_name` | `VARCHAR` | NO | NO | `-` |
| `medication_code` | `VARCHAR` | YES | NO | `-` |
| `active` | `BOOLEAN` | YES | NO | `-` |
| `first_seen_date` | `DATE` | YES | NO | `-` |
| `last_seen_date` | `DATE` | YES | NO | `-` |
| `source_record_id` | `UUID` | YES | NO | `patient_data_records.id` |
| `created_at` | `TIMESTAMP` | YES | NO | `-` |
| `updated_at` | `TIMESTAMP` | YES | NO | `-` |

---

## Table: `patient_preferences`

| Column Name | Data Type | Nullable | Primary Key | Foreign Key Reference |
|---|---|---|---|---|
| `id` | `UUID` | NO | YES | `-` |
| `patient_id` | `UUID` | NO | NO | `patients.id` |
| `ai_data_analysis` | `BOOLEAN` | YES | NO | `-` |
| `share_with_specialists` | `BOOLEAN` | YES | NO | `-` |
| `communication_preference` | `VARCHAR` | YES | NO | `-` |
| `created_at` | `TIMESTAMP` | YES | NO | `-` |
| `updated_at` | `TIMESTAMP` | YES | NO | `-` |

---

## Table: `patients`

| Column Name | Data Type | Nullable | Primary Key | Foreign Key Reference |
|---|---|---|---|---|
| `id` | `UUID` | NO | YES | `-` |
| `patient_id` | `VARCHAR` | NO | NO | `-` |
| `user_id` | `UUID` | YES | NO | `users.id` |
| `name` | `VARCHAR` | NO | NO | `-` |
| `date_of_birth` | `DATE` | YES | NO | `-` |
| `age` | `INTEGER` | NO | NO | `-` |
| `gender` | `VARCHAR` | NO | NO | `-` |
| `blood_group` | `VARCHAR` | YES | NO | `-` |
| `status` | `VARCHAR` | NO | NO | `-` |
| `phone` | `VARCHAR` | YES | NO | `-` |
| `email` | `VARCHAR` | YES | NO | `-` |
| `address` | `TEXT` | YES | NO | `-` |
| `created_at` | `TIMESTAMP` | YES | NO | `-` |
| `updated_at` | `TIMESTAMP` | YES | NO | `-` |

---

## Table: `payer_organizations`

| Column Name | Data Type | Nullable | Primary Key | Foreign Key Reference |
|---|---|---|---|---|
| `id` | `UUID` | NO | YES | `-` |
| `name` | `VARCHAR` | NO | NO | `-` |
| `organization_type` | `VARCHAR` | NO | NO | `-` |
| `status` | `VARCHAR` | NO | NO | `-` |
| `created_at` | `TIMESTAMP` | YES | NO | `-` |
| `updated_at` | `TIMESTAMP` | YES | NO | `-` |

---

## Table: `providers`

| Column Name | Data Type | Nullable | Primary Key | Foreign Key Reference |
|---|---|---|---|---|
| `id` | `UUID` | NO | YES | `-` |
| `name` | `VARCHAR` | NO | NO | `-` |
| `provider_type` | `VARCHAR` | NO | NO | `-` |
| `specialty` | `VARCHAR` | NO | NO | `-` |
| `facility_name` | `VARCHAR` | NO | NO | `-` |
| `phone` | `VARCHAR` | YES | NO | `-` |
| `address` | `VARCHAR` | YES | NO | `-` |
| `latitude` | `NUMERIC` | YES | NO | `-` |
| `longitude` | `NUMERIC` | YES | NO | `-` |
| `available` | `BOOLEAN` | YES | NO | `-` |
| `status` | `VARCHAR` | NO | NO | `-` |
| `created_at` | `TIMESTAMP` | YES | NO | `-` |
| `updated_at` | `TIMESTAMP` | YES | NO | `-` |

---

## Table: `safety_protocols`

| Column Name | Data Type | Nullable | Primary Key | Foreign Key Reference |
|---|---|---|---|---|
| `id` | `UUID` | NO | YES | `-` |
| `care_plan_id` | `UUID` | NO | NO | `care_plans.id` |
| `title` | `VARCHAR` | NO | NO | `-` |
| `description` | `TEXT` | NO | NO | `-` |
| `severity` | `VARCHAR` | NO | NO | `-` |
| `emergency_action` | `TEXT` | NO | NO | `-` |
| `created_at` | `TIMESTAMP` | YES | NO | `-` |
| `updated_at` | `TIMESTAMP` | YES | NO | `-` |

---

## Table: `users`

| Column Name | Data Type | Nullable | Primary Key | Foreign Key Reference |
|---|---|---|---|---|
| `id` | `UUID` | NO | YES | `-` |
| `email` | `VARCHAR` | NO | NO | `-` |
| `password_hash` | `VARCHAR` | NO | NO | `-` |
| `role` | `VARCHAR` | NO | NO | `-` |
| `is_active` | `BOOLEAN` | YES | NO | `-` |
| `created_at` | `TIMESTAMP` | YES | NO | `-` |
| `updated_at` | `TIMESTAMP` | YES | NO | `-` |

---
