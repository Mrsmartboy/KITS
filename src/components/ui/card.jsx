export const Card = ({ children, className }) => (
    <div className={`bg-white shadow-md rounded-md p-4 ${className}`}>{children}</div>
  );
  
  export const CardContent = ({ children }) => (
    <div className="p-4">{children}</div>
  );
  
  export const CardHeader = ({ children }) => (
    <div className="px-4 py-2 bg-gray-100 rounded-t-md">{children}</div>
  );
  