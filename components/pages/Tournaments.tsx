import React, { useState } from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import TournamentForm from "./tournaments/TournamentForm";
import { useData } from "@/context/DataContext";
import { TournamentType } from "@/types";
import { Link } from "react-router-dom";

interface Tournament {
  id: string;
  name: string;
  category: string;
  startDate: string;
  endDate: string;
  status: "upcoming" | "ongoing" | "completed";
  participants: number;
  maxParticipants: number;
}

const Tournaments: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { tournaments, loading, teams } = useData();

  const getStatusBadgeColor = (status: Tournament["status"]) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "ongoing":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: Tournament["status"]) => {
    switch (status) {
      case "upcoming":
        return "Próximo";
      case "ongoing":
        return "En Curso";
      case "completed":
        return "Finalizado";
    }
  };

  return (
    <div className="p-6">
      {!showCreateForm ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Torneos</h1>
            <Button variant="primary" onClick={() => setShowCreateForm(true)}>
              Crear Nuevo Torneo
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((tournament) => (
              <Card key={tournament.id}>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {tournament.name}
                      </h3>
                      <p className="text-gray-600">{tournament.category}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                        tournament.endDate === new Date().toISOString()
                          ? "completed"
                          : tournament.endDate === new Date().toISOString()
                          ? "upcoming"
                          : "ongoing"
                      )}`}
                    >
                      {getStatusText(
                        tournament.endDate === new Date().toISOString()
                          ? "completed"
                          : tournament.endDate === new Date().toISOString()
                          ? "upcoming"
                          : "ongoing"
                      )}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Inicio:</span>
                      <span>
                        {new Date(tournament.startDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Fin:</span>
                      <span>
                        {new Date(tournament.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Participantes:</span>
                      <span>
                        {tournament.type === TournamentType.quick
                          ? tournament.quickTeamNames?.length
                          : tournament.registeredTeams?.length}
                        /{tournament.maxParticipants}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end space-x-2">
                    <Link to={`/tournament/${tournament.id}`}>
                      <Button variant="secondary" size="small">
                        Ver Detalles
                      </Button>
                    </Link>

                    {tournament.endDate === "upcoming" && (
                      <Button variant="primary" size="small">
                        Inscribirse
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Crear Nuevo Torneo</h1>
            <Button
              variant="secondary"
              onClick={() => setShowCreateForm(false)}
            >
              Volver a Torneos
            </Button>
          </div>
          <TournamentForm
            availableTeams={teams}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}
    </div>
  );
};

export default Tournaments;
