import React, { useState, useEffect } from 'react';

const App = () => {
  const [products, setProducts] = useState([]);
  const [tray, setTray] = useState([]);
  const [showTray, setShowTray] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8000/produtos')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Erro ao carregar produtos:", err));
  }, []);

  const addToTray = (product) => {
    setTray(prev => {
      const existing = prev.find(item => item.idproduto === product.idproduto);
      if (existing) {
        return prev.map(item =>
          item.idproduto === product.idproduto
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantidade: 1 }];
    });
  };

  const removeFromTray = (productId) => {
    setTray(prev => prev.filter(item => item.idproduto !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setTray(prev => prev.map(item => {
      if (item.idproduto === productId) {
        const newQty = Math.max(0, item.quantidade + delta);
        return { ...item, quantidade: newQty };
      }
      return item;
    }).filter(item => item.quantidade > 0));
  };

  const total = tray.reduce((sum, item) => sum + (item.valor * item.quantidade), 0);

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <h1 className="text-ifood text-2xl font-bold text-center">Data Burger</h1>
      </header>

      {/* Catalogue */}
      <main className="p-4 max-w-2xl mx-auto space-y-4">
        <h2 className="text-xl font-semibold mb-4">Cardápio</h2>
        {products.map(product => (
          <div
            key={product.idproduto}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center hover:border-ifood transition-colors cursor-pointer"
            onClick={() => addToTray(product)}
          >
            <div className="flex-1">
              <h3 className="font-bold text-lg">{product.nome}</h3>
              <p className="text-gray-500 text-sm line-clamp-2">{product.descricao}</p>
              <p className="text-ifood font-semibold mt-1">R$ {parseFloat(product.valor).toFixed(2).replace('.', ',')}</p>
            </div>
            <div className="ml-4 w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center text-gray-400 text-xs">
              Sem Imagem
            </div>
          </div>
        ))}
      </main>

      {/* Dynamic Footer Button */}
      {tray.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <button
            onClick={() => setShowTray(true)}
            className="w-full bg-ifood text-white rounded-lg p-4 flex justify-between items-center font-bold hover:bg-opacity-90 transition-all active:scale-95"
          >
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="bg-white text-ifood text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {tray.reduce((s, i) => s + i.quantidade, 0)}
              </span>
            </div>
            <span>IR PARA O CAIXA</span>
            <span>R$ {total.toFixed(2).replace('.', ',')}</span>
          </button>
        </div>
      )}

      {/* Tray Sidebar/Modal */}
      {showTray && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 flex justify-end">
          <div className="bg-white w-full max-w-md h-full flex flex-col shadow-xl animate-slide-in">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold">Minha Bandeja</h2>
              <button onClick={() => setShowTray(false)} className="text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {tray.map(item => (
                <div key={item.idproduto} className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.nome}</h4>
                    <p className="text-sm text-gray-500">R$ {parseFloat(item.valor).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-3 border rounded-lg p-1">
                    <button onClick={() => updateQuantity(item.idproduto, -1)} className="text-ifood font-bold px-2">-</button>
                    <span className="text-sm font-semibold">{item.quantidade}</span>
                    <button onClick={() => updateQuantity(item.idproduto, 1)} className="text-ifood font-bold px-2">+</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-100 space-y-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>R$ {total.toFixed(2).replace('.', ',')}</span>
              </div>
              <button
                className="w-full bg-ifood text-white font-bold py-4 rounded-lg shadow-md"
                onClick={() => {
                  alert("Pedido finalizado com sucesso!");
                  setTray([]);
                  setShowTray(false);
                }}
              >
                FINALIZAR PEDIDO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
