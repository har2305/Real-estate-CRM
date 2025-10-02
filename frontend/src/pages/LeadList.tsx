import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";
import Spinner from "../components/ui/Spinner";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import StatusBadge from "../components/ui/StatusBadge";
import Input from "../components/ui/Input";
import { Card, CardContent } from "../components/ui/Card";
import type { AxiosError } from "axios";

interface Lead {
  id: number;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  status?: string;
  budget_min?: number | null;
  budget_max?: number | null;
  created_at?: string;
}

interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export default function LeadList() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      try {
        const response = await api.get("/leads/", {
          params: {
            page,
            page_size: pageSize,
            search: q || undefined,
            status: statusFilter !== "all" ? statusFilter : undefined,
          },
        });
        
        const responseData = response.data as Paginated<Lead> | Lead[];
        
        // Handle both paginated and direct array responses
        if (Array.isArray(responseData)) {
          setLeads(responseData);
          setTotal(responseData.length);
        } else if (responseData && Array.isArray(responseData.results)) {
          setLeads(responseData.results);
          setTotal(responseData.count);
        } else {
          setLeads([]);
          setTotal(0);
        }
      } catch (error) {
        const axiosError = error as AxiosError<{ detail?: string }>;
        setError(axiosError.response?.data?.detail ?? "Failed to load leads");
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [page, q, statusFilter]);

  const filtered = leads; // server-side filtering/search


  return (
    <div className="max-w-6xl mx-auto mt-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Leads</h1>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Search leads…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            className="w-64"
          />
          <Link to="/leads/new">
            <Button>+ New Lead</Button>
          </Link>
        </div>
      </div>

      {/* Status filter chips */}
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { key: "all", label: "All" },
          { key: "new", label: "New" },
          { key: "contacted", label: "Contacted" },
          { key: "qualified", label: "Qualified" },
          { key: "negotiation", label: "Negotiation" },
          { key: "closed", label: "Closed" },
          { key: "lost", label: "Lost" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => { setStatusFilter(f.key); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-sm border ${
              statusFilter === f.key
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && (
        <Card>
          <CardContent>
            <div className="flex items-center gap-2">
              <Spinner /> <span className="text-gray-300">Loading leads…</span>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && error && <Alert className="mb-4">{error}</Alert>}

      {!loading && !error && filtered.length === 0 && (
        <Card>
          <CardContent className="text-gray-400">No leads found.</CardContent>
        </Card>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="overflow-x-auto border border-slate-200 rounded-xl shadow">
          <table className="min-w-full text-left">
            <thead className="bg-slate-800">
              <tr>
                <th className="p-3 text-white">Name</th>
                <th className="p-3 text-white">Email</th>
                <th className="p-3 text-white">Phone</th>
                <th className="p-3 text-white">Status</th>
                <th className="p-3 text-white">Budget</th>
                <th className="p-3 text-white">Created</th>
                <th className="p-3 text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id} className="border-t border-slate-200 hover:bg-slate-50">
                  <td className="p-3 text-slate-900 font-medium">
                    {l.full_name ?? `${l.first_name ?? ""} ${l.last_name ?? ""}`.trim()}
                  </td>
                  <td className="p-3 text-slate-700">{l.email ?? "-"}</td>
                  <td className="p-3 text-slate-700">{l.phone ?? "-"}</td>
                  <td className="p-3">
                    <StatusBadge status={l.status ?? "new"} />
                  </td>
                  <td className="p-3 text-slate-700">
                    {l.budget_min != null || l.budget_max != null
                      ? `${l.budget_min ?? "-"} - ${l.budget_max ?? "-"}`
                      : "-"}
                  </td>
                  <td className="p-3 text-slate-700">
                    {l.created_at ? new Date(l.created_at).toLocaleDateString() : "-"}
                  </td>
                  <td className="p-3">
                    <Link to={`/leads/${l.id}`} className="text-indigo-600 hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && (
        <div className="flex items-center justify-between mt-4 text-sm text-slate-600">
          <div>
            Page {page} • {(total || 0) > 0 ? `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} of ${total}` : "0"}
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              onClick={() => setPage((p) => p + 1)}
              disabled={page * pageSize >= total}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
