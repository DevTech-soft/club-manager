import React, { useState } from 'react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';

interface TournamentFormData {
  name: string;
  category: string;
  purpose: string;
  startDate: string;
  endDate: string;
  location: string;
  maxParticipants: number;
  registrationDeadline: string;
  entryFee: number;
  description: string;
  rules: string;
  prizes: string;
  organizerContact: string;
}

interface TournamentFormProps {
  onCancel: () => void;
  onSubmit?: (data: TournamentFormData) => void;
}

const TournamentForm: React.FC<TournamentFormProps> = ({ onCancel, onSubmit }) => {
  const [formData, setFormData] = useState<TournamentFormData>({
    name: '',
    category: '',
    purpose: '',
    startDate: '',
    endDate: '',
    location: '',
    maxParticipants: 0,
    registrationDeadline: '',
    entryFee: 0,
    description: '',
    rules: '',
    prizes: '',
    organizerContact: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  const categories = [
    'Sub-12',
    'Sub-14',
    'Sub-16',
    'Sub-18',
    'Senior',
    'Veteranos',
    'Mixto',
    'Femenino',
    'Masculino'
  ];

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información básica del torneo */}
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Torneo*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                placeholder="Ej: Copa Club Manager 2025"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Categoría*
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Seleccionar categoría</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">
                Finalidad del Torneo*
              </label>
              <textarea
                id="purpose"
                name="purpose"
                required
                value={formData.purpose}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                rows={3}
                placeholder="Describe el objetivo principal del torneo..."
              />
            </div>
          </div>

          {/* Fechas y ubicación */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Inicio*
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  required
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Finalización*
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  required
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Ubicación*
              </label>
              <input
                type="text"
                id="location"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                placeholder="Dirección completa del evento"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-1">
                  Máximo de Participantes
                </label>
                <input
                  type="number"
                  id="maxParticipants"
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  min="0"
                />
              </div>
              <div>
                <label htmlFor="entryFee" className="block text-sm font-medium text-gray-700 mb-1">
                  Cuota de Inscripción
                </label>
                <input
                  type="number"
                  id="entryFee"
                  name="entryFee"
                  value={formData.entryFee}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Detalles adicionales */}
        <div className="space-y-4">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción del Torneo
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              rows={4}
              placeholder="Describe los detalles del torneo..."
            />
          </div>

          <div>
            <label htmlFor="rules" className="block text-sm font-medium text-gray-700 mb-1">
              Reglamento
            </label>
            <textarea
              id="rules"
              name="rules"
              value={formData.rules}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              rows={4}
              placeholder="Especifica las reglas del torneo..."
            />
          </div>

          <div>
            <label htmlFor="prizes" className="block text-sm font-medium text-gray-700 mb-1">
              Premios
            </label>
            <textarea
              id="prizes"
              name="prizes"
              value={formData.prizes}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              rows={2}
              placeholder="Describe los premios del torneo..."
            />
          </div>

          <div>
            <label htmlFor="organizerContact" className="block text-sm font-medium text-gray-700 mb-1">
              Contacto del Organizador*
            </label>
            <input
              type="text"
              id="organizerContact"
              name="organizerContact"
              required
              value={formData.organizerContact}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              placeholder="Nombre y datos de contacto del organizador"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Crear Torneo
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default TournamentForm;