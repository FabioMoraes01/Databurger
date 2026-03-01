-- 1. Preparação: Alterar tipo da coluna valortotal para suportar decimais
ALTER TABLE pedido ALTER COLUMN valortotal TYPE numeric(12,2);

-- 2. Função e Trigger para atualizar o total do pedido baseado nos itens
CREATE OR REPLACE FUNCTION fn_atualizar_pedido_total()
RETURNS trigger AS $$
BEGIN
    -- Se for INSERT ou UPDATE nos itens
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        UPDATE pedido 
        SET valortotal = (SELECT COALESCE(SUM(valortotal), 0) FROM itempedido WHERE idpedido = NEW.idpedido)
        WHERE idpedido = NEW.idpedido;
        RETURN NEW;
    -- Se for DELETE nos itens
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE pedido 
        SET valortotal = (SELECT COALESCE(SUM(valortotal), 0) FROM itempedido WHERE idpedido = OLD.idpedido)
        WHERE idpedido = OLD.idpedido;
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_atualizar_pedido_total ON itempedido;
CREATE TRIGGER trg_atualizar_pedido_total
AFTER INSERT OR UPDATE OR DELETE ON itempedido
FOR EACH ROW EXECUTE FUNCTION fn_atualizar_pedido_total();

-- 3. Função e Trigger para sincronizar o pagamento com o total do pedido
CREATE OR REPLACE FUNCTION fn_sincronizar_pagamento()
RETURNS trigger AS $$
BEGIN
    -- Atualiza o valor do pagamento se houver um registro vinculado
    UPDATE pagamento 
    SET valor = NEW.valortotal
    WHERE idpedido = NEW.idpedido;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sincronizar_pagamento ON pedido;
CREATE TRIGGER trg_sincronizar_pagamento
AFTER UPDATE OF valortotal ON pedido
FOR EACH ROW EXECUTE FUNCTION fn_sincronizar_pagamento();

-- 4. Correção dos dados existentes
-- Primeiro, sincronizamos o total do pedido com a soma real dos itens
UPDATE pedido p
SET valortotal = (
    SELECT COALESCE(SUM(ip.valortotal), 0)
    FROM itempedido ip
    WHERE ip.idpedido = p.idpedido
);

-- Segundo, sincronizamos o pagamento com o novo total (corrigido) do pedido
UPDATE pagamento pag
SET valor = p.valortotal
FROM pedido p
WHERE pag.idpedido = p.idpedido;

-- 5. Consulta de Verificação (Auditoria Final)
SELECT 
    p.idpedido, 
    p.valortotal AS total_pedido_corrigido,
    (SELECT SUM(valortotal) FROM itempedido WHERE idpedido = p.idpedido) AS soma_itens,
    pag.valor AS valor_pago_corrigido
FROM pedido p
LEFT JOIN pagamento pag ON p.idpedido = pag.idpedido
ORDER BY p.idpedido;
