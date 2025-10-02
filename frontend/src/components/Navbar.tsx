// components/Navbar.tsx
import React from "react";
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
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="bg-rose-600 hover:bg-rose-700 px-3 py-1 rounded text-sm font-medium text-white"
            >
              Logout
            </button>
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
