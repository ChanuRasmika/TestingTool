import { j as jsxRuntimeExports } from './jsx-runtime-8pb9gxWL.js';
import './index-X0j-QJCt.js';

function TransactionList({ transactions }) {
  const formatAmount = (amount) => {
    const formatted = Math.abs(amount).toFixed(2);
    return amount >= 0 ? `+$${formatted}` : `-$${formatted}`;
  };
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };
  if (!transactions || transactions.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center text-gray-500 py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "mx-auto h-12 w-12 text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-2 text-sm font-medium text-gray-900", children: "No transactions yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-gray-500", children: "Get started by making your first transaction." })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: transactions.map((transaction) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4 bg-gray-50 rounded-lg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-10 h-10 rounded-full flex items-center justify-center ${transaction.amount >= 0 ? "bg-green-100" : "bg-red-100"}`, children: transaction.amount >= 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-5 h-5 text-green-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 6v6m0 0v6m0-6h6m-6 0H6" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-5 h-5 text-red-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M20 12H4" }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-gray-900", children: transaction.description }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2 text-sm text-gray-500", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatDate(transaction.date) }),
          transaction.category && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "•" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-1 bg-gray-200 rounded-full text-xs", children: transaction.category })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-lg font-semibold ${transaction.amount >= 0 ? "text-green-600" : "text-red-600"}`, children: formatAmount(transaction.amount) })
  ] }, transaction.id)) });
}

export { TransactionList as default };
//# sourceMappingURL=TransactionList-CsGIMqSL.js.map
