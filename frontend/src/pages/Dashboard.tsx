import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto mt-12">
      <h1 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">
        Welcome, {user?.email ?? "User"}
      </h1>
      <p className="text-slate-600 mb-6">
        Quick links to manage your CRM data.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          to="/leads"
          className="block rounded-xl border border-slate-200 bg-white p-6 hover:border-indigo-300 shadow"
        >
          <h2 className="text-xl font-semibold mb-2 text-slate-900">Leads</h2>
          <p className="text-slate-600">Browse and manage your leads.</p>
        </Link>

        <Link
          to="/leads/new"
          className="block rounded-xl border border-slate-200 bg-white p-6 hover:border-indigo-300 shadow"
        >
          <h2 className="text-xl font-semibold mb-2 text-slate-900">Add Lead</h2>
          <p className="text-slate-600">Create a new lead from a form.</p>
        </Link>
      </div>
    </div>
  );
}
