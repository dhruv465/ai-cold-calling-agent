import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { useToast } from '../ui/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../ui/dialog';
import { Mic, Play, Pause, VolumeX, Volume2, Settings, HelpCircle } from 'lucide-react';

const LanguageDetectionDemo = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isRecording, setIsRecording] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [detectedLanguage, setDetectedLanguage] = React.useState(null);
  const [confidence, setConfidence] = React.useState(0);
  const [transcript, setTranscript] = React.useState('');
  const [response, setResponse] = React.useState('');
  
  const supportedLanguages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ta', name: 'Tamil' },
    { code: 'te', name: 'Telugu' },
    { code: 'bn', name: 'Bengali' },
    { code: 'mr', name: 'Marathi' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'kn', name: 'Kannada' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'pa', name: 'Punjabi' },
    { code: 'ur', name: 'Urdu' },
    { code: 'or', name: 'Odia' }
  ];

  const handleStartRecording = () => {
    setIsRecording(true);
    toast({
      title: "Recording started",
      description: "Speak now. The system will detect your language automatically.",
    });
    
    // Simulate recording for demo purposes
    setTimeout(() => {
      handleStopRecording();
    }, 5000);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    
    // Simulate language detection
    const randomLanguage = supportedLanguages[Math.floor(Math.random() * supportedLanguages.length)];
    const randomConfidence = Math.random() * 0.3 + 0.7; // Between 0.7 and 1.0
    
    setDetectedLanguage(randomLanguage);
    setConfidence(randomConfidence);
    
    // Set a sample transcript based on the detected language
    if (randomLanguage.code === 'en') {
      setTranscript("Hello, I'm interested in learning more about your services.");
    } else if (randomLanguage.code === 'hi') {
      setTranscript("नमस्ते, मैं आपकी सेवाओं के बारे में अधिक जानना चाहता हूं।");
    } else if (randomLanguage.code === 'ta') {
      setTranscript("வணக்கம், உங்கள் சேவைகளைப் பற்றி மேலும் அறிய விரும்புகிறேன்.");
    } else {
      setTranscript("Sample transcript in " + randomLanguage.name);
    }
    
    // Generate a sample response
    setTimeout(() => {
      if (randomLanguage.code === 'en') {
        setResponse("Thank you for your interest! I'd be happy to tell you more about our services. We offer...");
      } else if (randomLanguage.code === 'hi') {
        setResponse("आपकी रुचि के लिए धन्यवाद! मैं आपको हमारी सेवाओं के बारे में अधिक जानकारी देने में खुशी होगी। हम प्रदान करते हैं...");
      } else if (randomLanguage.code === 'ta') {
        setResponse("உங்கள் ஆர்வத்திற்கு நன்றி! எங்கள் சேவைகளைப் பற்றி உங்களுக்கு மேலும் சொல்ல நான் மகிழ்ச்சியடைகிறேன். நாங்கள் வழங்குகிறோம்...");
      } else {
        setResponse("Sample response in " + randomLanguage.name);
      }
    }, 1000);
  };

  const handlePlayResponse = () => {
    setIsPlaying(true);
    toast({
      title: "Playing response",
      description: "AI response in " + (detectedLanguage ? detectedLanguage.name : "detected language"),
    });
    
    // Simulate playback for demo purposes
    setTimeout(() => {
      setIsPlaying(false);
    }, 3000);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Language Detection Demo</h1>
          <p className="text-muted-foreground">Test the real-time language detection capabilities</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <HelpCircle className="mr-2 h-4 w-4" />
                How It Works
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>How Language Detection Works</DialogTitle>
                <DialogDescription>
                  This demo showcases the real-time language detection capabilities of the AI cold-calling agent.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p>The system uses advanced AI models to detect the language being spoken in real-time, with support for 12 Indian languages including English, Hindi, Tamil, Telugu, and more.</p>
                
                <h4 className="font-medium">How to use this demo:</h4>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Click the microphone button to start recording</li>
                  <li>Speak a few sentences in any supported language</li>
                  <li>The system will automatically detect the language</li>
                  <li>The AI will respond in the same language</li>
                </ol>
                
                <p>In a real call scenario, the system continuously monitors the conversation and can switch languages mid-call if the customer changes languages.</p>
              </div>
              <DialogFooter>
                <Button onClick={() => navigate('/settings/api-configuration')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Configure Settings
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Supported Languages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
            <div className="flex flex-wrap gap-1 mt-2">
              {supportedLanguages.map((lang) => (
                <span 
                  key={lang.code}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                >
                  {lang.name}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Detection Speed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">&lt;100ms</div>
            <p className="text-xs text-muted-foreground mt-1">Average detection time</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">98.7%</div>
            <p className="text-xs text-muted-foreground mt-1">For sentences &gt;5 words</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Record Your Voice</CardTitle>
            <CardDescription>
              Speak in any supported language to test detection
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="relative">
              <div className={`w-32 h-32 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                isRecording 
                  ? 'bg-red-100 text-red-600 animate-pulse' 
                  : 'bg-primary/10 text-primary hover:bg-primary/20'
              }`}
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              >
                <Mic className="h-12 w-12" />
              </div>
              {isRecording && (
                <div className="absolute -top-2 -right-2">
                  <span className="relative flex h-6 w-6">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-6 w-6 bg-red-500 items-center justify-center text-white text-xs">
                      REC
                    </span>
                  </span>
                </div>
              )}
            </div>
            <p className="mt-4 text-center text-muted-foreground">
              {isRecording 
                ? "Recording... Click to stop" 
                : "Click the microphone to start recording"}
            </p>
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Speak naturally in any supported language
              </p>
            </div>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Detection Results</CardTitle>
            <CardDescription>
              Language detection and confidence score
            </CardDescription>
          </CardHeader>
          <CardContent>
            {detectedLanguage ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Detected Language</h3>
                    <div className="flex items-center mt-1">
                      <span className="text-2xl font-bold">{detectedLanguage.name}</span>
                      <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {detectedLanguage.code}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-right">Confidence</h3>
                    <span className="text-2xl font-bold">{Math.round(confidence * 100)}%</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Transcript</h3>
                  <div className="p-3 bg-muted/30 rounded-md">
                    <p dir={['ar', 'ur'].includes(detectedLanguage.code) ? 'rtl' : 'ltr'}>
                      {transcript}
                    </p>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <h3 className="font-medium">AI Response</h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1"
                      onClick={handlePlayResponse}
                      disabled={isPlaying}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="h-4 w-4" />
                          <span>Playing...</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          <span>Play</span>
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-md">
                    <p dir={['ar', 'ur'].includes(detectedLanguage.code) ? 'rtl' : 'ltr'}>
                      {response}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                  <VolumeX className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium">No Speech Detected</h3>
                <p className="text-muted-foreground mt-2">
                  Record your voice to see language detection results
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Advanced Settings</CardTitle>
          <CardDescription>
            Configure language detection parameters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="detectionThreshold">Detection Confidence Threshold</Label>
                <Input 
                  id="detectionThreshold" 
                  type="range"
                  min="0.5"
                  max="0.95"
                  step="0.05"
                  defaultValue="0.75"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>More Sensitive (0.5)</span>
                  <span>More Accurate (0.95)</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="minSpeechDuration">Minimum Speech Duration (ms)</Label>
                <Input 
                  id="minSpeechDuration" 
                  type="range"
                  min="100"
                  max="1000"
                  step="100"
                  defaultValue="300"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Faster (100ms)</span>
                  <span>More Accurate (1000ms)</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="autoSwitch" defaultChecked />
                <Label htmlFor="autoSwitch">Enable automatic language switching</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="continuousDetection" defaultChecked />
                <Label htmlFor="continuousDetection">Enable continuous detection</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="adaptiveResponse" defaultChecked />
                <Label htmlFor="adaptiveResponse">Enable adaptive response generation</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="debugMode" />
                <Label htmlFor="debugMode">Enable debug mode</Label>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={() => navigate('/settings/api-configuration')}>
            <Settings className="mr-2 h-4 w-4" />
            Advanced Configuration
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LanguageDetectionDemo;
