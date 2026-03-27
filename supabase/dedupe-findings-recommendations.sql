-- ============================================================================
-- Remove duplicatas em findings/recommendations
-- Mantém o registro mais antigo (created_at, depois id)
-- ============================================================================

BEGIN;

-- Diagnóstico: duplicatas em findings
SELECT
  brand_id,
  audit_id,
  type,
  category,
  text,
  COUNT(*) AS qtd
FROM public.findings
GROUP BY 1, 2, 3, 4, 5
HAVING COUNT(*) > 1
ORDER BY qtd DESC;

-- Diagnóstico: duplicatas em recommendations
SELECT
  brand_id,
  audit_id,
  priority,
  category,
  text,
  COUNT(*) AS qtd
FROM public.recommendations
GROUP BY 1, 2, 3, 4, 5
HAVING COUNT(*) > 1
ORDER BY qtd DESC;

-- Deleta duplicatas de findings
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY brand_id, audit_id, type, category, text
      ORDER BY created_at ASC, id ASC
    ) AS rn
  FROM public.findings
)
DELETE FROM public.findings f
USING ranked r
WHERE f.id = r.id
  AND r.rn > 1;

-- Deleta duplicatas de recommendations
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY brand_id, audit_id, priority, category, text
      ORDER BY created_at ASC, id ASC
    ) AS rn
  FROM public.recommendations
)
DELETE FROM public.recommendations rec
USING ranked r
WHERE rec.id = r.id
  AND r.rn > 1;

-- Blindagem: impede nova duplicação para o mesmo audit
CREATE UNIQUE INDEX IF NOT EXISTS findings_unique_per_audit
ON public.findings (brand_id, audit_id, type, category, text);

CREATE UNIQUE INDEX IF NOT EXISTS recommendations_unique_per_audit
ON public.recommendations (brand_id, audit_id, priority, category, text);

COMMIT;
