// src/components/dashboard/analytics/AgentPerformanceTable.tsx
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  LinearProgress,
  Chip,
  Avatar,
  Tooltip
} from '@mui/material';

interface AgentPerformanceData {
  id: number;
  name: string;
  avatar?: string;
  callsHandled: number;
  successRate: number;
  averageHandlingTime: number;
  feedbackScore: number;
  status: 'online' | 'offline' | 'busy';
}

interface AgentPerformanceTableProps {
  data: AgentPerformanceData[];
  isLoading: boolean;
}

const AgentPerformanceTable: React.FC<AgentPerformanceTableProps> = ({ data, isLoading }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'success';
      case 'offline':
        return 'default';
      case 'busy':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 80) return '#4caf50';
    if (rate >= 60) return '#ff9800';
    return '#f44336';
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Typography variant="h6" sx={{ p: 2 }}>Agent Performance</Typography>
      
      {isLoading ? (
        <LinearProgress />
      ) : (
        <>
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader aria-label="agent performance table">
              <TableHead>
                <TableRow>
                  <TableCell>Agent</TableCell>
                  <TableCell align="right">Calls Handled</TableCell>
                  <TableCell align="right">Success Rate</TableCell>
                  <TableCell align="right">Avg. Handling Time</TableCell>
                  <TableCell align="right">Feedback Score</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((agent) => (
                    <TableRow hover key={agent.id}>
                      <TableCell component="th" scope="row">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            src={agent.avatar} 
                            alt={agent.name}
                            sx={{ mr: 2, width: 32, height: 32 }}
                          >
                            {agent.name.charAt(0)}
                          </Avatar>
                          {agent.name}
                        </Box>
                      </TableCell>
                      <TableCell align="right">{agent.callsHandled}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <Box sx={{ width: '60%', mr: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={agent.successRate} 
                              sx={{ 
                                height: 8, 
                                borderRadius: 5,
                                backgroundColor: '#e0e0e0',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: getSuccessRateColor(agent.successRate)
                                }
                              }}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {agent.successRate}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">{agent.averageHandlingTime}s</TableCell>
                      <TableCell align="right">{agent.feedbackScore.toFixed(1)}/5.0</TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={agent.status} 
                          color={getStatusColor(agent.status) as "success" | "default" | "warning"} 
                          size="small" 
                        />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={data.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}
    </Paper>
  );
};

export default AgentPerformanceTable;
