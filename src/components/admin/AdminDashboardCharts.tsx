"use client";

import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";

export function AdminDashboardCharts({ data }: { data: any[] }) {
  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#C45A3B" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#C45A3B" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#7A6353" }} dy={10} />
          <Tooltip 
            formatter={(value: any) => ["KSh " + Number(value).toLocaleString(), "Revenue"]}
            contentStyle={{ borderRadius: "4px", border: "1px solid #E5E5E5", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}
          />
          <Area type="monotone" dataKey="revenue" stroke="#C45A3B" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}