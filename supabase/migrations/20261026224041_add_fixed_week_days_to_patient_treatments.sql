ALTER TABLE public.patient_treatments
  ADD COLUMN IF NOT EXISTS fixed_week_days text[] NOT NULL DEFAULT '{}';

WITH session_weekdays AS (
  SELECT
    treatment_id,
    EXTRACT(ISODOW FROM session_date)::integer AS weekday_number
  FROM public.treatment_sessions
  GROUP BY treatment_id, EXTRACT(ISODOW FROM session_date)
),
weekday_names AS (
  SELECT
    treatment_id,
    weekday_number,
    CASE weekday_number
      WHEN 1 THEN 'Segunda'
      WHEN 2 THEN 'Terça'
      WHEN 3 THEN 'Quarta'
      WHEN 4 THEN 'Quinta'
      WHEN 5 THEN 'Sexta'
      WHEN 6 THEN 'Sábado'
    END AS weekday_name
  FROM session_weekdays
  WHERE weekday_number BETWEEN 1 AND 6
),
package_weekdays AS (
  SELECT treatment_id, array_agg(weekday_name ORDER BY weekday_number) AS weekdays
  FROM weekday_names
  GROUP BY treatment_id
)
UPDATE public.patient_treatments AS treatment
SET fixed_week_days = package_weekdays.weekdays
FROM package_weekdays
WHERE treatment.id = package_weekdays.treatment_id
  AND treatment.treatment_type = 'package';
