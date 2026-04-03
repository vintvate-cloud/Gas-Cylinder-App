import { ArrowLeft, Clock, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/DataTable";
import useFetch from "../../hooks/useFetch";

const columns = [
  { key: "id",                    label: "Order ID",  render: (v) => v?.slice(0, 8).toUpperCase() },
  { key: "customerName",          label: "Customer" },
  { key: "customerPhone",         label: "Phone",     render: (v) => v ?? "—" },
  { key: "customerAddress",       label: "Address" },
  { key: "cylinderType",          label: "Type" },
  { key: "quantity",              label: "Qty" },
  { key: "amount",                label: "Amount",    render: (v) => `₹${v}` },
  { key: "assignedStaff",         label: "Driver",    render: (v) => v?.name ?? <span className="text-orange-500 text-[12px] font-semibold">Unassigned</span> },
  { key: "scheduledDeliveryDate", label: "Scheduled", render: (v) => v ? new Date(v).toLocaleDateString("en-IN") : "—" },
  { key: "createdAt",             label: "Created",   render: (v) => new Date(v).toLocaleDateString("en-IN") },
];

const PendingPage = () => {
  const navigate = useNavigate();
  // GET /api/orders returns all orders — filter PENDING client-side
  const { data, loading, error, refetch } = useFetch("/orders");
  const pending = Array.isArray(data) ? data.filter((o) => o.status === "PENDING") : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} className="text-gray-500" />
          </button>
          <div className="p-2.5 rounded-2xl bg-orange-50">
            <Clock size={22} className="text-orange-500" />
          </div>
          <div>
            <h2 className="text-[22px] font-bold text-[#1F2933]">Pending Orders</h2>
            <p className="text-[13px] text-gray-400 font-medium">{pending.length} orders pending</p>
          </div>
        </div>
        <button onClick={refetch} className="flex items-center gap-2 px-3 py-2 text-[13px] font-semibold text-gray-500 hover:text-[#1F2933] hover:bg-gray-100 rounded-xl transition-colors">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>
      <DataTable columns={columns} data={pending} loading={loading} error={error} onRetry={refetch} emptyMessage="No pending orders" />
    </div>
  );
};

export default PendingPage;
