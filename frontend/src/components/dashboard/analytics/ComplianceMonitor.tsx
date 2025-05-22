// src/components/dashboard/analytics/ComplianceMonitor.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Alert,
  Button,
  Divider
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../redux/store';
import { fetchComplianceData } from '../../../redux/slices/dashboardSlice';

// Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import RefreshIcon from '@mui/icons-material/Refresh';

interface ComplianceItem {
  id: number;
  category: string;
  check: string;
  status: 'compliant' | 'non-compliant' | 'warning';
  lastChecked: string;
  details: string;
}

const ComplianceMonitor: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { complianceData, isLoading } = useSelector((state: RootState) => state.dashboard);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    dispatch(fetchComplianceData());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchComplianceData());
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'success';
      case 'non-compliant':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircleIcon fontSize="small" />;
      case 'non-compliant':
        return <ErrorIcon fontSize="small" />;
      case 'warning':
        return <WarningIcon fontSize="small" />;
      default:
        return null;
    }
  };

  const calculateComplianceScore = () => {
    if (!complianceData || complianceData.length === 0) return 0;
    
    const compliantItems = complianceData.filter(item => item.status === 'compliant').length;
    const warningItems = complianceData.filter(item => item.status === 'warning').length;
    
    // Warnings count as half-compliant
    return Math.round(((compliantItems + (warningItems * 0.5)) / complianceData.length) * 100);
  };

  const complianceScore = calculateComplianceScore();

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#4caf50';
    if (score >= 70) return '#ff9800';
    return '#f44336';
  };

  const groupedByCategory = complianceData?.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ComplianceItem[]>) || {};

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Compliance Monitor</Typography>
        <Button 
          startIcon={<RefreshIcon />} 
          onClick={handleRefresh}
          disabled={isLoading}
        >
          Refresh
        </Button>
      </Box>
      
      {showAlert && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Compliance data refreshed successfully
        </Alert>
      )}
      
      {isLoading ? (
        <LinearProgress />
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Paper elevation={0} variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Overall Compliance Score
                </Typography>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      border: '10px solid',
                      borderColor: getScoreColor(complianceScore),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Typography variant="h4" component="div" color={getScoreColor(complianceScore)}>
                      {complianceScore}%
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Compliance Summary
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" color="success.main">
                        {complianceData?.filter(item => item.status === 'compliant').length || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Compliant
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" color="warning.main">
                        {complianceData?.filter(item => item.status === 'warning').length || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Warnings
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" color="error.main">
                        {complianceData?.filter(item => item.status === 'non-compliant').length || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Non-Compliant
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
          
          {Object.entries(groupedByCategory).map(([category, items]) => (
            <Box key={category} sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                {category}
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Compliance Check</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Last Checked</TableCell>
                      <TableCell>Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell>{item.check}</TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(item.status)}
                            label={item.status.replace('-', ' ')}
                            color={getStatusColor(item.status) as "success" | "error" | "warning" | "default"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{new Date(item.lastChecked).toLocaleString()}</TableCell>
                        <TableCell>{item.details}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ))}
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="body2" color="text.secondary">
            Compliance monitoring is based on Indian telecommunication regulations, including TRAI guidelines and DND registry requirements.
            Regular audits are performed to ensure adherence to all applicable laws and regulations.
          </Typography>
        </>
      )}
    </Paper>
  );
};

export default ComplianceMonitor;
