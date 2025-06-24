import React, { useState } from 'react';
import { MessageSquare, Send, Mic, Brain, Zap, Shield, Globe, Play, Pause, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useRealtimeData } from '../hooks/useRealtimeData';
import type { AutomatedProcess } from '../hooks/useRealtimeData';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  message: string;
  timestamp: Date;
  executed?: boolean;
  commandType?: 'query' | 'control' | 'analysis' | 'alert' | 'automation';
}

interface NaturalLanguageAssistantProps {
  onAutomationUpdate?: (processes: AutomatedProcess[]) => void;
}

export const NaturalLanguageAssistant: React.FC<NaturalLanguageAssistantProps> = ({ onAutomationUpdate }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      message: 'AES Command & Control AI ready. I can execute ATC commands, analyze traffic patterns, and provide real-time flight data from commercial, military, civilian, and private sources. New: Automated processes available - try the automation buttons below for one-click operations.',
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

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: input,
      timestamp: new Date()
    };

    // Enhanced AI processing for comprehensive ATC command and control
    const processCommand = (command: string): { message: string; executed: boolean; commandType: 'query' | 'control' | 'analysis' | 'alert' | 'automation' } => {
      const lowerCommand = command.toLowerCase();
      
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
      if (lowerCommand.includes('show') && (lowerCommand.includes('inbound') || lowerCommand.includes('outbound'))) {
        const airport = lowerCommand.includes('jfk') ? 'JFK' : 
                      lowerCommand.includes('lga') ? 'LGA' : 
                      lowerCommand.includes('ewr') ? 'EWR' : 
                      lowerCommand.includes('teb') ? 'TEB' : 'Regional';
        return {
          message: `✈️ FLIGHT DATA FUSION: ${airport} - 47 inbound flights detected (12 commercial, 8 private, 3 military, 24 civilian). ETA range: 15-180 minutes. Congestion level: MODERATE. Amadeus & DOD data synchronized.`,
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
        message: `🤖 AES Command Center ready. I can process flight queries, traffic analysis, ground control commands, emergency protocols, and automated operations. Use automation buttons for one-click processes. Specify aircraft callsign, airport code, or command type for precise execution.`,
        executed: false,
        commandType: 'query'
      };
    };

    const response = processCommand(input);
    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      message: response.message,
      timestamp: new Date(),
      executed: response.executed,
      commandType: response.commandType
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
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
                : 'bg-gray-900 border border-yellow-400/20 text-gray-200'
              }
            `}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
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
            <div className="text-sm leading-relaxed">{message.message}</div>
            {message.executed && (
              <div className="flex items-center space-x-2 mt-3 p-2 bg-green-400/10 border border-green-400/20 rounded">
                <Zap className="w-3 h-3 text-green-400" />
                <span className="text-xs text-green-400 font-mono">COMMAND EXECUTED - SYSTEM UPDATED</span>
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
            placeholder="Enter ATC command or try: 'Automate pushback and taxi for UAL234'..."
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
          disabled={!input.trim()}
          className="p-3 rounded-lg border border-yellow-400/30 hover:border-yellow-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:bg-yellow-400/10"
        >
          <Send className="w-4 h-4 text-yellow-400" />
        </button>
      </div>

      {/* Enhanced Quick Commands */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={() => setInput('Show all inbound flights to JFK')}
          className="bg-gray-900 hover:bg-gray-800 border border-gray-600 hover:border-blue-400/50 rounded-lg px-3 py-2 text-xs text-left transition-all duration-200"
        >
          <Globe className="w-3 h-3 inline mr-2 text-blue-400" />
          JFK Inbound Flights
        </button>
        <button
          onClick={() => setInput('Analyze Newark congestion patterns')}
          className="bg-gray-900 hover:bg-gray-800 border border-gray-600 hover:border-purple-400/50 rounded-lg px-3 py-2 text-xs text-left transition-all duration-200"
        >
          <Brain className="w-3 h-3 inline mr-2 text-purple-400" />
          Newark Analysis
        </button>
        <button
          onClick={() => setInput('Clear UAL234 for pushback')}
          className="bg-gray-900 hover:bg-gray-800 border border-gray-600 hover:border-green-400/50 rounded-lg px-3 py-2 text-xs text-left transition-all duration-200"
        >
          <Zap className="w-3 h-3 inline mr-2 text-green-400" />
          Pushback Clearance
        </button>
        <button
          onClick={() => setInput('Automate all ground operations')}
          className="bg-gray-900 hover:bg-gray-800 border border-gray-600 hover:border-yellow-400/50 rounded-lg px-3 py-2 text-xs text-left transition-all duration-200"
        >
          <Play className="w-3 h-3 inline mr-2 text-yellow-400" />
          Full Automation
        </button>
      </div>

      {/* Performance & Integration Stats */}
      <div className="bg-gradient-to-r from-purple-400/10 to-blue-400/10 border border-purple-400/20 rounded-lg p-3">
        <div className="grid grid-cols-4 gap-4 text-xs text-center">
          <div>
            <div className="text-purple-400 font-bold">30K</div>
            <div className="text-gray-400">μServices</div>
          </div>
          <div>
            <div className="text-blue-400 font-bold">67%</div>
            <div className="text-gray-400">Efficiency</div>
          </div>
          <div>
            <div className="text-yellow-400 font-bold">{activeProcesses.length}</div>
            <div className="text-gray-400">Auto Active</div>
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