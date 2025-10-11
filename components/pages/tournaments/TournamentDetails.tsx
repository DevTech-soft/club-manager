// src/pages/TournamentDetails.tsx
import Button from "@/components/ui/Button";
import ModalDialog from "@/components/ui/Dialog";
import { useData } from "@/context/DataContext";
import { Match, TournamentGroup, TournamentType } from "@/types";
import {
  Calendar,
  Users,
  MapPin,
  Trophy,
  Clock,
  ChevronDown,
  Phone,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const AccordionSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ title, icon, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center px-4 py-3 text-lg font-semibold text-primary hover:text-white transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span>{title}</span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-primary transform transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`transition-all duration-300 overflow-hidden ${
          open ? "max-h-[1000px] opacity-100 p-4" : "max-h-0 opacity-0 p-0"
        }`}
      >
        {open && <div>{children}</div>}
      </div>
    </div>
  );
};

const TournamentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    getTournamentById,
    generateGroupsAndMatches,
    getMatchesByTournamentId,
  } = useData();
  const [tournament, setTournament] = useState<any>(null);
  const [matches, setMatches] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
 const [openGroup, setOpenGroup] = useState<number | null>(null);

const handleAccordionToggle = (groupIndex: number) => {
  setOpenGroup(prev => (prev === groupIndex ? null : groupIndex));
};

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        if (!id) return;
        const data = await getTournamentById(id);

        setTournament(data);
      } catch (error) {
        console.error("Error fetching tournament:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, [id, getTournamentById]);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        if (!id) return;
        const data = await getMatchesByTournamentId(id);
        setMatches(data);
      } catch (error) {
        console.error("Error fetching matches:", error);
      }
    };

    fetchMatches();
  }, [id, getMatchesByTournamentId]);

  if (loading) return <p className="p-6">Cargando detalles...</p>;
  if (!tournament) return <p className="p-6">Torneo no encontrado.</p>;

  return (
    <div className="p-6 text-text-primary">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-1">
            {tournament.name}
          </h1>
          <p className="text-sm text-text-secondary">{tournament.category}</p>
        </div>
        <Link to="/tournaments">
          <Button variant="secondary">Volver</Button>
        </Link>
      </div>

      {/* Información general */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <span>
              <strong className="text-text-secondary">Inicio:</strong>{" "}
              {new Date(tournament.startDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <span>
              <strong className="text-text-secondary">Fin:</strong>{" "}
              {new Date(tournament.endDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <span>
              <strong className="text-text-secondary">Ubicación:</strong>{" "}
              {tournament.location || "No especificada"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <span>
              <strong className="text-text-secondary">Equipos:</strong>{" "}
              {tournament.registeredTeams?.length || 0} /{" "}
              {tournament.maxParticipants}
            </span>
          </div>
          <div>
            <strong className="text-text-secondary">Tipo:</strong>{" "}
            <span className="capitalize">
              {tournament.type == TournamentType.standard
                ? "Competitivo"
                : "Entrenamiento"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-primary" />
            <strong className="text-text-secondary">Contacto:</strong>{" "}
            {tournament.organizerContact}
          </div>
        </div>

        {/* Descripción */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-primary mb-2">
            Descripción
          </h2>
          <p className="text-text-secondary leading-relaxed">
            {tournament.description || "Sin descripción disponible."}
          </p>
        </div>
      </div>

      {/* Acordeones */}
      <div className="mt-8 space-y-4">
        {/* Equipos Participantes */}
        <AccordionSection
          title="Equipos Participantes"
          icon={<Users className="w-5 h-5 text-primary" />}
          defaultOpen
        >
          {tournament.registeredTeams?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tournament.registeredTeams.map((reg: any) => (
                <div
                  key={reg.id}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:shadow-xl transition-shadow"
                >
                  <h3 className="text-lg font-bold text-white mb-1">
                    {reg.team?.name || reg.teamName}
                  </h3>
                  {reg.team?.coach && (
                    <p className="text-sm text-text-secondary">
                      Entrenador: {reg.team.coach.firstName}{" "}
                      {reg.team.coach.lastName}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Club: {reg.externalClub || "Sin club"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary">
              No hay equipos registrados aún.
            </p>
          )}
        </AccordionSection>

        {/* Tabla de posiciones */}
        <AccordionSection
          title="Tabla de Posiciones"
          icon={<Trophy className="w-5 h-5 text-primary" />}
        >
          {tournament.positions?.length ? (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-700 text-text-secondary">
                  <th className="py-2 text-left">#</th>
                  <th className="py-2 text-left">Equipo</th>
                  <th className="py-2 text-center">PJ</th>
                  <th className="py-2 text-center">G</th>
                  <th className="py-2 text-center">E</th>
                  <th className="py-2 text-center">P</th>
                  <th className="py-2 text-center">Pts</th>
                </tr>
              </thead>
              <tbody>
                {tournament.positions.map((pos: any, index: number) => (
                  <tr
                    key={index}
                    className="border-b border-gray-800 hover:bg-gray-700/30"
                  >
                    <td className="py-2">{index + 1}</td>
                    <td className="py-2">{pos.teamName}</td>
                    <td className="py-2 text-center">{pos.played}</td>
                    <td className="py-2 text-center">{pos.wins}</td>
                    <td className="py-2 text-center">{pos.draws}</td>
                    <td className="py-2 text-center">{pos.losses}</td>
                    <td className="py-2 text-center font-bold text-primary">
                      {pos.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-text-secondary">
              No hay posiciones registradas.
            </p>
          )}
        </AccordionSection>

        {/* Fechas y Encuentros */}
        <AccordionSection
          title="Fechas y Encuentros"
          icon={<Clock className="w-5 h-5 text-primary" />}
        >
          {tournament.groups?.length ? (
            <ul className="space-y-2">
              {tournament.groups.map((g: TournamentGroup, i: number) => {
               
                return (
                  <li
                    key={i}
                    className="bg-gray-700/40 p-3 rounded-md border border-gray-600"
                  >
                    {/* Encabezado del grupo */}
                    <button
                      onClick={() => handleAccordionToggle(i)}
                      className="w-full flex justify-between items-center text-left"
                    >
                      <span className="font-semibold text-lg text-white">
                        {g.name}
                      </span>
                      <span className="text-sm text-text-secondary">
                        {g.matches.length} encuentro
                        {g.matches.length !== 1 && "s"}
                      </span>
                    </button>

                    {/* Lista de encuentros del grupo */}
                    {openGroup === i && (
                      <ul className="mt-3 space-y-2 pl-4 border-l border-gray-600">
                        {g.matches.map((m: Match, j: number) => {
                          const teamA = tournament.registeredTeams?.find(
                            (t: any) => t.id === m.teamAId
                          );
                          const teamB = tournament.registeredTeams?.find(
                            (t: any) => t.id === m.teamBId
                          );
                          return (
                            <li
                              key={j}
                              className="flex justify-between items-center bg-gray-800/50 p-3 rounded-md border border-gray-700"
                            >
                              <span>
                                <strong>
                                  {teamA?.team?.name ||
                                    teamA?.teamName ||
                                    "Equipo A"}
                                </strong>{" "}
                                vs{" "}
                                <strong>
                                  {teamB?.team?.name ||
                                    teamB?.teamName ||
                                    "Equipo B"}
                                </strong>
                              </span>
                              <span className="text-sm text-text-secondary">
                                {m.date
                                  ? new Date(m.date).toLocaleDateString()
                                  : "Sin fecha"}{" "}
                                —{" "}
                                {m.date
                                  ? new Date(m.date).toLocaleTimeString()
                                  : "Sin hora"}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-3 text-center">
              <p className="text-text-secondary">
                No hay encuentros programados.
              </p>

              {/* Botón Generar Sorteo */}
              <Button
                variant="primary"
                onClick={async () => {
                  try {
                    setLoading(true);
                    const firstMatches = generateGroupsAndMatches(
                      tournament.id,
                      2
                    );
                    console.log(firstMatches);
                    setMatches(firstMatches);
                    // Refresca el torneo para mostrar los nuevos matches
                    const updated = await getTournamentById(tournament.id);
                    setTournament(updated);
                    setOpenDialog(true);
                    console.log(updated);
                  } catch (err: any) {
                    console.error(err);
                    alert(
                      "❌ No se pudo generar el sorteo. Revisa los equipos o el servidor."
                    );
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
              >
                {loading ? "Generando..." : "Generar sorteo"}
              </Button>
            </div>
          )}
        </AccordionSection>
      </div>
      {openDialog && (
        <ModalDialog
          isOpen={openDialog}
          onClose={() => setOpenDialog(false)}
          title="Se han creado encuentros"
          variant="info"
          showCloseIcon={false}
          confirmText="Aceptar"
          cancelText="Cancelar"
          onConfirm={async () => {
            setOpenDialog(false);
          }}
          showCancel={false}
        >
          <p>¿Estás seguro de eliminar el torneo?</p>
        </ModalDialog>
      )}
    </div>
  );
};

export default TournamentDetails;
