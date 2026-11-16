"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { formatKes } from "@/lib/money";

const COLORS = ["#6B2C2E", "#C99B3F", "#43533A", "#2B1A10", "#7A6353", "#A87C4F", "#8A1F1F"];

type AnalyticsData = {
  revenueData: Array<{ date: string; revenue: number }>;
  categoryData: Array<{ name: string; value: number }>;
  summary: { totalRevenue: number; totalOrders: number; itemsSold: number; averageOrderValue: number };
};

function formatValue(value: unknown): string {
  const n = typeof value === "number" ? value : Number(value ?? 0);
  return `KSh ${n.toLocaleString()}`;
}

export function AdminAnalyticsCharts() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/admin/analytics")
      .then((res) => res.json())
      .then((json) => {
        setData(json.data);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return <div className="text-sm text-muted animate-pulse mt-8">Loading analytics...</div>;
  }

  const { revenueData, categoryData, summary } = data;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border border-line bg-surface p-4">
          <p className="jr-eyebrow">Total Revenue</p>
          <p className="mt-1 text-2xl font-semibold">{formatKes(summary.totalRevenue * 100)}</p>
        </div>
        <div className="border border-line bg-surface p-4">
          <p className="jr-eyebrow">Paid Orders</p>
          <p className="mt-1 text-2xl font-semibold">{summary.totalOrders}</p>
        </div>
        <div className="border border-line bg-surface p-4">
          <p className="jr-eyebrow">Items Sold</p>
          <p className="mt-1 text-2xl font-semibold">{summary.itemsSold}</p>
        </div>
        <div className="border border-line bg-surface p-4">
          <p className="jr-eyebrow">Avg. Order Value</p>
          <p className="mt-1 text-2xl font-semibold">{formatKes(summary.averageOrderValue * 100)}</p>
        </div>
      </div>

      <div className="border border-line bg-surface p-6">
        <h3 className="jr-heading-lg text-lg mb-6">Revenue over time</h3>
        <div className="h-[300px] w-full">
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <XAxis dataKey="date" tick={{ fontSize: 12 }} tickMargin={10} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(val) => `KSh ${val}`} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip
                  formatter={(v) => [formatValue(v), "Revenue"]}
                  cursor={{ fill: "#F5EFE5" }}
                />
                <Bar dataKey="revenue" fill="#6B2C2E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted">No revenue data yet.</div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="border border-line bg-surface p-6">
          <h3 className="jr-heading-lg text-lg mb-6">Sales by category</h3>
          <div className="h-[250px] w-full">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatValue(v)} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ fontSize: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted">No category data yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}