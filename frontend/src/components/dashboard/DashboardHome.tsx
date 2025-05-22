// src/components/dashboard/DashboardHome.tsx
import React, { useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  Paper, 
  Container,
  useTheme
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { fetchDashboardData } from '../../redux/slices/dashboardSlice';
import KPICard from './cards/KPICard';
import CallMetricsChart from './charts/CallMetricsChart';
import LeadSourceChart from './charts/LeadSourceChart';
import ConversionRateChart from './charts/ConversionRateChart';
import RecentCallsList from './lists/RecentCallsList';

// Icons
import CallIcon from '@mui/icons-material/Call';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const DashboardHome: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { 
    isLoading, 
    error, 
    totalCalls, 
    successfulCalls, 
    totalLeads, 
    conversionRate,
    averageCallDuration,
    callsByOutcome,
    leadsBySource,
    conversionRateByDay,
    recentCalls
  } = useSelector((state: RootState) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardData());
    
    // Set up auto-refresh interval
    const refreshInterval = setInterval(() => {
      dispatch(fetchDashboardData());
    }, 60000); // Refresh every minute
    
    return () => clearInterval(refreshInterval);
  }, [dispatch]);

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>Dashboard</Typography>
        
        {/* KPI Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard 
              title="Total Calls"
              value={totalCalls}
              icon={<CallIcon />}
              color={theme.palette.primary.main}
              isLoading={isLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard 
              title="Successful Calls"
              value={successfulCalls}
              icon={<CheckCircleIcon />}
              color={theme.palette.success.main}
              isLoading={isLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard 
              title="Total Leads"
              value={totalLeads}
              icon={<PersonIcon />}
              color={theme.palette.info.main}
              isLoading={isLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard 
              title="Avg. Call Duration"
              value={`${averageCallDuration}s`}
              icon={<AccessTimeIcon />}
              color={theme.palette.warning.main}
              isLoading={isLoading}
            />
          </Grid>
        </Grid>
        
        {/* Charts */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Call Outcomes</Typography>
              <CallMetricsChart data={callsByOutcome} isLoading={isLoading} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Lead Sources</Typography>
              <LeadSourceChart data={leadsBySource} isLoading={isLoading} />
            </Paper>
          </Grid>
        </Grid>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Conversion Rate Trend</Typography>
              <ConversionRateChart data={conversionRateByDay} isLoading={isLoading} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Recent Calls</Typography>
              <RecentCallsList calls={recentCalls} isLoading={isLoading} />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default DashboardHome;
