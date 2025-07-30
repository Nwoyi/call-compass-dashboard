"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DailyCallAggregate, HourlyCallDistribution, OutcomeDistribution } from "./CallsDashboard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

interface CallsChartProps {
  dailyAggregates: DailyCallAggregate[];
  hourlyDistribution: HourlyCallDistribution[];
  outcomeDistribution: OutcomeDistribution[];
  loading: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function CallsChart({
  dailyAggregates,
  hourlyDistribution,
  outcomeDistribution,
  loading,
}: CallsChartProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatHour = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}${period}`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Daily Call Volume */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Call Volume</CardTitle>
          <CardDescription>Number of calls per day over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyAggregates}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="call_date"
                tickFormatter={formatDate}
                fontSize={12}
              />
              <YAxis fontSize={12} />
              <Tooltip
                labelFormatter={(value) => formatDate(value as string)}
                formatter={(value: number) => [value, "Calls"]}
              />
              <Bar dataKey="call_count" fill="#8884d8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Outcome Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Call Outcomes</CardTitle>
          <CardDescription>Distribution of call outcomes</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={outcomeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ outcome_name, percent }) => `${outcome_name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="outcome_count"
                nameKey="outcome_name"
              >
                {outcomeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [value, "Calls"]} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Daily Cost Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Cost Trend</CardTitle>
          <CardDescription>Call costs over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyAggregates}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="call_date"
                tickFormatter={formatDate}
                fontSize={12}
              />
              <YAxis
                tickFormatter={formatCurrency}
                fontSize={12}
              />
              <Tooltip
                labelFormatter={(value) => formatDate(value as string)}
                formatter={(value: number) => [formatCurrency(value), "Cost"]}
              />
              <Line
                type="monotone"
                dataKey="total_cost"
                stroke="#82ca9d"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Hourly Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Hourly Call Distribution</CardTitle>
          <CardDescription>Call volume by hour of day</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourlyDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="call_hour"
                tickFormatter={formatHour}
                fontSize={12}
              />
              <YAxis fontSize={12} />
              <Tooltip
                labelFormatter={(value) => `${formatHour(value as number)}`}
                formatter={(value: number) => [value, "Calls"]}
              />
              <Bar dataKey="call_count" fill="#ffc658" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}