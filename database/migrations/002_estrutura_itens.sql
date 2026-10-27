-- SiGPatri - estrutura de itens. Migration aditiva: NAO exclui tabelas nem registros legados.
-- statement-breakpoint
CREATE TABLE IF NOT EXISTS categorias_itens (
 id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
 nome VARCHAR(100) NOT NULL UNIQUE,
 descricao VARCHAR(255) NULL,
 ativo BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-breakpoint
CREATE TABLE IF NOT EXISTS tipos_itens (
 id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
 categoria_id BIGINT UNSIGNED NOT NULL,
 nome VARCHAR(100) NOT NULL,
 descricao VARCHAR(255) NULL,
 ativo BOOLEAN NOT NULL DEFAULT TRUE,
 UNIQUE KEY uq_tipo_categoria_nome (categoria_id,nome),
 UNIQUE KEY uq_tipo_id_categoria (id,categoria_id),
 CONSTRAINT fk_tipo_categoria FOREIGN KEY (categoria_id) REFERENCES categorias_itens(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-breakpoint
CREATE TABLE IF NOT EXISTS itens (
 id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
 codigo_lei VARCHAR(50) NOT NULL,
 patrimonio VARCHAR(50) NULL,
 categoria_id BIGINT UNSIGNED NOT NULL,
 tipo_item_id BIGINT UNSIGNED NOT NULL,
 descricao VARCHAR(255) NOT NULL,
 marca VARCHAR(100) NULL,
 modelo VARCHAR(150) NULL,
 numero_serie VARCHAR(150) NULL,
 data_compra DATE NULL,
 data_recebimento_lei DATE NULL,
 origem_aquisicao ENUM('RECURSOS_UFF','RECURSOS_LEI','PROJETO','DOACAO','CESSAO','OUTRO') NULL,
 projeto_origem VARCHAR(150) NULL,
 numero_nota_fiscal VARCHAR(100) NULL,
 arquivo_nota_fiscal VARCHAR(500) NULL,
 localizacao_atual VARCHAR(150) NOT NULL DEFAULT 'LEI',
 status ENUM('DISPONIVEL','RESERVADO','EMPRESTADO','EM_MANUTENCAO','INSERVIVEL','BAIXADO') NOT NULL DEFAULT 'DISPONIVEL',
 estado_conservacao ENUM('NOVO','BOM','REGULAR','RUIM') NOT NULL DEFAULT 'BOM',
 observacoes TEXT NULL,
 criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 UNIQUE KEY uq_itens_codigo_lei (codigo_lei),
 UNIQUE KEY uq_itens_patrimonio (patrimonio),
 KEY idx_itens_tipo_categoria (tipo_item_id,categoria_id),
 CONSTRAINT fk_itens_categoria FOREIGN KEY (categoria_id) REFERENCES categorias_itens(id),
 CONSTRAINT fk_itens_tipo_categoria FOREIGN KEY (tipo_item_id,categoria_id) REFERENCES tipos_itens(id,categoria_id),
 CONSTRAINT chk_itens_codigo CHECK (CHAR_LENGTH(TRIM(codigo_lei)) > 0),
 CONSTRAINT chk_itens_descricao CHECK (CHAR_LENGTH(TRIM(descricao)) > 0),
 CONSTRAINT chk_itens_datas CHECK (data_compra IS NULL OR data_recebimento_lei IS NULL OR data_recebimento_lei >= data_compra)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-breakpoint
CREATE TABLE IF NOT EXISTS itens_computadores (
 item_id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
 processador VARCHAR(150) NULL,
 memoria_ram VARCHAR(100) NULL,
 armazenamento VARCHAR(150) NULL,
 sistema_operacional VARCHAR(100) NULL,
 softwares_instalados TEXT NULL,
 CONSTRAINT fk_computador_item FOREIGN KEY (item_id) REFERENCES itens(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-breakpoint
CREATE TABLE IF NOT EXISTS emprestimos_itens (
 id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
 item_id BIGINT UNSIGNED NOT NULL,
 nome_requisitante VARCHAR(100) NOT NULL,
 data_emprestimo DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 data_devolucao DATETIME NULL,
 status_devolucao ENUM('EM_ANDAMENTO','CONCLUIDO') NOT NULL DEFAULT 'EM_ANDAMENTO',
 observacao TEXT NULL,
 KEY idx_emp_item (item_id),
 CONSTRAINT fk_emp_item FOREIGN KEY (item_id) REFERENCES itens(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-breakpoint
CREATE TABLE IF NOT EXISTS manutencoes_itens (
 id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
 item_id BIGINT UNSIGNED NOT NULL,
 responsavel ENUM('AUTORIZADA','EQUIPE_TI','OUTRO') NOT NULL DEFAULT 'EQUIPE_TI',
 data_entrada DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 data_fim DATETIME NULL,
 diagnostico TEXT NULL,
 reparo_feito TEXT NULL,
 status_manutencao ENUM('EM_INSPECAO','EM_MANUTENCAO','CONCLUIDO') NOT NULL DEFAULT 'EM_MANUTENCAO',
 KEY idx_man_item (item_id),
 CONSTRAINT fk_man_item FOREIGN KEY (item_id) REFERENCES itens(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- statement-breakpoint
INSERT IGNORE INTO categorias_itens (nome) VALUES
('Equipamentos de TI'),('Áudio e Vídeo'),('Climatização e Eletrodomésticos'),('Mobiliário'),('Ferramentas e Acessórios'),('Outros');
-- statement-breakpoint
INSERT IGNORE INTO tipos_itens (categoria_id,nome)
SELECT id,'Notebook' FROM categorias_itens WHERE nome='Equipamentos de TI';
-- statement-breakpoint
INSERT IGNORE INTO tipos_itens (categoria_id,nome)
SELECT id,'Monitor' FROM categorias_itens WHERE nome='Equipamentos de TI';
-- statement-breakpoint
INSERT IGNORE INTO tipos_itens (categoria_id,nome)
SELECT id,'Computador Desktop' FROM categorias_itens WHERE nome='Equipamentos de TI';
-- statement-breakpoint
INSERT IGNORE INTO tipos_itens (categoria_id,nome)
SELECT id,'Projetor' FROM categorias_itens WHERE nome='Áudio e Vídeo';
-- statement-breakpoint
INSERT IGNORE INTO tipos_itens (categoria_id,nome)
SELECT id,'Televisor' FROM categorias_itens WHERE nome='Áudio e Vídeo';
-- statement-breakpoint
INSERT IGNORE INTO tipos_itens (categoria_id,nome)
SELECT id,'Mesa' FROM categorias_itens WHERE nome='Mobiliário';
-- statement-breakpoint
INSERT IGNORE INTO tipos_itens (categoria_id,nome)
SELECT id,'Cadeira' FROM categorias_itens WHERE nome='Mobiliário';
-- statement-breakpoint
INSERT IGNORE INTO tipos_itens (categoria_id,nome)
SELECT id,'Armário' FROM categorias_itens WHERE nome='Mobiliário';
-- statement-breakpoint
INSERT IGNORE INTO tipos_itens (categoria_id,nome)
SELECT id,'Ar-condicionado' FROM categorias_itens WHERE nome='Climatização e Eletrodomésticos';
-- statement-breakpoint
INSERT IGNORE INTO tipos_itens (categoria_id,nome)
SELECT id,'Geladeira' FROM categorias_itens WHERE nome='Climatização e Eletrodomésticos';
-- statement-breakpoint
INSERT IGNORE INTO tipos_itens (categoria_id,nome)
SELECT id,'Outro' FROM categorias_itens WHERE nome='Outros';
