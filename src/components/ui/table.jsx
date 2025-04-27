export const Table = ({ children }) => (
    <table className="min-w-full border-collapse">{children}</table>
  );
  
  export const TableHeader = ({ children }) => (
    <thead className="bg-gray-100">{children}</thead>
  );
  
  export const TableRow = ({ children }) => (
    <tr className="border-b">{children}</tr>
  );
  
  export const TableHead = ({ children }) => (
    <th className="px-4 py-2 text-left text-sm font-semibold">{children}</th>
  );
  
  export const TableCell = ({ children }) => (
    <td className="px-4 py-2 text-sm">{children}</td>
  );
  
  export const TableBody = ({ children }) => <tbody>{children}</tbody>;
  