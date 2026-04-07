import {
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Edit,
  Eye,
  Filter,
  IndianRupee,
  Loader2,
  MapPin,
  MoreHorizontal,
  Package,
  Phone,
  Search,
  Trash2,
  Truck,
  User,
  UserPlus,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../services/api";

// ── constants ─────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = ["PENDING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

const STATUS_STYLE = {
  DELIVERED:        "bg-[#E8F5E9] text-[#00C853]",
  OUT_FOR_DELIVERY: "bg-[#EBF5FF] text-[#3B82F6]",
  PENDING:          "bg-orange-50 text-orange-500",
  CANCELLED:        "bg-red-50 text-red-500",
};

const STATUS_ICON = {
  DELIVERED:        <CheckCircle2 size={12} />,
  OUT_FOR_DELIVERY: <Truck size={12} />,
  PENDING:          <Clock size={12} />,
  CANCELLED:        <XCircle size={12} />,
};

// ── Modal wrapper ─────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children, maxWidth = "max-w-xl" }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
    <div className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[90vh] flex flex-col`}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 className="text-[17px] font-bold text-[#1F2933]">{title}</h3>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600">
          <X size={18} />
        </button>
      </div>
      <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
    </div>
  </div>
);

// ── Detail row helper ─────────────────────────────────────────────────────────
const DetailRow = ({ icon: Icon, label, value, valueClass = "" }) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
    <div className="p-2 rounded-xl bg-gray-50 shrink-0">
      <Icon size={15} className="text-gray-400" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className={`text-[14px] font-semibold text-[#1F2933] break-words ${valueClass}`}>{value || "—"}</p>
    </div>
  </div>
);

// ── View Modal ────────────────────────────────────────────────────────────────
const ViewModal = ({ order, onClose }) => {
  const paid = order.transactions?.length > 0;
  const txn  = order.transactions?.[0];

  return (
    <Modal title={`Order #${order.id.slice(0, 8).toUpperCase()}`} onClose={onClose}>
      {/* Status badge */}
      <div className="flex items-center gap-2 mb-5">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border border-transparent ${STATUS_STYLE[order.status]}`}>
          {STATUS_ICON[order.status]}
          {order.status.replace(/_/g, " ")}
        </span>
        <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${paid ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}>
          {paid ? "PAID" : "UNPAID"}
        </span>
      </div>

      <div className="space-y-0 divide-y divide-gray-50">
        <DetailRow icon={User}        label="Customer Name"   value={order.customerName} />
        <DetailRow icon={Phone}       label="Phone"           value={order.customerPhone} />
        <DetailRow icon={MapPin}      label="Address"         value={order.customerAddress} />
        <DetailRow icon={Package}     label="Cylinder"        value={`${order.cylinderType} × ${order.quantity}`} />
        <DetailRow icon={IndianRupee} label="Order Amount"    value={`₹${order.amount}`} />
        <DetailRow icon={Truck}       label="Assigned Driver" value={order.assignedStaff?.name} />
        <DetailRow icon={Calendar}    label="Scheduled Date"  value={order.scheduledDeliveryDate ? new Date(order.scheduledDeliveryDate).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : null} />
        <DetailRow icon={CreditCard}  label="Payment Method"  value={txn?.paymentType ?? "N/A"} />
        {txn?.amount && <DetailRow icon={IndianRupee} label="Amount Paid" value={`₹${txn.amount}`} />}
        {txn?.referenceId && <DetailRow icon={CreditCard} label="UPI Reference" value={txn.referenceId} />}
        <DetailRow icon={Clock}       label="Created At"      value={new Date(order.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })} />
      </div>
    </Modal>
  );
};

// ── Edit Modal ────────────────────────────────────────────────────────────────
const EditModal = ({ order, drivers, onClose, onSave }) => {
  const [form, setForm] = useState({
    customerName:         order.customerName,
    customerPhone:        order.customerPhone ?? "",
    customerAddress:      order.customerAddress,
    assignedStaffId:      order.assignedStaffId ?? "",
    status:               order.status,
    scheduledDeliveryDate: order.scheduledDeliveryDate
      ? new Date(order.scheduledDeliveryDate).toISOString().slice(0, 16)
      : "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        assignedStaffId:      form.assignedStaffId || null,
        scheduledDeliveryDate: form.scheduledDeliveryDate || null,
      };
      const res = await api.patch(`/orders/${order.id}`, payload);
      onSave({ ...order, ...payload, assignedStaff: drivers.find((d) => d.id === form.assignedStaffId) ?? order.assignedStaff });
      toast.success("Order updated successfully");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update order");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-[14px] text-[#1F2933] font-medium focus:outline-none focus:ring-2 focus:ring-[#00C853]/30 focus:border-[#00C853] transition-all bg-white";
  const labelCls = "block text-[12px] font-bold text-gray-500 uppercase tracking-wide mb-1.5";

  return (
    <Modal title="Edit Order" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Customer Name</label>
            <input className={inputCls} value={form.customerName} onChange={(e) => set("customerName", e.target.value)} required />
          </div>
          <div>
            <label className={labelCls}>Phone</label>
            <input className={inputCls} value={form.customerPhone} onChange={(e) => set("customerPhone", e.target.value)} />
          </div>
        </div>

        <div>
          <label className={labelCls}>Delivery Address</label>
          <textarea className={`${inputCls} resize-none`} rows={2} value={form.customerAddress} onChange={(e) => set("customerAddress", e.target.value)} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Status</label>
            <select className={inputCls} value={form.status} onChange={(e) => set("status", e.target.value)}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Assign Driver</label>
            <select className={inputCls} value={form.assignedStaffId} onChange={(e) => set("assignedStaffId", e.target.value)}>
              <option value="">Unassigned</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls}>Scheduled Date & Time</label>
          <input type="datetime-local" className={inputCls} value={form.scheduledDeliveryDate} onChange={(e) => set("scheduledDeliveryDate", e.target.value)} />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-[14px] font-bold text-gray-500 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-[#00C853] hover:bg-[#00B248] text-white rounded-xl text-[14px] font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
            {saving && <Loader2 size={15} className="animate-spin" />}
            {saving ? "Saving..." : "Update Order"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ── Delete Confirm Modal ──────────────────────────────────────────────────────
const DeleteModal = ({ order, onClose, onConfirm }) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      // Backend has no DELETE route — use PATCH to set status CANCELLED
      await api.patch(`/orders/${order.id}`, { status: "CANCELLED" });
      onConfirm(order.id);
      toast.success("Order cancelled successfully");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel order");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal title="Cancel Order" onClose={onClose} maxWidth="max-w-sm">
      <div className="text-center py-2">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={24} className="text-red-500" />
        </div>
        <p className="text-[15px] font-semibold text-[#1F2933] mb-1">Cancel this order?</p>
        <p className="text-[13px] text-gray-400 mb-1">
          Order <span className="font-bold text-[#1F2933]">#{order.id.slice(0, 8).toUpperCase()}</span>
        </p>
        <p className="text-[13px] text-gray-400 mb-6">for <span className="font-semibold">{order.customerName}</span> will be marked as cancelled.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-[14px] font-bold text-gray-500 hover:bg-gray-50 transition-colors">
            Keep Order
          </button>
          <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[14px] font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
            {deleting && <Loader2 size={15} className="animate-spin" />}
            {deleting ? "Cancelling..." : "Yes, Cancel"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const OrderManagement = () => {
  const [orders, setOrders]               = useState([]);
  const [drivers, setDrivers]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [searchQuery, setSearchQuery]     = useState("");
  const [statusFilter, setStatusFilter]   = useState("");
  const [openDropdown, setOpenDropdown]   = useState(null);
  const [viewOrder, setViewOrder]         = useState(null);
  const [editOrder, setEditOrder]         = useState(null);
  const [deleteOrder, setDeleteOrder]     = useState(null);
  const dropdownRef = useRef(null);

  // close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setOpenDropdown(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const [ordersRes, staffRes] = await Promise.all([
        api.get("/orders"),
        api.get("/staff"),
      ]);
      setOrders(ordersRes.data);
      setDrivers(staffRes.data.filter((s) => s.role === "DRIVER"));
    } catch (err) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  // ── handlers ────────────────────────────────────────────────────────────────
  const handleSaveEdit = (updated) => {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o)));
  };

  const handleConfirmDelete = (id) => {
    // optimistic: mark as CANCELLED in UI (backend does PATCH status=CANCELLED)
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: "CANCELLED" } : o));
  };

  const toggleOrderSelection = (id) =>
    setSelectedOrders((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);

  const openAction = (action, order) => {
    setOpenDropdown(null);
    if (action === "view")   setViewOrder(order);
    if (action === "edit")   setEditOrder(order);
    if (action === "delete") setDeleteOrder(order);
  };

  // ── filter ──────────────────────────────────────────────────────────────────
  const filteredOrders = orders.filter((o) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = o.customerName.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q) ||
      o.customerPhone?.includes(q);
    const matchStatus = !statusFilter || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-[#1F2933]">Order Management</h2>
          <p className="text-gray-500 mt-1 text-sm">Track customer orders and manage driver assignments</p>
        </div>
        {selectedOrders.length > 0 && (
          <button className="bg-[#00C853] hover:bg-[#00B248] text-white font-bold px-5 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm text-[13px]">
            <UserPlus size={16} strokeWidth={2.5} />
            Assign {selectedOrders.length} Orders
          </button>
        )}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
        style={{ boxShadow: "0 1px 3px 0 rgba(0,0,0,0.04)" }}>

        {/* Search & Filter */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-3 items-center flex-1 max-w-2xl">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" placeholder="Search by name, ID or phone..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg py-2 pl-9 pr-4 text-[#1F2933] placeholder-gray-400 focus:ring-1 focus:ring-[#00C853] focus:border-[#00C853] outline-none text-[13px] font-medium" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg py-2 px-3 text-[#1F2933] text-[13px] font-semibold focus:ring-1 focus:ring-[#00C853] focus:border-[#00C853] outline-none">
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div className="flex items-center gap-2 text-[13px] text-gray-400 font-medium">
            <Filter size={14} />
            {filteredOrders.length} orders
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
            <Loader2 size={24} className="animate-spin text-[#00C853]" />
            <span className="text-[14px] font-medium">Loading orders...</span>
          </div>
        ) : (
          <div className="overflow-x-auto" ref={dropdownRef}>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                  <th className="px-5 py-3.5 w-10">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#00C853] focus:ring-[#00C853]"
                      onChange={(e) => setSelectedOrders(e.target.checked ? orders.map((o) => o.id) : [])} />
                  </th>
                  <th className="px-5 py-3.5">Order / Customer</th>
                  <th className="px-5 py-3.5">Address</th>
                  <th className="px-5 py-3.5">Scheduled</th>
                  <th className="px-5 py-3.5">Cylinder</th>
                  <th className="px-5 py-3.5">Driver</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Payment</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrders.map((order) => (
                  <tr key={order.id}
                    className={`hover:bg-gray-50/70 transition-colors group ${selectedOrders.includes(order.id) ? "bg-blue-50/40" : ""}`}>
                    <td className="px-5 py-4">
                      <input type="checkbox" checked={selectedOrders.includes(order.id)}
                        onChange={() => toggleOrderSelection(order.id)}
                        className="w-4 h-4 rounded border-gray-300 text-[#00C853] focus:ring-[#00C853]" />
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-[11px] font-mono text-gray-400 mb-0.5">#{order.id.slice(0, 8)}</p>
                      <p className="font-semibold text-[#1F2933] text-[14px]">{order.customerName}</p>
                      <p className="text-gray-400 text-[12px]">{order.customerPhone}</p>
                    </td>
                    <td className="px-5 py-4 min-w-[180px]">
                      <div className="flex items-start gap-1.5 text-gray-500">
                        <MapPin size={13} className="mt-0.5 shrink-0" />
                        <span className="text-[13px] line-clamp-2">{order.customerAddress}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {order.scheduledDeliveryDate ? (
                        <>
                          <p className="text-[13px] font-medium text-[#1F2933]">
                            {new Date(order.scheduledDeliveryDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            {new Date(order.scheduledDeliveryDate).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </>
                      ) : <span className="text-gray-400 text-[12px]">Not scheduled</span>}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Package size={13} className="text-gray-400" />
                        <span className="text-[13px] font-medium text-gray-600">{order.cylinderType} × {order.quantity}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {order.assignedStaff ? (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#1F2933] flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                            {order.assignedStaff.name.charAt(0)}
                          </div>
                          <span className="text-[13px] font-medium text-gray-600">{order.assignedStaff.name}</span>
                        </div>
                      ) : (
                        <span className="text-[12px] text-gray-400 font-medium">Unassigned</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-transparent text-[10px] font-bold ${STATUS_STYLE[order.status] || "bg-gray-100 text-gray-500"}`}>
                        {STATUS_ICON[order.status]}
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className={`text-[12px] font-bold ${order.transactions?.length > 0 ? "text-emerald-600" : "text-amber-600"}`}>
                        {order.transactions?.length > 0 ? "PAID" : "UNPAID"}
                      </p>
                      <p className="text-[11px] text-gray-400 font-medium">{order.transactions?.[0]?.paymentType || "—"}</p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={() => setOpenDropdown(openDropdown === order.id ? null : order.id)}
                          className="p-1.5 text-gray-400 hover:text-[#1F2933] hover:bg-gray-100 rounded-lg transition-all">
                          <MoreHorizontal size={18} />
                        </button>
                        {openDropdown === order.id && (
                          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl py-1.5 z-20 min-w-[150px]"
                            style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.12)" }}>
                            <button onClick={() => openAction("view", order)}
                              className="w-full px-4 py-2 text-left text-[13px] text-gray-600 hover:bg-gray-50 hover:text-[#1F2933] flex items-center gap-2.5 transition-colors font-medium">
                              <Eye size={14} className="text-blue-500" /> View Details
                            </button>
                            <button onClick={() => openAction("edit", order)}
                              className="w-full px-4 py-2 text-left text-[13px] text-gray-600 hover:bg-gray-50 hover:text-[#1F2933] flex items-center gap-2.5 transition-colors font-medium">
                              <Edit size={14} className="text-[#00C853]" /> Edit Order
                            </button>
                            <div className="my-1 border-t border-gray-100" />
                            <button onClick={() => openAction("delete", order)}
                              className="w-full px-4 py-2 text-left text-[13px] text-red-500 hover:bg-red-50 flex items-center gap-2.5 transition-colors font-medium">
                              <Trash2 size={14} /> Cancel Order
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredOrders.length === 0 && (
              <div className="py-16 text-center">
                <Package size={32} className="text-gray-200 mx-auto mb-3" />
                <p className="text-[15px] font-semibold text-gray-400">No orders found</p>
                <p className="text-[13px] text-gray-300 mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {viewOrder   && <ViewModal   order={viewOrder}   onClose={() => setViewOrder(null)} />}
      {editOrder   && <EditModal   order={editOrder}   drivers={drivers} onClose={() => setEditOrder(null)}   onSave={handleSaveEdit} />}
      {deleteOrder && <DeleteModal order={deleteOrder} onClose={() => setDeleteOrder(null)} onConfirm={handleConfirmDelete} />}
    </div>
  );
};

export default OrderManagement;
