import { ArrowLeft, CreditCard, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/DataTable";
import TimeFilter from "../../components/TimeFilter";
import useFetch from "../../hooks/useFetch";

const columns = [
  { key: "txnId",        label: "Txn ID",    render: (v) => v?.slice(0, 10).toUpperCase() },
  { key: "orderId",      label: "Order ID",  render: (v) => v?.slice(0, 8).toUpperCase() },
  { key: "customerName", label: "Customer" },
  { key: "driverName",   label: "Driver" },
  { key: "amount",       label: "Amount",    render: (v) => `₹${v}` },
  { key: "referenceId",  label: "UPI Ref",   render: (v) => v ?? "—" },
  {
    key: "timestamp",
    label: "Time",
    render: (v) => new Date(v).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }),
  },
];

const getRangeStart = (range) => {
  const d = new Date();
  if (range === "24hr")  { d.setHours(d.getHours() - 24); return d; }
  if (range === "week")  { d.setDate(d.getDate() - 7);    return d; }
  if (range === "month") { d.setMonth(d.getMonth() - 1);  return d; }
  return null;
};

const UpiPage = () => {
  const navigate = useNavigate();
  const [range, setRange] = useState("24hr");
  const { data, loading, error, refetch } = useFetch("/orders");

  const upiRows = useMemo(() => {
    if (!Array.isArray(data)) return [];
    const start = getRangeStart(range);
    return data.flatMap((o) =>
      (o.transactions ?? [])
        .filter((t) => {
          if (t.paymentType !== "UPI") return false;
          return start ? new Date(t.timestamp) >= start : true;
        })
        .map((t) => ({
          id: t.id, txnId: t.id, orderId: o.id,
          customerName: o.customerName,
          driverName: o.assignedStaff?.name ?? "—",
          amount: t.amount, referenceId: t.referenceId, timestamp: t.timestamp,
        }))
    );
  }, [data, range]);

  const total = upiRows.reduce((s, r) => s + (r.amount ?? 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} className="text-gray-500" />
          </button>
          <div className="p-2.5 rounded-2xl bg-purple-50">
            <CreditCard size={22} className="text-purple-500" />
          </div>
          <div>
            <h2 className="text-[22px] font-bold text-[#1F2933]">UPI Transactions</h2>
            <p className="text-[13px] text-gray-400 font-medium">
              {loading
                ? "Loading..."
                : <>{upiRows.length} transactions · Total <span className="text-[#1F2933] font-bold">₹{total}</span></>
              }
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
      <DataTable columns={columns} data={upiRows} loading={loading} error={error} onRetry={refetch} emptyMessage="No UPI transactions in this period" />
    </div>
  );
};

export default UpiPage;
