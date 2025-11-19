import { j as jsxRuntimeExports } from './jsx-runtime-8pb9gxWL.js';
import { r as reactExports } from './index-X0j-QJCt.js';

function TransactionForm({ onTransactionAdded, onClose }) {
  const [formData, setFormData] = reactExports.useState({
    date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    description: "",
    amount: "",
    category: ""
  });
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const categories = ["Food", "Income", "Groceries", "Services", "Entertainment", "Transport", "Other"];
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount)
        })
      });
      const data = await response.json();
      if (response.ok) {
        onTransactionAdded(data);
        onClose();
      } else {
        setError(data.error || "Failed to create transaction");
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg p-6 w-full max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold", children: "Add Transaction" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "text-gray-500 hover:text-gray-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded", children: error }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "date",
            value: formData.date,
            onChange: (e) => setFormData({ ...formData, date: e.target.value }),
            className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Description" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            value: formData.description,
            onChange: (e) => setFormData({ ...formData, description: e.target.value }),
            className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500",
            placeholder: "Enter description",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Amount" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "number",
            step: "0.01",
            value: formData.amount,
            onChange: (e) => setFormData({ ...formData, amount: e.target.value }),
            className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500",
            placeholder: "Enter amount (negative for expenses)",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Category" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: formData.category,
            onChange: (e) => setFormData({ ...formData, category: e.target.value }),
            className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select category" }),
              categories.map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: cat, children: cat }, cat))
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex space-x-3 pt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: onClose,
            className: "flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "submit",
            disabled: loading,
            className: "flex-1 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:opacity-50",
            children: loading ? "Adding..." : "Add Transaction"
          }
        )
      ] })
    ] })
  ] }) });
}

export { TransactionForm as default };
//# sourceMappingURL=TransactionForm-CdaCKO8r.js.map
