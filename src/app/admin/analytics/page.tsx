import { prisma } from "@/lib/db";
import { AdminAnalyticsCharts } from "@/components/admin/AdminAnalyticsCharts";

export default async function AdminAnalyticsPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-display font-semibold text-espresso">Analytics</h1>
      <p className="text-sm text-muted mt-1 mb-8">Real-time performance overview.</p>
      <AdminAnalyticsCharts />
    </div>
  );
}