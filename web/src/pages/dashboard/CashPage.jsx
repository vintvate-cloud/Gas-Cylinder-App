import { ArrowLeft, IndianRupee, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/DataTable";
import useFetch from "../../hooks/useFetch";

const columns = [
  { key: "txnId",        label: "Txn ID",    render: (v) => v?.slice(0, 10).toUpperCase() },
  { key: "orderId",      label: "Order ID",  render: (v) => v?.slice(0, 8).toUpperCase() },
  { key: "customerName", label: "Customer" },
  { key: "driverName",   label: "Driver" },
  { key: "amount",       label: "Amount",    render: (v) => `₹${v}` },
  { key: "timestamp",    label: "Time",      render: (v) => new Date(v).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) },
];

const CashPage = () => {
  const navigate = useNavigate();
  // GET /api/orders includes transactions[] — extract CASH txns from today client-side
  const { data, loading, error, refetch } = useFetch("/orders");

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const cashRows = Array.isArray(data)
    ? data.flatMap((o) =>
        (o.transactions ?? [])
          .filter((t) => t.paymentType === "CASH" && new Date(t.timestamp) >= todayStart)
          .map((t) => ({
            id: t.id,
            txnId: t.id,
            orderId: o.id,
            customerName: o.customerName,
            driverName: o.assignedStaff?.name ?? "—",
            amount: t.amount,
            timestamp: t.timestamp,
          }))
      )
    : [];

  const total = cashRows.reduce((s, r) => s + (r.amount ?? 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} className="text-gray-500" />
          </button>
          <div className="p-2.5 rounded-2xl bg-cyan-50">
            <IndianRupee size={22} className="text-cyan-500" />
          </div>
          <div>
            <h2 className="text-[22px] font-bold text-[#1F2933]">Cash Transactions</h2>
            <p className="text-[13px] text-gray-400 font-medium">
              {cashRows.length} transactions · Total <span className="text-[#1F2933] font-bold">₹{total}</span>
            </p>
          </div>
        </div>
        <button onClick={refetch} className="flex items-center gap-2 px-3 py-2 text-[13px] font-semibold text-gray-500 hover:text-[#1F2933] hover:bg-gray-100 rounded-xl transition-colors">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>
      <DataTable columns={columns} data={cashRows} loading={loading} error={error} onRetry={refetch} emptyMessage="No cash transactions today" />
    </div>
  );
};

export default CashPage;
