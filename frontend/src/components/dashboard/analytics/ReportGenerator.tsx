// src/components/dashboard/analytics/ReportGenerator.tsx
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  Chip,
  Stack
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { generateReport } from '../../../redux/slices/dashboardSlice';

// Icons
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import EmailIcon from '@mui/icons-material/Email';
import ScheduleIcon from '@mui/icons-material/Schedule';

const ReportGenerator: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isGeneratingReport, reportError, lastGeneratedReport } = useSelector((state: RootState) => state.dashboard);
  
  const [reportType, setReportType] = useState('call_metrics');
  const [format, setFormat] = useState('pdf');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date()
  });
  const [recipients, setRecipients] = useState('');
  const [schedule, setSchedule] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleGenerateReport = () => {
    dispatch(generateReport({
      reportType,
      format,
      startDate: dateRange.startDate.toISOString(),
      endDate: dateRange.endDate.toISOString(),
      recipients: recipients ? recipients.split(',').map(email => email.trim()) : [],
      schedule
    }));
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
  };

  const reportTypes = [
    { value: 'call_metrics', label: 'Call Metrics' },
    { value: 'lead_metrics', label: 'Lead Metrics' },
    { value: 'agent_performance', label: 'Agent Performance' },
    { value: 'campaign_performance', label: 'Campaign Performance' },
    { value: 'conversion_analysis', label: 'Conversion Analysis' }
  ];

  const formatTypes = [
    { value: 'pdf', label: 'PDF', icon: <PictureAsPdfIcon /> },
    { value: 'csv', label: 'CSV', icon: <TableChartIcon /> }
  ];

  const scheduleOptions = [
    { value: '', label: 'One-time (No schedule)' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Report Generator</Typography>
      <Divider sx={{ mb: 3 }} />
      
      {reportError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {reportError}
        </Alert>
      )}
      
      {showSuccess && lastGeneratedReport && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Report generated successfully! {lastGeneratedReport.downloadUrl && (
            <Button 
              size="small" 
              href={lastGeneratedReport.downloadUrl} 
              target="_blank"
              sx={{ ml: 1 }}
            >
              Download
            </Button>
          )}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="report-type-label">Report Type</InputLabel>
            <Select
              labelId="report-type-label"
              id="report-type"
              value={reportType}
              label="Report Type"
              onChange={(e) => setReportType(e.target.value)}
            >
              {reportTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="format-label">Format</InputLabel>
            <Select
              labelId="format-label"
              id="format"
              value={format}
              label="Format"
              onChange={(e) => setFormat(e.target.value)}
            >
              {formatTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {type.icon}
                    <Typography sx={{ ml: 1 }}>{type.label}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={dateRange.startDate}
              onChange={(newValue) => {
                if (newValue) {
                  setDateRange({ ...dateRange, startDate: newValue });
                }
              }}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </LocalizationProvider>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="End Date"
              value={dateRange.endDate}
              onChange={(newValue) => {
                if (newValue) {
                  setDateRange({ ...dateRange, endDate: newValue });
                }
              }}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </LocalizationProvider>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="recipients"
            label="Email Recipients (comma separated)"
            value={recipients}
            onChange={(e) => setRecipients(e.target.value)}
            placeholder="email1@example.com, email2@example.com"
            InputProps={{
              startAdornment: <EmailIcon color="action" sx={{ mr: 1 }} />
            }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel id="schedule-label">Schedule</InputLabel>
            <Select
              labelId="schedule-label"
              id="schedule"
              value={schedule}
              label="Schedule"
              onChange={(e) => setSchedule(e.target.value)}
              startAdornment={<ScheduleIcon color="action" sx={{ mr: 1 }} />}
            >
              {scheduleOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack direction="row" spacing={1}>
          {lastGeneratedReport && (
            <>
              <Chip 
                label={`Last Generated: ${new Date(lastGeneratedReport.generatedAt).toLocaleString()}`} 
                variant="outlined" 
              />
              <Chip 
                label={`Type: ${reportTypes.find(t => t.value === lastGeneratedReport.type)?.label || lastGeneratedReport.type}`} 
                variant="outlined" 
              />
            </>
          )}
        </Stack>
        
        <Button
          variant="contained"
          onClick={handleGenerateReport}
          disabled={isGeneratingReport}
          startIcon={isGeneratingReport ? <CircularProgress size={20} /> : null}
        >
          {isGeneratingReport ? 'Generating...' : 'Generate Report'}
        </Button>
      </Box>
    </Paper>
  );
};

export default ReportGenerator;
