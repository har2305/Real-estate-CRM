// components/Navbar.tsx
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

const linkBase = "px-2 py-1 rounded hover:text-indigo-600";
const active = "text-indigo-700 font-medium";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="w-full bg-white text-slate-900 px-6 py-3 flex justify-between items-center border-b border-slate-200">
      <NavLink to="/" className="text-xl font-bold text-indigo-700">
        Real-Estate-CRM App
      </NavLink>

      <div className="flex gap-3 items-center">
        <NavLink
          to="/"
          className={({ isActive }) => `${linkBase} ${isActive ? active : ""}`}
          end
        >
          Home
        </NavLink>

        {user ? (
          <>
            <NavLink
              to="/dashboard"
              className={({ isActive }) => `${linkBase} ${isActive ? active : ""}`}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/leads"
              className={({ isActive }) => `${linkBase} ${isActive ? active : ""}`}
            >
              Leads
            </NavLink>
            <NavLink
              to="/analytics"
              className={({ isActive }) => `${linkBase} ${isActive ? active : ""}`}
            >
              Analytics
            </NavLink>
            <NavLink
              to="/deleted-leads"
              className={({ isActive }) => `${linkBase} ${isActive ? active : ""}`}
            >
              Deleted Leads
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) => `${linkBase} ${isActive ? active : ""}`}
            >
              Profile
            </NavLink>
            <div className="flex items-center gap-2 border-l border-slate-200 pl-3 ml-2">
              <span className="text-sm text-slate-600">
                {user.full_name || user.email}
              </span>
              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="bg-rose-600 hover:bg-rose-700 px-3 py-1 rounded text-sm font-medium text-white"
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <NavLink
              to="/login"
              className={({ isActive }) => `${linkBase} ${isActive ? active : ""}`}
            >
              Login
            </NavLink>
            <NavLink
              to="/register"
              className={({ isActive }) => `${linkBase} ${isActive ? active : ""}`}
            >
              Register
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}
