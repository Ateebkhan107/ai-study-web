const stats = [
  {
    label: "Tests Attempted",
    value: "48",
    sub: "+3 this week",
    icon: "◈",
  },
  {
    label: "Accuracy",
    value: "73.4%",
    sub: "↑ 2.1% from last test",
    icon: "◎",
  },
  {
    label: "Rank",
    value: "#214",
    sub: "Top 8% nationally",
    icon: "◇",
  },
  {
    label: "Study Time",
    value: "124h",
    sub: "This month",
    icon: "◷",
  },
];

export default function StatsCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200 group"
        >
          <div className="flex items-start justify-between mb-4">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
              {stat.label}
            </p>
            <span className="text-gray-300 text-lg group-hover:text-gray-500 transition-colors">
              {stat.icon}
            </span>
          </div>
          <p className="text-3xl font-black text-black tracking-tight mb-1">
            {stat.value}
          </p>
          <p className="text-xs text-gray-400">{stat.sub}</p>
        </div>
      ))}
    </div>
  );
}