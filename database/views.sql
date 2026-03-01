--vw_produtodetalhado

CREATE OR REPLACE VIEW vw_produtodetalhado AS
SELECT
    p.idproduto AS id,
    p.nome AS nome,
    tp.descricao AS categoria,
    p.valor,
    p.descricao,
    CASE 
        WHEN p.status THEN 'ativo'
        ELSE 'inativo'
    END AS status
FROM produto p
JOIN tipoproduto tp 
    ON tp.idtipoproduto = p.idtipoproduto
WHERE p.status = TRUE;

--------------------------------------------------------------------
select * from vw_pedidodetalhado


CREATE OR REPLACE VIEW public.vw_pedidodetalhado AS
SELECT
    ped.idpedido,
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
        WHEN pag.idstatuspagamento = 1 THEN 'Pendente'
        WHEN pag.idstatuspagamento = 2 THEN 'Em Processamento'
        WHEN pag.idstatuspagamento = 3 THEN 'Aprovado'
        WHEN pag.idstatuspagamento = 4 THEN 'Reprovado'
        ELSE 'Desconhecido'
    END AS status_pagamento

FROM pedido ped
JOIN cliente cli 
    ON cli.idcliente = ped.idcliente

JOIN itempedido ip 
    ON ip.idpedido = ped.idpedido

JOIN produto prod 
    ON prod.idproduto = ip.idproduto

LEFT JOIN pagamento pag 
    ON pag.idpedido = ped.idpedido

LEFT JOIN formapagamento fp 
    ON fp.idformapagamento = pag.idformapagamento

JOIN statuspedido sp 
    ON sp.idstatuspedido = ped.idstatuspedido;

select * from vw_pedido_read_model

CREATE OR REPLACE VIEW vw_pedido_read_model AS
SELECT
    -- Pedido
    ped.idpedido,
    ped.data AS data_pedido,
    ped.valortotal AS valor_total_pedido,

    -- Cliente
    cli.idcliente,
    cli.nome AS cliente_nome,
    cli.telefone,
    cli.email,

    -- Status pedido
    sp.descricao AS status_pedido,

    -- Tipo entrega
    te.descricao AS tipo_entrega,

    -- Item vendido
    ip.iditempedido,
    ip.quantidade,
    ip.valorunitario,
    ip.valortotal AS valor_total_item,

    -- Produto vendido
    prod.idproduto,
    prod.nome AS produto_nome,
    tp.descricao AS tipo_produto,

    -- Pagamento
    pag.idpagamento,
    pag.valor AS valor_pago,
    pag.datapagamento,
    fp.descricao AS forma_pagamento,
    spg.descricao AS status_pagamento

FROM pedido ped

JOIN cliente cli 
    ON cli.idcliente = ped.idcliente

JOIN statuspedido sp
    ON sp.idstatuspedido = ped.idstatuspedido

JOIN tipoentrega te
    ON te.idtipoentrega = ped.idtipoentrega

JOIN itempedido ip
    ON ip.idpedido = ped.idpedido

JOIN produto prod
    ON prod.idproduto = ip.idproduto

LEFT JOIN tipoproduto tp
    ON tp.idtipoproduto = prod.idtipoproduto

LEFT JOIN pagamento pag
    ON pag.idpedido = ped.idpedido

LEFT JOIN formapagamento fp
    ON fp.idformapagamento = pag.idformapagamento

LEFT JOIN statuspagamento spg
    ON spg.idstatuspagamento = pag.idstatuspagamento;