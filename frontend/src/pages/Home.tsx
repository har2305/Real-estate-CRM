import React from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { useAuth } from "../auth/useAuth";

export default function Home() {
  const { user } = useAuth();
  return (
    <div className="mx-auto max-w-6xl pt-16">
      {/* Hero */}
      <section className="text-center">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-slate-900">
          Manage leads with clarity.
        </h1>
        <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
          A focused Real-Estate-CRM to capture, track, and convert — without the clutter.
        </p>

        {!user ? (
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link to="/register">
              <Button className="px-5 py-2.5">Get started</Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" className="px-5 py-2.5">
                Sign in
              </Button>
            </Link>
          </div>
        ) : (
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link to="/dashboard">
              <Button className="px-5 py-2.5">Go to Dashboard</Button>
            </Link>
            <Link to="/leads">
              <Button variant="secondary" className="px-5 py-2.5">View Leads</Button>
            </Link>
          </div>
        )}
      </section>

      {/* Highlights */}
      <section className="mt-14 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <h3 className="text-lg font-medium text-slate-900">Simple</h3>
            <p className="text-sm text-slate-600 mt-2">
              Minimal screens, fast actions, no distractions.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <h3 className="text-lg font-medium text-slate-900">Secure</h3>
            <p className="text-sm text-slate-600 mt-2">
              Token-based auth and protected routes by default.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <h3 className="text-lg font-medium text-slate-900">Productive</h3>
            <p className="text-sm text-slate-600 mt-2">
              Quickly add, view, and update leads in a few clicks.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Footer-ish */}
      <section className="mt-16 text-center text-xs text-slate-500">
        Built with React, Vite, Tailwind, and Axios.
      </section>
    </div>
  );
}
