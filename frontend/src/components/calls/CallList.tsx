// src/components/calls/CallList.tsx
import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  Button,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { fetchCalls } from '../../redux/slices/callSlice';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PhoneIcon from '@mui/icons-material/Phone';
import HeadsetIcon from '@mui/icons-material/Headset';

const CallList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { calls, isLoading, error, totalCalls, currentPage, totalPages } = useSelector((state: RootState) => state.calls);
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [campaignFilter, setCampaignFilter] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  
  useEffect(() => {
    dispatch(fetchCalls({ 
      page: page + 1, 
      limit: rowsPerPage,
      status: statusFilter,
      campaign_id: campaignFilter ? parseInt(campaignFilter) : undefined,
      start_date: dateRange.startDate || undefined,
      end_date: dateRange.endDate || undefined
    }));
  }, [dispatch, page, rowsPerPage, statusFilter, campaignFilter, dateRange]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setStatusFilter(event.target.value as string);
    setPage(0);
  };

  const handleCampaignFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setCampaignFilter(event.target.value as string);
    setPage(0);
  };

  const handleViewCall = (id: number) => {
    navigate(`/calls/${id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'info';
      case 'failed':
        return 'error';
      case 'no-answer':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Calls</Typography>
      </Box>
      
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            variant="outlined"
            placeholder="Search calls..."
            size="small"
            value={searchTerm}
            onChange={handleSearch}
            sx={{ width: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              id="status-filter"
              value={statusFilter}
              label="Status"
              onChange={handleStatusFilterChange}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
              <MenuItem value="no-answer">No Answer</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="campaign-filter-label">Campaign</InputLabel>
            <Select
              labelId="campaign-filter-label"
              id="campaign-filter"
              value={campaignFilter}
              label="Campaign"
              onChange={handleCampaignFilterChange}
            >
              <MenuItem value="">All Campaigns</MenuItem>
              {/* Campaign options would be dynamically loaded here */}
            </Select>
          </FormControl>
          
          <TextField
            label="Start Date"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
          />
          
          <TextField
            label="End Date"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
          />
        </Box>
        
        <TableContainer>
          <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
            <TableHead>
              <TableRow>
                <TableCell>Lead</TableCell>
                <TableCell>Campaign</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Outcome</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading && calls.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="error">{error}</Typography>
                  </TableCell>
                </TableRow>
              ) : calls.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography>No calls found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                calls.map((call) => (
                  <TableRow
                    hover
                    key={call.id}
                    onClick={() => handleViewCall(call.id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      {call.CampaignLead?.Lead ? 
                        `${call.CampaignLead.Lead.first_name} ${call.CampaignLead.Lead.last_name}` : 
                        'Unknown Lead'}
                    </TableCell>
                    <TableCell>{call.CampaignLead?.Campaign?.name || 'Unknown Campaign'}</TableCell>
                    <TableCell>
                      {call.start_time ? format(new Date(call.start_time), 'MMM dd, yyyy HH:mm') : 'N/A'}
                    </TableCell>
                    <TableCell>{call.duration ? `${call.duration}s` : 'N/A'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={call.status} 
                        color={getStatusColor(call.status) as "success" | "info" | "error" | "warning" | "default"} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      {call.outcome || 'N/A'}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewCall(call.id);
                          }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      {call.recording_url && (
                        <Tooltip title="Listen to Recording">
                          <IconButton 
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle playing recording
                            }}
                          >
                            <HeadsetIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalCalls}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default CallList;
