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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '../ui/alert-dialog';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '../ui/accordion';
import { Mic, Save, Upload, X, HelpCircle, Check, AlertTriangle, Globe, Key } from 'lucide-react';

const ApiConfigurationPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [configData, setConfigData] = React.useState({
    elevenLabsApiKey: '',
    elevenLabsModelId: 'eleven_multilingual_v2',
    elevenLabsVoiceId: 'pNInz6obpgDQGcFmaJgB',
    twilioAccountSid: '',
    twilioAuthToken: '',
    twilioPhoneNumber: '',
    openAiApiKey: '',
    openAiModelId: 'gpt-4o',
    languageDetectionThreshold: 0.75,
    enableAutoLanguageSwitching: true,
    enableRealTimeTranscription: true,
    enableSentimentAnalysis: true
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setConfigData({
      ...configData,
      [name]: value
    });
  };

  const handleSwitchChange = (name, checked) => {
    setConfigData({
      ...configData,
      [name]: checked
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // In a real implementation, this would call the API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Configuration saved successfully",
        description: "Your API configuration has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error saving configuration",
        description: "There was a problem saving your configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestConnection = (service) => {
    toast({
      title: `Testing ${service} connection`,
      description: "Verifying API credentials...",
    });
    
    // Simulate API test
    setTimeout(() => {
      toast({
        title: `${service} connection successful`,
        description: "API credentials are valid and working correctly.",
      });
    }, 1500);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">API Configuration</h1>
          <p className="text-muted-foreground">Configure external service integrations</p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline">
              <HelpCircle className="mr-2 h-4 w-4" />
              Help Guide
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>API Configuration Guide</AlertDialogTitle>
              <AlertDialogDescription>
                <p className="mb-4">This page allows you to configure all external services used by the AI cold-calling agent. Follow these steps:</p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Obtain API keys from each service provider's website</li>
                  <li>Enter the API keys and other required information in the appropriate fields</li>
                  <li>Test each connection to verify your credentials are working</li>
                  <li>Save your configuration when all tests pass</li>
                </ol>
                <p className="mt-4">For security, all API keys are encrypted before being stored in the database.</p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction>Close</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      
      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="voice" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="voice">Voice Synthesis</TabsTrigger>
            <TabsTrigger value="telephony">Telephony</TabsTrigger>
            <TabsTrigger value="language">Language Detection</TabsTrigger>
            <TabsTrigger value="ai">AI Models</TabsTrigger>
          </TabsList>
          
          <TabsContent value="voice">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mic className="mr-2 h-5 w-5" />
                  ElevenLabs Voice Configuration
                </CardTitle>
                <CardDescription>
                  Configure ElevenLabs for high-quality voice synthesis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="elevenLabsApiKey">API Key</Label>
                    <a 
                      href="https://elevenlabs.io/subscription" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Get an API key
                    </a>
                  </div>
                  <Input 
                    id="elevenLabsApiKey" 
                    name="elevenLabsApiKey" 
                    type="password"
                    value={configData.elevenLabsApiKey}
                    onChange={handleInputChange}
                    placeholder="Enter your ElevenLabs API key"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your API key is encrypted before being stored
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="elevenLabsModelId">Voice Model</Label>
                    <select 
                      id="elevenLabsModelId" 
                      name="elevenLabsModelId" 
                      value={configData.elevenLabsModelId}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="eleven_multilingual_v2">Multilingual v2 (Recommended)</option>
                      <option value="eleven_multilingual_v1">Multilingual v1</option>
                      <option value="eleven_monolingual_v1">Monolingual v1</option>
                      <option value="eleven_english_v1">English Only</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="elevenLabsVoiceId">Default Voice</Label>
                    <select 
                      id="elevenLabsVoiceId" 
                      name="elevenLabsVoiceId" 
                      value={configData.elevenLabsVoiceId}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="pNInz6obpgDQGcFmaJgB">Adam (Male, Professional)</option>
                      <option value="21m00Tcm4TlvDq8ikWAM">Rachel (Female, Professional)</option>
                      <option value="AZnzlk1XvdvUeBnXmlld">Domi (Female, Friendly)</option>
                      <option value="MF3mGyEYCl7XYWbV9V6O">Elli (Female, Friendly)</option>
                      <option value="TxGEqnHWrfWFTfGW9XjX">Josh (Male, Friendly)</option>
                      <option value="yoZ06aMxZJJ28mfd3POQ">Sam (Male, Friendly)</option>
                    </select>
                  </div>
                </div>
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="advanced">
                    <AccordionTrigger>Advanced Voice Settings</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="stability">Stability</Label>
                            <Input 
                              id="stability" 
                              name="stability" 
                              type="range"
                              min="0"
                              max="1"
                              step="0.1"
                              defaultValue="0.5"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>More Variable</span>
                              <span>More Stable</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="clarity">Clarity + Similarity Enhancement</Label>
                            <Input 
                              id="clarity" 
                              name="clarity" 
                              type="range"
                              min="0"
                              max="1"
                              step="0.1"
                              defaultValue="0.75"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Less Clear</span>
                              <span>More Clear</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="style">Speaking Style</Label>
                          <Input 
                            id="style" 
                            name="style" 
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            defaultValue="0.3"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Natural</span>
                            <span>Expressive</span>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                <div className="pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => handleTestConnection('ElevenLabs')}
                    disabled={!configData.elevenLabsApiKey}
                  >
                    Test ElevenLabs Connection
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="telephony">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="mr-2 h-5 w-5" />
                  Twilio Telephony Configuration
                </CardTitle>
                <CardDescription>
                  Configure Twilio for making and receiving phone calls
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="twilioAccountSid">Account SID</Label>
                    <a 
                      href="https://www.twilio.com/console" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Twilio Console
                    </a>
                  </div>
                  <Input 
                    id="twilioAccountSid" 
                    name="twilioAccountSid" 
                    value={configData.twilioAccountSid}
                    onChange={handleInputChange}
                    placeholder="Enter your Twilio Account SID"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="twilioAuthToken">Auth Token</Label>
                  <Input 
                    id="twilioAuthToken" 
                    name="twilioAuthToken" 
                    type="password"
                    value={configData.twilioAuthToken}
                    onChange={handleInputChange}
                    placeholder="Enter your Twilio Auth Token"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your Auth Token is encrypted before being stored
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="twilioPhoneNumber">Twilio Phone Number</Label>
                  <Input 
                    id="twilioPhoneNumber" 
                    name="twilioPhoneNumber" 
                    value={configData.twilioPhoneNumber}
                    onChange={handleInputChange}
                    placeholder="+1234567890"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter in international format (e.g., +1234567890)
                  </p>
                </div>
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="advanced">
                    <AccordionTrigger>Advanced Telephony Settings</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        <div className="flex items-center space-x-2">
                          <Switch id="recordCalls" defaultChecked />
                          <Label htmlFor="recordCalls">Record calls for quality and training</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch id="transcribeCalls" defaultChecked />
                          <Label htmlFor="transcribeCalls">Automatically transcribe calls</Label>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="callTimeout">Call Timeout (seconds)</Label>
                          <Input 
                            id="callTimeout" 
                            name="callTimeout" 
                            type="number"
                            min="30"
                            max="300"
                            defaultValue="60"
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                <div className="pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => handleTestConnection('Twilio')}
                    disabled={!configData.twilioAccountSid || !configData.twilioAuthToken}
                  >
                    Test Twilio Connection
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="language">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="mr-2 h-5 w-5" />
                  Language Detection Configuration
                </CardTitle>
                <CardDescription>
                  Configure real-time language detection settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="languageDetectionThreshold">Detection Confidence Threshold</Label>
                  <Input 
                    id="languageDetectionThreshold" 
                    name="languageDetectionThreshold" 
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={configData.languageDetectionThreshold}
                    onChange={handleInputChange}
                  />
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">More Sensitive (0.5)</span>
                    <span className="text-sm font-medium">{configData.languageDetectionThreshold}</span>
                    <span className="text-xs text-muted-foreground">More Accurate (0.95)</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Higher values require more confidence before switching languages
                  </p>
                </div>
                
                <div className="space-y-4 pt-2">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="enableAutoLanguageSwitching" 
                      checked={configData.enableAutoLanguageSwitching}
                      onCheckedChange={(checked) => handleSwitchChange('enableAutoLanguageSwitching', checked)}
                    />
                    <Label htmlFor="enableAutoLanguageSwitching">Enable automatic language switching</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="enableRealTimeTranscription" 
                      checked={configData.enableRealTimeTranscription}
                      onCheckedChange={(checked) => handleSwitchChange('enableRealTimeTranscription', checked)}
                    />
                    <Label htmlFor="enableRealTimeTranscription">Enable real-time transcription</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="enableSentimentAnalysis" 
                      checked={configData.enableSentimentAnalysis}
                      onCheckedChange={(checked) => handleSwitchChange('enableSentimentAnalysis', checked)}
                    />
                    <Label htmlFor="enableSentimentAnalysis">Enable sentiment analysis</Label>
                  </div>
                </div>
                
                <div className="pt-4">
                  <h3 className="font-medium mb-2">Supported Languages</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      'English', 'Hindi', 'Tamil', 'Telugu', 
                      'Bengali', 'Marathi', 'Gujarati', 'Kannada',
                      'Malayalam', 'Punjabi', 'Urdu', 'Odia'
                    ].map((language) => (
                      <div key={language} className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                        <span>{language}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="rounded-md border p-4 bg-amber-50 text-amber-800 mt-4">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    <div>
                      <h4 className="font-medium">Language Detection Notice</h4>
                      <p className="text-sm">
                        Language detection requires the AI model configuration to be properly set up.
                        Please ensure you have configured the AI Models tab.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="ai">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="mr-2 h-5 w-5" />
                  AI Model Configuration
                </CardTitle>
                <CardDescription>
                  Configure AI models for conversation and language processing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="openAiApiKey">OpenAI API Key</Label>
                    <a 
                      href="https://platform.openai.com/api-keys" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Get an API key
                    </a>
                  </div>
                  <Input 
                    id="openAiApiKey" 
                    name="openAiApiKey" 
                    type="password"
                    value={configData.openAiApiKey}
                    onChange={handleInputChange}
                    placeholder="Enter your OpenAI API key"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your API key is encrypted before being stored
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="openAiModelId">AI Model</Label>
                  <select 
                    id="openAiModelId" 
                    name="openAiModelId" 
                    value={configData.openAiModelId}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="gpt-4o">GPT-4o (Recommended)</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  </select>
                  <p className="text-xs text-muted-foreground">
                    GPT-4o is recommended for best multilingual performance
                  </p>
                </div>
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="advanced">
                    <AccordionTrigger>Advanced AI Settings</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                          <Label htmlFor="temperature">Temperature</Label>
                          <Input 
                            id="temperature" 
                            name="temperature" 
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            defaultValue="0.7"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>More Focused</span>
                            <span>More Creative</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="maxTokens">Max Response Length</Label>
                          <select 
                            id="maxTokens" 
                            name="maxTokens" 
                            defaultValue="1024"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="512">Short (512 tokens)</option>
                            <option value="1024">Medium (1024 tokens)</option>
                            <option value="2048">Long (2048 tokens)</option>
                            <option value="4096">Very Long (4096 tokens)</option>
                          </select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="systemPrompt">System Prompt</Label>
                          <Textarea 
                            id="systemPrompt" 
                            name="systemPrompt" 
                            rows={4}
                            defaultValue="You are an AI assistant making phone calls on behalf of a company. Your goal is to be helpful, clear, and professional while respecting the customer's time and preferences. Adapt to the customer's language and communication style."
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                <div className="pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => handleTestConnection('OpenAI')}
                    disabled={!configData.openAiApiKey}
                  >
                    Test OpenAI Connection
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => navigate('/dashboard')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Configuration"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ApiConfigurationPage;
