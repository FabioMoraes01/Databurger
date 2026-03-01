from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Numeric
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import datetime

Base = declarative_base()

class Cliente(Base):
    __tablename__ = 'cliente'
    idcliente = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    telefone = Column(String, nullable=False)
    email = Column(String, nullable=False)
    status = Column(Boolean, default=True)
    datacadastro = Column(DateTime, default=datetime.datetime.utcnow)

class Produto(Base):
    __tablename__ = 'produto'
    idproduto = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    descricao = Column(String)
    idtipoproduto = Column(Integer)
    valor = Column(Numeric(12, 2), nullable=False)
    status = Column(Boolean, default=True)

class Pedido(Base):
    __tablename__ = 'pedido'
    idpedido = Column(Integer, primary_key=True, index=True)
    idcliente = Column(Integer, ForeignKey('cliente.idcliente'))
    data = Column(DateTime, default=datetime.datetime.utcnow)
    idstatuspedido = Column(Integer, default=1)
    valortotal = Column(Numeric(12, 2), default=0.0)
    idtipoentrega = Column(Integer)
    
    itens = relationship("ItemPedido", back_populates="pedido")

class ItemPedido(Base):
    __tablename__ = 'itempedido'
    iditempedido = Column(Integer, primary_key=True, index=True)
    idpedido = Column(Integer, ForeignKey('pedido.idpedido'))
    idproduto = Column(Integer, ForeignKey('produto.idproduto'))
    quantidade = Column(Integer, nullable=False)
    valorunitario = Column(Numeric(12, 2), nullable=False)
    valortotal = Column(Numeric(12, 2), nullable=False)
    
    pedido = relationship("Pedido", back_populates="itens")

class Pagamento(Base):
    __tablename__ = 'pagamento'
    idpagamento = Column(Integer, primary_key=True, index=True)
    idpedido = Column(Integer, ForeignKey('pedido.idpedido'))
    idformapagamento = Column(Integer)
    valor = Column(Numeric(12, 2), nullable=False)
    datapagamento = Column(DateTime, default=datetime.datetime.utcnow)
    idstatuspagamento = Column(Integer, default=1)
