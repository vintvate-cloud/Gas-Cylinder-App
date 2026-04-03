import { AlertCircle, Loader2, RefreshCw } from "lucide-react";

const DataTable = ({ columns, data, loading, error, emptyMessage = "No data found", onRetry }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 size={32} className="animate-spin text-[#00C853]" />
        <p className="text-[13px] text-gray-400 font-medium">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="p-4 rounded-2xl bg-red-50">
          <AlertCircle size={28} className="text-red-400" />
        </div>
        <p className="text-[15px] font-semibold text-red-500 text-center max-w-sm">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 bg-[#1F2933] text-white text-[13px] font-bold rounded-xl hover:bg-gray-700 transition-colors"
          >
            <RefreshCw size={14} /> Retry
          </button>
        )}
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2 text-gray-400">
        <p className="text-[15px] font-semibold">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB]">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-[#E5E7EB]">
            {columns.map((col) => (
              <th key={col.key} className="px-5 py-3.5 text-left text-[12px] font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((row, i) => (
            <tr key={row.id || i} className="bg-white hover:bg-gray-50/80 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="px-5 py-3.5 text-[14px] text-[#1F2933] whitespace-nowrap">
                  {col.render ? col.render(row[col.key], row) : (row[col.key] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
