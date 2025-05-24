import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Snackbar,
  Tab,
  Tabs,
  TextField,
  Typography,
  Alert,
  Tooltip
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  Backup as BackupIcon,
  Restore as RestoreIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import { apiConfigApi } from '../../api/apiConfigApi';
import { RootState } from '../../redux/store';
import { setApiCredentials, setApiStatus } from '../../redux/slices/settingsSlice';

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
      id={`api-config-tabpanel-${index}`}
      aria-labelledby={`api-config-tab-${index}`}
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

function a11yProps(index: number) {
  return {
    id: `api-config-tab-${index}`,
    'aria-controls': `api-config-tabpanel-${index}`,
  };
}

const ApiConfigurationPage: React.FC = () => {
  const dispatch = useDispatch();
  const apiCredentials = useSelector((state: RootState) => state.settings.apiCredentials);
  const apiStatus = useSelector((state: RootState) => state.settings.apiStatus);
  
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });
  
  const [credentials, setCredentials] = useState<Record<string, any>>({
    elevenlabs: {
      apiKey: '',
      model: 'eleven_multilingual_v2'
    },
    languageDetection: {
      apiKey: '',
      region: 'global',
      minConfidence: 0.6
    },
    voiceSettings: {
      defaultVoice: 'female',
      defaultPersonality: 'professional',
      defaultLanguage: 'english'
    }
  });
  
  const [backups, setBackups] = useState<Array<{
    path: string;
    filename: string;
    created: string;
    size: number;
  }>>([]);
  
  const [selectedBackup, setSelectedBackup] = useState('');
  
  useEffect(() => {
    // Load API credentials on component mount
    loadApiCredentials();
    loadBackups();
  }, []);
  
  useEffect(() => {
    // Update local state when redux state changes
    if (apiCredentials) {
      setCredentials(prevState => ({
        ...prevState,
        ...apiCredentials
      }));
    }
  }, [apiCredentials]);
  
  const loadApiCredentials = async () => {
    setLoading(true);
    try {
      const response = await apiConfigApi.getApiCredentials();
      if (response.success) {
        dispatch(setApiCredentials(response.credentials));
        dispatch(setApiStatus(response.status));
      }
    } catch (error) {
      console.error('Error loading API credentials:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load API credentials',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const loadBackups = async () => {
    try {
      const response = await apiConfigApi.getAvailableBackups();
      if (response.success) {
        setBackups(response.backups);
      }
    } catch (error) {
      console.error('Error loading backups:', error);
    }
  };
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleCredentialChange = (service: string, field: string, value: any) => {
    setCredentials(prevState => ({
      ...prevState,
      [service]: {
        ...prevState[service],
        [field]: value
      }
    }));
  };
  
  const handleToggleShowPassword = (field: string) => {
    setShowPassword(prevState => ({
      ...prevState,
      [field]: !prevState[field]
    }));
  };
  
  const validateCredentials = async (service: string) => {
    setValidating({ ...validating, [service]: true });
    try {
      const response = await apiConfigApi.validateCredentials(service, credentials[service]);
      
      setSnackbar({
        open: true,
        message: response.valid ? 
          `${service} credentials validated successfully` : 
          `${service} credentials validation failed: ${response.message}`,
        severity: response.valid ? 'success' : 'error'
      });
      
      // Update API status in redux
      if (response.valid) {
        dispatch(setApiStatus({
          ...apiStatus,
          [service]: {
            valid: true,
            message: 'Credentials validated successfully',
            lastChecked: new Date().toISOString()
          }
        }));
      }
      
      return response.valid;
    } catch (error) {
      console.error(`Error validating ${service} credentials:`, error);
      setSnackbar({
        open: true,
        message: `Failed to validate ${service} credentials`,
        severity: 'error'
      });
      return false;
    } finally {
      setValidating({ ...validating, [service]: false });
    }
  };
  
  const saveCredentials = async (service: string) => {
    setLoading(true);
    try {
      // Validate credentials before saving
      const isValid = await validateCredentials(service);
      
      if (isValid) {
        const response = await apiConfigApi.saveCredentials(service, credentials[service]);
        
        if (response.success) {
          setSnackbar({
            open: true,
            message: `${service} credentials saved successfully`,
            severity: 'success'
          });
          
          // Update redux state
          dispatch(setApiCredentials({
            ...apiCredentials,
            [service]: credentials[service]
          }));
        } else {
          setSnackbar({
            open: true,
            message: `Failed to save ${service} credentials: ${response.message}`,
            severity: 'error'
          });
        }
      }
    } catch (error) {
      console.error(`Error saving ${service} credentials:`, error);
      setSnackbar({
        open: true,
        message: `Failed to save ${service} credentials`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const createBackup = async () => {
    setLoading(true);
    try {
      const response = await apiConfigApi.createBackup();
      
      if (response.success) {
        setSnackbar({
          open: true,
          message: `Backup created successfully: ${response.backupPath}`,
          severity: 'success'
        });
        
        // Refresh backups list
        loadBackups();
      } else {
        setSnackbar({
          open: true,
          message: `Failed to create backup: ${response.message}`,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      setSnackbar({
        open: true,
        message: 'Failed to create backup',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const restoreFromBackup = async () => {
    if (!selectedBackup) {
      setSnackbar({
        open: true,
        message: 'Please select a backup to restore',
        severity: 'warning'
      });
      return;
    }
    
    setLoading(true);
    try {
      const response = await apiConfigApi.restoreFromBackup(selectedBackup);
      
      if (response.success) {
        setSnackbar({
          open: true,
          message: 'Credentials restored successfully from backup',
          severity: 'success'
        });
        
        // Reload credentials
        loadApiCredentials();
      } else {
        setSnackbar({
          open: true,
          message: `Failed to restore from backup: ${response.message}`,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error restoring from backup:', error);
      setSnackbar({
        open: true,
        message: 'Failed to restore from backup',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="API configuration tabs">
            <Tab label="ElevenLabs" {...a11yProps(0)} />
            <Tab label="Language Detection" {...a11yProps(1)} />
            <Tab label="Voice Settings" {...a11yProps(2)} />
            <Tab label="Backup & Restore" {...a11yProps(3)} />
          </Tabs>
        </Box>
        
        {/* ElevenLabs Configuration */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            ElevenLabs Voice API Configuration
            <Tooltip title="ElevenLabs provides high-quality voice synthesis for multiple languages and accents">
              <IconButton size="small">
                <HelpIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined" margin="normal">
                <InputLabel htmlFor="elevenlabs-api-key">API Key</InputLabel>
                <OutlinedInput
                  id="elevenlabs-api-key"
                  type={showPassword.elevenLabsApiKey ? 'text' : 'password'}
                  value={credentials.elevenlabs?.apiKey || ''}
                  onChange={(e) => handleCredentialChange('elevenlabs', 'apiKey', e.target.value)}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => handleToggleShowPassword('elevenLabsApiKey')}
                        edge="end"
                      >
                        {showPassword.elevenLabsApiKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  }
                  label="API Key"
                />
                <FormHelperText>
                  Enter your ElevenLabs API key. You can find this in your ElevenLabs dashboard.
                </FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined" margin="normal">
                <InputLabel id="elevenlabs-model-label">Model</InputLabel>
                <Select
                  labelId="elevenlabs-model-label"
                  id="elevenlabs-model"
                  value={credentials.elevenlabs?.model || 'eleven_multilingual_v2'}
                  onChange={(e) => handleCredentialChange('elevenlabs', 'model', e.target.value)}
                  label="Model"
                >
                  <MenuItem value="eleven_monolingual_v1">Monolingual v1</MenuItem>
                  <MenuItem value="eleven_multilingual_v1">Multilingual v1</MenuItem>
                  <MenuItem value="eleven_multilingual_v2">Multilingual v2 (Recommended)</MenuItem>
                </Select>
                <FormHelperText>
                  Select the ElevenLabs model to use. Multilingual v2 is recommended for Indian languages.
                </FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => validateCredentials('elevenlabs')}
                  disabled={validating.elevenlabs || !credentials.elevenlabs?.apiKey}
                  startIcon={validating.elevenlabs ? <CircularProgress size={20} /> : <CheckIcon />}
                  sx={{ mr: 2 }}
                >
                  Validate
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => saveCredentials('elevenlabs')}
                  disabled={loading || !credentials.elevenlabs?.apiKey}
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                >
                  Save
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Card variant="outlined" sx={{ mt: 2 }}>
                <CardHeader title="API Status" />
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {apiStatus?.elevenlabs?.valid ? (
                      <CheckIcon color="success" sx={{ mr: 1 }} />
                    ) : (
                      <ErrorIcon color="error" sx={{ mr: 1 }} />
                    )}
                    <Typography>
                      {apiStatus?.elevenlabs?.valid ? 'Connected' : 'Not Connected'}
                    </Typography>
                  </Box>
                  {apiStatus?.elevenlabs?.lastChecked && (
                    <Typography variant="body2" color="textSecondary">
                      Last checked: {new Date(apiStatus.elevenlabs.lastChecked).toLocaleString()}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Language Detection Configuration */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Language Detection API Configuration
            <Tooltip title="Configure the language detection service for real-time language switching">
              <IconButton size="small">
                <HelpIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined" margin="normal">
                <InputLabel htmlFor="language-detection-api-key">API Key</InputLabel>
                <OutlinedInput
                  id="language-detection-api-key"
                  type={showPassword.languageDetectionApiKey ? 'text' : 'password'}
                  value={credentials.languageDetection?.apiKey || ''}
                  onChange={(e) => handleCredentialChange('languageDetection', 'apiKey', e.target.value)}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => handleToggleShowPassword('languageDetectionApiKey')}
                        edge="end"
                      >
                        {showPassword.languageDetectionApiKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  }
                  label="API Key"
                />
                <FormHelperText>
                  Enter your language detection API key.
                </FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined" margin="normal">
                <InputLabel id="language-detection-region-label">Region</InputLabel>
                <Select
                  labelId="language-detection-region-label"
                  id="language-detection-region"
                  value={credentials.languageDetection?.region || 'global'}
                  onChange={(e) => handleCredentialChange('languageDetection', 'region', e.target.value)}
                  label="Region"
                >
                  <MenuItem value="global">Global</MenuItem>
                  <MenuItem value="asia-south1">Asia South (Mumbai)</MenuItem>
                  <MenuItem value="asia-east1">Asia East (Singapore)</MenuItem>
                  <MenuItem value="us-central1">US Central</MenuItem>
                  <MenuItem value="europe-west1">Europe West</MenuItem>
                </Select>
                <FormHelperText>
                  Select the region for language detection API. Choose the closest region for best performance.
                </FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined" margin="normal">
                <InputLabel htmlFor="min-confidence">Minimum Confidence</InputLabel>
                <OutlinedInput
                  id="min-confidence"
                  type="number"
                  value={credentials.languageDetection?.minConfidence || 0.6}
                  onChange={(e) => handleCredentialChange(
                    'languageDetection', 
                    'minConfidence', 
                    parseFloat(e.target.value)
                  )}
                  inputProps={{ min: 0, max: 1, step: 0.1 }}
                  label="Minimum Confidence"
                />
                <FormHelperText>
                  Minimum confidence threshold (0-1) for language detection.
                </FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => validateCredentials('languageDetection')}
                  disabled={validating.languageDetection || !credentials.languageDetection?.apiKey}
                  startIcon={validating.languageDetection ? <CircularProgress size={20} /> : <CheckIcon />}
                  sx={{ mr: 2 }}
                >
                  Validate
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => saveCredentials('languageDetection')}
                  disabled={loading || !credentials.languageDetection?.apiKey}
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                >
                  Save
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Card variant="outlined" sx={{ mt: 2 }}>
                <CardHeader title="API Status" />
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {apiStatus?.languageDetection?.valid ? (
                      <CheckIcon color="success" sx={{ mr: 1 }} />
                    ) : (
                      <ErrorIcon color="error" sx={{ mr: 1 }} />
                    )}
                    <Typography>
                      {apiStatus?.languageDetection?.valid ? 'Connected' : 'Not Connected'}
                    </Typography>
                  </Box>
                  {apiStatus?.languageDetection?.lastChecked && (
                    <Typography variant="body2" color="textSecondary">
                      Last checked: {new Date(apiStatus.languageDetection.lastChecked).toLocaleString()}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Voice Settings Configuration */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Voice Settings
            <Tooltip title="Configure default voice settings for calls">
              <IconButton size="small">
                <HelpIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth variant="outlined" margin="normal">
                <InputLabel id="default-voice-type-label">Default Voice Type</InputLabel>
                <Select
                  labelId="default-voice-type-label"
                  id="default-voice-type"
                  value={credentials.voiceSettings?.defaultVoice || 'female'}
                  onChange={(e) => handleCredentialChange('voiceSettings', 'defaultVoice', e.target.value)}
                  label="Default Voice Type"
                >
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="male">Male</MenuItem>
                </Select>
                <FormHelperText>
                  Select the default voice type for calls.
                </FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth variant="outlined" margin="normal">
                <InputLabel id="default-personality-label">Default Personality</InputLabel>
                <Select
                  labelId="default-personality-label"
                  id="default-personality"
                  value={credentials.voiceSettings?.defaultPersonality || 'professional'}
                  onChange={(e) => handleCredentialChange('voiceSettings', 'defaultPersonality', e.target.value)}
                  label="Default Personality"
                >
                  <MenuItem value="professional">Professional</MenuItem>
                  <MenuItem value="friendly">Friendly</MenuItem>
                  <MenuItem value="empathetic">Empathetic</MenuItem>
                </Select>
                <FormHelperText>
                  Select the default voice personality for calls.
                </FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth variant="outlined" margin="normal">
                <InputLabel id="default-language-label">Default Language</InputLabel>
                <Select
                  labelId="default-language-label"
                  id="default-language"
                  value={credentials.voiceSettings?.defaultLanguage || 'english'}
                  onChange={(e) => handleCredentialChange('voiceSettings', 'defaultLanguage', e.target.value)}
                  label="Default Language"
                >
                  <MenuItem value="english">English</MenuItem>
                  <MenuItem value="hindi">Hindi</MenuItem>
                  <MenuItem value="tamil">Tamil</MenuItem>
                  <MenuItem value="telugu">Telugu</MenuItem>
                  <MenuItem value="bengali">Bengali</MenuItem>
                  <MenuItem value="marathi">Marathi</MenuItem>
                  <MenuItem value="gujarati">Gujarati</MenuItem>
                  <MenuItem value="kannada">Kannada</MenuItem>
                  <MenuItem value="malayalam">Malayalam</MenuItem>
                  <MenuItem value="punjabi">Punjabi</MenuItem>
                  <MenuItem value="odia">Odia</MenuItem>
                  <MenuItem value="assamese">Assamese</MenuItem>
                </Select>
                <FormHelperText>
                  Select the default language for calls.
                </FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => saveCredentials('voiceSettings')}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                >
                  Save
                </Button>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Backup & Restore */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Backup & Restore
            <Tooltip title="Create backups of your API configurations and restore when needed">
              <IconButton size="small">
                <HelpIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={createBackup}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <BackupIcon />}
                sx={{ mb: 2 }}
              >
                Create Backup
              </Button>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Available Backups
              </Typography>
              
              {backups.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  No backups available
                </Typography>
              ) : (
                <>
                  <FormControl fullWidth variant="outlined" margin="normal">
                    <InputLabel id="backup-select-label">Select Backup</InputLabel>
                    <Select
                      labelId="backup-select-label"
                      id="backup-select"
                      value={selectedBackup}
                      onChange={(e) => setSelectedBackup(e.target.value as string)}
                      label="Select Backup"
                    >
                      {backups.map((backup) => (
                        <MenuItem key={backup.path} value={backup.path}>
                          {backup.filename} - {new Date(backup.created).toLocaleString()}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={restoreFromBackup}
                    disabled={loading || !selectedBackup}
                    startIcon={loading ? <CircularProgress size={20} /> : <RestoreIcon />}
                    sx={{ mt: 2 }}
                  >
                    Restore Selected Backup
                  </Button>
                </>
              )}
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ApiConfigurationPage;
