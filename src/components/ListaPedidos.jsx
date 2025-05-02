import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css'; // Importar los estilos
import logo from '../assets/logoFCA.png'; // Importar el logo
const backendURL = import.meta.env.VITE_BACKEND_URL;
const ListaPedidos = () => {
  const [pedidos, setPedidos] = useState([]); // Pedidos generales
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [cantidades, setCantidades] = useState({});
  const [verRecibidos, setVerRecibidos] = useState(false); // Estado para cambiar entre mostrar "enviado/pendiente" o "recibido"


  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await axios.get(`${backendURL}/pedidos`);

        // Filtrar los pedidos según si estamos viendo los "enviado/pendiente" o los "recibidos"
        const pedidosFiltrados = response.data.filter(pedido => {
          if (verRecibidos) {
            return pedido.estado === 'recibido';
          }
          return pedido.estado === 'enviado' || pedido.estado === 'pendiente';
        });

        // Ordenar los pedidos por fecha (últimos primero) y limitar a los 5 más recientes
        const pedidosRecientes = pedidosFiltrados
          .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
          .slice(0, 5);

        setPedidos(pedidosRecientes);
      } catch (error) {
        console.error("Error al cargar los pedidos", error);
      }
    };

    fetchPedidos();
  }, [verRecibidos]); // Dependencia de verRecibidos para que se actualice cada vez que cambie

  const togglePedido = (id) => {
    setPedidoSeleccionado(pedidoSeleccionado === id ? null : id);
  };

  const handleChange = (productoId, value) => {
    setCantidades(prev => ({
      ...prev,
      [productoId]: value
    }));
  };

  const enviarPedido = async (pedidoId, productos) => {
    try {
      const datos = productos.map(p => ({
        productoId: p.id,
        cantidadenviada: cantidades[p.id] || 0
      }));

      await axios.put(`${backendURL}/pedidos/${pedidoId}/enviar`, {
        productos: datos
      });

      alert('Pedido enviado correctamente');
      window.location.reload();
    } catch (error) {
      console.error("Error al enviar pedido:", error);
    }
  };

  return (
    <div className="lista-pedidos">
      {/* Logo en la parte superior */}
      <div className="logo-container">
        <img src={logo} alt="Logo" className="logo" />
      </div>

      <h1>Lista de Pedidos</h1>

      {/* Botón para cambiar entre "ver recibidos" o "ver enviados/pendientes" */}
      <div className="boton-cambiar">
        <button onClick={() => setVerRecibidos(!verRecibidos)} className="boton-ver-recibidos">
          {verRecibidos ? 'Ver Pedidos Enviados/Pendientes' : 'Ver Pedidos Recibidos'}
        </button>
      </div>

      {pedidos.length === 0 ? (
        <p>No hay pedidos disponibles.</p>
      ) : (
        pedidos.map(pedido => (
          <div
            key={pedido.id}
            onClick={() => togglePedido(pedido.id)}
            className={`pedido-card ${pedido.estado === 'enviado' ? 'enviado' : ''} 
            ${pedido.estado === 'pendiente' ? 'pendiente' : ''}
            ${pedido.estado === 'recibido' ? 'recibido' : ''}`}
          >
            <strong>Usuario:</strong> {pedido.Usuario?.nombre || 'Desconocido'}<br />
            <strong>Fecha:</strong> {pedido.fecha}<br />
            <strong>Estado:</strong> {pedido.estado}

            {pedidoSeleccionado === pedido.id && (
              <div className="pedido-detalles">
                <table className="productos-tabla">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad Pedida</th>
                      <th>Cantidad Enviada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedido.Productos.map((prod, index) => (
                      <tr key={index}>
                        <td>{prod.nombre}</td>
                        <td>{prod.PedidoProducto?.cantidadpedida}</td>
                        <td>
                          <input
                            type="number"
                            value={cantidades[prod.id] || ''}
                            placeholder={prod.PedidoProducto?.cantidadenviada || ''}
                            onChange={(e) => handleChange(prod.id, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="input-cantidad"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!verRecibidos && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      enviarPedido(pedido.id, pedido.Productos);
                    }}
                    className="boton-enviar"
                  >
                    Marcar como enviado
                  </button>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ListaPedidos;
