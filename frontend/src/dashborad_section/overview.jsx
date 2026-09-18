import { Card, CardContent, Typography, Box } from '@mui/material';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Color palette mapping based on index or item type
const GET_THEME = (index) => {
  const themes = [
    { border: "#2563eb", text: "#1d4ed8", bg: "rgba(219, 234, 254, 0.6)", glow: "rgba(37, 99, 235, 0.12)" },
    { border: "#059669", text: "#047857", bg: "rgba(209, 250, 229, 0.6)", glow: "rgba(5, 150, 105, 0.12)" },
    { border: "#7c3aed", text: "#6d28d9", bg: "rgba(237, 233, 254, 0.6)", glow: "rgba(124, 58, 237, 0.12)" },
    { border: "#e11d48", text: "#be123c", bg: "rgba(255, 228, 230, 0.6)", glow: "rgba(225, 29, 72, 0.12)" },
  ];
  return themes[index % themes.length];
};

// Custom Tooltip for Stacked Bar Chart
const CustomChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box 
        sx={{ 
          bgcolor: 'rgba(15, 23, 42, 0.90)', 
          backdropFilter: 'blur(8px)',
          color: '#fff', 
          p: 1.5, 
          borderRadius: '12px', 
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          minWidth: 160
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, borderBottom: '1px solid rgba(255,255,255,0.1)', pb: 0.5 }}>
          {label}
        </Typography>
        {payload.map((entry, index) => (
          <Box key={`item-${index}`} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: entry.color }} />
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>{entry.name}:</Typography>
            </Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#f8fafc', ml: 1 }}>
              {entry.value}%
            </Typography>
          </Box>
        ))}
      </Box>
    );
  }
  return null;
};

// Custom Bar Label at the end of each stack
const renderCustomBarLabel = (props) => {
  const { x, y, width, height, payload } = props;
  if (!payload || payload.completed === undefined) return null;
  return (
    <text 
      x={x + width + 8} 
      y={y + height / 2 + 4} 
      fill="#475569" 
      fontSize="12" 
      fontWeight="700" 
      textAnchor="start"
    >
      {`${payload.completed}% Done`}
    </text>
  );
};

export default function Overview({ 
  data = { 
    totalClasses: 45, 
    classesCompleted: 32, 
    cancelledClasses: 2 
  },
  syllabusData = [
    { subject: 'Mathematics', completed: 65, inProgress: 20, pending: 15 },
    { subject: 'Physics', completed: 50, inProgress: 30, pending: 20 },
    { subject: 'Chemistry', completed: 80, inProgress: 10, pending: 10 },
    { subject: 'Computer Sci', completed: 40, inProgress: 45, pending: 15 },
    { subject: 'English', completed: 90, inProgress: 5, pending: 5 },
  ]
}) {
  const classesRemaining = data.totalClasses - (data.classesCompleted + data.cancelledClasses);

  const classStats = [
    { label: "Total Classes", value: data.totalClasses },
    { label: "Classes Completed", value: data.classesCompleted },
    { label: "Classes Remaining", value: classesRemaining },
    { label: "Cancelled / Rescheduled", value: data.cancelledClasses },
  ];

  // Data for Round (Donut/Pie) Chart
  const pieData = [
    { name: 'Completed', value: data.classesCompleted, color: '#059669' },
    { name: 'Remaining', value: classesRemaining, color: '#7c3aed' },
    { name: 'Cancelled', value: data.cancelledClasses, color: '#e11d48' },
  ];

  // Total calculated attendance completion rate %
  const attendanceRate = Math.round((data.classesCompleted / data.totalClasses) * 100) || 0;

  return (
    <Box className="p-5 mb-6">
      {/* Dashboard Header */}
      <Box className="mb-8">
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
          Dashboard
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
          Real-time attendance summary and course syllabus breakdown.
        </Typography>
      </Box>

      {/* Top KPI Cards Section */}
      <Box className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        {classStats.map((item, index) => {
          const theme = GET_THEME(index);

          return (
            <Card 
              key={index} 
              elevation={0}
              sx={{ 
                borderRadius: '16px', 
                background: `linear-gradient(135deg, ${theme.bg} 0%, rgba(255, 255, 255, 0.95) 100%)`,
                borderLeft: `6px solid ${theme.border}`,
                borderTop: '1px solid rgba(255, 255, 255, 0.8)',
                borderRight: '1px solid rgba(226, 232, 240, 0.6)',
                borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
                backdropFilter: 'blur(12px)',
                boxShadow: `0 4px 20px -2px ${theme.glow}`,
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: `0 20px 50px -5px ${theme.glow}`,
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '-40px',
                  right: '-40px',
                  width: '100px',
                  height: '100px',
                  background: theme.border,
                  opacity: 0.05,
                  borderRadius: '50%',
                }
              }}
            >
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Typography variant="subtitle2" sx={{ color: '#475569', fontWeight: 600, fontSize: '0.85rem' }}>
                  {item.label}
                </Typography>
                
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 800, 
                    fontSize: '2.2rem', 
                    mt: 0.5, 
                    color: theme.text,
                    letterSpacing: '-0.5px'
                  }}
                >
                  {item.value}
                </Typography>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* Charts Layout Grid */}
      <Box className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 1 Column: Round/Donut Chart */}
        
        {/* Right 2 Columns: Syllabus Progress Bar Chart */}
        <Card 
          elevation={0} 
          className="lg:col-span-2"
          sx={{ 
            borderRadius: '20px', 
            border: '1px solid #e2e8f0',
            background: '#ffffff',
            boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.04)',
            p: 2.5
          }}
        >
          <CardContent sx={{ p: '0 !important' }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', letterSpacing: '-0.3px' }}>
                Syllabus & Course Progress
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
                Track completion status per subject normalized to 100%.
              </Typography>
            </Box>

            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={syllabusData}
                  margin={{ top: 10, right: 70, left: 20, bottom: 0 }}
                  barSize={18}
                >
                  <defs>
                    <linearGradient id="completedGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                    <linearGradient id="inProgressGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#1d4ed8" />
                    </linearGradient>
                    <linearGradient id="pendingGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#f1f5f9" />
                      <stop offset="100%" stopColor="#cbd5e1" />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />

                  <XAxis 
                    type="number" 
                    domain={[0, 100]} 
                    unit="%" 
                    stroke="#94a3b8"
                    fontSize={12}
                    axisLine={false}
                    tickLine={false}
                  />
                  
                  <YAxis 
                    type="category" 
                    dataKey="subject" 
                    stroke="#334155"
                    fontSize={13}
                    fontWeight={600}
                    axisLine={false}
                    tickLine={false}
                    width={110}
                  />

                  <Tooltip content={<CustomChartTooltip />} />
                  
                  <Legend 
                    verticalAlign="top" 
                    align="right"
                    wrapperStyle={{ paddingBottom: '20px' }}
                    iconType="circle"
                  />

                  <Bar 
                    dataKey="completed" 
                    name="Completed" 
                    stackId="syllabus" 
                    fill="url(#completedGrad)" 
                    radius={[8, 0, 0, 8]} 
                  />
                  <Bar 
                    dataKey="inProgress" 
                    name="In Progress" 
                    stackId="syllabus" 
                    fill="url(#inProgressGrad)" 
                  />
                  <Bar 
                    dataKey="pending" 
                    name="Pending" 
                    stackId="syllabus" 
                    fill="url(#pendingGrad)" 
                    radius={[0, 8, 8, 0]} 
                    label={renderCustomBarLabel}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

								<Card 
          elevation={0} 
          sx={{ 
            borderRadius: '20px', 
            border: '1px solid #e2e8f0',
            background: '#ffffff',
            boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.04)',
            p: 2.5
          }}
        >
          <CardContent sx={{ p: '0 !important' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', letterSpacing: '-0.3px' }}>
              Class Status
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
              Distribution of session metrics.
            </Typography>

            <Box sx={{ width: '100%', height: 260, position: 'relative', mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Center Text displaying Attendance % */}
              <Box 
                sx={{
                  position: 'absolute',
                  top: '40%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center'
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                  {attendanceRate}%
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                  Completion
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

      </Box>
    </Box>
  );
}