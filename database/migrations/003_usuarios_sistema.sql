-- SiGPatri - LEI-002: usuarios autorizados (login Google) e auditoria de eventos.
-- Migration aditiva: NAO altera nem exclui tabelas existentes (usuarios, itens, etc.).
-- statement-breakpoint
CREATE TABLE IF NOT EXISTS usuarios_sistema (
 id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
 google_sub VARCHAR(255) NULL,
 nome VARCHAR(150) NOT NULL,
 email VARCHAR(255) NOT NULL,
 perfil ENUM('ADMINISTRADOR','TI','OPERADOR','CONSULTA') NOT NULL DEFAULT 'CONSULTA',
 ativo BOOLEAN NOT NULL DEFAULT TRUE,
 primeiro_acesso_em DATETIME NULL,
 ultimo_acesso_em DATETIME NULL,
 criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 criado_por BIGINT UNSIGNED NULL,
 UNIQUE KEY uq_usuarios_sistema_email (email),
 UNIQUE KEY uq_usuarios_sistema_google_sub (google_sub),
 CONSTRAINT fk_usuarios_sistema_criado_por FOREIGN KEY (criado_por) REFERENCES usuarios_sistema(id) ON DELETE RESTRICT,
 CONSTRAINT chk_usuarios_sistema_nome CHECK (CHAR_LENGTH(TRIM(nome)) > 0),
 CONSTRAINT chk_usuarios_sistema_email CHECK (CHAR_LENGTH(TRIM(email)) > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-breakpoint
CREATE TABLE IF NOT EXISTS auditoria_eventos (
 id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
 tipo_evento VARCHAR(50) NOT NULL,
 resultado ENUM('SUCESSO','NEGADO','FALHA') NOT NULL,
 email_informado VARCHAR(255) NULL,
 usuario_afetado_id BIGINT UNSIGNED NULL,
 administrador_id BIGINT UNSIGNED NULL,
 valor_anterior VARCHAR(255) NULL,
 valor_novo VARCHAR(255) NULL,
 detalhe VARCHAR(255) NULL,
 criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 KEY idx_auditoria_criado_em (criado_em),
 KEY idx_auditoria_email (email_informado),
 KEY idx_auditoria_usuario (usuario_afetado_id),
 CONSTRAINT fk_auditoria_usuario FOREIGN KEY (usuario_afetado_id) REFERENCES usuarios_sistema(id) ON DELETE RESTRICT,
 CONSTRAINT fk_auditoria_administrador FOREIGN KEY (administrador_id) REFERENCES usuarios_sistema(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
