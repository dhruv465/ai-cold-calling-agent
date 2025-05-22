// src/components/dashboard/analytics/CampaignAnalytics.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { fetchCampaignAnalytics } from '../../../redux/slices/dashboardSlice';
import CallMetricsChart from '../charts/CallMetricsChart';
import ConversionRateChart from '../charts/ConversionRateChart';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`campaign-tabpanel-${index}`}
      aria-labelledby={`campaign-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const CampaignAnalytics: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { campaigns, campaignAnalytics, isLoading } = useSelector((state: RootState) => state.dashboard);
  
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (campaigns.length > 0 && !selectedCampaign) {
      setSelectedCampaign(campaigns[0].id.toString());
    }
  }, [campaigns, selectedCampaign]);

  useEffect(() => {
    if (selectedCampaign) {
      dispatch(fetchCampaignAnalytics(selectedCampaign));
    }
  }, [dispatch, selectedCampaign]);

  const handleCampaignChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedCampaign(event.target.value as string);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Campaign Analytics</Typography>
        
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="campaign-select-label">Campaign</InputLabel>
          <Select
            labelId="campaign-select-label"
            id="campaign-select"
            value={selectedCampaign}
            label="Campaign"
            onChange={handleCampaignChange}
            size="small"
          >
            {campaigns.map((campaign) => (
              <MenuItem key={campaign.id} value={campaign.id.toString()}>
                {campaign.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      
      <Divider />
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="campaign analytics tabs">
              <Tab label="Overview" />
              <Tab label="Call Metrics" />
              <Tab label="Conversion Rates" />
              <Tab label="Agent Performance" />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Campaign Summary</Typography>
                  <Box sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Total Calls</Typography>
                        <Typography variant="h6">{campaignAnalytics?.totalCalls || 0}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Connected Calls</Typography>
                        <Typography variant="h6">{campaignAnalytics?.connectedCalls || 0}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Conversion Rate</Typography>
                        <Typography variant="h6">{campaignAnalytics?.conversionRate || 0}%</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Avg. Call Duration</Typography>
                        <Typography variant="h6">{campaignAnalytics?.avgCallDuration || 0}s</Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Call Outcomes</Typography>
                  <Box sx={{ height: 200 }}>
                    <CallMetricsChart 
                      data={campaignAnalytics?.callOutcomes || []} 
                      isLoading={false} 
                    />
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Daily Performance</Typography>
                  <Box sx={{ height: 300 }}>
                    <ConversionRateChart 
                      data={campaignAnalytics?.dailyPerformance || []} 
                      isLoading={false} 
                    />
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ height: 400 }}>
              <Typography variant="subtitle1" gutterBottom>Call Metrics Analysis</Typography>
              <CallMetricsChart 
                data={campaignAnalytics?.callOutcomes || []} 
                isLoading={false}
                showLegend={true}
                height={350}
              />
            </Box>
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ height: 400 }}>
              <Typography variant="subtitle1" gutterBottom>Conversion Rate Trends</Typography>
              <ConversionRateChart 
                data={campaignAnalytics?.dailyPerformance || []} 
                isLoading={false}
                showLegend={true}
                height={350}
              />
            </Box>
          </TabPanel>
          
          <TabPanel value={tabValue} index={3}>
            <Typography variant="subtitle1" gutterBottom>Agent Performance for this Campaign</Typography>
            {campaignAnalytics?.agentPerformance ? (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  {campaignAnalytics.agentPerformance.map((agent) => (
                    <Grid item xs={12} md={6} lg={4} key={agent.id}>
                      <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Box sx={{ 
                            width: 40, 
                            height: 40, 
                            borderRadius: '50%', 
                            bgcolor: 'primary.main', 
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2
                          }}>
                            {agent.name.charAt(0)}
                          </Box>
                          <Typography variant="subtitle1">{agent.name}</Typography>
                        </Box>
                        
                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">Calls</Typography>
                            <Typography variant="body1">{agent.calls}</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">Success Rate</Typography>
                            <Typography variant="body1">{agent.successRate}%</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">Avg. Duration</Typography>
                            <Typography variant="body1">{agent.avgDuration}s</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">Feedback</Typography>
                            <Typography variant="body1">{agent.feedback}/5.0</Typography>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ) : (
              <Typography variant="body1">No agent performance data available</Typography>
            )}
          </TabPanel>
        </>
      )}
    </Paper>
  );
};

export default CampaignAnalytics;
