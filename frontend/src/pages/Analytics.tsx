import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import type { AxiosError } from "axios";

interface LeadStats {
  total: number;
  by_status: Record<string, number>;
}

interface Activity {
  id: number;
  activity_type: string;
  title: string;
  notes?: string;
  activity_date: string;
  lead: {
    id: number;
    first_name: string;
    last_name: string;
    full_name?: string;
  };
  user: {
    id: number;
    username: string;
  };
}

const COLORS = {
  new: '#0ea5e9',
  contacted: '#6366f1',
  qualified: '#10b981',
  negotiation: '#f59e0b',
  closed: '#6b7280',
  lost: '#ef4444'
};

export default function Analytics() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch leads for stats
        const leadsRes = await api.get("/leads/");
        const leads = Array.isArray(leadsRes.data) ? leadsRes.data : leadsRes.data.results || [];
        
        // Calculate stats
        const byStatus: Record<string, number> = {};
        leads.forEach((lead: any) => {
          const status = lead.status || 'new';
          byStatus[status] = (byStatus[status] || 0) + 1;
        });
        
        setStats({
          total: leads.length,
          by_status: byStatus
        });

        // Fetch recent activities
        try {
          const activitiesRes = await api.get("/activities/recent/");
          const activities = activitiesRes.data || [];
          // Ensure each activity has the expected structure
          const safeActivities = activities.map((activity: any) => ({
            ...activity,
            lead: activity.lead || { first_name: '', last_name: '', full_name: '' },
            user: activity.user || { username: 'Unknown' }
          }));
          setRecentActivities(safeActivities);
        } catch (activitiesErr) {
          console.warn("Failed to fetch recent activities:", activitiesErr);
          setRecentActivities([]);
        }
        
      } catch (err) {
        const ax = err as AxiosError<{ detail?: string }>;
        setError(ax.response?.data?.detail ?? "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartData = stats ? Object.entries(stats.by_status).map(([status, count]) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1),
    count,
    color: COLORS[status as keyof typeof COLORS] || '#6b7280'
  })) : [];

  // Fallback data if no stats
  const fallbackChartData = [
    { status: 'New', count: 0, color: '#0ea5e9' },
    { status: 'Contacted', count: 0, color: '#6366f1' },
    { status: 'Qualified', count: 0, color: '#10b981' },
    { status: 'Negotiation', count: 0, color: '#f59e0b' },
    { status: 'Closed', count: 0, color: '#6b7280' },
    { status: 'Lost', count: 0, color: '#ef4444' }
  ];

  const displayChartData = chartData.length > 0 ? chartData : fallbackChartData;

  const conversionRate = stats ? 
    Math.round(((stats.by_status.closed || 0) / Math.max(stats.total, 1)) * 100) : 0;

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
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Analytics</h1>
        </div>
        <div className="text-center text-slate-600">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-10">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Analytics Dashboard</h1>
      </div>

      {error && (
        <Card className="mb-6">
          <CardContent className="text-rose-700">{error}</CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-slate-900">{stats?.total || 0}</div>
            <div className="text-sm text-slate-600">Total Active Leads</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-emerald-600">{stats?.by_status.qualified || 0}</div>
            <div className="text-sm text-slate-600">Qualified Leads</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-indigo-600">{conversionRate}%</div>
            <div className="text-sm text-slate-600">Conversion Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-900">Leads by Status</h3>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={displayChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-900">Status Distribution</h3>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={displayChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, count }) => `${status}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {displayChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-900">Recent Activities (Last 10)</h3>
        </CardHeader>
        <CardContent>
          {recentActivities.length === 0 ? (
            <div className="text-slate-600 text-center py-8">No recent activities</div>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-slate-900">{activity.title}</span>
                      <span className="text-xs text-slate-500 capitalize bg-slate-100 px-2 py-0.5 rounded">
                        {activity.activity_type}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 mb-1">
                      Lead: {activity.lead?.full_name || `${activity.lead?.first_name || ''} ${activity.lead?.last_name || ''}`.trim() || 'Unknown Lead'}
                    </div>
                    {activity.notes && (
                      <div className="text-sm text-slate-700">{activity.notes}</div>
                    )}
                    <div className="text-xs text-slate-500 mt-1">
                      {new Date(activity.activity_date).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
