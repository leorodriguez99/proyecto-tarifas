import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { createCarga, deleteCarga, getCargas, updateCarga } from '../../../services/tipoCarga.service';
import Swal from 'sweetalert2';

const TiposCarga = ({ showNotification, tabColor }) => {
  const [data, setData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  // Modificado: Se quita valorBase del estado
  const [form, setForm] = useState({ 
    categoria: '',
    pesoTotal: '', 
    volumenTotal: '', 
    esEspecial: false,
    requisitoEspecial: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cargas = await getCargas();
        setData(cargas);
      } catch (error) {
        showNotification('Error al cargar los tipos de carga', 'error');
      }
    };
    fetchData();
  }, []);

  const clearForm = () => {
    // Modificado: Se quita valorBase al limpiar el formulario
    setForm({ 
      categoria: '', 
      pesoTotal: '', 
      volumenTotal: '', 
      esEspecial: false,
      requisitoEspecial: ''
    });
    setEditingId(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm({ 
        ...form, 
        [name]: checked,
        requisitoEspecial: name === 'esEspecial' && !checked ? '' : form.requisitoEspecial
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // Modificado: Se quita la validación de valorBase
  const validateForm = () => {
    const peso = parseFloat(form.pesoTotal);
    const volumen = parseFloat(form.volumenTotal);

    if (
      !form.categoria.trim() ||
      isNaN(peso) || peso < 0 ||
      isNaN(volumen) || volumen < 0
    ) {
      return false;
    }

    if (form.esEspecial && !form.requisitoEspecial.trim()) {
      return false;
    }

    return true;
  };
  
  const editEntity = (id) => {
    const carga = data.find(item => item.id === id);
    if (carga) {
      // Modificado: Se quita valorBase al popular el formulario para edición
      setForm({
        categoria: carga.categoria || '',
        pesoTotal: carga.pesoTotal.toString(),
        volumenTotal: carga.volumenTotal.toString(),
        esEspecial: carga.esEspecial,
        requisitoEspecial: carga.requisitoEspecial || '',
      });
      setEditingId(id);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      if (form.esEspecial && !form.requisitoEspecial.trim()) {
        showNotification('Para cargas especiales, debes especificar el requisito especial', 'error');
      } else {
        showNotification('Por favor completa todos los campos requeridos', 'error');
      }
      return;
    }

    // Modificado: Se quita valorBase de los datos a enviar
    const entityData = {
      categoria: form.categoria.trim(),
      requisitoEspecial: form.esEspecial ? form.requisitoEspecial.trim() : '',
      pesoTotal: parseFloat(form.pesoTotal),
      volumenTotal: parseFloat(form.volumenTotal),
      esEspecial: form.esEspecial,
    };

    try {
      if (editingId) {
        const updatedCarga = await updateCarga(editingId, entityData);
        setData(data.map(item =>
          item.id === editingId ? { ...item, ...updatedCarga } : item
        ));
        showNotification('Tipo de carga actualizado correctamente');
      } else {
        const nuevaCarga = await createCarga(entityData);
        setData([...data, nuevaCarga]);
        showNotification('Tipo de carga agregada correctamente');
      }
      clearForm();
    } catch (error) {
      console.error('Error al guardar tipo de carga:', error);
      const mensaje = error?.response?.data?.message || 'Error al guardar el tipo de carga';
      showNotification(mensaje, 'error');
    }
  };

  const deleteEntity = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el tipo de carga definitivamente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await deleteCarga(id);
        setData(data.filter(item => item.id !== id));
        showNotification('Tipo de carga eliminado correctamente');
      } catch (error) {
        console.error('Error al eliminar tipo de carga:', error);
        const mensaje = error?.response?.data?.message || 'Error al eliminar el tipo de carga';
        showNotification(mensaje, 'error');
      }
    }
  };

  // Modificado: Se quita valorBase de los criterios de búsqueda
  const filteredData = data.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.categoria.toLowerCase().includes(searchLower) ||
      (item.requisitoEspecial && item.requisitoEspecial.toLowerCase().includes(searchLower)) ||
      item.pesoTotal.toString().includes(searchTerm) ||
      item.volumenTotal.toString().includes(searchTerm)
    );
  });

  // Eliminado: La función formatCurrency ya no es necesaria
  
  const formatWeight = (weight) => {
    return `${weight} kg`;
  };

  const formatVolume = (volume) => {
    return `${volume} m³`;
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Form Section */}
      <div className="lg:col-span-1">
        <div className="bg-[#444240] p-8 rounded-2xl shadow-lg border border-gray-900">
          <h2 className={`text-2xl font-bold text-gray-300 mb-6 pb-3 border-b-4 border-${tabColor}-500`}>
            {editingId ? 'Editar Tipo de Carga' : 'Nuevo Tipo de Carga'}
          </h2>

          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Categoría *
                </label>
                <input
                  type="text"
                  name="categoria"
                  value={form.categoria}
                  onChange={handleInputChange}
                  placeholder="Ej: Electrodomésticos, Productos químicos..."
                  className="w-full p-3 border-2 border-gray-200 text-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Peso Total Estimado (kg) *
                </label>
                <input
                  type="number"
                  name="pesoTotal"
                  value={form.pesoTotal}
                  onChange={handleInputChange}
                  placeholder="Peso estimado en kilogramos"
                  min="0"
                  step="0.1"
                  className="w-full p-3 border-2 border-gray-200 text-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Volumen Total Estimado (m³) *
                </label>
                <input
                  type="number"
                  name="volumenTotal"
                  value={form.volumenTotal}
                  onChange={handleInputChange}
                  placeholder="Volumen estimado en metros cúbicos"
                  min="0"
                  step="0.1"
                  className="w-full p-3 border-2 border-gray-200 text-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>
              
              {/* Eliminado: Bloque del input para Valor Base */}

              <div className="flex items-center space-x-3 p-4 rounded-lg">
                <input
                  type="checkbox"
                  id="esEspecial"
                  name="esEspecial"
                  checked={form.esEspecial}
                  onChange={handleInputChange}
                  className={`w-5 h-5 text-${tabColor}-600 border-gray-300 rounded focus:ring-${tabColor}-500`}
                />
                <div>
                  <label htmlFor="esEspecial" className="text-sm font-semibold text-gray-300 cursor-pointer">
                    ¿Es carga especial?
                  </label>
                  <p className="text-xs text-gray-300">Marca si requiere manejo o transporte especial</p>
                </div>
              </div>

              {form.esEspecial && (
                <div className="animate-fadeIn">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Requisito Especial *
                  </label>
                  <textarea
                    name="requisitoEspecial"
                    value={form.requisitoEspecial}
                    onChange={handleInputChange}
                    placeholder="Describe los requisitos especiales para el manejo de esta carga..."
                    rows="3"
                    className="w-full p-3 border-2 text-gray-300 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-all resize-none"
                  />
                  <p className="text-xs text-red-600 mt-1">
                    <AlertTriangle size={12} className="inline mr-1" />
                    Este campo es obligatorio para cargas especiales
                  </p>
                </div>
              )}
              
              {/* Eliminado: Bloque que mostraba el valor base formateado */}

              {(form.pesoTotal || form.volumenTotal) && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <label className="block text-sm font-semibold text-blue-700 mb-2">
                    Especificaciones
                  </label>
                  <div className="space-y-1 text-sm text-blue-800">
                    {form.pesoTotal && (
                      <p><strong>Peso:</strong> {formatWeight(parseFloat(form.pesoTotal))}</p>
                    )}
                    {form.volumenTotal && (
                      <p><strong>Volumen:</strong> {formatVolume(parseFloat(form.volumenTotal))}</p>
                    )}
                    {form.pesoTotal && form.volumenTotal && parseFloat(form.volumenTotal) > 0 && (
                      <p><strong>Densidad:</strong> {(parseFloat(form.pesoTotal) / parseFloat(form.volumenTotal)).toFixed(2)} kg/m³</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={clearForm}
                className="px-6 py-3 bg-[#444240] text-yellow-500 border border-yellow-500 hover:text-white rounded-lg hover:bg-yellow-500 transition-colors font-semibold"
              >
                Limpiar
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={clearForm}
                  className="px-6 py-3 bg-[#444240] text-red-600 hover:text-white rounded-lg border border-red-600 hover:bg-red-600 transition-colors font-semibold"
                >
                  Cancelar
                </button>
              )}
              <button
                onClick={handleSubmit}
                className={`px-6 py-3 rounded-lg transition-colors font-semibold ${
                  editingId
                    ? `bg-[#444240] border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white`
                    : 'bg-[#444240] border border-green-500 text-green-500 hover:text-white hover:bg-green-500'
                }`}
              >
                {editingId ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="lg:col-span-2 bg-[#444240] rounded-2xl shadow-lg border border-gray-900 overflow-hidden">
        <div className={`bg-gradient-to-r from-blue-700 to-blue-800 text-white p-6`}>
          <h2 className="text-2xl font-bold mb-4">
            Tipos de Carga Registrados
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              // Modificado: Placeholder del buscador
              placeholder="Buscar por categoría, peso, volumen o requisito..."
              className="w-full max-w-md pl-10 pr-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:bg-white/20"
            />
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          <table className="w-full">
            <thead className="bg-[#242423] sticky top-0">
              <tr className="text-gray-300">
                <th className="px-4 py-3 text-left text-sm text-gray-300 font-semibold">Categoría</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Especificaciones</th>
                {/* Eliminado: Cabecera de la tabla para Valor Base */}
                <th className="px-4 py-3 text-left text-sm font-semibold">Tipo</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  {/* Modificado: colSpan cambia de 5 a 4 */}
                  <td colSpan="4" className="px-4 py-12 text-center text-gray-300">
                    <div className="flex flex-col items-center">
                      <div className="text-6xl mb-4">📦</div>
                      <h3 className="text-lg font-semibold mb-2">No hay tipos de carga registrados</h3>
                      <p>Comienza agregando un nuevo tipo de carga usando el formulario</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="border-b border-gray-900 hover:border-blue-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-sm text-neutral-200">{item.categoria}</div>
                      {item.esEspecial && item.requisitoEspecial && (
                        <div className="text-xs text-orange-600 mt-1 bg-orange-50 px-2 py-1 rounded max-w-xs">
                          <AlertTriangle size={10} className="inline mr-1" />
                          {item.requisitoEspecial.length > 50 
                            ? `${item.requisitoEspecial.substring(0, 50)}...`
                            : item.requisitoEspecial
                          }
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="space-y-1 text-neutral-300">
                        <div><strong>Peso:</strong> {formatWeight(item.pesoTotal)}</div>
                        <div><strong>Volumen:</strong> {formatVolume(item.volumenTotal)}</div>
                        {item.volumenTotal > 0 && (
                          <div className="text-xs text-neutral-400">
                            Densidad: {(item.pesoTotal / item.volumenTotal).toFixed(2)} kg/m³
                          </div>
                        )}
                      </div>
                    </td>
                    {/* Eliminado: Celda de la tabla para mostrar el valorBase */}
                    <td className="px-4 py-3">
                      <span
                        title={item.esEspecial ? item.requisitoEspecial : ''}
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          item.esEspecial 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {item.esEspecial && <AlertTriangle size={12} className="mr-1" />}
                        {item.esEspecial ? 'Especial' : 'Regular'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => editEntity(item.id)}
                          className="p-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => deleteEntity(item.id)}
                          className="p-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TiposCarga;