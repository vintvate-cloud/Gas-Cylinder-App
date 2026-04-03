import { ArrowLeft, PackageCheck, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/DataTable";
import useFetch from "../../hooks/useFetch";

const columns = [
  { key: "id",            label: "Order ID",    render: (v) => v?.slice(0, 8).toUpperCase() },
  { key: "customerName",  label: "Customer" },
  { key: "customerPhone", label: "Phone",       render: (v) => v ?? "—" },
  { key: "cylinderType",  label: "Type" },
  { key: "quantity",      label: "Qty" },
  { key: "amount",        label: "Amount",      render: (v) => `₹${v}` },
  { key: "assignedStaff", label: "Driver",      render: (v) => v?.name ?? "—" },
  {
    key: "transactions",
    label: "Payment",
    render: (v) => v?.[0]?.paymentType
      ? <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-700">{v[0].paymentType}</span>
      : <span className="text-gray-400 text-[12px]">—</span>,
  },
  { key: "updatedAt", label: "Delivered At", render: (v) => new Date(v).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) },
];

const DeliveredPage = () => {
  const navigate = useNavigate();
  // GET /api/orders returns all orders — filter DELIVERED + today client-side
  const { data, loading, error, refetch } = useFetch("/orders");

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const delivered = Array.isArray(data)
    ? data.filter((o) => o.status === "DELIVERED" && new Date(o.updatedAt) >= todayStart)
    : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} className="text-gray-500" />
          </button>
          <div className="p-2.5 rounded-2xl bg-[#E8F5E9]">
            <PackageCheck size={22} className="text-[#00C853]" />
          </div>
          <div>
            <h2 className="text-[22px] font-bold text-[#1F2933]">Delivered Orders</h2>
            <p className="text-[13px] text-gray-400 font-medium">{delivered.length} deliveries today</p>
          </div>
        </div>
        <button onClick={refetch} className="flex items-center gap-2 px-3 py-2 text-[13px] font-semibold text-gray-500 hover:text-[#1F2933] hover:bg-gray-100 rounded-xl transition-colors">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>
      <DataTable columns={columns} data={delivered} loading={loading} error={error} onRetry={refetch} emptyMessage="No deliveries today" />
    </div>
  );
};

export default DeliveredPage;
