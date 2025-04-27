export const Select = ({ value, onValueChange, children }) => {
    return (
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {children}
        </select>
      </div>
    );
  };
  
  export const SelectTrigger = ({ children }) => <>{children}</>;
  export const SelectContent = ({ children }) => <>{children}</>;
  export const SelectItem = ({ children, value }) => (
    <option value={value}>{children}</option>
  );
  export const SelectValue = ({ placeholder }) => <>{placeholder}</>;
  