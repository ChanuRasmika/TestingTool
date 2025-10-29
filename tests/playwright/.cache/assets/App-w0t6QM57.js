import { j as jsxRuntimeExports } from './jsx-runtime-CirYrYFd.js';
import { r as reactExports } from './index-CtAEwszi.js';
import Login from './Login-Bq69wFHC.js';
import Signup from './Signup-C5nUu0iU.js';
import Dashboard from './Dashboard-CJakxEyO.js';
import './TransactionForm-FBizvZsA.js';
import './TransactionList-D5kLQqRF.js';
import './ProfileForm-JRkw5gk6.js';

function App() {
  const [user, setUser] = reactExports.useState(null);
  const [currentView, setCurrentView] = reactExports.useState("login");
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
    }
    setLoading(false);
  }, []);
  const handleLogin = (userData) => {
    setUser(userData);
  };
  const handleSignup = (userData) => {
    setUser(userData);
  };
  const handleLogout = () => {
    setUser(null);
    setCurrentView("login");
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-gray-600", children: "Loading..." })
    ] }) });
  }
  if (user) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Dashboard, { user, onLogout: handleLogout });
  }
  if (currentView === "login") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Login,
      {
        onLogin: handleLogin,
        onSwitchToSignup: () => setCurrentView("signup")
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Signup,
    {
      onSignup: handleSignup,
      onSwitchToLogin: () => setCurrentView("login")
    }
  );
}

export { App as default };
//# sourceMappingURL=App-w0t6QM57.js.map
