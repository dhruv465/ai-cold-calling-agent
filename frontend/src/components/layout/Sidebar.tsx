// src/components/layout/Sidebar.tsx
import React from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Box, 
  Toolbar,
  Collapse,
  ListItemButton
} from '@mui/material';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { RootState } from '../../redux/store';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import CampaignIcon from '@mui/icons-material/Campaign';
import PhoneIcon from '@mui/icons-material/Phone';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TimelineIcon from '@mui/icons-material/Timeline';
import InsightsIcon from '@mui/icons-material/Insights';

const drawerWidth = 240;

const Sidebar: React.FC = () => {
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [openAnalytics, setOpenAnalytics] = React.useState(false);
  const [openSettings, setOpenSettings] = React.useState(false);

  const handleAnalyticsClick = () => {
    setOpenAnalytics(!openAnalytics);
  };

  const handleSettingsClick = () => {
    setOpenSettings(!openSettings);
  };

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'admin' || user?.role === 'manager';

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', access: true },
    { text: 'Leads', icon: <PeopleIcon />, path: '/leads', access: true },
    { text: 'Campaigns', icon: <CampaignIcon />, path: '/campaigns', access: isManager },
    { text: 'Calls', icon: <PhoneIcon />, path: '/calls', access: true },
  ];

  const analyticsItems = [
    { text: 'Overview', icon: <BarChartIcon />, path: '/analytics', access: true },
    { text: 'Call Metrics', icon: <TimelineIcon />, path: '/analytics/calls', access: true },
    { text: 'Lead Metrics', icon: <AssessmentIcon />, path: '/analytics/leads', access: true },
    { text: 'Agent Performance', icon: <InsightsIcon />, path: '/analytics/agents', access: isManager },
  ];

  const settingsItems = [
    { text: 'Profile', icon: <PersonIcon />, path: '/settings/profile', access: true },
    { text: 'User Management', icon: <GroupIcon />, path: '/settings/users', access: isAdmin },
    { text: 'System Settings', icon: <SettingsIcon />, path: '/settings/system', access: isAdmin },
  ];

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {menuItems.filter(item => item.access).map((item) => (
          <ListItem 
            button 
            key={item.text} 
            onClick={() => navigate(item.path)}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItemButton onClick={handleAnalyticsClick}>
          <ListItemIcon>
            <BarChartIcon />
          </ListItemIcon>
          <ListItemText primary="Analytics" />
          {openAnalytics ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openAnalytics} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {analyticsItems.filter(item => item.access).map((item) => (
              <ListItemButton 
                key={item.text} 
                sx={{ pl: 4 }}
                onClick={() => navigate(item.path)}
                selected={location.pathname === item.path}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            ))}
          </List>
        </Collapse>
        <ListItemButton onClick={handleSettingsClick}>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Settings" />
          {openSettings ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openSettings} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {settingsItems.filter(item => item.access).map((item) => (
              <ListItemButton 
                key={item.text} 
                sx={{ pl: 4 }}
                onClick={() => navigate(item.path)}
                selected={location.pathname === item.path}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            ))}
          </List>
        </Collapse>
      </List>
    </div>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      <Drawer
        variant="temporary"
        open={sidebarOpen}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
