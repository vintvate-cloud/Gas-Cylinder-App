import { ArrowLeft, RefreshCw, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/DataTable";
import TimeFilter from "../../components/TimeFilter";
import useFetch from "../../hooks/useFetch";

const statusColors = {
  "On Field": "bg-blue-100 text-blue-700",
  "Active":   "bg-green-100 text-green-700",
  "Offline":  "bg-gray-100 text-gray-500",
};

const columns = [
  { key: "name",          label: "Name" },
  { key: "phone",         label: "Phone",               render: (v) => v ?? "—" },
  { key: "vehicleNumber", label: "Vehicle",             render: (v) => v ?? "—" },
  { key: "totalOrders",   label: "Total Orders" },
  { key: "doneOrders",    label: "Delivered" },
  { key: "collection",    label: "Today's Collection",  render: (v) => `₹${v ?? 0}` },
  { key: "progress",      label: "Progress",            render: (v) => `${v ?? 0}%` },
  {
    key: "status",
    label: "Status",
    render: (v) => (
      <span className={`px-2.5 py-1 rounded-full text-[12px] font-bold ${statusColors[v] || statusColors.Offline}`}>
        {v}
      </span>
    ),
  },
];

const getRangeStart = (range) => {
  const d = new Date();
  if (range === "24hr")  { d.setHours(d.getHours() - 24); return d; }
  if (range === "week")  { d.setDate(d.getDate() - 7);    return d; }
  if (range === "month") { d.setMonth(d.getMonth() - 1);  return d; }
  return null;
};

const DriversPage = () => {
  const navigate = useNavigate();
  const [range, setRange] = useState("all");
  const { data, loading, error, refetch } = useFetch("/staff");

  const drivers = useMemo(() => {
    if (!Array.isArray(data)) return [];
    const start = getRangeStart(range);
    return data.filter((u) => {
      if (u.role !== "DRIVER") return false;
      return start ? new Date(u.createdAt) >= start : true;
    });
  }, [data, range]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} className="text-gray-500" />
          </button>
          <div className="p-2.5 rounded-2xl bg-blue-50">
            <Users size={22} className="text-blue-500" />
          </div>
          <div>
            <h2 className="text-[22px] font-bold text-[#1F2933]">Active Drivers</h2>
            <p className="text-[13px] text-gray-400 font-medium">
              {loading ? "Loading..." : `${drivers.length} drivers found`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TimeFilter value={range} onChange={setRange} />
          <button onClick={refetch} className="flex items-center gap-2 px-3 py-2 text-[13px] font-semibold text-gray-500 hover:text-[#1F2933] hover:bg-gray-100 rounded-xl transition-colors">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>
      <DataTable columns={columns} data={drivers} loading={loading} error={error} onRetry={refetch} emptyMessage="No drivers found in this period" />
    </div>
  );
};

export default DriversPage;
