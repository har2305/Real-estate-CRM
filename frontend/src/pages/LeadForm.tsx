import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import Label from "../components/ui/Label";
import type { AxiosError } from "axios";

interface LeadPayload {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  status: string;
  source?: string;
  budget_min?: number | null;
  budget_max?: number | null;
  property_interest?: string;
}

export default function LeadForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState<LeadPayload>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    status: "new",
    source: "",
    budget_min: undefined,
    budget_max: undefined,
    property_interest: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const res = await api.get<any>(`/leads/${id}/`);
        setForm({
          first_name: res.data.first_name ?? "",
          last_name: res.data.last_name ?? "",
          email: res.data.email ?? "",
          phone: res.data.phone ?? "",
          status: res.data.status ?? "new",
          source: res.data.source ?? "",
          budget_min: res.data.budget_min ?? undefined,
          budget_max: res.data.budget_max ?? undefined,
          property_interest: res.data.property_interest ?? "",
        });
      } catch (err) {
        const ax = err as AxiosError<{ detail?: string }>;
        setError(ax.response?.data?.detail ?? "Failed to load lead");
      }
    })();
  }, [id, isEdit]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        ...form,
        budget_min: form.budget_min === null || form.budget_min === undefined || form.budget_min === ("" as any) ? null : Number(form.budget_min),
        budget_max: form.budget_max === null || form.budget_max === undefined || form.budget_max === ("" as any) ? null : Number(form.budget_max),
      };
      if (isEdit) {
        await api.patch(`/leads/${id}/`, payload);
        navigate(`/leads/${id}`);
      } else {
        const res = await api.post<{ id: number }>(`/leads/`, payload);
        navigate(`/leads/${res.data.id ?? ""}`);
      }
    } catch (err) {
      const ax = err as AxiosError<{ detail?: string }>;
      setError(ax.response?.data?.detail ?? "Save failed");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{isEdit ? "Edit Lead" : "Add Lead"}</h1>
        </div>
      </div>
      <Card>
        <CardHeader />
        <CardContent>
          {error && <Alert className="mb-4">{error}</Alert>}

          <form onSubmit={submit} className="grid gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First name</Label>
                <Input
                  id="first_name"
                  placeholder="Alice"
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last name</Label>
                <Input
                  id="last_name"
                  placeholder="Morrow"
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="alice@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="555-2000"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="w-full rounded-lg bg-white border border-slate-300 focus:border-indigo-500 focus:outline-none px-3 py-2 text-sm text-slate-900"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="closed">Closed</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
              <div>
                <Label htmlFor="source">Source</Label>
                <Input
                  id="source"
                  placeholder="referral / website / other"
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="budget_min">Budget min</Label>
                <Input
                  id="budget_min"
                  type="number"
                  placeholder="250000"
                  value={form.budget_min as any as string || ""}
                  onChange={(e) => setForm({ ...form, budget_min: e.target.value === "" ? undefined : Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="budget_max">Budget max</Label>
                <Input
                  id="budget_max"
                  type="number"
                  placeholder="400000"
                  value={form.budget_max as any as string || ""}
                  onChange={(e) => setForm({ ...form, budget_max: e.target.value === "" ? undefined : Number(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="property_interest">Property interest</Label>
              <textarea
                id="property_interest"
                className="w-full rounded-lg bg-white border border-slate-300 focus:border-indigo-500 focus:outline-none px-3 py-2 text-sm text-slate-900"
                placeholder="Notes about desired property"
                rows={4}
                value={form.property_interest}
                onChange={(e) => setForm({ ...form, property_interest: e.target.value })}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
              <Button>{isEdit ? "Update" : "Create"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
