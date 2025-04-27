export const Calendar = ({ selected, onSelect, className }) => (
    <input
      type="date"
      value={selected.toISOString().split("T")[0]}
      onChange={(e) => onSelect(new Date(e.target.value))}
      className={`${className} w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
    />
  );
  