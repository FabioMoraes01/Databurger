
--cria as tabelas. falta alterar para not null
create table TipoProduto (
	idProduto INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	Descricao varchar(255) not null
	
);

alter table tipoproduto
rename column idProduto to idTipoProduto

create table StatusPedido (
	idStatusPedido serial primary key,
	Descricao varchar(255)
	
);

create table StatusPagamento (
	idStatusPagamento serial primary key,
	Descricao varchar(255)
	
);

create table FormaPagamento (
	idFormaPagamento serial primary key,
	Descricao varchar(255)
	
);

create table TipoEntrega (
	idTipoEntrega serial primary key,
	Descricao varchar(255)
	
);


--inserts das tabelas básicas
insert into TipoProduto (Descricao)
values ('Lanche'),
('Bebida'),
('Acompanhamento'),
('Sobremesa');

insert into TipoEntrega (Descricao) values 
('Motoboy'),
('Retirada na Loja')

select * from tipoentrega

insert into FormaPagamento (Descricao) values 
('Crédito'),
('PIX'),
('Débito'),
('VR')

insert into StatusPagamento (Descricao) values
('Pendente'),
('Em processamento'),
('Aprovado'),
('Recusado')

insert into StatusPedido (Descricao) values
('Recebido'),
('Em Preparação'),
('Pronto. Aguardando motoboy.'),
('Pronto. Aguardando retirada pelo cliente.'),
('Pedido saiu para entrega'),
('Pedido entregue!'),
('Pedido retirado!')

--validação
select * from tipoproduto
select * from tipoentrega
select * from statuspedido
select * from statuspagamento
select * from formapagamento

CREATE TABLE cliente (
    idCliente SERIAL NOT NULL primary key,
    Nome VARCHAR(255) NOT NULL,
    Telefone VARCHAR(255) NOT NULL,
    Email VARCHAR(255) NOT NULL,
    Status BOOLEAN NOT NULL,
    DataCadastro DATE NOT NULL
);

select * from Cliente

drop table cliente

CREATE TABLE produto(
    idProduto SERIAL NOT null primary key,
    Nome VARCHAR(255) NOT NULL,
    "Descricao" VARCHAR(255) NOT NULL,
    idTipoProduto INTEGER NOT NULL,
    valor NUMERIC(10,2) NOT NULL,
    Status BOOLEAN NOT NULL
);

alter table produto
rename column "Descricao" to descricao

ALTER TABLE produto
ALTER COLUMN descricao TYPE varchar(500)
USING valor::numeric;

drop table produto


CREATE TABLE pedido (
    idpedido SERIAL PRIMARY KEY,
    idcliente INTEGER NOT NULL,
    data TIMESTAMP(0) NOT NULL,
    idstatuspedido INTEGER NOT NULL,
    valortotal INTEGER NOT NULL,
    idtipoentrega INTEGER NOT NULL,

    CONSTRAINT fk_pedido_cliente
        FOREIGN KEY (idcliente)
        REFERENCES cliente(idcliente),

    CONSTRAINT fk_pedido_status
        FOREIGN KEY (idstatuspedido)
        REFERENCES statuspedido(idstatuspedido),

    CONSTRAINT fk_pedido_tipoentrega
        FOREIGN KEY (idtipoentrega)
        REFERENCES tipoentrega(idtipoentrega)
);


CREATE TABLE pagamento (
    idpagamento SERIAL PRIMARY KEY,
    idpedido INTEGER NOT NULL,
    idformapagamento INTEGER NOT NULL,
    valor NUMERIC(10,2) NOT NULL,
    idstatuspagamento INTEGER NOT NULL,
    datapagamento TIMESTAMP(0) NOT NULL,

    CONSTRAINT fk_pagamento_pedido
        FOREIGN KEY (idpedido)
        REFERENCES pedido(idpedido),

    CONSTRAINT fk_pagamento_forma
        FOREIGN KEY (idformapagamento)
        REFERENCES formapagamento(idformapagamento),

    CONSTRAINT fk_pagamento_status
        FOREIGN KEY (idstatuspagamento)
        REFERENCES statuspagamento(idstatuspagamento)
);

alter table pagamento
alter column datapagamento drop not null

CREATE TABLE combo(
    idCombo SERIAL NOT NULL,
    NomeCombo VARCHAR(255) NOT NULL,
    Descricao VARCHAR(500) NOT NULL,
    valor NUMERIC(10,2) NOT null,
    Status BOOLEAN NOT NULL,
    DataInicio DATE NOT NULL,
    DataFim DATE NOT NULL
);

alter table combo
alter column datafim drop not null

ALTER TABLE
    Combo ADD PRIMARY KEY(idCombo);

CREATE TABLE itempedido (
    idItemPedido SERIAL PRIMARY KEY,
    
    idPedido INTEGER NOT NULL,
    idProduto INTEGER NULL,
    idCombo INTEGER NULL,

    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    valorUnitario NUMERIC(12,2) NOT NULL,
    valorTotal NUMERIC(12,2) NOT NULL,

    -- FKs
    CONSTRAINT fk_itempedido_pedido
        FOREIGN KEY (idPedido)
        REFERENCES pedido(idPedido),

    CONSTRAINT fk_itempedido_produto
        FOREIGN KEY (idProduto)
        REFERENCES produto(idProduto),

    CONSTRAINT fk_itempedido_combo
        FOREIGN KEY (idCombo)
        REFERENCES combo(idCombo),

    -- Garante que seja produto OU combo
    CONSTRAINT chk_itempedido_origem
        CHECK (
            (idProduto IS NOT NULL AND idCombo IS NULL) OR
            (idProduto IS NULL AND idCombo IS NOT NULL)
        )
);

CREATE TABLE itemcombo (
    idItemCombo SERIAL PRIMARY KEY,

    idCombo INTEGER NOT NULL,
    idProduto INTEGER NOT NULL,

    quantidade INTEGER NOT NULL DEFAULT 1 CHECK (quantidade > 0),

    -- FKs
    CONSTRAINT fk_itemcombo_combo
        FOREIGN KEY (idCombo)
        REFERENCES combo(idCombo),

    CONSTRAINT fk_itemcombo_produto
        FOREIGN KEY (idProduto)
        REFERENCES produto(idProduto),

    -- Evita duplicidade de produto no combo
    CONSTRAINT uq_combo_produto UNIQUE (idCombo, idProduto)
);
-------------------------------------------------------------------------------------------------------------------------

--CRIANDO AS MASSAS

--tabela cliente
INSERT INTO cliente (nome, telefone, email, status, datacadastro)
VALUES
('Ana Souza',        '11987654321', 'ana.souza@email.com',        true,  '2024-01-05'),
('Bruno Lima',       '11987654322', 'bruno.lima@email.com',       true,  '2024-01-06'),
('Carlos Pereira',   '11987654323', 'carlos.p@email.com',         true,  '2024-01-07'),
('Daniela Rocha',    '11987654324', 'daniela.rocha@email.com',    true,  '2024-01-08'),
('Eduardo Santos',   '11987654325', 'edu.santos@email.com',       false, '2024-01-09'),
('Fernanda Alves',   '11987654326', 'fernanda.alves@email.com',   true,  '2024-01-10'),
('Gabriel Nunes',    '11987654327', 'gabriel.nunes@email.com',    true,  '2024-01-11'),
('Helena Martins',   '11987654328', 'helena.m@email.com',         true,  '2024-01-12'),
('Igor Teixeira',    '11987654329', 'igor.teixeira@email.com',    false, '2024-01-13'),
('Juliana Costa',    '11987654330', 'juliana.costa@email.com',    true,  '2024-01-14'),
('Lucas Ribeiro',    '11987654331', 'lucas.ribeiro@email.com',    true,  '2024-01-15'),
('Mariana Araujo',   '11987654332', 'mariana.araujo@email.com',   true,  '2024-01-16'),
('Nathan Oliveira',  '11987654333', 'nathan.oliveira@email.com',  true,  '2024-01-17'),
('Paula Mendes',     '11987654334', 'paula.mendes@email.com',     false, '2024-01-18'),
('Rafael Barros',    '11987654335', 'rafael.barros@email.com',    true,  '2024-01-19'),
('Sabrina Pacheco',  '11987654336', 'sabrina.p@email.com',        true,  '2024-01-20'),
('Thiago Farias',    '11987654337', 'thiago.farias@email.com',    true,  '2024-01-21'),
('Vanessa Guedes',   '11987654338', 'vanessa.guedes@email.com',   true,  '2024-01-22'),
('William Moreira',  '11987654339', 'will.moreira@email.com',     false, '2024-01-23'),
('Yasmin Torres',    '11987654340', 'yasmin.torres@email.com',    true,  '2024-01-24');

select * from cliente

---------------------------------------------------------------------------------------------

--tabela produto
select * from produto
where idtipoproduto = 3

INSERT INTO produto (nome, descricao, valor, idTipoProduto, status) VALUES
('X-Burger', 'Hambúrguer clássico com queijo prato', 18.90, 1, true),
('X-Salada', 'Hambúrguer com queijo, alface e tomate', 21.90, 1, true),
('X-Bacon', 'Hambúrguer com queijo e bacon crocante', 24.90, 1, true),
('X-Tudo', 'Hambúrguer completo com ovo, bacon e salada', 29.90, 1, true),
('Smash Burger', 'Dois discos smash com cheddar', 27.90, 1, true),
('Veggie Burger', 'Hambúrguer vegetal com salada', 23.90, 1, true),
('Batata Pequena', 'Porção pequena de batata frita', 9.90, 2, true),
('Batata Média', 'Porção média de batata frita', 13.90, 2, true),
('Batata Grande', 'Porção grande de batata frita', 17.90, 2, true),
('Onion Rings', 'Anéis de cebola empanados', 15.90, 2, true),
('Nuggets', 'Porção com 6 nuggets crocantes', 14.90, 2, true),
('Refrigerante Lata', 'Coca-Cola, Guaraná ou Sprite 350ml', 6.90, 3, true),
('Refrigerante 600ml', 'Refrigerante 600ml gelado', 8.90, 3, true),
('Suco Natural', 'Suco natural de laranja ou limão', 9.90, 3, true),
('Água Mineral', 'Água mineral sem gás 500ml', 4.90, 3, true),
('Água com Gás', 'Água mineral com gás 500ml', 5.90, 3, true),
('Milkshake Chocolate', 'Milkshake cremoso de chocolate', 16.90, 4, true),
('Milkshake Morango', 'Milkshake cremoso de morango', 16.90, 4, true),
('Brownie', 'Brownie artesanal com chocolate meio amargo', 12.90, 4, true);

----------------------------------------------------------------------------------------------
--combos

select * from combo

INSERT INTO combo (nomecombo, descricao, valor, status, datainicio, datafim) VALUES
('Combo Clássico', 'X-Burger + Batata Média + Refrigerante Lata', 29.90, true, '2026-02-01', null),
('Combo Bacon Lovers', 'X-Bacon + Batata Grande + Refrigerante 600ml', 39.90, true, '2026-02-01', null),
('Combo Smash', 'Smash Burger + Batata Média + Refrigerante Lata', 34.90, true, '2026-02-01', null),
('Combo Família', '2 X-Salada + Batata Grande + 2 Refrigerantes 600ml', 59.90, true, '2026-02-01', null),
('Combo Veggie', 'Veggie Burger + Onion Rings + Suco Natural', 32.90, true, '2026-02-01', null),
('Combo Doce', 'X-Burger + Batata Pequena + Refrigerante Lata + Brownie', 33.90, true, '2026-02-01', null);

----------------------------------------------------------------------------------------------------------------------------

--pedidos

INSERT INTO pedido (idcliente, data, idstatuspedido, valortotal, idtipoentrega) VALUES
(1,  '2026-02-01 12:15', 3, 38.80, 1),
(2,  '2026-02-01 19:22', 3, 29.90, 2),
(3,  '2026-02-02 20:10', 3, 59.90, 1),
(4,  '2026-02-03 18:45', 2, 24.90, 1),
(5,  '2026-02-03 21:05', 3, 33.90, 1),
(6,  '2026-02-04 12:00', 3, 27.90, 2),
(7,  '2026-02-05 13:30', 3, 41.80, 1),
(8,  '2026-02-05 20:40', 3, 34.90, 1),
(9,  '2026-02-06 19:55', 3, 18.90, 2),
(10, '2026-02-06 22:10', 1, 0.00, 1); -- pedido criado sem fechar ainda

-------------------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION calcular_valortotal()
RETURNS TRIGGER AS $$
BEGIN
    NEW.valortotal := NEW.quantidade * NEW.valorunitario;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calcular_valortotal
BEFORE INSERT OR UPDATE
ON itempedido
FOR EACH ROW
EXECUTE FUNCTION calcular_valortotal();

INSERT INTO itempedido
(idpedido, idproduto, quantidade, valorunitario)
VALUES
-- Pedido 1
(1, 1, 2, 18.90),
(1, 3, 1, 25.50),

-- Pedido 2
(2, 2, 3, 12.00),
(2, 4, 1, 45.00),

-- Pedido 3
(3, 1, 1, 18.90),
(3, 5, 2, 9.90),

-- Pedido 4
(4, 3, 2, 25.50),

-- Pedido 5
(5, 4, 1, 45.00),
(5, 2, 2, 12.00),

-- Pedido 6
(6, 5, 5, 9.90),

-- Pedido 7
(7, 1, 2, 18.90),

-- Pedido 8
(8, 3, 1, 25.50),

-- Pedido 9
(9, 5, 3, 9.90),

-- Pedido 10
(10, 4, 2, 45.00);

select * from itempedido

--------------------------------------------------------------------------------------------------------

select * from combo

INSERT INTO itemcombo (idcombo, idproduto, quantidade) VALUES

-- Combo 2 - Clássico
(2, 1, 1),
(2, 8, 1),
(2, 12, 1),

-- Combo 3 - Bacon Lovers
(3, 3, 1),
(3, 9, 1),
(3, 13, 1),

-- Combo 4 - Smash
(4, 5, 1),
(4, 8, 1),
(4, 12, 1),

-- Combo 5 - Família
(5, 2, 2),
(5, 9, 1),
(5, 13, 2),

-- Combo 6 - Veggie
(6, 6, 1),
(6, 10, 1),
(6, 14, 1),

-- Combo 7 - Doce
(7, 1, 1),
(7, 7, 1),
(7, 12, 1),
(7, 19, 1);

select * from itemcombo 

---------------------------------------------------------------------------------------

--pagamento

select * from pagamento

INSERT INTO pagamento (idpedido, idformapagamento, valor, idstatuspagamento, datapagamento) VALUES
(1, 1, 38.80, 2, '2026-02-01 12:16'),
(2, 2, 29.90, 2, '2026-02-01 19:23'),
(3, 1, 59.90, 2, '2026-02-02 20:11'),
(4, 1, 24.90, 1, '2026-02-03 18:46'),
(5, 3, 33.90, 2, '2026-02-03 21:06'),
(6, 2, 27.90, 2, '2026-02-04 12:01'),
(7, 1, 41.80, 2, '2026-02-05 13:31'),
(8, 1, 34.90, 2, '2026-02-05 20:41'),
(9, 2, 18.90, 2, '2026-02-06 19:56');

--validações

--FK
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS referenced_table
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name;


select * from pagamento s 

select * from cliente

select * from produto

select * from tipoproduto

select * from pedido

select * from itempedido

select * from statuspagamento

select * from pagamento

select * from itemcombo

select * from combo
select * from formapagamento

SELECT conname
FROM pg_constraint
WHERE conrelid = 'itempedido'::regclass;

ALTER TABLE itempedido
DROP CONSTRAINT fk_itempedido_combo;

ALTER TABLE itempedido
DROP COLUMN idcombo;

select * from vw_pedidodetalhado vp 
order by id


