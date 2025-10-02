import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import Spinner from "../components/ui/Spinner";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import StatusBadge from "../components/ui/StatusBadge";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
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
  updated_at?: string;
}

export default function DeletedLeads() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [restoring, setRestoring] = useState<number | null>(null);

  useEffect(() => {
    const fetchDeletedLeads = async () => {
      setLoading(true);
      try {
        // Get all leads including soft-deleted ones
        const response = await api.get("/leads/?is_active=false");
        const responseData = response.data;
        
        // Handle both paginated and direct array responses
        if (Array.isArray(responseData)) {
          setLeads(responseData);
        } else if (responseData && Array.isArray(responseData.results)) {
          setLeads(responseData.results);
        } else {
          setLeads([]);
        }
      } catch (error) {
        const axiosError = error as AxiosError<{ detail?: string }>;
        setError(axiosError.response?.data?.detail ?? "Failed to load deleted leads");
      } finally {
        setLoading(false);
      }
    };

    fetchDeletedLeads();
  }, []);

  const handleRestore = async (leadId: number) => {
    if (!confirm("Restore this lead?")) return;
    
    setRestoring(leadId);
    try {
      await api.post(`/leads/${leadId}/restore/`);
      // Remove from the list
      setLeads(leads.filter(lead => lead.id !== leadId));
    } catch (err) {
      const ax = err as AxiosError<{ detail?: string }>;
      setError(ax.response?.data?.detail ?? "Restore failed");
    } finally {
      setRestoring(null);
    }
  };

  const handleRestoreAll = async () => {
    if (!confirm(`Restore all ${leads.length} deleted leads?`)) return;
    
    setRestoring(-1); // Special value for "restoring all"
    try {
      for (const lead of leads) {
        await api.post(`/leads/${lead.id}/restore/`);
      }
      setLeads([]);
    } catch (err) {
      const ax = err as AxiosError<{ detail?: string }>;
      setError(ax.response?.data?.detail ?? "Restore failed");
    } finally {
      setRestoring(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto mt-10">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Deleted Leads</h1>
        </div>
        <div className="text-center">
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Deleted Leads</h1>
        </div>
        {leads.length > 0 && (
          <Button 
            variant="secondary" 
            onClick={handleRestoreAll}
            disabled={restoring === -1}
          >
            {restoring === -1 ? "Restoring..." : `Restore All (${leads.length})`}
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      {leads.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-slate-600 text-lg">No deleted leads found</div>
            <div className="text-slate-500 text-sm mt-2">All your leads are active</div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {leads.map((lead) => (
            <Card key={lead.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {lead.full_name || `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Unnamed Lead'}
                      </h3>
                      <StatusBadge status={lead.status || 'new'} />
                    </div>
                    <div className="text-sm text-slate-600 space-y-1">
                      {lead.email && <div>📧 {lead.email}</div>}
                      {lead.phone && <div>📞 {lead.phone}</div>}
                      {lead.budget_min && lead.budget_max && (
                        <div>💰 ${lead.budget_min.toLocaleString()} - ${lead.budget_max.toLocaleString()}</div>
                      )}
                      <div className="text-xs text-slate-500">
                        Deleted: {lead.updated_at ? new Date(lead.updated_at).toLocaleString() : 'Unknown'}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => handleRestore(lead.id)}
                      disabled={restoring === lead.id}
                    >
                      {restoring === lead.id ? "Restoring..." : "Restore"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
