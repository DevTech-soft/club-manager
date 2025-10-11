import React, { useState, useEffect } from "react";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import {
  MainCategory,
  SubCategory,
  Team,
  Tournament,
  TournamentType,
} from "@/types";
import { useData } from "@/context/DataContext";

interface TournamentFormProps {
  onCancel: () => void;
  onSubmit?: (data: Tournament) => void;
  availableTeams?: Team[]; // 🔹 equipos cargados desde la BD
}

const TournamentForm: React.FC<TournamentFormProps> = ({
  onCancel,
  onSubmit,
  availableTeams = [],
}) => {
  const [formData, setFormData] = useState<Tournament>({
    id: "",
    name: "",
    category: "",
    purpose: "",
    startDate: "",
    endDate: "",
    location: "",
    maxParticipants: 0,
    registrationDeadline: "",
    entryFee: 0,
    description: "",
    rules: "",
    prizes: "",
    organizerContact: "",
    type: TournamentType.standard,
    quickTeamNames: [],
    registeredTeams: [],
  });

  const subCategoryOptions: Record<MainCategory, SubCategory[]> = {
    [MainCategory.Femenino]: [SubCategory.Intermedio],
    [MainCategory.Mixto]: [
      SubCategory.Avanzado,
      SubCategory.Intermedio,
      SubCategory.Basico,
    ],
    [MainCategory.Masculino]: [SubCategory.Avanzado, SubCategory.Intermedio],
  };

  const [mainCategory, setMainCategory] = useState<MainCategory>(
    MainCategory.Masculino
  );
  const [subCategory, setSubCategory] = useState<SubCategory>(
    SubCategory.Avanzado
  );
  const [availableSubCategories, setAvailableSubCategories] = useState<
    SubCategory[]
  >(subCategoryOptions[mainCategory]);

  const [teams, setTeams] = useState<Team[]>(availableTeams);

  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const { createTournament } = useData();
  useEffect(() => {
    const options = subCategoryOptions[mainCategory];
    setAvailableSubCategories(options);
    if (!options.includes(subCategory)) {
      setSubCategory(options[0]);
    }
  }, [mainCategory, subCategory]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as TournamentType;
    setFormData((prev) => ({
      ...prev,
      type: value,
      quickTeamNames: value === TournamentType.quick ? [""] : [],
      registeredTeams: value === TournamentType.standard ? [] : [],
    }));
  };

  const handleQuickTeamChange = (index: number, newName: string) => {
    const updated = [...(formData.quickTeamNames ?? [])];
    updated[index] = newName;
    setFormData((prev) => ({ ...prev, quickTeamNames: updated }));
  };

  const addQuickTeam = () => {
    setFormData((prev) => ({
      ...prev,
      quickTeamNames: [...(prev.quickTeamNames ?? []), ""],
    }));
  };

  const removeQuickTeam = (index: number) => {
    const updated = (formData.quickTeamNames ?? []).filter(
      (_, i) => i !== index
    );
    setFormData((prev) => ({ ...prev, quickTeamNames: updated }));
  };

  const handleTeamSelection = (teamId: string) => {
    setSelectedTeams((prev) =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tournamentPayload: any = {
        ...formData,
        category: mainCategory,
        startDate: formData.type === TournamentType.quick
          ? new Date().toISOString()
          : formData.startDate,
        endDate: formData.type === TournamentType.quick
          ? new Date().toISOString()
          : formData.endDate,
        registrationDeadline:  new Date().toISOString(),
         
        registeredTeams: formData.type === TournamentType.standard
          ? selectedTeams
          : [],
      };

      await createTournament(tournamentPayload);
      onSubmit?.(tournamentPayload);
      console.log("Torneo creado:", tournamentPayload);
    } catch (error) {
      console.error("Error al crear el torneo:", error);
    }
  };


  // 🔹 Filtrar equipos por categoría seleccionada
  const filteredTeams = availableTeams.filter(
    (team) =>
      team.mainCategory === mainCategory && team.subCategory === subCategory
  );

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 🏆 Tipo de torneo */}
        <div>
          <label
            htmlFor="type"
            className="block text-sm font-medium text-white mb-1"
          >
            Tipo de Torneo*
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleTypeChange}
            className="w-full p-2 border rounded-md bg-gray-800 text-white"
            required
          >
            <option value="">Seleccionar tipo</option>
            <option value={TournamentType.quick}>Rápido (Entrenamiento)</option>
            <option value={TournamentType.standard}>
              Normal (Competitivo)
            </option>
          </select>
        </div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-white mb-1"
        >
          {" "}
          Nombre del Torneo*{" "}
        </label>{" "}
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 border rounded-md bg-gray-800 text-white bg-gray-800 text-white"
          placeholder="Ej: Copa Club Manager 2025"
        />
        {formData.type === TournamentType.standard && (
          <>
            <div className="space-y-4">
              {" "}
              <div className="grid grid-cols-2 gap-4">
                {" "}
                <div>
                  {" "}
                  <label
                    htmlFor="startDate"
                    className="block text-sm font-medium text-white mb-1"
                  >
                    {" "}
                    Fecha de Inicio*{" "}
                  </label>{" "}
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    required
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md bg-gray-800 text-white bg-gray-800 text-white"
                  />{" "}
                </div>{" "}
                <div>
                  {" "}
                  <label
                    htmlFor="endDate"
                    className="block text-sm font-medium text-white mb-1"
                  >
                    {" "}
                    Fecha de Finalización*{" "}
                  </label>{" "}
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    required
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md bg-gray-800 text-white bg-gray-800 text-white"
                  />{" "}
                </div>{" "}
              </div>{" "}
              <div>
                {" "}
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-white mb-1"
                >
                  {" "}
                  Ubicación*{" "}
                </label>{" "}
                <input
                  type="text"
                  id="location"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md bg-gray-800 text-white"
                  placeholder="Dirección completa del evento"
                />{" "}
              </div>{" "}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {" "}
              <div>
                {" "}
                <label
                  htmlFor="maxParticipants"
                  className="block text-sm font-medium text-white mb-1"
                >
                  {" "}
                  Máximo de Participantes{" "}
                </label>{" "}
                <input
                  type="number"
                  id="maxParticipants"
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md bg-gray-800 text-white"
                  min="0"
                />{" "}
              </div>{" "}
              <div>
                {" "}
                <label
                  htmlFor="entryFee"
                  className="block text-sm font-medium text-white mb-1"
                >
                  {" "}
                  Cuota de Inscripción{" "}
                </label>{" "}
                <input
                  type="number"
                  id="entryFee"
                  name="entryFee"
                  value={formData.entryFee}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md bg-gray-800 text-white"
                  min="0"
                  step="0.01"
                />{" "}
              </div>{" "}
            </div>
            {/* Detalles adicionales */}{" "}
            <div className="space-y-4">
              {" "}
              <div>
                {" "}
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-white mb-1"
                >
                  {" "}
                  Descripción del Torneo{" "}
                </label>{" "}
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md bg-gray-800 text-white"
                  rows={4}
                  placeholder="Describe los detalles del torneo..."
                />{" "}
              </div>{" "}
              <div>
                {" "}
                <label
                  htmlFor="rules"
                  className="block text-sm font-medium text-white mb-1"
                >
                  {" "}
                  Reglamento{" "}
                </label>{" "}
                <textarea
                  id="rules"
                  name="rules"
                  value={formData.rules}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md bg-gray-800 text-white"
                  rows={4}
                  placeholder="Especifica las reglas del torneo..."
                />{" "}
              </div>{" "}
              <div>
                {" "}
                <label
                  htmlFor="prizes"
                  className="block text-sm font-medium text-white mb-1"
                >
                  {" "}
                  Premios{" "}
                </label>{" "}
                <textarea
                  id="prizes"
                  name="prizes"
                  value={formData.prizes}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md bg-gray-800 text-white"
                  rows={2}
                  placeholder="Describe los premios del torneo..."
                />{" "}
              </div>{" "}
              <div>
                {" "}
                <label
                  htmlFor="organizerContact"
                  className="block text-sm font-medium text-white mb-1"
                >
                  {" "}
                  Contacto del Organizador*{" "}
                </label>{" "}
                <input
                  type="text"
                  id="organizerContact"
                  name="organizerContact"
                  required
                  value={formData.organizerContact}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md bg-gray-800 text-white"
                  placeholder="Nombre y datos de contacto del organizador"
                />{" "}
              </div>{" "}
            </div>
          </>
        )}
        {/* Categoría principal y subcategoría */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Categoría Principal
            </label>
            <select
              value={mainCategory}
              onChange={(e) => setMainCategory(e.target.value as MainCategory)}
              className="w-full p-2 border rounded-md bg-gray-800 text-white"
            >
              {Object.values(MainCategory).map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Subcategoría
            </label>
            <select
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value as SubCategory)}
              className="w-full p-2 border rounded-md bg-gray-800 text-white"
            >
              {availableSubCategories.map((sub) => (
                <option key={sub}>{sub}</option>
              ))}
            </select>
          </div>
        </div>
        {/* 🏃‍♂️ Equipos rápidos */}
        {formData.type === TournamentType.quick && (
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Equipos Rápidos</h3>
            {(formData.quickTeamNames ?? []).map((name, index) => (
              <div key={index} className="flex space-x-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleQuickTeamChange(index, e.target.value)}
                  className="flex-1 p-2 border rounded-md bg-gray-800 text-white"
                  placeholder={`Nombre del equipo #${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeQuickTeam(index)}
                  className="text-red-500"
                >
                  ✕
                </button>
              </div>
            ))}
            <Button type="button" variant="secondary" onClick={addQuickTeam}>
              + Agregar equipo
            </Button>
          </div>
        )}
        {/* ⚙️ Equipos registrados */}
        {formData.type === TournamentType.standard && (
          <div>
            <h3 className="text-white font-semibold mb-2">
              Selecciona los Equipos
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {filteredTeams.map((team) => (
                <label
                  key={team.id}
                  className="flex items-center space-x-2 text-white"
                >
                  <input
                    type="checkbox"
                    checked={selectedTeams.includes(team.id)}
                    onChange={() => handleTeamSelection(team.id)}
                  />
                  <span>{team.name}</span>
                </label>
              ))}
              {filteredTeams.length === 0 && (
                <p className="text-gray-400 text-sm col-span-2">
                  No hay equipos en esta categoría
                </p>
              )}
            </div>
          </div>
        )}
        {/* Botones */}
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
