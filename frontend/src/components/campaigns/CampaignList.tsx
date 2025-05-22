// src/components/campaigns/CampaignList.tsx
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
  CircularProgress
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { fetchCampaigns } from '../../redux/slices/campaignSlice';
import { useNavigate } from 'react-router-dom';

// Icons
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

const CampaignList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { campaigns, isLoading, error, totalCampaigns, currentPage, totalPages } = useSelector((state: RootState) => state.campaigns);
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  useEffect(() => {
    dispatch(fetchCampaigns({ 
      page: page + 1, 
      limit: rowsPerPage,
      search: searchTerm,
      status: statusFilter
    }));
  }, [dispatch, page, rowsPerPage, searchTerm, statusFilter]);

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

  const handleAddCampaign = () => {
    navigate('/campaigns/new');
  };

  const handleEditCampaign = (id: number) => {
    navigate(`/campaigns/${id}/edit`);
  };

  const handleViewCampaign = (id: number) => {
    navigate(`/campaigns/${id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'paused':
        return 'warning';
      case 'completed':
        return 'info';
      case 'draft':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Campaigns</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleAddCampaign}
        >
          Create Campaign
        </Button>
      </Box>
      
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
          <TextField
            variant="outlined"
            placeholder="Search campaigns..."
            size="small"
            value={searchTerm}
            onChange={handleSearch}
            sx={{ width: 300, mr: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          {/* Additional filters can be added here */}
        </Box>
        
        <TableContainer>
          <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Goal</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Leads</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading && campaigns.length === 0 ? (
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
              ) : campaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography>No campaigns found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                campaigns.map((campaign) => (
                  <TableRow
                    hover
                    key={campaign.id}
                    onClick={() => handleViewCampaign(campaign.id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>{campaign.name}</TableCell>
                    <TableCell>{campaign.goal}</TableCell>
                    <TableCell>{campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : 'Not started'}</TableCell>
                    <TableCell>{campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : 'No end date'}</TableCell>
                    <TableCell>{campaign.lead_count || 0}</TableCell>
                    <TableCell>
                      <Chip 
                        label={campaign.status} 
                        color={getStatusColor(campaign.status) as "success" | "info" | "error" | "warning" | "default"} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View">
                        <IconButton 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewCampaign(campaign.id);
                          }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCampaign(campaign.id);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={campaign.status === 'active' ? 'Pause' : 'Activate'}>
                        <IconButton 
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle campaign status toggle
                          }}
                        >
                          {campaign.status === 'active' ? <PauseIcon /> : <PlayArrowIcon />}
                        </IconButton>
                      </Tooltip>
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
          count={totalCampaigns}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default CampaignList;
