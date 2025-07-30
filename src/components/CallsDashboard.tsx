"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CallsOverview } from "./CallsOverview";
import { CallsChart } from "./CallsChart";
import { CallsFilters } from "./CallsFilters";
import { CallsTable } from "./CallsTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface CallRecord {
  id: string;
  call_id: string;
  customer_number: string;
  call_date: string;
  call_minutes: number;
  outcome: string;
  call_cost: number;
  recording_url?: string;
  summary?: string;
  created_at: string;
  updated_at: string;
}

export interface CallStatistics {
  total_calls: number;
  total_cost: number;
  total_minutes: number;
  successful_calls: number;
  success_rate: number;
}

export interface DailyCallAggregate {
  call_date: string;
  call_count: number;
  total_cost: number;
  total_minutes: number;
}

export interface HourlyCallDistribution {
  call_hour: number;
  call_count: number;
}

export interface OutcomeDistribution {
  outcome_name: string;
  outcome_count: number;
}

export interface CallFilters {
  outcome?: string;
  dateFrom?: string;
  dateTo?: string;
  customerNumber?: string;
}

export function CallsDashboard() {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [statistics, setStatistics] = useState<CallStatistics | null>(null);
  const [dailyAggregates, setDailyAggregates] = useState<DailyCallAggregate[]>([]);
  const [hourlyDistribution, setHourlyDistribution] = useState<HourlyCallDistribution[]>([]);
  const [outcomeDistribution, setOutcomeDistribution] = useState<OutcomeDistribution[]>([]);
  const [filters, setFilters] = useState<CallFilters>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch calls with filters
      let query = supabase.from('calls').select('*');
      
      if (filters.outcome) {
        query = query.eq('outcome', filters.outcome);
      }
      if (filters.dateFrom) {
        query = query.gte('call_date', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('call_date', filters.dateTo);
      }
      if (filters.customerNumber) {
        query = query.eq('customer_number', filters.customerNumber);
      }

      const { data: callsData, error: callsError } = await query.order('call_date', { ascending: false });
      
      if (callsError) throw callsError;
      setCalls(callsData || []);

      // Fetch statistics
      const { data: statsData, error: statsError } = await supabase.rpc('get_call_statistics', {
        p_outcome: filters.outcome,
        p_date_from: filters.dateFrom,
        p_date_to: filters.dateTo,
        p_customer_number: filters.customerNumber
      });
      
      if (statsError) throw statsError;
      setStatistics(statsData?.[0] || null);

      // Fetch daily aggregates
      const { data: dailyData, error: dailyError } = await supabase.rpc('get_daily_call_aggregates', {
        p_outcome: filters.outcome,
        p_date_from: filters.dateFrom,
        p_date_to: filters.dateTo,
        p_customer_number: filters.customerNumber,
        p_limit: 30
      });
      
      if (dailyError) throw dailyError;
      setDailyAggregates(dailyData || []);

      // Fetch hourly distribution
      const { data: hourlyData, error: hourlyError } = await supabase.rpc('get_hourly_call_distribution', {
        p_outcome: filters.outcome,
        p_date_from: filters.dateFrom,
        p_date_to: filters.dateTo,
        p_customer_number: filters.customerNumber
      });
      
      if (hourlyError) throw hourlyError;
      setHourlyDistribution(hourlyData || []);

      // Fetch outcome distribution
      const { data: outcomeData, error: outcomeError } = await supabase.rpc('get_outcome_distribution', {
        p_outcome: filters.outcome,
        p_date_from: filters.dateFrom,
        p_date_to: filters.dateTo,
        p_customer_number: filters.customerNumber
      });
      
      if (outcomeError) throw outcomeError;
      setOutcomeDistribution(outcomeData || []);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleFiltersChange = (newFilters: CallFilters) => {
    setFilters(newFilters);
  };

  if (error) {
    return (
      <Card className="m-6">
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Failed to load dashboard data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Call Compass Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor and analyze your call center performance
        </p>
      </div>

      <CallsFilters onFiltersChange={handleFiltersChange} />

      <CallsOverview statistics={statistics} loading={loading} />

      <Tabs defaultValue="charts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="table">Call Records</TabsTrigger>
        </TabsList>
        
        <TabsContent value="charts" className="space-y-4">
          <CallsChart
            dailyAggregates={dailyAggregates}
            hourlyDistribution={hourlyDistribution}
            outcomeDistribution={outcomeDistribution}
            loading={loading}
          />
        </TabsContent>
        
        <TabsContent value="table">
          <CallsTable calls={calls} loading={loading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}