// src/components/leads/LeadList.tsx
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
import { fetchLeads, checkDNDStatus } from '../../redux/slices/leadSlice';
import { useNavigate } from 'react-router-dom';

// Icons
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PhoneIcon from '@mui/icons-material/Phone';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';

const LeadList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { leads, isLoading, error, totalLeads, currentPage, totalPages } = useSelector((state: RootState) => state.leads);
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  useEffect(() => {
    dispatch(fetchLeads({ 
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

  const handleAddLead = () => {
    navigate('/leads/new');
  };

  const handleEditLead = (id: number) => {
    navigate(`/leads/${id}/edit`);
  };

  const handleViewLead = (id: number) => {
    navigate(`/leads/${id}`);
  };

  const handleCheckDND = (id: number) => {
    dispatch(checkDNDStatus(id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'info';
      case 'contacted':
        return 'primary';
      case 'qualified':
        return 'success';
      case 'converted':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Leads</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleAddLead}
        >
          Add Lead
        </Button>
      </Box>
      
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
          <TextField
            variant="outlined"
            placeholder="Search leads..."
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
                <TableCell>Phone</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Language</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>DND Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading && leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="error">{error}</Typography>
                  </TableCell>
                </TableRow>
              ) : leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography>No leads found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => (
                  <TableRow
                    hover
                    key={lead.id}
                    onClick={() => handleViewLead(lead.id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>{`${lead.first_name} ${lead.last_name}`}</TableCell>
                    <TableCell>{lead.phone_number}</TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell>{lead.lead_source || 'N/A'}</TableCell>
                    <TableCell>{lead.language_preference}</TableCell>
                    <TableCell>
                      <Chip 
                        label={lead.status} 
                        color={getStatusColor(lead.status) as "success" | "info" | "error" | "warning" | "primary" | "default"} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      {lead.dnd_checked_at ? (
                        lead.dnd_status ? (
                          <Tooltip title="On DND Registry">
                            <BlockIcon color="error" />
                          </Tooltip>
                        ) : (
                          <Tooltip title="Not on DND Registry">
                            <CheckCircleIcon color="success" />
                          </Tooltip>
                        )
                      ) : (
                        <Tooltip title="Check DND Status">
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCheckDND(lead.id);
                            }}
                          >
                            <PhoneIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditLead(lead.id);
                          }}
                        >
                          <EditIcon />
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
          count={totalLeads}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default LeadList;
