'use client'

import { useState } from 'react'
import { Lightbulb, Users, Target, Calendar, Sparkles, TrendingUp } from 'lucide-react'

type AgentMode = 'content-plan' | 'pain-points' | 'offers' | null

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function Home() {
  const [selectedMode, setSelectedMode] = useState<AgentMode>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [businessInfo, setBusinessInfo] = useState({
    industry: '',
    targetAudience: '',
    product: ''
  })
  const [showBusinessForm, setShowBusinessForm] = useState(false)

  const modes = [
    {
      id: 'content-plan' as const,
      title: 'Content Plan Builder',
      description: 'Create comprehensive content strategies with topics, formats, and scheduling',
      icon: Calendar,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'pain-points' as const,
      title: 'Customer Psychology',
      description: 'Identify pain points, dreams, desires, and motivations of your audience',
      icon: Users,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'offers' as const,
      title: 'Irresistible Offers',
      description: 'Craft compelling offers with strong value propositions and urgency',
      icon: Target,
      color: 'from-orange-500 to-red-500'
    }
  ]

  const handleModeSelect = (mode: AgentMode) => {
    setSelectedMode(mode)
    setMessages([])
    setShowBusinessForm(true)
  }

  const handleBusinessInfoSubmit = () => {
    if (!businessInfo.industry || !businessInfo.targetAudience || !businessInfo.product) {
      alert('Please fill in all business information fields')
      return
    }
    setShowBusinessForm(false)

    const initialMessage = getInitialAgentMessage(selectedMode!, businessInfo)
    setMessages([{ role: 'assistant', content: initialMessage }])
  }

  const getInitialAgentMessage = (mode: AgentMode, info: typeof businessInfo) => {
    const modes = {
      'content-plan': `Great! I'll help you build a content plan for your ${info.product} targeting ${info.targetAudience} in the ${info.industry} industry.\n\nLet's start by understanding:\n1. What are your main marketing goals? (e.g., brand awareness, lead generation, sales)\n2. What platforms do you want to focus on?\n3. How often can you realistically create content?\n\nShare your thoughts and I'll create a tailored content strategy.`,
      'pain-points': `Perfect! Let's dive deep into understanding your ${info.targetAudience} in the ${info.industry} space.\n\nI'll help you uncover:\n✓ Core pain points and frustrations\n✓ Deep desires and aspirations\n✓ Hidden motivations\n✓ Emotional triggers\n\nTell me: What problems do you think your ${info.product} solves? Even a rough idea helps me go deeper.`,
      'offers': `Excellent! Let's craft an irresistible offer for your ${info.product}.\n\nI'll help you create:\n✓ Compelling value proposition\n✓ Strategic pricing and packaging\n✓ Scarcity and urgency elements\n✓ Risk reversal strategies\n✓ Bonus stacking\n\nFirst, what's the transformation or outcome your ${info.product} delivers?`
    }
    return modes[mode!]
  }

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: selectedMode,
          messages: [...messages, userMessage],
          businessInfo
        })
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.'
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {!selectedMode ? (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <Sparkles className="w-12 h-12 text-yellow-400 mr-3" />
                <h1 className="text-5xl font-bold text-white">Marketing Coach Agent</h1>
              </div>
              <p className="text-xl text-gray-300">Your AI-powered marketing strategy assistant</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {modes.map(mode => {
                const Icon = mode.icon
                return (
                  <div
                    key={mode.id}
                    onClick={() => handleModeSelect(mode.id)}
                    className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 cursor-pointer transform transition-all hover:scale-105 hover:shadow-2xl border border-white/20"
                  >
                    <div className={`w-16 h-16 bg-gradient-to-r ${mode.color} rounded-xl flex items-center justify-center mb-4`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{mode.title}</h3>
                    <p className="text-gray-300">{mode.description}</p>
                  </div>
                )
              })}
            </div>

            <div className="mt-16 bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
              <div className="flex items-start space-x-4">
                <TrendingUp className="w-8 h-8 text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">How It Works</h3>
                  <ol className="text-gray-300 space-y-2">
                    <li>1. Choose your marketing objective from the options above</li>
                    <li>2. Share information about your business and target audience</li>
                    <li>3. Engage in a conversation with your AI marketing coach</li>
                    <li>4. Get actionable strategies, insights, and detailed plans</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Lightbulb className="w-8 h-8 text-white" />
                  <h2 className="text-2xl font-bold text-white">
                    {modes.find(m => m.id === selectedMode)?.title}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setSelectedMode(null)
                    setMessages([])
                    setBusinessInfo({ industry: '', targetAudience: '', product: '' })
                    setShowBusinessForm(false)
                  }}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
                >
                  Change Mode
                </button>
              </div>

              {showBusinessForm ? (
                <div className="p-8">
                  <h3 className="text-xl font-bold text-white mb-6">Tell me about your business</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-300 mb-2">Industry</label>
                      <input
                        type="text"
                        value={businessInfo.industry}
                        onChange={(e) => setBusinessInfo({ ...businessInfo, industry: e.target.value })}
                        placeholder="e.g., Health & Fitness, SaaS, E-commerce"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2">Target Audience</label>
                      <input
                        type="text"
                        value={businessInfo.targetAudience}
                        onChange={(e) => setBusinessInfo({ ...businessInfo, targetAudience: e.target.value })}
                        placeholder="e.g., Small business owners, Busy professionals"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2">Product/Service</label>
                      <input
                        type="text"
                        value={businessInfo.product}
                        onChange={(e) => setBusinessInfo({ ...businessInfo, product: e.target.value })}
                        placeholder="e.g., Online coaching program, Project management software"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <button
                      onClick={handleBusinessInfoSubmit}
                      className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105"
                    >
                      Start Coaching Session
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="h-[500px] overflow-y-auto p-6 space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-4 rounded-2xl ${
                            message.role === 'user'
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                              : 'bg-white/10 text-gray-100 border border-white/20'
                          }`}
                        >
                          <div className="whitespace-pre-wrap">{message.content}</div>
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="flex justify-start">
                        <div className="bg-white/10 border border-white/20 p-4 rounded-2xl">
                          <div className="flex space-x-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-white/20 p-4">
                    <div className="flex space-x-2">
                      <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Share your thoughts or ask a question..."
                        className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        rows={2}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={loading || !input.trim()}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
