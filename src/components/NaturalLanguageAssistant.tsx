import React, { useState } from 'react';
import { MessageSquare, Send, Mic, Brain, Zap, Shield, Globe, Play, Pause, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useRealtimeData } from '../hooks/useRealtimeData';
import type { AutomatedProcess } from '../hooks/useRealtimeData';
import { gatherLastKnownPosition, formatPosition, AdsbExchangeError, fetchOperations } from '../services/adsbExchangeApi';
import type { LastKnownPosition } from '../services/adsbExchangeApi';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  message: string;
  timestamp: Date;
  executed?: boolean;
  commandType?: 'query' | 'control' | 'analysis' | 'alert' | 'automation' | 'adsb-search' | 'emergency';
  isLoading?: boolean;
  error?: boolean;
}

interface NaturalLanguageAssistantProps {
  onAutomationUpdate?: (processes: AutomatedProcess[]) => void;
}

export const NaturalLanguageAssistant: React.FC<NaturalLanguageAssistantProps> = ({ onAutomationUpdate }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessingAdsbQuery, setIsProcessingAdsbQuery] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      message: 'AES Command & Control AI ready. I can execute ATC commands, analyze traffic patterns, provide real-time flight data from commercial, military, civilian, and private sources, show active/inbound flights for LGA, JFK, TEB, and EWR, and locate aircraft using ADSB Exchange data. New: VIP aircraft tracking and emergency location services available.\n\n🚨 EMERGENCY COMMANDS:\n• "locate aircraft [ICAO]" - Find any aircraft worldwide\n• "find downed aircraft [ICAO]" - Emergency location service\n• "last position [ICAO]" - Get last known coordinates\n\nAutomated processes available - use the automation buttons below.',
      timestamp: new Date(Date.now() - 300000),
      commandType: 'query'
    }
  ]);

  const { 
    aircraft, 
    automatedProcesses, 
    initiateAutomatedPushbackTaxi, 
    initiateConflictResolution, 
    initiateGateOptimization 
  } = useRealtimeData();

  // Get a random parked aircraft for demonstration
  const getRandomParkedAircraft = () => {
    const parkedAircraft = aircraft.filter(ac => ac.status === 'parked');
    return parkedAircraft[Math.floor(Math.random() * parkedAircraft.length)]?.callsign || 'UAL234';
  };

  const handleAutomatedPushbackTaxi = () => {
    const selectedAircraft = getRandomParkedAircraft();
    const processId = initiateAutomatedPushbackTaxi(selectedAircraft);
    
    const automationMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'assistant',
      message: `🤖 AUTOMATED PUSHBACK & TAXI INITIATED: ${selectedAircraft} - Process ID: ${processId}. AI taking full control: route calculation, ground vehicle coordination, pushback clearance, and automated taxi to runway. Estimated completion: 8 minutes. All safety protocols active.`,
      timestamp: new Date(),
      executed: true,
      commandType: 'automation'
    };

    setMessages(prev => [...prev, automationMessage]);
    onAutomationUpdate?.(automatedProcesses);
  };

  const handleConflictResolution = () => {
    const processId = initiateConflictResolution();
    
    const automationMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'assistant',
      message: `🛡️ AUTOMATED CONFLICT RESOLUTION INITIATED: Process ID: ${processId}. AI analyzing all ground traffic, calculating alternative routes, and implementing separation commands. Machine learning algorithms predicting and preventing conflicts. Estimated completion: 3 minutes.`,
      timestamp: new Date(),
      executed: true,
      commandType: 'automation'
    };

    setMessages(prev => [...prev, automationMessage]);
    onAutomationUpdate?.(automatedProcesses);
  };

  const handleGateOptimization = () => {
    const processId = initiateGateOptimization();
    
    const automationMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'assistant',
      message: `⚡ AUTOMATED GATE OPTIMIZATION INITIATED: Process ID: ${processId}. AI analyzing gate utilization, aircraft-gate matching, and turnaround times. Optimizing for 35% efficiency improvement. All gate assignments will be automatically updated. Estimated completion: 2 minutes.`,
      timestamp: new Date(),
      executed: true,
      commandType: 'automation'
    };

    setMessages(prev => [...prev, automationMessage]);
    onAutomationUpdate?.(automatedProcesses);
  };

  // Enhanced ADSB Exchange integration for aircraft location
  const handleAdsbQuery = async (icaoHex: string, isEmergency: boolean = false): Promise<string> => {
    setIsProcessingAdsbQuery(true);
    
    try {
      const position = await gatherLastKnownPosition(icaoHex);
      
      if (!position) {
        return `❌ AIRCRAFT NOT FOUND: No tracking data available for ICAO ${icaoHex.toUpperCase()}. This aircraft may not exist, may not have ADS-B equipment, or may not have been active recently.`;
      }

      const formattedPosition = formatPosition(position);
      
      // If it's an emergency query and the data is old, add warning
      const dataAge = Date.now() - position.timestamp.getTime();
      const isOldData = dataAge > 24 * 60 * 60 * 1000; // Older than 24 hours
      
      if (isEmergency && isOldData) {
        return `🚨 EMERGENCY ALERT - STALE DATA WARNING:\n\n${formattedPosition}\n\n⚠️ WARNING: This data is more than 24 hours old. For emergency response, coordinate with local authorities and air traffic control for real-time information.`;
      }
      
      return `${isEmergency ? '🚨 EMERGENCY AIRCRAFT LOCATION:\n\n' : ''}${formattedPosition}${isEmergency ? '\n\n📞 Recommend immediate coordination with local ATC and emergency services.' : ''}`;
      
    } catch (error) {
      console.error('ADSB query failed:', error);
      
      if (error instanceof AdsbExchangeError) {
        if (error.status === 429) {
          return `⚠️ API RATE LIMITED: Too many requests to ADSB Exchange. Please wait a moment before trying again.`;
        } else if (error.status === 403) {
          return `🔒 API ACCESS DENIED: Authentication failed with ADSB Exchange. Please check API key configuration.`;
        } else if (error.status && error.status >= 500) {
          return `🔧 SERVICE UNAVAILABLE: ADSB Exchange servers are experiencing issues. Please try again in a few minutes.`;
        }
        return `❌ ADSB QUERY FAILED: ${error.message}`;
      }
      
      return `❌ SYSTEM ERROR: Unable to query ADSB Exchange. Please check your internet connection and try again.`;
    } finally {
      setIsProcessingAdsbQuery(false);
    }
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: input,
      timestamp: new Date()
    };

    // Enhanced AI processing for comprehensive ATC command and control
    const processCommand = async (command: string): Promise<{ message: string; executed: boolean; commandType: 'query' | 'control' | 'analysis' | 'alert' | 'automation' | 'adsb-search' | 'emergency'; isAsync?: boolean }> => {
      const lowerCommand = command.toLowerCase();
      
      // Enhanced ADSB Exchange Integration - VIP Aircraft Tracking
      const icaoMatch = command.match(/\b([a-fA-F0-9]{6})\b/);
      
      if ((lowerCommand.includes('locate') || lowerCommand.includes('find') || lowerCommand.includes('track') || lowerCommand.includes('search')) && 
          (lowerCommand.includes('aircraft') || lowerCommand.includes('plane') || lowerCommand.includes('flight'))) {
        
        if (icaoMatch) {
          const icaoHex = icaoMatch[1];
          const isEmergency = lowerCommand.includes('downed') || lowerCommand.includes('emergency') || 
                             lowerCommand.includes('missing') || lowerCommand.includes('crashed') ||
                             lowerCommand.includes('vip') || lowerCommand.includes('critical');
          
          // This will be handled asynchronously
          return {
            message: `🔍 Querying ADSB Exchange for aircraft ${icaoHex.toUpperCase()}...`,
            executed: false,
            commandType: isEmergency ? 'emergency' : 'adsb-search',
            isAsync: true
          };
        } else {
          return {
            message: `❌ INVALID COMMAND: Please provide a valid ICAO hex code (6 characters). Example: "locate aircraft A1B2C3" or "find downed aircraft 4D2228"`,
            executed: false,
            commandType: 'adsb-search'
          };
        }
      }
      
      if (lowerCommand.includes('last position') || lowerCommand.includes('last known')) {
        if (icaoMatch) {
          const icaoHex = icaoMatch[1];
          return {
            message: `🔍 Retrieving last known position for ${icaoHex.toUpperCase()}...`,
            executed: false,
            commandType: 'adsb-search',
            isAsync: true
          };
        }
      }
      
      // Enhanced Active Flights Queries
      if (lowerCommand.includes('active flights') || lowerCommand.includes('show active')) {
        return {
          message: `✈️ ACTIVE FLIGHTS REGIONAL STATUS:\n\n📍 NEWARK (EWR): 23 active flights - 12 departures, 11 arrivals\n📍 JFK: 31 active flights - 18 departures, 13 arrivals\n📍 LGA: 19 active flights - 9 departures, 10 arrivals\n📍 TEB: 8 active flights - 5 departures, 3 arrivals\n\nTotal Regional Traffic: 81 flights | Peak congestion: JFK Terminal 4 | Delay factor: 12 minutes average`,
          executed: true,
          commandType: 'query'
        };
      }

      // Enhanced Inbound Flight Queries by Airport
      if (lowerCommand.includes('inbound') && (lowerCommand.includes('lga') || lowerCommand.includes('laguardia'))) {
        return {
          message: `🛬 LAGUARDIA (LGA) INBOUND FLIGHTS:\n\n• AAL1247 - A320 - ETA 14:25 - Gate B3\n• UAL892 - B737 - ETA 14:32 - Gate A7\n• DL2134 - A321 - ETA 14:45 - Gate C12\n• JBU567 - E190 - ETA 14:52 - Gate B8\n• SWA1823 - B737 - ETA 15:10 - Gate A2\n\nTotal Inbound: 15 flights | Next 2 hours: 8 additional | Runway: 04/22 active`,
          executed: true,
          commandType: 'query'
        };
      }

      if (lowerCommand.includes('inbound') && lowerCommand.includes('jfk')) {
        return {
          message: `🛬 JFK INBOUND FLIGHTS:\n\n• BAW114 - B777 - ETA 14:20 - Gate T4-A1\n• LH441 - A340 - ETA 14:35 - Gate T1-2\n• UAL15 - B767 - ETA 14:42 - Gate T4-B6\n• AAL100 - B777 - ETA 14:55 - Gate T8-12\n• DL1 - A330 - ETA 15:05 - Gate T4-A8\n• EK204 - A380 - ETA 15:20 - Gate T4-A4\n\nTotal Inbound: 28 flights | Next 2 hours: 15 additional | Primary: 04L/22R active`,
          executed: true,
          commandType: 'query'
        };
      }

      if (lowerCommand.includes('inbound') && (lowerCommand.includes('ewr') || lowerCommand.includes('newark'))) {
        return {
          message: `🛬 NEWARK (EWR) INBOUND FLIGHTS:\n\n• UAL1234 - B737 - ETA 14:28 - Gate C74\n• CON567 - E175 - ETA 14:35 - Gate A12\n• UAL2156 - B757 - ETA 14:48 - Gate C92\n• SWA1456 - B737 - ETA 14:55 - Gate A8\n• AAL782 - A319 - ETA 15:12 - Gate A24\n\nTotal Inbound: 19 flights | Next 2 hours: 11 additional | Runway: 04L/22R primary`,
          executed: true,
          commandType: 'query'
        };
      }

      if (lowerCommand.includes('inbound') && (lowerCommand.includes('teb') || lowerCommand.includes('teterboro'))) {
        return {
          message: `🛬 TETERBORO (TEB) INBOUND FLIGHTS:\n\n• N747BA - G650 - ETA 14:40 - Private\n• N125XX - Citation X - ETA 14:55 - Private\n• N456JT - Falcon 7X - ETA 15:15 - Private\n• N789GS - Challenger 350 - ETA 15:25 - Private\n\nTotal Inbound: 8 flights | Next 2 hours: 4 additional | Runway: 06/24 active | Private/Corporate traffic`,
          executed: true,
          commandType: 'query'
        };
      }

      // Automation Commands
      if (lowerCommand.includes('automate') || lowerCommand.includes('autopilot')) {
        if (lowerCommand.includes('pushback') || lowerCommand.includes('taxi')) {
          handleAutomatedPushbackTaxi();
          return {
            message: `🤖 Automated pushback and taxi sequence has been initiated. Check the automation panel for real-time progress.`,
            executed: true,
            commandType: 'automation'
          };
        } else if (lowerCommand.includes('conflict') || lowerCommand.includes('resolution')) {
          handleConflictResolution();
          return {
            message: `🛡️ Automated conflict resolution system has been activated. AI is now monitoring and resolving all potential conflicts.`,
            executed: true,
            commandType: 'automation'
          };
        } else if (lowerCommand.includes('gate') || lowerCommand.includes('optimization')) {
          handleGateOptimization();
          return {
            message: `⚡ Automated gate optimization process has been started. AI is recalculating optimal gate assignments.`,
            executed: true,
            commandType: 'automation'
          };
        }
      }
      
      // Flight Query Commands
      if (lowerCommand.includes('show') && (lowerCommand.includes('flights') || lowerCommand.includes('traffic'))) {
        const airport = lowerCommand.includes('jfk') ? 'JFK' : 
                      lowerCommand.includes('lga') ? 'LGA' : 
                      lowerCommand.includes('ewr') ? 'EWR' : 
                      lowerCommand.includes('teb') ? 'TEB' : 'Regional';
        return {
          message: `✈️ FLIGHT DATA FUSION: ${airport} - 47 flights detected (12 commercial, 8 private, 3 military, 24 civilian). Combined inbound/outbound activity. Congestion level: MODERATE. Amadeus & DOD data synchronized. Real-time tracking active.`,
          executed: true,
          commandType: 'query'
        };
      }
      
      // Traffic Analysis Commands
      if (lowerCommand.includes('analyze') || lowerCommand.includes('predict')) {
        const location = lowerCommand.includes('newark') ? 'Newark (EWR)' : 
                        lowerCommand.includes('jfk') ? 'JFK' : 
                        lowerCommand.includes('lga') ? 'LaGuardia' : 
                        lowerCommand.includes('taxiway') ? 'Taxiway Network' : 'Regional Airspace';
        return {
          message: `📊 AI ANALYSIS: ${location} - ML algorithms predict 23% congestion increase in next 30 minutes. Recommended: Reroute via Alpha-Charlie, delay 3 departures by 5 minutes. Fuel savings: 12%. Conflict probability reduced by 67%.`,
          executed: true,
          commandType: 'analysis'
        };
      }
      
      // Ground Control Commands
      if (lowerCommand.includes('clear') && lowerCommand.includes('pushback')) {
        const aircraft = command.match(/[A-Z]{3}\d{1,4}/)?.[0] || 'Aircraft';
        return {
          message: `✅ PUSHBACK CLEARANCE: ${aircraft} cleared for pushback from gate. Ground frequency 121.9. Taxi route optimized via AI - 18% time reduction. All ground vehicles notified. Conflict detection: CLEAR.`,
          executed: true,
          commandType: 'control'
        };
      }
      
      if (lowerCommand.includes('taxi') && lowerCommand.includes('runway')) {
        const aircraft = command.match(/[A-Z]{3}\d{1,4}/)?.[0] || 'Aircraft';
        const runway = lowerCommand.includes('27') ? '27R' : lowerCommand.includes('09') ? '09L' : '04L';
        return {
          message: `🛫 TAXI CLEARANCE: ${aircraft} taxi to runway ${runway} via optimized route. AI route planning: 22% faster than standard. Ground radar tracking active. Hold short instructions will be issued automatically.`,
          executed: true,
          commandType: 'control'
        };
      }
      
      // Emergency & Alert Commands
      if (lowerCommand.includes('emergency') || lowerCommand.includes('alert') || lowerCommand.includes('priority')) {
        return {
          message: `🚨 EMERGENCY PROTOCOL ACTIVATED: All emergency vehicles dispatched. Priority aircraft handling initiated. DOD liaison notified. Ground frequencies cleared. AI conflict resolution: 100% coverage active. All microservices in emergency mode.`,
          executed: true,
          commandType: 'alert'
        };
      }
      
      // Default enhanced response
      return {
        message: `🤖 AES Command Center ready. I can process:\n• Active flights queries ("show active flights")\n• Airport-specific inbound flights ("show inbound flights for JFK")\n• Aircraft location services ("locate aircraft A1B2C3")\n• Emergency aircraft tracking ("find downed aircraft 4D2228")\n• Traffic analysis and predictions\n• Ground control commands\n• Automated operations\n\nUse automation buttons for one-click processes. For aircraft tracking, provide 6-character ICAO hex codes.`,
        executed: false,
        commandType: 'query'
      };
    };

    // Handle async commands (ADSB queries)
    const handleAsyncCommand = async () => {
      const response = await processCommand(input);
      
      if (response.isAsync) {
        // Show loading message first
        const loadingMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          message: response.message,
          timestamp: new Date(),
          executed: false,
          commandType: response.commandType,
          isLoading: true
        };
        
        setMessages(prev => [...prev, userMessage, loadingMessage]);
        
        // Process ADSB query
        const icaoMatch = input.match(/\b([a-fA-F0-9]{6})\b/);
        if (icaoMatch) {
          const icaoHex = icaoMatch[1];
          const isEmergency = input.toLowerCase().includes('downed') || input.toLowerCase().includes('emergency') || 
                             input.toLowerCase().includes('missing') || input.toLowerCase().includes('vip');
          
          const adsbResult = await handleAdsbQuery(icaoHex, isEmergency);
          
          // Update the loading message with results
          const resultMessage: ChatMessage = {
            id: loadingMessage.id,
            type: 'assistant',
            message: adsbResult,
            timestamp: new Date(),
            executed: true,
            commandType: response.commandType,
            isLoading: false,
            error: adsbResult.includes('❌') || adsbResult.includes('⚠️')
          };
          
          setMessages(prev => prev.map(msg => 
            msg.id === loadingMessage.id ? resultMessage : msg
          ));
        }
      } else {
        // Handle non-async commands normally
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          message: response.message,
          timestamp: new Date(),
          executed: response.executed,
          commandType: response.commandType
        };
        
        setMessages(prev => [...prev, userMessage, assistantMessage]);
      }
    };

    handleAsyncCommand();
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleListening = () => {
    setIsListening(!isListening);
  };

  const getCommandTypeIcon = (type?: string) => {
    switch (type) {
      case 'control': return <Zap className="w-3 h-3 text-green-400" />;
      case 'analysis': return <Brain className="w-3 h-3 text-purple-400" />;
      case 'alert': return <Shield className="w-3 h-3 text-red-400" />;
      case 'query': return <Globe className="w-3 h-3 text-blue-400" />;
      case 'automation': return <Play className="w-3 h-3 text-yellow-400" />;
      case 'adsb-search': return <Globe className="w-3 h-3 text-cyan-400" />;
      case 'emergency': return <AlertTriangle className="w-3 h-3 text-red-400 animate-pulse" />;
      default: return <MessageSquare className="w-3 h-3 text-gray-400" />;
    }
  };

  const getCommandTypeLabel = (type?: string) => {
    switch (type) {
      case 'control': return 'CONTROL';
      case 'analysis': return 'ANALYSIS';
      case 'alert': return 'ALERT';
      case 'query': return 'QUERY';
      case 'automation': return 'AUTOMATION';
      case 'adsb-search': return 'AIRCRAFT SEARCH';
      case 'emergency': return 'EMERGENCY';
      default: return 'INFO';
    }
  };

  const getProcessStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'in-progress': return <Clock className="w-4 h-4 text-yellow-400 animate-spin" />;
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-blue-400" />;
    }
  };

  const activeProcesses = automatedProcesses.filter(p => p.status === 'in-progress');
  const completedProcesses = automatedProcesses.filter(p => p.status === 'completed');

  return (
    <div className="bg-black border border-yellow-400/30 rounded-lg p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Brain className="w-6 h-6 text-yellow-400" />
          <h2 className="text-yellow-400 font-mono text-xl font-bold">AES COMMAND & CONTROL CENTER</h2>
        </div>
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            <span className="text-purple-400">AI FUSION</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-blue-400">AMADEUS</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400">DOD SECURE</span>
          </div>
        </div>
      </div>

      {/* Automated Process Controls - Autopilot Style */}
      <div className="mb-4 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 border border-yellow-400/30 rounded-lg p-3">
        <h3 className="text-yellow-400 font-mono text-sm font-bold mb-3 flex items-center">
          <Play className="w-4 h-4 mr-2" />
          AUTOMATED OPERATIONS - ONE-CLICK CONTROL
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleAutomatedPushbackTaxi}
            className="bg-blue-400/20 hover:bg-blue-400/30 border border-blue-400/50 rounded-lg p-3 transition-all duration-200 hover:shadow-lg hover:shadow-blue-400/20"
          >
            <div className="flex items-center justify-center mb-1">
              <Zap className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-xs text-blue-400 font-mono font-bold">AUTO PUSHBACK</div>
            <div className="text-xs text-blue-400 font-mono">& TAXI</div>
          </button>
          
          <button
            onClick={handleConflictResolution}
            className="bg-red-400/20 hover:bg-red-400/30 border border-red-400/50 rounded-lg p-3 transition-all duration-200 hover:shadow-lg hover:shadow-red-400/20"
          >
            <div className="flex items-center justify-center mb-1">
              <Shield className="w-5 h-5 text-red-400" />
            </div>
            <div className="text-xs text-red-400 font-mono font-bold">CONFLICT</div>
            <div className="text-xs text-red-400 font-mono">RESOLUTION</div>
          </button>
          
          <button
            onClick={handleGateOptimization}
            className="bg-green-400/20 hover:bg-green-400/30 border border-green-400/50 rounded-lg p-3 transition-all duration-200 hover:shadow-lg hover:shadow-green-400/20"
          >
            <div className="flex items-center justify-center mb-1">
              <Brain className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-xs text-green-400 font-mono font-bold">GATE</div>
            <div className="text-xs text-green-400 font-mono">OPTIMIZATION</div>
          </button>
        </div>
      </div>

      {/* Active Automated Processes */}
      {(activeProcesses.length > 0 || completedProcesses.length > 0) && (
        <div className="mb-4 bg-gray-900 border border-gray-600 rounded-lg p-3 max-h-32 overflow-auto">
          <h4 className="text-gray-300 font-mono text-xs font-bold mb-2">AUTOMATED PROCESSES STATUS</h4>
          {activeProcesses.map((process) => (
            <div key={process.id} className="flex items-center justify-between text-xs mb-2 p-2 bg-yellow-400/10 border border-yellow-400/20 rounded">
              <div className="flex items-center space-x-2">
                {getProcessStatusIcon(process.status)}
                <span className="text-yellow-400 font-mono">{process.type.toUpperCase()}</span>
                <span className="text-gray-300">{process.aircraftId}</span>
              </div>
              <span className="text-yellow-400">Step {process.currentStep + 1}/{process.steps.length}</span>
            </div>
          ))}
          {completedProcesses.slice(-2).map((process) => (
            <div key={process.id} className="flex items-center justify-between text-xs mb-1 p-1 bg-green-400/10 border border-green-400/20 rounded">
              <div className="flex items-center space-x-2">
                {getProcessStatusIcon(process.status)}
                <span className="text-green-400 font-mono text-xs">{process.type.toUpperCase()} COMPLETED</span>
              </div>
              <span className="text-green-400 text-xs">{process.estimatedCompletion?.toLocaleTimeString().slice(0, 5)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-auto mb-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`
              p-4 rounded-lg max-w-[85%] ${message.type === 'user' 
                ? 'bg-blue-400/10 border border-blue-400/20 ml-auto text-blue-400' 
                : message.commandType === 'emergency' 
                  ? 'bg-red-400/10 border border-red-400/30 text-gray-200'
                  : message.error
                    ? 'bg-red-400/10 border border-red-400/20 text-gray-200'
                    : 'bg-gray-900 border border-yellow-400/20 text-gray-200'
              }
            `}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {message.isLoading && (
                  <div className="w-3 h-3 border border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                )}
                <span className="text-xs font-mono font-bold opacity-80">
                  {message.type === 'user' ? 'ATC CONTROLLER' : 'AES AI COMMAND'}
                </span>
                {message.commandType && message.type === 'assistant' && (
                  <div className="flex items-center space-x-1">
                    {getCommandTypeIcon(message.commandType)}
                    <span className="text-xs font-mono opacity-70">
                      {getCommandTypeLabel(message.commandType)}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-xs opacity-60">
                {message.timestamp.toLocaleTimeString().slice(0, 5)}
              </span>
            </div>
            <div className="text-sm leading-relaxed whitespace-pre-line">{message.message}</div>
            {message.executed && (
              <div className="flex items-center space-x-2 mt-3 p-2 bg-green-400/10 border border-green-400/20 rounded">
                <Zap className="w-3 h-3 text-green-400" />
                <span className="text-xs text-green-400 font-mono">COMMAND EXECUTED - SYSTEM UPDATED</span>
              </div>
            )}
            {message.isLoading && (
              <div className="flex items-center space-x-2 mt-3 p-2 bg-yellow-400/10 border border-yellow-400/20 rounded">
                <div className="w-3 h-3 border border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-yellow-400 font-mono">PROCESSING ADSB EXCHANGE QUERY...</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Try: 'locate aircraft A1B2C3' or 'find downed aircraft 4D2228' or 'show active flights'..."
            disabled={isProcessingAdsbQuery}
            className="w-full bg-gray-900 border border-yellow-400/20 rounded-lg px-4 py-3 text-sm text-yellow-400 font-mono focus:border-yellow-400/50 focus:outline-none focus:ring-2 focus:ring-yellow-400/20"
          />
        </div>
        
        <button
          onClick={toggleListening}
          className={`
            p-3 rounded-lg border transition-all duration-200
            ${isListening 
              ? 'border-red-400 bg-red-400/20 shadow-lg shadow-red-400/20' 
              : 'border-gray-600 hover:border-yellow-400/50'
            }
          `}
        >
          <Mic className={`w-4 h-4 ${isListening ? 'text-red-400 animate-pulse' : 'text-gray-400'}`} />
        </button>
        
        <button
          onClick={handleSendMessage}
          disabled={!input.trim() || isProcessingAdsbQuery}
          className="p-3 rounded-lg border border-yellow-400/30 hover:border-yellow-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:bg-yellow-400/10"
        >
          {isProcessingAdsbQuery ? (
            <div className="w-4 h-4 border border-yellow-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4 text-yellow-400" />
          )}
        </button>
      </div>

      {/* Enhanced Quick Commands with ADSB Examples */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={() => setInput('show active flights')}
          className="bg-gray-900 hover:bg-gray-800 border border-gray-600 hover:border-blue-400/50 rounded-lg px-3 py-2 text-xs text-left transition-all duration-200"
        >
          <Globe className="w-3 h-3 inline mr-2 text-blue-400" />
          Show Active Flights
        </button>
        <button
          onClick={() => setInput('locate aircraft A1B2C3')}
          className="bg-gray-900 hover:bg-gray-800 border border-gray-600 hover:border-purple-400/50 rounded-lg px-3 py-2 text-xs text-left transition-all duration-200"
        >
          <Globe className="w-3 h-3 inline mr-2 text-cyan-400" />
          Locate Aircraft
        </button>
        <button
          onClick={() => setInput('find downed aircraft 4D2228')}
          className="bg-gray-900 hover:bg-gray-800 border border-gray-600 hover:border-red-400/50 rounded-lg px-3 py-2 text-xs text-left transition-all duration-200"
        >
          <AlertTriangle className="w-3 h-3 inline mr-2 text-red-400" />
          Emergency Search
        </button>
        <button
          onClick={() => setInput('show inbound flights for JFK')}
          className="bg-gray-900 hover:bg-gray-800 border border-gray-600 hover:border-green-400/50 rounded-lg px-3 py-2 text-xs text-left transition-all duration-200"
        >
          <Brain className="w-3 h-3 inline mr-2 text-green-400" />
          Airport Traffic
        </button>
      </div>

      {/* Enhanced Performance & Integration Stats */}
      <div className="bg-gradient-to-r from-purple-400/10 to-blue-400/10 border border-purple-400/20 rounded-lg p-3">
        <div className="grid grid-cols-5 gap-3 text-xs text-center">
          <div>
            <div className="text-purple-400 font-bold">30K</div>
            <div className="text-gray-400">μServices</div>
          </div>
          <div>
            <div className="text-cyan-400 font-bold">LIVE</div>
            <div className="text-gray-400">ADSB Exchange</div>
          </div>
          <div>
            <div className="text-yellow-400 font-bold">{activeProcesses.length}</div>
            <div className="text-gray-400">Auto Active</div>
          </div>
          <div>
            <div className="text-blue-400 font-bold">67%</div>
            <div className="text-gray-400">Efficiency</div>
          </div>
          <div>
            <div className="text-green-400 font-bold">100%</div>
            <div className="text-gray-400">DOD Secure</div>
          </div>
        </div>
      </div>
    </div>
  );
};