import { ArrowLeft, RefreshCw, Truck } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/DataTable";
import TimeFilter from "../../components/TimeFilter";
import useFetch from "../../hooks/useFetch";

const statusColors = {
  PENDING:          "bg-orange-100 text-orange-600",
  OUT_FOR_DELIVERY: "bg-blue-100 text-blue-600",
};

const columns = [
  { key: "id",            label: "Order ID",  render: (v) => v?.slice(0, 8).toUpperCase() },
  { key: "customerName",  label: "Customer" },
  { key: "customerPhone", label: "Phone",     render: (v) => v ?? "—" },
  { key: "cylinderType",  label: "Type" },
  { key: "quantity",      label: "Qty" },
  { key: "amount",        label: "Amount",    render: (v) => `₹${v}` },
  { key: "assignedStaff", label: "Driver",    render: (v) => v?.name ?? "Unassigned" },
  {
    key: "status",
    label: "Status",
    render: (v) => (
      <span className={`px-2.5 py-1 rounded-full text-[12px] font-bold ${statusColors[v] || "bg-gray-100 text-gray-500"}`}>
        {v?.replace(/_/g, " ")}
      </span>
    ),
  },
  { key: "scheduledDeliveryDate", label: "Scheduled", render: (v) => v ? new Date(v).toLocaleDateString("en-IN") : "—" },
];

const getRangeStart = (range) => {
  const d = new Date();
  if (range === "24hr")  { d.setHours(d.getHours() - 24); return d; }
  if (range === "week")  { d.setDate(d.getDate() - 7);    return d; }
  if (range === "month") { d.setMonth(d.getMonth() - 1);  return d; }
  return null;
};

const AssignedPage = () => {
  const navigate = useNavigate();
  const [range, setRange] = useState("24hr");
  const { data, loading, error, refetch } = useFetch("/orders");

  const assigned = useMemo(() => {
    if (!Array.isArray(data)) return [];
    const start = getRangeStart(range);
    return data.filter((o) => {
      if (!["PENDING", "OUT_FOR_DELIVERY"].includes(o.status) || !o.assignedStaffId) return false;
      return start ? new Date(o.createdAt) >= start : true;
    });
  }, [data, range]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} className="text-gray-500" />
          </button>
          <div className="p-2.5 rounded-2xl bg-indigo-50">
            <Truck size={22} className="text-indigo-500" />
          </div>
          <div>
            <h2 className="text-[22px] font-bold text-[#1F2933]">Assigned Orders</h2>
            <p className="text-[13px] text-gray-400 font-medium">
              {loading ? "Loading..." : `${assigned.length} orders assigned`}
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
      <DataTable columns={columns} data={assigned} loading={loading} error={error} onRetry={refetch} emptyMessage="No assigned orders in this period" />
    </div>
  );
};

export default AssignedPage;
