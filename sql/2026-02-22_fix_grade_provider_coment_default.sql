-- Endurecimiento opcional para evitar ER_NO_DEFAULT_FOR_FIELD en n_grade_provider.coment
-- Aplica incluso si un cliente legacy omite el comentario.

USE ies9021_coco;

ALTER TABLE n_grade_provider
  MODIFY COLUMN coment VARCHAR(255) NOT NULL DEFAULT '';
