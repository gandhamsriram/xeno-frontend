import React, { useState } from 'react';
import { 
  Server, 
  Database, 
  Terminal, 
  Cpu, 
  Globe, 
  MessageSquare, 
  Activity, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle,
  Code
} from 'lucide-react';

const Architecture = () => {
  const [selectedNode, setSelectedNode] = useState(null);

  const subsystems = [
    {
      id: 'frontend',
      name: 'React Frontend',
      tech: 'React, Vite, Tailwind CSS, Recharts',
      icon: Globe,
      color: 'border-blue-500 text-blue-400 bg-blue-500/10',
      shadow: 'shadow-blue-500/10',
      description: 'The user-facing Single Page Application (SPA). Provides CRM panels, campaign wizards, audience builder interfaces, and interactive dashboards.',
      responsibilities: [
        'Render customer segmentation and campaign builders',
        'Visualize conversion funnel stats and customer metrics',
        'Trigger the AI Campaign Agent inputs and chat strategically',
        'Render real-time delivery retries and timeline updates'
      ],
      connections: ['backend'],
      scaleStrategy: 'Deploy via CDN (Vercel/AWS CloudFront) with asset compression, caching, and lazy loading for sub-second load times.'
    },
    {
      id: 'backend',
      name: 'Backend API Gateway',
      tech: 'Node.js, Express.js',
      icon: Server,
      color: 'border-purple-500 text-purple-400 bg-purple-500/10',
      shadow: 'shadow-purple-500/10',
      description: 'The core gateway exposing secure REST APIs. Authenticates users, proxies AI generation requests, translates rules to database queries, and manages campaign launches.',
      responsibilities: [
        'Manage segments, campaigns, and customer data streams',
        'Translate natural language instructions into MongoDB filters',
        'Receive public delivery webhooks from the Channel Service',
        'Secure routes using JWT authentication middleware'
      ],
      connections: ['mongodb', 'ai-layer', 'campaign-engine', 'webhook-handler'],
      scaleStrategy: 'Cluster application processes across CPU cores using PM2; deploy stateless instances behind a load balancer (NGINX/AWS ALB) with auto-scaling groups.'
    },
    {
      id: 'mongodb',
      name: 'MongoDB Storage',
      tech: 'MongoDB, Mongoose ORM',
      icon: Database,
      color: 'border-green-500 text-green-400 bg-green-500/10',
      shadow: 'shadow-green-500/10',
      description: 'Document database storing customer profiles, transaction records, segments, campaign meta fields, and delivery logs.',
      responsibilities: [
        'Store and query 500+ customer profile indexes',
        'Maintain dynamic segment filter rules and campaign statistics',
        'Persist detailed, step-by-step communication logs',
        'Index schemas on critical query keys (email, phone, status, campaignId)'
      ],
      connections: ['backend'],
      scaleStrategy: 'Configure multi-node replica sets for high availability, create compound indexes for search filters, and employ read-replicas for heavy analytic querying.'
    },
    {
      id: 'campaign-engine',
      name: 'Campaign Engine',
      tech: 'Mongoose Streams & Asynchronous Batching',
      icon: Cpu,
      color: 'border-pink-500 text-pink-400 bg-pink-500/10',
      shadow: 'shadow-pink-500/10',
      description: 'Responsible for evaluating segment rules, generating personalized message copies, batching customers, and dispatching payloads to target messaging networks.',
      responsibilities: [
        'Query the segment rules database using Aggregation Pipelines',
        'Compile template variables (name, city, totalSpend) per user',
        'Process message batches with configurable throttle timers',
        'Initiate the initial communication log in queued state'
      ],
      connections: ['backend', 'channel-service'],
      scaleStrategy: 'Move from in-memory timers to a distributed queue worker system (e.g. BullMQ powered by Redis) to survive node restarts, handle millions of jobs, and support rate limits.'
    },
    {
      id: 'channel-service',
      name: 'Channel Service',
      tech: 'Express Sub-Service (Separate Port)',
      icon: MessageSquare,
      color: 'border-amber-500 text-amber-400 bg-amber-500/10',
      shadow: 'shadow-amber-500/10',
      description: 'An independent service simulating real-world WhatsApp, SMS, Email, and RCS carrier gateway networks.',
      responsibilities: [
        'Accept carrier payload dispatches asynchronously',
        'Simulate network delivery delay timeouts (2s - 60s)',
        'Generate multi-stage callback events (delivered -> opened -> read -> converted)',
        'Report delivery failures back to the Webhook Callback Receiver'
      ],
      connections: ['campaign-engine', 'webhook-handler'],
      scaleStrategy: 'Containerize as a microservice (Docker/Kubernetes) to isolate simulated network carrier loads from the core API gateway.'
    },
    {
      id: 'webhook-handler',
      name: 'Webhook & Retry Service',
      tech: 'Express.js public callback receiver',
      icon: Zap,
      color: 'border-cyan-500 text-cyan-400 bg-cyan-500/10',
      shadow: 'shadow-cyan-500/10',
      description: 'Receives delivery status receipt events from carrier networks, manages the state machine, and triggers automatic retries on delivery failures.',
      responsibilities: [
        'Validate callback event signatures and logs',
        'Prevent status regression (e.g., opened cannot transition back to sent)',
        'Execute automatic Retry Loop: Queue Retry #1, #2, #3 on carrier failure',
        'Perform campaign revenue adjustments upon receiving conversion events'
      ],
      connections: ['backend', 'channel-service'],
      scaleStrategy: 'Employ a message queue (RabbitMQ/Kafka) to buffer incoming webhook spikes during large campaign blasts, processing callbacks asynchronously to protect the database.'
    },
    {
      id: 'ai-layer',
      name: 'AI Layer (LLM Router)',
      tech: 'Claude API / Smart Rules Mock Engine',
      icon: Terminal,
      color: 'border-indigo-500 text-indigo-400 bg-indigo-500/10',
      shadow: 'shadow-indigo-500/10',
      description: 'Translates natural language prompts to database query formats, generates copywriting variants, and acts as a CRM data strategist chatbot.',
      responsibilities: [
        'Translate natural language prompts to MongoDB segment operators',
        'Draft highly converting, personalized marketing templates',
        'Formulate customer analysis and strategy recommendations in chat',
        'Fallback to smart regex-based parsers when API keys are absent'
      ],
      connections: ['backend'],
      scaleStrategy: 'Implement caching for similar prompts, establish rate-limiting rules, and utilize asynchronous worker workers for long LLM generation calls.'
    },
    {
      id: 'analytics',
      name: 'Analytics Engine',
      tech: 'Aggregation Framework, Health-Risk Analytics',
      icon: Activity,
      color: 'border-teal-500 text-teal-400 bg-teal-500/10',
      shadow: 'shadow-teal-500/10',
      description: 'Aggregates campaign logs, calculates customer health trends, conversion rates, churn risks, and LTV forecasts.',
      responsibilities: [
        'Calculate individual open rates, click rates, and preferred channels',
        'Forecast Lifetime Value (LTV) and churn probabilities',
        'Aggregate top-performing copy tones, segments, and campaigns',
        'Compile the Customer Intelligence insights matrix'
      ],
      connections: ['backend'],
      scaleStrategy: 'Pre-calculate and store analytics metrics overnight using cron workers, saving aggregates in database cache tables to keep real-time dashboards fast.'
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">System Architecture</h1>
        <p className="text-gray-400 text-sm mt-1">Explore the interactive topology, subsystem connections, and production scaling guidelines of Xeno CRM</p>
      </div>

      {/* Topology Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Subsystems Map Diagram */}
        <div className="lg:col-span-2 bg-crmCard p-6 rounded-3xl border border-gray-800 shadow-xl space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-gray-800">
            <h2 className="text-lg font-bold text-white">Interactive Network Topology</h2>
            <span className="text-xs bg-gray-900 border border-gray-800 px-3 py-1 rounded-full text-gray-400 font-medium">Click a subsystem node to inspect</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-900/40 rounded-2xl border border-gray-850 relative min-h-[400px] content-center">
            {subsystems.map((sub) => {
              const Icon = sub.icon;
              const isSelected = selectedNode?.id === sub.id;
              
              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedNode(sub)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between h-36 ${
                    isSelected 
                      ? `${sub.color} ring-2 ring-purple-500 shadow-2xl scale-[1.02]` 
                      : 'border-gray-800 bg-gray-950 hover:bg-gray-900 text-gray-400 hover:text-white hover:border-gray-700'
                  } ${sub.shadow}`}
                >
                  <div className="flex justify-between items-start w-full">
                    <div className="p-2.5 rounded-xl bg-gray-900 border border-gray-800">
                      <Icon className="w-5 h-5" />
                    </div>
                    {isSelected && (
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping"></span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white truncate">{sub.name}</h3>
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5 truncate">{sub.tech}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Flows & Connections Guide */}
          <div className="p-4 bg-gray-900/20 border border-gray-850 rounded-2xl">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Key System Flows</h4>
            <div className="space-y-2.5 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                <span className="font-semibold text-white">Campaign Dispatch</span>: 
                React UI <ArrowRight className="w-3.5 h-3.5 inline mx-1 text-gray-500" /> API Gateway <ArrowRight className="w-3.5 h-3.5 inline mx-1 text-gray-500" /> Campaign Engine <ArrowRight className="w-3.5 h-3.5 inline mx-1 text-gray-500" /> Channel Service (Carrier API)
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span className="font-semibold text-white">Webhook Delivery Receipt</span>: 
                Channel Service <ArrowRight className="w-3.5 h-3.5 inline mx-1 text-gray-500" /> Webhook API <ArrowRight className="w-3.5 h-3.5 inline mx-1 text-gray-500" /> Retry Logic / Status Updates <ArrowRight className="w-3.5 h-3.5 inline mx-1 text-gray-500" /> MongoDB
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                <span className="font-semibold text-white">AI Strategy & Copy generation</span>: 
                React UI <ArrowRight className="w-3.5 h-3.5 inline mx-1 text-gray-500" /> API Gateway <ArrowRight className="w-3.5 h-3.5 inline mx-1 text-gray-500" /> AI Layer (Claude integration) <ArrowRight className="w-3.5 h-3.5 inline mx-1 text-gray-500" /> Response output
              </div>
            </div>
          </div>
        </div>

        {/* Selected Subsystem detail card */}
        <div className="bg-crmCard p-6 rounded-3xl border border-gray-800 shadow-xl flex flex-col justify-between min-h-[450px]">
          {selectedNode ? (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-800">
                <div className={`p-3 rounded-2xl border ${selectedNode.color}`}>
                  {React.createElement(selectedNode.icon, { className: "w-6 h-6" })}
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{selectedNode.name}</h3>
                  <span className="text-[10px] text-gray-500 font-mono tracking-wider block">{selectedNode.tech}</span>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Subsystem Overview</span>
                  <p className="text-gray-300 leading-relaxed font-semibold">{selectedNode.description}</p>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Responsibilities</span>
                  <ul className="space-y-1.5">
                    {selectedNode.responsibilities.map((resp, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-400 leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                        {resp}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1 bg-purple-500/5 border border-purple-500/10 p-3 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 animate-pulse" />
                    Production Scaling Strategy
                  </span>
                  <p className="text-gray-450 leading-relaxed text-[11px] mt-1 italic">{selectedNode.scaleStrategy}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-20 gap-4 flex-grow">
              <HelpCircle className="w-12 h-12 text-gray-700 animate-bounce" />
              <div>
                <h3 className="font-bold text-white text-sm">No node selected</h3>
                <p className="text-xs text-gray-500 mt-1.5 max-w-[200px] mx-auto leading-relaxed">
                  Select any subsystem node on the map diagram to inspect its parameters, responsibilities, and scalability recommendations.
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-850 flex items-center gap-2 text-gray-500 text-[10px] font-mono justify-center">
            <Code className="w-3.5 h-3.5" />
            <span>Xeno Architectural Blueprints</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Architecture;
