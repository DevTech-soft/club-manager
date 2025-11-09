import React, { useRef, useState } from "react";
import { CalendarIcon } from "lucide-react"; // usa cualquier icono que prefieras

const MatchDatePicker = ({ initialDate, onDateChange } : any) => {
  const [selectedDate, setSelectedDate] = useState(initialDate || "");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.showPicker?.(); // método nativo moderno
      inputRef.current.focus(); // fallback para navegadores sin showPicker
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    onDateChange?.(newDate);
  };

  return (
    <div className="flex items-center gap-2">
      {/* input oculto visualmente */}
      <input
        ref={inputRef}
        type="date"
        value={selectedDate}
        onChange={handleChange}
        className="hidden"
      />

      {/* botón principal */}
      <button
        type="button"
        onClick={handleButtonClick}
        className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-md"
      >
        {selectedDate ? (
          <>
            <span>{new Date(selectedDate).toLocaleDateString()}</span>
            <CalendarIcon size={18} />
          </>
        ) : (
          <>
            <span>+ Asignar fecha</span>
            <CalendarIcon size={18} />
          </>
        )}
      </button>
    </div>
  );
};

export default MatchDatePicker;
