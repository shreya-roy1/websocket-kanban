import React from "react";
import PropTypes from "prop-types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from "recharts";

/**
 * StatsChart component - Displays visual analytics of the Kanban board,
 * including completion gauge (pie chart) and task status distribution (bar chart).
 * Uses solid, high-contrast colors and a clean, flat aesthetic.
 *
 * @component
 * @param {Object} props
 * @param {import('../hooks/useSocket').Task[]} props.tasks - The array of tasks to analyze
 */
function StatsChart({ tasks }) {
  const todoCount = tasks.filter((t) => t.status === "todo").length;
  const inProgressCount = tasks.filter((t) => t.status === "in_progress").length;
  const doneCount = tasks.filter((t) => t.status === "done").length;
  const totalCount = tasks.length;

  const barData = [
    { name: "To Do", count: todoCount, fill: "#6366f1" },       // Indigo-500
    { name: "In Progress", count: inProgressCount, fill: "#f59e0b" }, // Amber-500
    { name: "Done", count: doneCount, fill: "#10b981" }         // Emerald-500
  ];

  const completionPercentage = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const pieData = [
    { name: "Completed", value: doneCount, fill: "#10b981" },
    { name: "Pending", value: totalCount - doneCount, fill: "#334155" }
  ];

  // Adjust for cases when totalCount is 0 to show empty states beautifully
  const displayPieData = totalCount === 0 
    ? [{ name: "No Tasks", value: 1, fill: "#1e293b" }] 
    : pieData;

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800/40" data-testid="stats-chart-container">
      <h3 className="text-base font-bold text-slate-200 mb-6 flex justify-between items-center">
        <span>Analytics Dashboard</span>
        <span className="text-xs font-medium bg-slate-800/50 text-slate-400 px-2 py-0.5 rounded-lg">
          Total: {totalCount}
        </span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        
        {/* Completion Gauge / Pie Chart */}
        <div className="flex flex-col items-center justify-center relative">
          <div className="w-[180px] h-[180px] flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={displayPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={75}
                  startAngle={90}
                  endAngle={-270}
                  paddingAngle={totalCount > 0 ? 3 : 0}
                  dataKey="value"
                >
                  {displayPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold text-slate-100" data-testid="completion-percentage">
                {completionPercentage}%
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Completed
              </span>
            </div>
          </div>
          <div className="text-center mt-3">
            <p className="text-xs text-slate-400 font-medium">
              {doneCount} of {totalCount} tasks completed
            </p>
          </div>
        </div>

        {/* Column Tasks Distribution Bar Chart */}
        <div className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barData}
              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
            >
              <XAxis
                dataKey="name"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "0.75rem",
                  color: "#f1f5f9",
                  fontSize: "12px"
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={32}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}

StatsChart.propTypes = {
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      status: PropTypes.oneOf(["todo", "in_progress", "done"]).isRequired,
      priority: PropTypes.oneOf(["Low", "Medium", "High"]).isRequired,
      category: PropTypes.oneOf(["Bug", "Feature", "Enhancement"]).isRequired,
      createdAt: PropTypes.string.isRequired,
      attachments: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string.isRequired,
          type: PropTypes.string,
          url: PropTypes.string.isRequired
        })
      )
    })
  ).isRequired
};

export default StatsChart;

