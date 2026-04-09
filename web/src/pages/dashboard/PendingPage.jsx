import { ArrowLeft, Clock, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/DataTable";
import TimeFilter from "../../components/TimeFilter";
import useFetch from "../../hooks/useFetch";

const columns = [
  { key: "id",                    label: "Order ID",  render: (v) => v?.slice(0, 8).toUpperCase() },
  { key: "customerName",          label: "Customer" },
  { key: "customerPhone",         label: "Phone",     render: (v) => v ?? "—" },
  { key: "customerAddress",       label: "Address" },
  { key: "cylinderType",          label: "Type" },
  { key: "quantity",              label: "Qty" },
  { key: "amount",                label: "Amount",    render: (v) => `₹${v}` },
  {
    key: "assignedStaff",
    label: "Driver",
    render: (v) => v?.name ?? <span className="text-orange-500 text-[12px] font-semibold">Unassigned</span>,
  },
  { key: "scheduledDeliveryDate", label: "Scheduled", render: (v) => v ? new Date(v).toLocaleDateString("en-IN") : "—" },
  { key: "createdAt",             label: "Created",   render: (v) => new Date(v).toLocaleDateString("en-IN") },
];

const getRangeStart = (range) => {
  const d = new Date();
  if (range === "24hr")  { d.setHours(d.getHours() - 24); return d; }
  if (range === "week")  { d.setDate(d.getDate() - 7);    return d; }
  if (range === "month") { d.setMonth(d.getMonth() - 1);  return d; }
  return null;
};

const PendingPage = () => {
  const navigate = useNavigate();
  const [range, setRange] = useState("24hr");
  const { data, loading, error, refetch } = useFetch("/orders");

  const pending = useMemo(() => {
    if (!Array.isArray(data)) return [];
    const start = getRangeStart(range);
    return data.filter((o) => {
      if (o.status !== "PENDING") return false;
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
          <div className="p-2.5 rounded-2xl bg-orange-50">
            <Clock size={22} className="text-orange-500" />
          </div>
          <div>
            <h2 className="text-[22px] font-bold text-[#1F2933]">Pending Orders</h2>
            <p className="text-[13px] text-gray-400 font-medium">
              {loading ? "Loading..." : `${pending.length} orders pending`}
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
      <DataTable columns={columns} data={pending} loading={loading} error={error} onRetry={refetch} emptyMessage="No pending orders in this period" />
    </div>
  );
};

export default PendingPage;
