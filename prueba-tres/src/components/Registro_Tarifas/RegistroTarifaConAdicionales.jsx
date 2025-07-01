import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Plus, X, ChevronDown, ChevronUp } from 'lucide-react';

const TarifaCosto = ({ showNotification, tabColor = 'emerald' }) => {
  const [tiposVehiculo, setTiposVehiculo] = useState([]);
  const [tiposCarga, setTiposCargas] = useState([]);
  const [zonasDeViaje, setZonasDeViaje] = useState([]);
  const [transportistas, setTransportistas] = useState([]);
  const [tarifas, setTarifasCosto] = useState([]);
  const [adicionales, setAdicionales] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para adicionales
  const [showAdicionalesForm, setShowAdicionalesForm] = useState(false);
  const [showAdicionalesSelector, setShowAdicionalesSelector] = useState(false);
  const [adicionalSearch, setAdicionalSearch] = useState('');
  const [nuevoAdicional, setNuevoAdicional] = useState({ descripcion: '', costo: '' });

  const [form, setForm] = useState({
    tipoVehiculo: '',
    tipoCarga: '',
    zonaDeViaje: '',
    transportista: '',
    valorBase: '',
    adicionalesSeleccionados: []
  });

  // Simulamos algunos adicionales predeterminados
  useEffect(() => {
    setAdicionales([
      { id: 1, descripcion: 'Carga frágil', costo: 50.00 },
      { id: 2, descripcion: 'Entrega urgente', costo: 75.00 },
      { id: 3, descripcion: 'Carga peligrosa', costo: 100.00 },
      { id: 4, descripcion: 'Descarga manual', costo: 30.00 },
      { id: 5, descripcion: 'Seguro adicional', costo: 25.00 },
      { id: 6, descripcion: 'Servicio nocturno', costo: 60.00 }
    ]);
  }, []);

  const clearForm = () => {
    setForm({
      tipoVehiculo: '',
      tipoCarga: '',
      zonaDeViaje: '',
      transportista: '',
      valorBase: '',
      adicionalesSeleccionados: []
    });
    setEditingId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleValorBaseChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setForm({ ...form, valorBase: value });
  };

  // Manejo de adicionales
  const agregarAdicional = () => {
    if (!nuevoAdicional.descripcion || !nuevoAdicional.costo) {
      showNotification('Complete descripción y costo del adicional', 'error');
      return;
    }

    const nuevo = {
      id: Date.now(),
      descripcion: nuevoAdicional.descripcion,
      costo: parseFloat(nuevoAdicional.costo)
    };

    setAdicionales([...adicionales, nuevo]);
    setNuevoAdicional({ descripcion: '', costo: '' });
    setShowAdicionalesForm(false);
    showNotification('Adicional agregado correctamente');
  };

  const seleccionarAdicional = (adicional) => {
    const yaSeleccionado = form.adicionalesSeleccionados.find(a => a.id === adicional.id);
    
    if (yaSeleccionado) {
      setForm({
        ...form,
        adicionalesSeleccionados: form.adicionalesSeleccionados.filter(a => a.id !== adicional.id)
      });
    } else {
      setForm({
        ...form,
        adicionalesSeleccionados: [...form.adicionalesSeleccionados, adicional]
      });
    }
  };

  const removerAdicionalSeleccionado = (id) => {
    setForm({
      ...form,
      adicionalesSeleccionados: form.adicionalesSeleccionados.filter(a => a.id !== id)
    });
  };

  // Cálculo del costo total
  const calcularCostoTotal = () => {
    const base = parseFloat(form.valorBase) || 0;
    const adicional = form.adicionalesSeleccionados.reduce((sum, item) => sum + item.costo, 0);
    return base + adicional;
  };

  // Filtrado de adicionales para el buscador
  const adicionalesFiltrados = adicionales.filter(adicional =>
    adicional.descripcion.toLowerCase().includes(adicionalSearch.toLowerCase())
  );

  const validateForm = () => {
    return form.tipoVehiculo && form.tipoCarga && form.zonaDeViaje && form.transportista && form.valorBase;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showNotification('Por favor completa todos los campos obligatorios', 'error');
      return;
    }

    const payload = {
      valorBase: Number(form.valorBase),
      tipoVehiculo: Number(form.tipoVehiculo),
      zonaDeViaje: Number(form.zonaDeViaje),
      transportista: Number(form.transportista),
      tipoCarga: Number(form.tipoCarga),
      adicionales: form.adicionalesSeleccionados,
      costoTotal: calcularCostoTotal()
    };

    try {
      if (editingId) {
        showNotification('Tarifa de costo actualizada correctamente');
      } else {
        showNotification('Tarifa de costo agregada correctamente');
      }
      // Aquí irían las llamadas a la API
      clearForm();
    } catch (error) {
      console.error('Error al guardar tarifa:', error);
      showNotification('Error al guardar la tarifa', 'error');
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Formulario */}
      <div className="lg:col-span-1">
        <div className="bg-[#444240] p-8 rounded-2xl shadow-lg border border-gray-900">
          <h2 className={`text-2xl font-bold text-gray-300 mb-6 pb-3 border-b-4 border-${tabColor}-500`}>
            {editingId ? 'Editar Tarifa de Costo' : 'Nueva Tarifa de Costo'}
          </h2>

          <div className="space-y-5">
            {/* Campos existentes */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Tipo de Vehículo *
              </label>
              <select
                name="tipoVehiculo"
                value={form.tipoVehiculo}
                onChange={handleInputChange}
                className={`w-full p-3 border-2 border-gray-200 rounded-lg text-gray-900 focus:border-${tabColor}-500 focus:outline-none transition-all`}
              >
                <option value="">Seleccionar tipo de vehículo</option>
                <option value="1">Camión (Base: $120/km)</option>
                <option value="2">Furgoneta (Base: $80/km)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Tipo de Carga *
              </label>
              <select
                name="tipoCarga"
                value={form.tipoCarga}
                onChange={handleInputChange}
                className={`w-full p-3 border-2 border-gray-200 rounded-lg text-gray-900 focus:border-${tabColor}-500 focus:outline-none transition-all`}
              >
                <option value="">Seleccionar tipo de carga</option>
                <option value="1">General ($50)</option>
                <option value="2">Frágil ($100)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Zona de Viaje *
              </label>
              <select
                name="zonaDeViaje"
                value={form.zonaDeViaje}
                onChange={handleInputChange}
                className={`w-full p-3 border-2 border-gray-200 rounded-lg text-gray-900 focus:border-${tabColor}-500 focus:outline-none transition-all`}
              >
                <option value="">Seleccionar zona de viaje</option>
                <option value="1">Buenos Aires - Córdoba | 700 km ($840)</option>
                <option value="2">Buenos Aires - Rosario | 300 km ($360)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Transportista *
              </label>
              <select
                name="transportista"
                value={form.transportista}
                onChange={handleInputChange}
                className={`w-full p-3 border-2 border-gray-200 rounded-lg text-gray-900 focus:border-${tabColor}-500 focus:outline-none transition-all`}
              >
                <option value="">Seleccionar transportista</option>
                <option value="1">Juan Pérez (Base: $500)</option>
                <option value="2">María González (Base: $450)</option>
              </select>
            </div>

            {/* Valor Base */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <label className="block text-sm font-semibold text-blue-700 mb-2">
                Valor Base *
              </label>
              <input
                type="number"
                value={form.valorBase}
                onChange={handleValorBaseChange}
                min="0"
                step="0.01"
                className="w-full p-3 border-2 border-blue-300 rounded-lg focus:border-blue-400 focus:outline-none transition-all text-xl font-bold text-blue-600"
                placeholder="0.00"
              />
            </div>

            {/* Sección de Adicionales */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-semibold text-green-700">
                  Servicios Adicionales
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAdicionalesForm(true)}
                    className="p-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    title="Crear nuevo adicional"
                  >
                    <Plus size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAdicionalesSelector(!showAdicionalesSelector)}
                    className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    title="Seleccionar adicionales"
                  >
                    {showAdicionalesSelector ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {/* Adicionales seleccionados */}
              {form.adicionalesSeleccionados.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {form.adicionalesSeleccionados.map(adicional => (
                      <span
                        key={adicional.id}
                        className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                      >
                        {adicional.descripcion} (${adicional.costo})
                        <button
                          type="button"
                          onClick={() => removerAdicionalSeleccionado(adicional.id)}
                          className="ml-1 text-green-600 hover:text-green-800"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Selector de adicionales */}
              {showAdicionalesSelector && (
                <div className="border border-green-300 rounded-lg p-3 bg-white max-h-40 overflow-y-auto">
                  <div className="relative mb-2">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      value={adicionalSearch}
                      onChange={(e) => setAdicionalSearch(e.target.value)}
                      placeholder="Buscar adicionales..."
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-green-400"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    {adicionalesFiltrados.map(adicional => {
                      const isSelected = form.adicionalesSeleccionados.find(a => a.id === adicional.id);
                      return (
                        <div
                          key={adicional.id}
                          onClick={() => seleccionarAdicional(adicional)}
                          className={`p-2 rounded cursor-pointer text-sm transition-colors ${
                            isSelected 
                              ? 'bg-green-100 border border-green-300' 
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className={isSelected ? 'font-medium text-green-800' : 'text-gray-700'}>
                              {adicional.descripcion}
                            </span>
                            <span className={`font-bold ${isSelected ? 'text-green-600' : 'text-gray-600'}`}>
                              ${adicional.costo}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Formulario para nuevo adicional */}
              {showAdicionalesForm && (
                <div className="border border-green-300 rounded-lg p-3 bg-white">
                  <h4 className="font-semibold text-green-700 mb-2">Nuevo Adicional</h4>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={nuevoAdicional.descripcion}
                      onChange={(e) => setNuevoAdicional({...nuevoAdicional, descripcion: e.target.value})}
                      placeholder="Descripción del adicional"
                      className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-green-400"
                    />
                    <input
                      type="number"
                      value={nuevoAdicional.costo}
                      onChange={(e) => setNuevoAdicional({...nuevoAdicional, costo: e.target.value})}
                      placeholder="Costo"
                      min="0"
                      step="0.01"
                      className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-green-400"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={agregarAdicional}
                        className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                      >
                        Agregar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAdicionalesForm(false);
                          setNuevoAdicional({ descripcion: '', costo: '' });
                        }}
                        className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Costo Total */}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <label className="block text-sm font-semibold text-yellow-700 mb-2">
                Costo Total
              </label>
              <div className="text-2xl font-bold text-yellow-600">
                ${calcularCostoTotal().toFixed(2)}
              </div>
              <div className="text-xs text-yellow-600 mt-1">
                Base: ${(parseFloat(form.valorBase) || 0).toFixed(2)} + 
                Adicionales: ${form.adicionalesSeleccionados.reduce((sum, item) => sum + item.costo, 0).toFixed(2)}
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={clearForm}
                className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-semibold"
              >
                Limpiar
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={clearForm}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
                >
                  Cancelar
                </button>
              )}
              <button
                onClick={handleSubmit}
                className={`px-6 py-3 text-white rounded-lg transition-colors font-semibold ${
                  editingId
                    ? `bg-${tabColor}-500 hover:bg-${tabColor}-600`
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {editingId ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="lg:col-span-2 bg-[#444240] rounded-2xl shadow-lg border border-gray-900 overflow-hidden">
        <div className={`bg-gradient-to-r from-${tabColor}-700 to-${tabColor}-800 text-white p-6`}>
          <h2 className="text-2xl font-bold mb-4">Tarifas de Costo Registradas</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por vehículo o transportista..."
              className="w-full max-w-xs pl-10 pr-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:bg-white/20"
            />
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          <table className="w-full">
            <thead className="bg-[#242423] sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Vehículo</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Carga</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Zona</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Transportista</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Valor Base</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Adicionales</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Total</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="8" className="px-4 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <div className="text-6xl mb-4">💰</div>
                    <h3 className="text-lg font-semibold mb-2">No hay tarifas de costo registradas</h3>
                    <p>Comienza agregando una nueva tarifa usando el formulario</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TarifaCosto;