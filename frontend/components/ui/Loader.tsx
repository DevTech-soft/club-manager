import React, { useEffect, useState } from "react";

interface TournamentLoaderProps {
  loading: boolean;
}

export default function TournamentLoader({ loading }: TournamentLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Preparando sorteo...");

  useEffect(() => {
    let isActive = true;
    const runProgress = async () => {
      if (!loading) {
        setProgress(0);
        setStatusText("Preparando sorteo...");
        return;
      }

      setProgress(0);
      setStatusText("Iniciando sorteo...");

      // Simula progreso mientras el backend trabaja
      for (let i = 1; i <= 100; i++) {
        if (!isActive) return; // si se desmonta o termina antes
        await new Promise((r) => setTimeout(r, 50)); // delay
        setProgress(i);

        if (i === 20) setStatusText("Generando equipos...");
        if (i === 50) setStatusText("Creando grupos...");
        if (i === 80) setStatusText("Asignando posiciones...");
        if (i === 100) setStatusText("¡Sorteo completado!");
      }
    };

    runProgress();

    return () => {
      isActive = false;
    };
  }, [loading]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl p-8 w-96 text-center shadow-2xl text-white">
        <h2 className="text-xl font-bold mb-4">Generando sorteo...</h2>
        <div className="w-full bg-gray-700 rounded-full h-4 mb-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-400 h-4 rounded-full transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-300 animate-pulse">{statusText}</p>
      </div>
    </div>
  );
}
