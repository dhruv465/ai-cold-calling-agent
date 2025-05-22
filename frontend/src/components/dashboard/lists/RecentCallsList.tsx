// src/components/dashboard/lists/RecentCallsList.tsx
import React from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  Typography, 
  Chip,
  Divider,
  Box
} from '@mui/material';
import { format } from 'date-fns';
import PhoneIcon from '@mui/icons-material/Phone';
import { Call } from '../../../types';
import { useNavigate } from 'react-router-dom';

interface RecentCallsListProps {
  calls: Call[];
}

const RecentCallsList: React.FC<RecentCallsListProps> = ({ calls }) => {
  const navigate = useNavigate();

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

  const handleCallClick = (callId: number) => {
    navigate(`/calls/${callId}`);
  };

  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper', maxHeight: 300, overflow: 'auto' }}>
      {calls.length > 0 ? (
        calls.map((call, index) => (
          <React.Fragment key={call.id}>
            <ListItem alignItems="flex-start" button onClick={() => handleCallClick(call.id)}>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: getStatusColor(call.status) === 'success' ? 'success.main' : 'primary.main' }}>
                  <PhoneIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1">
                      {call.CampaignLead?.Lead?.first_name} {call.CampaignLead?.Lead?.last_name}
                    </Typography>
                    <Chip 
                      label={call.status} 
                      color={getStatusColor(call.status) as "success" | "info" | "error" | "warning" | "default"} 
                      size="small" 
                    />
                  </Box>
                }
                secondary={
                  <React.Fragment>
                    <Typography
                      sx={{ display: 'inline' }}
                      component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      {call.CampaignLead?.Campaign?.name}
                    </Typography>
                    {" — "}
                    {call.start_time && format(new Date(call.start_time), 'MMM dd, yyyy HH:mm')}
                    {call.duration && ` • ${call.duration}s`}
                  </React.Fragment>
                }
              />
            </ListItem>
            {index < calls.length - 1 && <Divider variant="inset" component="li" />}
          </React.Fragment>
        ))
      ) : (
        <ListItem>
          <ListItemText primary="No recent calls" />
        </ListItem>
      )}
    </List>
  );
};

export default RecentCallsList;
