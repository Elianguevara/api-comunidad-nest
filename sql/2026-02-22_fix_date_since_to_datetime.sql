-- Fix definitivo para tiempos relativos de peticiones.
-- Problema: n_petition.date_since estaba en tipo DATE y truncaba la hora a 00:00:00.
-- Resultado: el frontend mostraba "hace X horas" desde medianoche.

USE ies9021_coco;

-- Verificacion previa
SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'ies9021_coco'
  AND TABLE_NAME = 'n_petition'
  AND COLUMN_NAME IN ('date_since', 'date_until');

-- Correccion: conservar fecha+hora real de creacion
ALTER TABLE n_petition
  MODIFY COLUMN date_since DATETIME NULL;

-- Verificacion posterior
SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'ies9021_coco'
  AND TABLE_NAME = 'n_petition'
  AND COLUMN_NAME = 'date_since';
