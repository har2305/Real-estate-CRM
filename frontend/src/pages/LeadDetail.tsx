import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";
import { Card, CardContent } from "../components/ui/Card";
import Button from "../components/ui/Button";
import StatusBadge from "../components/ui/StatusBadge";
import type { AxiosError } from "axios";

interface Lead {
  id: number;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  status?: string;
  source?: string;
  budget_min?: number | null;
  budget_max?: number | null;
  property_interest?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface Activity {
  id: number;
  activity_type: "call" | "email" | "meeting" | "note";
  title: string;
  notes?: string;
  duration?: number | null;
  activity_date: string; // ISO string
  // Optional denormalized fields depending on serializer
  user?: { id: number; username?: string; email?: string } | number;
}

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [error, setError] = useState("");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  // New activity form state
  const [newType, setNewType] = useState<Activity["activity_type"]>("note");
  const [newTitle, setNewTitle] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newDate, setNewDate] = useState<string>(new Date().toISOString().slice(0, 16)); // yyyy-MM-ddTHH:mm
  const [newDuration, setNewDuration] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<Lead>(`/leads/${id}/`);
        setLead(res.data);
      } catch (err) {
        const ax = err as AxiosError<{ detail?: string }>;
        setError(ax.response?.data?.detail ?? "Failed to fetch lead");
      }
    })();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    
    const fetchActivities = async () => {
      setLoadingActivities(true);
      try {
        const response = await api.get(`/leads/${id}/activities/`);
        // Handle both paginated and direct array responses
        const activitiesData = response.data.results || response.data || [];
        setActivities(Array.isArray(activitiesData) ? activitiesData : []);
      } catch (error) {
        console.error('Error loading activities:', error);
        setActivities([]);
      } finally {
        setLoadingActivities(false);
      }
    };

    fetchActivities();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm("Delete this lead?")) return;
    try {
      await api.delete(`/leads/${id}/`);
      navigate("/leads");
    } catch (err) {
      const ax = err as AxiosError<{ detail?: string }>;
      setError(ax.response?.data?.detail ?? "Delete failed");
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Lead Details</h1>
        </div>
        <div className="flex gap-2">
          <Link to={`/leads/${id}/edit`}>
            <Button variant="secondary">Edit</Button>
          </Link>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </div>

      {error && (
        <Card className="mb-4">
          <CardContent className="text-rose-700">{error}</CardContent>
        </Card>
      )}

      {!lead ? (
        <Card>
          <CardContent className="text-slate-600">Loading...</CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-semibold text-slate-900">
                    {lead.full_name ?? `${lead.first_name ?? ""} ${lead.last_name ?? ""}`.trim()}
                  </div>
                  <div className="text-sm text-slate-600">{lead.email ?? "-"}</div>
                  <div className="text-sm text-slate-600">{lead.phone ?? "-"}</div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={lead.status ?? "new"} />
                  <select
                    className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm"
                    value={lead.status ?? "new"}
                    onChange={async (e) => {
                      if (!id) return;
                      const newStatus = e.target.value;
                      try {
                        await api.patch(`/leads/${id}/`, { status: newStatus });
                        setLead((prev) => (prev ? { ...prev, status: newStatus } : prev));
                      } catch (err) {
                        console.error('Failed to update status:', err);
                        alert('Failed to update status. Please try again.');
                      }
                    }}
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="closed">Closed</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="text-slate-500">Source</div>
                <div className="text-slate-900">{lead.source || "-"}</div>
                <div className="text-slate-500">Budget</div>
                <div className="text-slate-900">
                  {lead.budget_min != null || lead.budget_max != null
                    ? `${lead.budget_min ?? "-"} - ${lead.budget_max ?? "-"}`
                    : "-"}
                </div>
                <div className="text-slate-500">Created</div>
                <div className="text-slate-900">
                  {lead.created_at ? new Date(lead.created_at).toLocaleString() : "-"}
                </div>
                <div className="text-slate-500">Updated</div>
                <div className="text-slate-900">
                  {lead.updated_at ? new Date(lead.updated_at).toLocaleString() : "-"}
                </div>
                <div className="text-slate-500">Property Interest</div>
                <div className="text-slate-900 whitespace-pre-wrap">{lead.property_interest || "-"}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="text-lg font-semibold text-slate-900 mb-3">Add Activity</div>
              <form
                className="grid gap-3"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!id || !newType || !newTitle) return;
                  
                  setSaving(true);
                  try {
                    const activityData: any = {
                      activity_type: newType,
                      title: newTitle,
                      notes: newNotes || undefined,
                      activity_date: new Date(newDate).toISOString(),
                    };
                    
                    // Only add duration for call activities
                    if (newType === "call" && newDuration) {
                      activityData.duration = Number(newDuration);
                    }
                    
                    const response = await api.post(`/leads/${id}/activities/`, activityData);
                    setActivities((prev) => [response.data, ...prev]);
                    
                    // Clear form after successful submission
                    setNewTitle("");
                    setNewNotes("");
                    setNewDuration("");
                  } catch (error) {
                    console.error('Error creating activity:', error);
                    alert('Failed to create activity. Please try again.');
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-sm text-slate-600">Type
                    <select
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm"
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as Activity["activity_type"])}
                    >
                      <option value="note">Note</option>
                      <option value="call">Call</option>
                      <option value="email">Email</option>
                      <option value="meeting">Meeting</option>
                    </select>
                  </label>
                  <label className="text-sm text-slate-600">When
                    <input
                      type="datetime-local"
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                    />
                  </label>
                </div>
                <label className="text-sm text-slate-600">Title
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm"
                    placeholder="e.g. Called the client"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                  />
                </label>
                <label className="text-sm text-slate-600">Notes
                  <textarea
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm"
                    placeholder="Optional details"
                    rows={3}
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                  />
                </label>
                {newType === "call" && (
                  <label className="text-sm text-slate-600">Duration (minutes)
                    <input
                      type="number"
                      min={0}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm"
                      placeholder="e.g. 15"
                      value={newDuration}
                      onChange={(e) => setNewDuration(e.target.value)}
                    />
                  </label>
                )}
                <div>
                  <Button disabled={saving}>{saving ? "Saving..." : "Add Activity"}</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardContent className="p-5">
              <div className="text-lg font-semibold text-slate-900 mb-3">Activity Timeline</div>
              {loadingActivities ? (
                <div className="text-slate-600 text-sm">Loading activities…</div>
              ) : activities.length === 0 ? (
                <div className="text-slate-600 text-sm">No activities yet.</div>
              ) : (
                <ul className="space-y-3">
                  {activities.map((a) => (
                    <li key={a.id} className="flex items-start gap-3">
                      <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-indigo-500" />
                      <div>
                        <div className="text-sm text-slate-900 font-medium">
                          {a.title}
                          <span className="ml-2 text-xs text-slate-500">
                            {new Date(a.activity_date).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 capitalize">
                          {a.activity_type}
                          {a.activity_type === "call" && a.duration ? ` • ${a.duration} min` : ""}
                        </div>
                        {a.notes && (
                          <div className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{a.notes}</div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
