import React from 'react';
import ListaPedidos from './components/ListaPedidos';  // Importamos el componente de pedidos


const App = () => {
  return (
    <div>
      <ListaPedidos />  {/* Agregamos el componente para mostrar los pedidos */}
    </div>
  );
};

export default App;