// src/pages/TournamentDetails.tsx
import Button from "@/components/ui/Button";
import ModalDialog from "@/components/ui/Dialog";
import TournamentLoader from "@/components/ui/Loader";
import { useData } from "@/context/DataContext";
import {
  Match,
  TournamentGroup,
  TournamentPosition,
  TournamentType,
} from "@/types";

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
    getGroupsByTournamentId,
    getMatchesByGroupId,
    updateMatch,
    createSet,
    getPositionsByTournamentId,
  } = useData();
  const [tournament, setTournament] = useState<any>(null);
  const [matchesByGroup, setMatches] = useState<any>(null);
  const [positions, setPositions] = useState<TournamentPosition[]>([]);
  const [groups, setGroups] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [dialogMessage, setDialogMessage] = useState("");
  const [editedDates, setEditedDates] = useState<{ [matchId: string]: string }>(
    {}
  );
  const [editingDates, setEditingDates] = useState<{
    [matchId: string]: boolean;
  }>({});

  const handleAccordionToggle = async (groupId: string) => {
    setOpenGroup((prev) => (prev === groupId ? null : groupId));
    try {
      const matches = await getMatchesByGroupId(groupId);
      setMatches((prev: any) => ({ ...prev, [groupId]: matches }));
      console.log("Matches for group", groupId, matches);
    } catch (err) {
      console.error("Error fetching matches for group:", err);
    }
  };

  // Guardar en DB (simulado — tú harás el fetch real)
  const handleSaveMatchDate = async (match: Match) => {
    try {
      const updatedMatch = await updateMatch(match);
      const groupId = updatedMatch.groupId!;

      setMatches((prevMatches: any) => {
        const groupId = updatedMatch.groupId!;
        const groupMatches = prevMatches[groupId] ?? [];

        const updatedGroupMatches = groupMatches.map((m: any) =>
          m.id === updatedMatch.id ? updatedMatch : m
        );

        return { ...prevMatches, [groupId]: updatedGroupMatches };
      });

      setDialogMessage(`Fecha guardada para el encuentro.`);
      setOpenDialog(true);
    } catch (error) {
      console.error("Error al guardar fecha:", error);
      setDialogMessage("❌ No se pudo guardar la fecha del encuentro.");
      setOpenDialog(true);
    }
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
    const fetchGroups = async () => {
      try {
        if (!id) return;
        const data = await getGroupsByTournamentId(id);
        setGroups(data);
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };

    fetchGroups();
  }, [id, getGroupsByTournamentId]);

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        if (!id) return;
        const data = await getPositionsByTournamentId(id);
        setPositions(data);
        // console.log("Positions:", data);
      } catch (error) {
        console.error("Error fetching positions:", error);
      }
    };

    fetchPositions();
  }, [id, getPositionsByTournamentId]);

  const handleStartMatch = async (match: Match) => {
    try {
      const updatedMatch = await updateMatch({
        ...match,
        status: "in_progress",
      });
      await createSet(updatedMatch.id);
      setMatches((prevMatches: any) => {
        const groupId = updatedMatch.groupId!;
        const groupMatches = prevMatches[groupId] ?? [];

        const updatedGroupMatches = groupMatches.map((m: any) =>
          m.id === updatedMatch.id ? updatedMatch : m
        );

        return { ...prevMatches, [groupId]: updatedGroupMatches };
      });

      setDialogMessage("Deseas ir a los detalles del encuentro?");
      setOpenDialog(true);
      setShowCancelDialog(true);
    } catch (error) {
      console.error("Error al iniciar el encuentro:", error);
      setDialogMessage("❌ No se pudo iniciar el encuentro.");
      setOpenDialog(true);
    }
  };

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
          ) : 
          tournament.quickTeamNames?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tournament.quickTeamNames.map((name: string) => (
                <div
                  key={name + Math.random()}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:shadow-xl transition-shadow"
                >
                  <h3 className="text-lg font-bold text-white mb-1">{name}</h3>
                </div>
              ))}
            </div>
          ):
          (
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
          {positions?.length ? (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-700 text-text-secondary">
                  <th className="py-2 text-left">#</th>
                  <th className="py-2 text-left">Equipo</th>
                  <th className="py-2 text-center">PJ</th>
                  <th className="py-2 text-center">PG</th>
                  <th className="py-2 text-center">PE</th>
                  <th className="py-2 text-center">PP</th>
                  <th className="py-2 text-center">SF</th>
                  <th className="py-2 text-center">SC</th>
                  <th className="py-2 text-center">PF</th>
                  <th className="py-2 text-center">PC</th>
                  <th className="py-2 text-center">Pts</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((pos: any, index: number) => (
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
                    <td className="py-2 text-center">{pos.setsWon}</td>
                    <td className="py-2 text-center">{pos.setsLost}</td>
                    <td className="py-2 text-center">{pos.pointsFor}</td>
                    <td className="py-2 text-center">{pos.pointsAgainst}</td>
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
          {groups?.length ? (
            <ul className="space-y-2">
              <ul className="space-y-2">
                {groups.map((g: any) => (
                  <li
                    key={g.id}
                    className="bg-gray-700/40 p-3 rounded-md border border-gray-600"
                  >
                    {/* Encabezado del grupo */}
                    <button
                      onClick={() => handleAccordionToggle(g.id)}
                      className="w-full flex justify-between items-center text-left"
                    >
                      <span className="font-semibold text-lg text-white">
                        {g.name}
                      </span>
                      {/* <span className="text-sm text-text-secondary">
                        {g.matches ?? matchesByGroup[g.id]?.length ?? 0}{" "}
                        encuentro
                        {(g.matches ?? matchesByGroup[g.id]?.length ?? 0) !==
                          1 && "s"}
                      </span> */}
                    </button>

                    {/* Matches del grupo */}
                    {openGroup === g.id && (
                      <ul className="mt-3 space-y-2 pl-4 border-l border-gray-600">
                        {matchesByGroup &&
                        Array.isArray(matchesByGroup[g.id]) ? (
                          matchesByGroup[g.id].length > 0 ? (
                            matchesByGroup[g.id].map((m: any) => {
                              const teamA = tournament.registeredTeams?.find(
                                (t: any) => t.id === m.teamAId
                              );
                              const teamB = tournament.registeredTeams?.find(
                                (t: any) => t.id === m.teamBId
                              );

                              return (
                                <li
                                  key={m.id}
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
                                      ? new Date(m.date).toLocaleDateString(
                                          "es-CO"
                                        ) // o "en-CA" si quieres YYYY-MM-DD
                                      : "Sin fecha"}{" "}
                                    —{" "}
                                    {m.date
                                      ? new Date(m.date).toLocaleTimeString(
                                          "es-CO",
                                          {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          }
                                        )
                                      : "Sin hora"}
                                  </span>

                                  {(() => {
                                    const matchDate = m.date
                                      ? new Date(m.date)
                                      : null;
                                    const now = new Date();

                                    const tempDate = editedDates[m.id]
                                      ? new Date(editedDates[m.id])
                                      : matchDate;

                                    const isFutureSaved =
                                      matchDate && matchDate >= now;
                                    const isEditing =
                                      editingDates[m.id] || false;

                                    // === MODO EDICIÓN (APLazar FECHA) ===
                                    if (isEditing) {
                                      return (
                                        <div className="flex items-center gap-2">
                                          {/* Fecha */}
                                          <input
                                            type="date"
                                            value={
                                              tempDate
                                                ? tempDate.toLocaleDateString(
                                                    "en-CA"
                                                  )
                                                : ""
                                            }
                                            onChange={(e) => {
                                              const newDate = e.target.value;
                                              setEditedDates((prev) => {
                                                const current = new Date(
                                                  tempDate || Date.now()
                                                );
                                                const [year, month, day] =
                                                  newDate
                                                    .split("-")
                                                    .map(Number);
                                                current.setFullYear(
                                                  year,
                                                  month - 1,
                                                  day
                                                );
                                                return {
                                                  ...prev,
                                                  [m.id]: current.toISOString(),
                                                };
                                              });
                                            }}
                                            className="w-auto p-2 border rounded-md bg-gray-800 text-white"
                                          />

                                          {/* Hora */}
                                          <input
                                            type="time"
                                            value={
                                              tempDate
                                                ? tempDate
                                                    .toTimeString()
                                                    .slice(0, 5)
                                                : ""
                                            }
                                            onChange={(e) => {
                                              const newTime = e.target.value;
                                              setEditedDates((prev) => {
                                                const current = new Date(
                                                  tempDate || Date.now()
                                                );
                                                const [hours, minutes] = newTime
                                                  .split(":")
                                                  .map(Number);
                                                current.setHours(
                                                  hours,
                                                  minutes,
                                                  0,
                                                  0
                                                );
                                                return {
                                                  ...prev,
                                                  [m.id]: current.toISOString(),
                                                };
                                              });
                                            }}
                                            className="w-auto p-2 border rounded-md bg-gray-800 text-white"
                                          />

                                          <button
                                            onClick={() => {
                                              const finalDate =
                                                editedDates[m.id];
                                              if (!finalDate) return;
                                              handleSaveMatchDate({
                                                ...m,
                                                date: finalDate,
                                              });
                                              // Limpia fecha temporal y modo edición
                                              setEditedDates((prev) => {
                                                const copy = { ...prev };
                                                delete copy[m.id];
                                                return copy;
                                              });
                                              setEditingDates((prev) => ({
                                                ...prev,
                                                [m.id]: false,
                                              }));
                                            }}
                                            className="px-3 py-2 text-sm rounded-md bg-primary hover:bg-primary/80 text-white"
                                          >
                                            Guardar
                                          </button>

                                          <button
                                            onClick={() =>
                                              setEditingDates((prev) => ({
                                                ...prev,
                                                [m.id]: false,
                                              }))
                                            }
                                            className="px-3 py-2 text-sm rounded-md bg-gray-700 hover:bg-gray-600 text-white"
                                          >
                                            Cancelar
                                          </button>
                                        </div>
                                      );
                                    }

                                    if (m.status === "in_progress") {
                                      return (
                                        <div className="flex items-center gap-2">
                                          <Link to={`/match/${m.id}`}>
                                            <button className="px-3 py-2 text-sm rounded-md bg-red-600 hover:bg-red-500 text-white">
                                              Ir a Encuentro
                                            </button>
                                          </Link>
                                        </div>
                                      );
                                    }
                                    if (
                                      m.status === "finished" ||
                                      m.status === "cancelled"
                                    )
                                      return (
                                        <div className="flex items-center gap-2">
                                          <Link to={`/match/${m.id}`}>
                                            <button className="px-3 py-2 text-sm rounded-md bg-red-600 hover:bg-red-500 text-white">
                                              Ver Detalles
                                            </button>
                                          </Link>
                                        </div>
                                      );

                                    // === MODO NORMAL ===
                                    if (isFutureSaved) {
                                      return (
                                        <div className="flex items-center gap-2">
                                          <button
                                            onClick={() => {
                                              m.status = "in_progress";
                                              handleStartMatch(m);
                                            }}
                                            className="px-3 py-2 text-sm rounded-md bg-primary hover:bg-primary/80 text-white"
                                          >
                                            Iniciar Encuentro
                                          </button>

                                          <button
                                            onClick={() =>
                                              setEditingDates((prev) => ({
                                                ...prev,
                                                [m.id]: true,
                                              }))
                                            }
                                            className="px-3 py-2 text-sm rounded-md bg-yellow-600 hover:bg-yellow-500 text-white"
                                          >
                                            Aplazar Fecha
                                          </button>
                                        </div>
                                      );
                                    }

                                    // === MODO CREAR FECHA (aún no existe fecha guardada) ===
                                    return (
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="date"
                                          value={
                                            tempDate
                                              ? tempDate.toLocaleDateString(
                                                  "en-CA"
                                                )
                                              : ""
                                          }
                                          onChange={(e) => {
                                            const newDate = e.target.value;
                                            setEditedDates((prev) => {
                                              const current = new Date(
                                                tempDate || Date.now()
                                              );
                                              const [year, month, day] = newDate
                                                .split("-")
                                                .map(Number);
                                              current.setFullYear(
                                                year,
                                                month - 1,
                                                day
                                              );
                                              return {
                                                ...prev,
                                                [m.id]: current.toISOString(),
                                              };
                                            });
                                          }}
                                          className="w-auto p-2 border rounded-md bg-gray-800 text-white"
                                        />

                                        <input
                                          type="time"
                                          value={
                                            tempDate
                                              ? tempDate
                                                  .toTimeString()
                                                  .slice(0, 5)
                                              : ""
                                          }
                                          onChange={(e) => {
                                            const newTime = e.target.value;
                                            setEditedDates((prev) => {
                                              const current = new Date(
                                                tempDate || Date.now()
                                              );
                                              const [hours, minutes] = newTime
                                                .split(":")
                                                .map(Number);
                                              current.setHours(
                                                hours,
                                                minutes,
                                                0,
                                                0
                                              );
                                              return {
                                                ...prev,
                                                [m.id]: current.toISOString(),
                                              };
                                            });
                                          }}
                                          className="w-auto p-2 border rounded-md bg-gray-800 text-white"
                                        />

                                        <button
                                          onClick={() => {
                                            const finalDate = editedDates[m.id];
                                            if (!finalDate) return;

                                            handleSaveMatchDate({
                                              ...m,
                                              date: finalDate,
                                            });

                                            setEditedDates((prev) => {
                                              const copy = { ...prev };
                                              delete copy[m.id];
                                              return copy;
                                            });
                                          }}
                                          className="px-3 py-2 text-sm rounded-md bg-primary hover:bg-primary/80 text-white"
                                        >
                                          Guardar
                                        </button>
                                      </div>
                                    );
                                  })()}
                                </li>
                              );
                            })
                          ) : (
                            <p className="text-text-secondary">
                              No hay encuentros aún.
                            </p>
                          )
                        ) : (
                          <p className="text-text-secondary">
                            Cargando encuentros...
                          </p>
                        )}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
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

                    setMatches(firstMatches);
                    // Refresca el torneo para mostrar los nuevos matches
                    const updated = await getTournamentById(tournament.id);
                    setTournament(updated);
                    setOpenDialog(true);
                    setDialogMessage(
                      "Se han generado los encuentros dividos por grupos segun la cantidad de equipos registrados."
                    );
                  } catch (err: any) {
                    console.error(err);
                    setDialogMessage(
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
          title="Información"
          variant="info"
          showCloseIcon={false}
          confirmText="Aceptar"
          showCancel={showCancelDialog}
          onConfirm={() => setOpenDialog(false)}
        >
          <p>{dialogMessage}</p>
        </ModalDialog>
      )}
      {loading && <TournamentLoader/>}
    </div>
  );
};

export default TournamentDetails;
