import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button"; // o tu propio botón si no usas shadcn
import { useData } from "@/context/DataContext";
import { Match, MatchSet, TournamentPosition } from "@/types";
import { de, se } from "date-fns/locale";

export default function MatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getMatchById, finishSet, updateSetScore, finishMatch, getPositionsByTournamentId } = useData();

  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState({ teamA: 0, teamB: 0 });
  const [sets, setSets] = useState<MatchSet[]>([]);
  const [positions, setPositions] = useState<TournamentPosition[]>([]);

  useEffect(() => {
    if (!id) return;

    getMatchById(id).then((data) => {
      setMatch(data);

      const allSets = data?.sets || [];
      setSets(allSets);

      // Obtener el set activo
      const currentSet =
        allSets.find((s) => s.status === "in_progress") || allSets[0];

      setScores({
        teamA: currentSet?.teamAPoints || 0,
        teamB: currentSet?.teamBPoints || 0,
      });

      setLoading(false);
    });
  }, [id]);

  const handleFinishSet = async (setId: string) => {
    try {
      const { finishedSet, nextSet, allSets } = await finishSet(
        match.id,
        setId,
        scores.teamA,
        scores.teamB,
        scores.teamA > scores.teamB ? match.teamAId : match.teamBId
      );

      setSets(allSets);

      if (finishedSet.winnerId === match.teamAId) {
        setScores((prev) => ({ ...prev, teamA: prev.teamA + 1 }));
      } else if (finishedSet.winnerId === match.teamBId) {
        setScores((prev) => ({ ...prev, teamB: prev.teamB + 1 }));
      }

      setTimeout(() => {
        setScores({
          teamA: 0,
          teamB: 0,
        });
      }, 200);

      console.log("✅ Set finalizado:", finishedSet);
      console.log("➡️ Nuevo set iniciado:", nextSet);
    } catch (error) {
      console.error("Error finalizando set:", error);
    }
  };

  const handleUpdateSetScore = async (
    team: "teamA" | "teamB",
    delta: number
  ) => {
    try {
      const currentSet = sets.find((s) => s.status === "in_progress");
      if (!currentSet) return;

      const updatedSet = await updateSetScore(
        match.id,
        currentSet.id,
        team === "teamA"
          ? currentSet.teamAPoints + delta
          : currentSet.teamAPoints,
        team === "teamB"
          ? currentSet.teamBPoints + delta
          : currentSet.teamBPoints
      );

      // Actualiza estado local
      setSets((prev) =>
        prev.map((s) => (s.id === currentSet.id ? updatedSet : s))
      );

      setScores({
        teamA: updatedSet.teamAPoints,
        teamB: updatedSet.teamBPoints,
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !match) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400">
        Cargando encuentro...
      </div>
    );
  }

  const handleEndMatch = async (match: Match) => {
    const teamAWins = sets.filter((s) => s.winnerId === match.teamAId).length;
    const teamBWins = sets.filter((s) => s.winnerId === match.teamBId).length;

    const matchWinnerId = teamAWins > teamBWins ? match.teamAId : match.teamBId;
    const finishedMatch = await finishMatch(match.id, {
      status: "finished",
      winnerId: matchWinnerId,
    });
    console.log("✅ Encuentro finalizado:", finishedMatch);

    // Actualizar posiciones del torneo
    const updatedPositions = await getPositionsByTournamentId(match.tournamentId);
    setPositions(updatedPositions);

    // Redirigir a los detalles del torneo
    navigate(`/tournaments/${match.tournamentId}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white px-4">
      <Card className="w-full max-w-3xl">
        {/* 🏷️ Encabezado */}
        <div className="text-center border-b border-gray-700 pb-4 mb-4">
          <h1 className="text-2xl font-bold">
            {match.teamAName} <span className="text-primary">vs</span>{" "}
            {match.teamBName}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Estado:{" "}
            <span className="text-yellow-400 capitalize">
              {match.status == "in_progress" ? "En progreso" : match.status === "finished" ? "Finalizado" : "Pendiente"}
            </span>
          </p>
        </div>
        {/* Set Actual */}
        <div className="text-center mb-6">
          <p className="text-gray-400">{match.status === "in_progress" ? "Set Actual" : "Sets Finalizados"}</p>
          <h2 className="text-3xl font-semibold text-primary">
            #  {match.status === "in_progress" ? sets.filter((s) => s.status === "finished").length +1 : sets.filter((s) => s.status === "finished").length}
          </h2>
        </div>
        {/* 🔢 Marcador */}
        { match.status === "in_progress" && (
          <div className="flex items-center justify-center gap-10 my-6">
          <div className="text-center">
            <p className="text-lg font-semibold">{match.teamAName}</p>
            <p className="text-5xl font-bold text-primary">{scores.teamA}</p>
            <div className="flex gap-2 mt-2">
              <button
                className="px-3 py-2 bg-green-600 rounded-md hover:bg-green-500 text-white"
                onClick={() => handleUpdateSetScore("teamA", 1)} // sumar 1 punto
              >
                +
              </button>

              {/* Restar 1 punto */}
              {scores.teamA > 0 && (
                <button
                  className="px-3 py-2 bg-red-600 rounded-md hover:bg-red-500 text-white"
                  onClick={() => handleUpdateSetScore("teamA", -1)} // restar 1 punto
                >
                  -
                </button>
              )}
            </div>
          </div>

          <div className="text-3xl font-bold text-gray-400">-</div>

          <div className="text-center">
            <p className="text-lg font-semibold">{match.teamBName}</p>
            <p className="text-5xl font-bold text-primary">{scores.teamB}</p>
            <div className="flex gap-2 mt-2">
              <button
                className="px-3 py-2 bg-green-600 rounded-md hover:bg-green-500 text-white"
                onClick={() => handleUpdateSetScore("teamB", 1)}
              >
                +
              </button>

              {/* Restar 1 punto */}
              {scores.teamB > 0 && (
                <button
                  className="px-3 py-2 bg-red-600 rounded-md hover:bg-red-500 text-white"
                  onClick={() => handleUpdateSetScore("teamB", -1)}
                >
                  -
                </button>
              )}
            </div>
          </div>
        </div>
        )}
        {
          match.status === "in_progress" &&
          <div className="text-center">
            <Button
              variant="primary"
              onClick={() => handleFinishSet(sets[sets.length - 1].id)}
            >
              Finalizar Set
            </Button>
          </div>
        }

        {/* 🏐 Sets */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3 text-center text-gray-300">
            Resultados por set
          </h2>

          <div className="grid grid-cols-3 text-center text-sm bg-gray-800/40 rounded-lg py-2">
            <span className="font-medium">Set</span>
            <span className="font-medium">{match.teamAName}</span>
            <span className="font-medium">{match.teamBName}</span>
          </div>

          {sets
            .filter((s) => s.status === "finished")
            .map((s) => (
              <div
                key={s.id}
                className="grid grid-cols-3 text-center py-2 border-b border-gray-700/40"
              >
                <span className="text-gray-400">{s.setNumber}</span>
                <span>{s.teamAPoints}</span>
                <span>{s.teamBPoints}</span>
              </div>
            ))}
        </div>

        {/* ⚙️ Footer */}
        <div className="flex justify-between mt-8 pt-4 border-t border-gray-700">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-md border border-gray-600 hover:bg-gray-800"
          >
            ← Volver
          </button>

          {match.status === "in_progress" && (
            <button
            onClick={() => handleEndMatch(match)}
            className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-500 text-white"
          >
            Finalizar Encuentro
          </button>
          )}
        </div>
      </Card>
    </div>
  );
}
