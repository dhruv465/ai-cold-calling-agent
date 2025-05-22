// src/components/dashboard/cards/KPICard.tsx
import React from 'react';
import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon, color }) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
        <Avatar
          sx={{
            backgroundColor: color,
            height: 56,
            width: 56,
            mr: 2
          }}
        >
          {icon}
        </Avatar>
        <Box>
          <Typography color="textSecondary" gutterBottom variant="overline">
            {title}
          </Typography>
          <Typography variant="h4">{value}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default KPICard;
