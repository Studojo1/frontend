import type { ReactNode } from "react";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";

interface MetricCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  trend?: "up" | "down";
  trendValue?: string;
}

export function MetricCard({ label, value, icon, trend, trendValue }: MetricCardProps) {
  return (
    <div className="rounded-2xl border-2 border-studojo-ink bg-white shadow-brutal p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold uppercase text-studojo-muted font-satoshi">{label}</span>
        <div className="w-10 h-10 rounded-lg bg-studojo-purple/10 flex items-center justify-center text-studojo-purple">
          {icon}
        </div>
      </div>
      <div className="font-clash text-2xl font-bold text-studojo-ink">{value}</div>
      {trend && trendValue && (
        <div className={`flex items-center gap-1 mt-2 text-sm font-satoshi ${trend === "up" ? "text-studojo-green" : "text-red-500"}`}>
          {trend === "up" ? <FiTrendingUp className="w-4 h-4" /> : <FiTrendingDown className="w-4 h-4" />}
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  );
}