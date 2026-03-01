-- 1. Remover TODAS as dependências (Views e Triggers)
DROP VIEW IF EXISTS vw_pedido_read_model;
DROP VIEW IF EXISTS vw_pedidodetalhado;
DROP TRIGGER IF EXISTS trg_sincronizar_pagamento ON pedido;
DROP TRIGGER IF EXISTS trg_atualizar_pedido_total ON itempedido;

-- 2. Garantir que a coluna valortotal seja numeric(12,2) para precisão real
ALTER TABLE pedido ALTER COLUMN valortotal TYPE numeric(12,2);

-- 3. Recriar Funções de Integridade
CREATE OR REPLACE FUNCTION fn_atualizar_pedido_total()
RETURNS trigger AS $$
BEGIN
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        UPDATE pedido 
        SET valortotal = (SELECT COALESCE(SUM(valortotal), 0) FROM itempedido WHERE idpedido = NEW.idpedido)
        WHERE idpedido = NEW.idpedido;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE pedido 
        SET valortotal = (SELECT COALESCE(SUM(valortotal), 0) FROM itempedido WHERE idpedido = OLD.idpedido)
        WHERE idpedido = OLD.idpedido;
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_sincronizar_pagamento()
RETURNS trigger AS $$
BEGIN
    UPDATE pagamento 
    SET valor = NEW.valortotal
    WHERE idpedido = NEW.idpedido;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Reaplicar Triggers
CREATE TRIGGER trg_atualizar_pedido_total
AFTER INSERT OR UPDATE OR DELETE ON itempedido
FOR EACH ROW EXECUTE FUNCTION fn_atualizar_pedido_total();

CREATE TRIGGER trg_sincronizar_pagamento
AFTER UPDATE OF valortotal ON pedido
FOR EACH ROW EXECUTE FUNCTION fn_sincronizar_pagamento();

-- 5. Correção FINAL dos dados (Sincronização forçada)
UPDATE pedido p
SET valortotal = (
    SELECT COALESCE(SUM(ip.valortotal), 0)
    FROM itempedido ip
    WHERE ip.idpedido = p.idpedido
);

UPDATE pagamento pag
SET valor = p.valortotal
FROM pedido p
WHERE pag.idpedido = p.idpedido;

-- 6. Recriar Views com as definições originais
CREATE VIEW vw_pedidodetalhado AS
 SELECT ped.idpedido,
    ped.data AS datapedido,
    cli.idcliente,
    cli.nome AS cliente,
    prod.idproduto,
    prod.nome AS produto,
    ip.quantidade,
    ip.valorunitario,
    ip.valortotal AS valoritem,
    ped.valortotal AS valorpedido,
    sp.descricao AS statuspedido,
    pag.idpagamento,
    fp.descricao AS formapagamento,
    pag.valor AS valorpago,
    pag.datapagamento,
        CASE
            WHEN (pag.idstatuspagamento = 1) THEN 'Pendente'::text
            WHEN (pag.idstatuspagamento = 2) THEN 'Em Processamento'::text
            WHEN (pag.idstatuspagamento = 3) THEN 'Aprovado'::text
            WHEN (pag.idstatuspagamento = 4) THEN 'Reprovado'::text
            ELSE 'Desconhecido'::text
        END AS status_pagamento
   FROM ((((((pedido ped
     JOIN cliente cli ON ((cli.idcliente = ped.idcliente)))
     JOIN itempedido ip ON ((ip.idpedido = ped.idpedido)))
     JOIN produto prod ON ((prod.idproduto = ip.idproduto)))
     LEFT JOIN pagamento pag ON ((pag.idpedido = ped.idpedido)))
     LEFT JOIN formapagamento fp ON ((fp.idformapagamento = pag.idformapagamento)))
     JOIN statuspedido sp ON ((sp.idstatuspedido = ped.idstatuspedido)));

CREATE VIEW vw_pedido_read_model AS
 SELECT ped.idpedido,
    ped.data AS data_pedido,
    ped.valortotal AS valor_total_pedido,
    cli.idcliente,
    cli.nome AS cliente_nome,
    cli.telefone,
    cli.email,
    sp.descricao AS status_pedido,
    te.descricao AS tipo_entrega,
    ip.iditempedido,
    ip.quantidade,
    ip.valorunitario,
    ip.valortotal AS valor_total_item,
    prod.idproduto,
    prod.nome AS produto_nome,
    tp.descricao AS tipo_produto,
    pag.idpagamento,
    pag.valor AS valor_pago,
    pag.datapagamento,
    fp.descricao AS forma_pagamento,
    spg.descricao AS status_pagamento
   FROM (((((((((pedido ped
     JOIN cliente cli ON ((cli.idcliente = ped.idcliente)))
     JOIN statuspedido sp ON ((sp.idstatuspedido = ped.idstatuspedido)))
     JOIN tipoentrega te ON ((te.idtipoentrega = ped.idtipoentrega)))
     JOIN itempedido ip ON ((ip.idpedido = ped.idpedido)))
     JOIN produto prod ON ((prod.idproduto = ip.idproduto)))
     LEFT JOIN tipoproduto tp ON ((tp.idtipoproduto = prod.idtipoproduto)))
     LEFT JOIN pagamento pag ON ((pag.idpedido = ped.idpedido)))
     LEFT JOIN formapagamento fp ON ((fp.idformapagamento = pag.idformapagamento)))
     LEFT JOIN statuspagamento spg ON ((spg.idstatuspagamento = pag.idstatuspagamento)));

-- 7. Auditoria Final (Verificação de precisão decimal)
SELECT 
    p.idpedido, 
    p.valortotal AS total_pedido_corrigido,
    (SELECT SUM(valortotal) FROM itempedido WHERE idpedido = p.idpedido) AS soma_itens,
    pag.valor AS valor_pago_corrigido
FROM pedido p
LEFT JOIN pagamento pag ON p.idpedido = pag.idpedido
ORDER BY p.idpedido;
