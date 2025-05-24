import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  TextField,
  Typography,
  Alert,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Mic as MicIcon,
  Stop as StopIcon,
  VolumeUp as VolumeUpIcon,
  Language as LanguageIcon,
  Settings as SettingsIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import { RootState } from '../../redux/store';
import { multiLingualVoiceApi } from '../../api/multiLingualVoiceApi';

const LanguageDetectionDemo: React.FC = () => {
  const dispatch = useDispatch();
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [responseAudioUrl, setResponseAudioUrl] = useState<string | null>(null);
  const [languageHistory, setLanguageHistory] = useState<Array<{
    language: string;
    timestamp: Date;
    confidence: number;
  }>>([]);
  const [supportedLanguages, setSupportedLanguages] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('english');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // Mock audio recorder (in a real app, this would use the Web Audio API)
  const mediaRecorder = React.useRef<any>(null);
  const audioChunks = React.useRef<Blob[]>([]);
  
  useEffect(() => {
    // Load supported languages
    loadSupportedLanguages();
  }, []);
  
  const loadSupportedLanguages = async () => {
    try {
      const response = await multiLingualVoiceApi.getSupportedLanguages();
      if (response.success) {
        setSupportedLanguages(response.languages);
      }
    } catch (error) {
      console.error('Error loading supported languages:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load supported languages',
        severity: 'error'
      });
    }
  };
  
  const startRecording = async () => {
    try {
      audioChunks.current = [];
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create media recorder
      mediaRecorder.current = new MediaRecorder(stream);
      
      // Set up event handlers
      mediaRecorder.current.ondataavailable = (event: any) => {
        audioChunks.current.push(event.data);
      };
      
      mediaRecorder.current.onstop = () => {
        // Create audio blob
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        
        // Process the recording
        processRecording(audioBlob);
      };
      
      // Start recording
      mediaRecorder.current.start();
      setRecording(true);
      
      setSnackbar({
        open: true,
        message: 'Recording started. Speak now...',
        severity: 'info'
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      setSnackbar({
        open: true,
        message: 'Failed to start recording. Please check microphone permissions.',
        severity: 'error'
      });
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
      setRecording(false);
      
      // Stop all audio tracks
      mediaRecorder.current.stream.getTracks().forEach((track: any) => track.stop());
      
      setSnackbar({
        open: true,
        message: 'Recording stopped. Processing...',
        severity: 'info'
      });
    }
  };
  
  const processRecording = async (audioBlob: Blob) => {
    setProcessing(true);
    
    try {
      // In a real app, this would send the audio to the backend for processing
      // For demo purposes, we'll simulate a response
      
      // Create a FormData object to send the audio file
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      formData.append('language', selectedLanguage);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate language detection result
      const detectedLang = Math.random() > 0.3 ? selectedLanguage : 
        supportedLanguages[Math.floor(Math.random() * supportedLanguages.length)];
      const detectedConfidence = 0.7 + Math.random() * 0.3;
      
      // Update state with detection results
      setDetectedLanguage(detectedLang);
      setConfidence(detectedConfidence);
      
      // Simulate transcript based on detected language
      let simulatedTranscript = '';
      switch (detectedLang) {
        case 'hindi':
          simulatedTranscript = 'नमस्ते, मैं भाषा पहचान प्रणाली का परीक्षण कर रहा हूँ।';
          break;
        case 'tamil':
          simulatedTranscript = 'வணக்கம், நான் மொழி கண்டறிதல் அமைப்பை சோதிக்கிறேன்.';
          break;
        case 'bengali':
          simulatedTranscript = 'নমস্কার, আমি ভাষা সনাক্তকরণ সিস্টেম পরীক্ষা করছি।';
          break;
        default:
          simulatedTranscript = 'Hello, I am testing the language detection system.';
      }
      
      setTranscript(simulatedTranscript);
      
      // Add to language history
      setLanguageHistory(prev => [
        {
          language: detectedLang,
          timestamp: new Date(),
          confidence: detectedConfidence
        },
        ...prev.slice(0, 9) // Keep only the last 10 entries
      ]);
      
      // Generate response based on detected language
      let simulatedResponse = '';
      switch (detectedLang) {
        case 'hindi':
          simulatedResponse = 'हां, मैं आपकी हिंदी समझ सकता हूँ। कृपया जारी रखें।';
          break;
        case 'tamil':
          simulatedResponse = 'ஆம், எனக்கு உங்கள் தமிழ் புரிகிறது. தொடரவும்.';
          break;
        case 'bengali':
          simulatedResponse = 'হ্যাঁ, আমি আপনার বাংলা বুঝতে পারি। অনুগ্রহ করে চালিয়ে যান।';
          break;
        default:
          simulatedResponse = 'Yes, I can understand your English. Please continue.';
      }
      
      setResponse(simulatedResponse);
      
      // Simulate response audio URL
      setResponseAudioUrl(audioUrl);
      
      setSnackbar({
        open: true,
        message: `Language detected: ${detectedLang} (${(detectedConfidence * 100).toFixed(1)}% confidence)`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error processing recording:', error);
      setSnackbar({
        open: true,
        message: 'Failed to process recording',
        severity: 'error'
      });
    } finally {
      setProcessing(false);
    }
  };
  
  const playResponseAudio = () => {
    if (responseAudioUrl) {
      const audio = new Audio(responseAudioUrl);
      audio.play();
    }
  };
  
  const handleLanguageChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedLanguage(event.target.value as string);
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  const getLanguageColor = (language: string) => {
    const colorMap: Record<string, string> = {
      english: '#1976d2',
      hindi: '#388e3c',
      tamil: '#d32f2f',
      bengali: '#7b1fa2',
      telugu: '#0288d1',
      marathi: '#f57c00',
      gujarati: '#c2185b',
      kannada: '#689f38',
      malayalam: '#00796b',
      punjabi: '#fbc02d',
      odia: '#5d4037',
      assamese: '#00acc1'
    };
    
    return colorMap[language] || '#757575';
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h4" gutterBottom>
          Real-Time Language Detection Demo
          <Tooltip title="This demo showcases the real-time language detection capabilities of the system">
            <IconButton size="small">
              <HelpIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Typography>
        
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <LanguageIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Language Selection
                </Typography>
                
                <FormControl fullWidth variant="outlined" margin="normal">
                  <InputLabel id="language-select-label">Select Language</InputLabel>
                  <Select
                    labelId="language-select-label"
                    id="language-select"
                    value={selectedLanguage}
                    onChange={handleLanguageChange}
                    label="Select Language"
                  >
                    {supportedLanguages.map((language) => (
                      <MenuItem key={language} value={language}>
                        {language.charAt(0).toUpperCase() + language.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    Select the language you want to speak in
                  </FormHelperText>
                </FormControl>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  {!recording ? (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<MicIcon />}
                      onClick={startRecording}
                      disabled={processing}
                      size="large"
                      sx={{ borderRadius: '50%', width: 100, height: 100 }}
                    >
                      Start
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<StopIcon />}
                      onClick={stopRecording}
                      size="large"
                      sx={{ borderRadius: '50%', width: 100, height: 100 }}
                    >
                      Stop
                    </Button>
                  )}
                </Box>
                
                {processing && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <CircularProgress />
                  </Box>
                )}
              </CardContent>
            </Card>
            
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Language History
                </Typography>
                
                {languageHistory.length === 0 ? (
                  <Typography variant="body2" color="textSecondary">
                    No language detection history yet
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {languageHistory.map((entry, index) => (
                      <Chip
                        key={index}
                        label={`${entry.language} (${(entry.confidence * 100).toFixed(0)}%)`}
                        sx={{
                          bgcolor: getLanguageColor(entry.language),
                          color: 'white'
                        }}
                        size="small"
                      />
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Detection Results
                </Typography>
                
                {detectedLanguage ? (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Chip
                        label={`${detectedLanguage.charAt(0).toUpperCase() + detectedLanguage.slice(1)}`}
                        sx={{
                          bgcolor: getLanguageColor(detectedLanguage),
                          color: 'white',
                          fontSize: '1.1rem',
                          fontWeight: 'bold',
                          mr: 1
                        }}
                      />
                      <Typography variant="body1">
                        Confidence: {confidence ? `${(confidence * 100).toFixed(1)}%` : 'N/A'}
                      </Typography>
                    </Box>
                    
                    <TextField
                      label="Transcript"
                      multiline
                      rows={3}
                      value={transcript}
                      fullWidth
                      variant="outlined"
                      InputProps={{ readOnly: true }}
                      sx={{ mb: 2 }}
                    />
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="h6" gutterBottom>
                      AI Response
                    </Typography>
                    
                    <TextField
                      label="Response"
                      multiline
                      rows={3}
                      value={response}
                      fullWidth
                      variant="outlined"
                      InputProps={{ readOnly: true }}
                      sx={{ mb: 2 }}
                    />
                    
                    {responseAudioUrl && (
                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<VolumeUpIcon />}
                        onClick={playResponseAudio}
                      >
                        Play Response
                      </Button>
                    )}
                  </>
                ) : (
                  <Typography variant="body1" color="textSecondary">
                    Speak into the microphone to detect language
                  </Typography>
                )}
              </CardContent>
            </Card>
            
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Configuration
                </Typography>
                
                <Typography variant="body2" paragraph>
                  This demo uses the real-time language detection engine with ElevenLabs voice synthesis.
                </Typography>
                
                <Button
                  variant="outlined"
                  color="primary"
                  component="a"
                  href="/settings/api-configuration"
                >
                  Configure API Settings
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
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

export default LanguageDetectionDemo;
