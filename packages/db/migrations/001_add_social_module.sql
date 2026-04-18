-- 為現有站台的 module_config 加入 social 模組預設值
UPDATE sites
SET module_config = module_config || '{"social":{"enabled":false,"line":"","facebook":"","email":"","position":"right"}}'::jsonb
WHERE NOT (module_config ? 'social');
