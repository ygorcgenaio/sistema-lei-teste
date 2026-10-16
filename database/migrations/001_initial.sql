-- LEI-Gestão - schema inicial
-- Cada bloco SQL deve ser separado por: -- statement-breakpoint

CREATE TABLE IF NOT EXISTS inventario_lei (
  patrimonio_id VARCHAR(100) NOT NULL,
  categoria ENUM('notebook', 'equipamento_de_ti', 'movel', 'eletrodomestico', 'outro') NOT NULL DEFAULT 'notebook',
  descricao TEXT DEFAULT NULL,
  estado_conservacao VARCHAR(100) DEFAULT 'Bom',
  localizacao VARCHAR(150) DEFAULT 'LEI',
  status ENUM('ATIVO', 'DESATIVADO', 'EMPRESTADO', 'EM_MANUTENCAO', 'EM_INSPECAO') DEFAULT 'ATIVO',
  data_compra DATE DEFAULT NULL,
  data_recebimento DATE DEFAULT NULL,
  origem_recurso ENUM('UFF', 'LEI', 'PROJETO') DEFAULT 'LEI',
  nota_fiscal_pdf VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (patrimonio_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- statement-breakpoint

CREATE TABLE IF NOT EXISTS notebook (
  patrimonio_id VARCHAR(100) NOT NULL,
  marca VARCHAR(100) NOT NULL,
  modelo VARCHAR(100) NOT NULL,
  memoria_ram VARCHAR(50) NOT NULL,
  armazenamento VARCHAR(100) NOT NULL,
  softwares_instalados TEXT DEFAULT NULL,
  status_notebook ENUM('DISPONIVEL', 'EMPRESTADO', 'EM_MANUTENCAO', 'REVISAO_TI') DEFAULT 'DISPONIVEL',
  PRIMARY KEY (patrimonio_id),
  CONSTRAINT fk_notebook_inventario
    FOREIGN KEY (patrimonio_id) REFERENCES inventario_lei (patrimonio_id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- statement-breakpoint

CREATE TABLE IF NOT EXISTS usuarios (
  id INT NOT NULL AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  matricula VARCHAR(50) DEFAULT NULL,
  telefone VARCHAR(20) DEFAULT NULL,
  senha VARCHAR(255) DEFAULT NULL,
  role ENUM('ADMIN', 'PROFESSOR', 'ALUNO', 'SERVIDOR', 'OUTROS') NOT NULL DEFAULT 'OUTROS',
  data_criacao TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- statement-breakpoint

CREATE TABLE IF NOT EXISTS emprestimos (
  id INT NOT NULL AUTO_INCREMENT,
  patrimonio_id VARCHAR(100) NOT NULL,
  nome_requisitante VARCHAR(100) NOT NULL,
  data_emprestimo DATETIME DEFAULT CURRENT_TIMESTAMP,
  data_devolucao DATETIME DEFAULT NULL,
  status_devolucao ENUM('EM_ANDAMENTO', 'CONCLUIDO') DEFAULT 'EM_ANDAMENTO',
  observacao TEXT DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_emprestimos_patrimonio (patrimonio_id),
  CONSTRAINT fk_emprestimo_inventario
    FOREIGN KEY (patrimonio_id) REFERENCES inventario_lei (patrimonio_id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- statement-breakpoint

CREATE TABLE IF NOT EXISTS manutencao (
  id INT NOT NULL AUTO_INCREMENT,
  patrimonio_id VARCHAR(100) NOT NULL,
  responsavel ENUM('AUTORIZADA', 'EQUIPE_TI', 'OUTRO') DEFAULT 'EQUIPE_TI',
  data_entrada DATETIME DEFAULT CURRENT_TIMESTAMP,
  data_fim DATETIME DEFAULT NULL,
  diagnostico TEXT DEFAULT NULL,
  reparo_feito TEXT DEFAULT NULL,
  status_manutencao ENUM('EM_INSPECAO', 'EM_MANUTENCAO', 'CONCLUIDO') DEFAULT 'EM_MANUTENCAO',
  PRIMARY KEY (id),
  KEY idx_manutencao_patrimonio (patrimonio_id),
  CONSTRAINT fk_manutencao_inventario
    FOREIGN KEY (patrimonio_id) REFERENCES inventario_lei (patrimonio_id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- statement-breakpoint

DROP TRIGGER IF EXISTS trg_remover_notebook_desativado;

-- statement-breakpoint

CREATE TRIGGER trg_remover_notebook_desativado
AFTER UPDATE ON inventario_lei
FOR EACH ROW
BEGIN
  IF NEW.status = 'DESATIVADO' THEN
    DELETE FROM notebook WHERE patrimonio_id = NEW.patrimonio_id;
  END IF;
END;
