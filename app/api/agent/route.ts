import { NextRequest, NextResponse } from 'next/server'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || ''

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const systemPrompts = {
  'content-plan': `You are an expert marketing content strategist. Help users create comprehensive content plans including:
- Content topics and themes aligned with business goals
- Content formats (blog posts, videos, social media, emails, etc.)
- Publishing schedule and frequency
- Distribution channels
- KPIs and success metrics
- Content calendar structure
- SEO optimization strategies
- Engagement tactics

Be specific, actionable, and provide detailed examples. Ask clarifying questions to understand their goals, resources, and constraints.`,

  'pain-points': `You are a customer psychology expert specializing in deep audience research. Help users understand their target audience:
- Core pain points and frustrations
- Aspirations, dreams, and desires
- Hidden motivations and fears
- Emotional triggers
- Current situations vs desired situations
- Jobs to be done framework
- Objections and hesitations
- Language and phrases they use

Use empathy, ask probing questions, and help them see beyond surface-level understanding. Create detailed customer avatars and psychographic profiles.`,

  'offers': `You are a conversion optimization and offer creation specialist. Help users craft irresistible offers:
- Strong value propositions
- Clear transformation and outcomes
- Strategic pricing and positioning
- Scarcity and urgency elements
- Risk reversal (guarantees, trials)
- Bonus stacking and package creation
- Payment options
- Compelling copy and messaging
- Call-to-action optimization

Focus on creating offers that are specific, tangible, and address real customer desires. Use proven frameworks like value equation, offer stacking, and urgency triggers.`
}

export async function POST(request: NextRequest) {
  try {
    const { mode, messages, businessInfo } = await request.json()

    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      )
    }

    const systemPrompt = systemPrompts[mode as keyof typeof systemPrompts]
    const contextPrompt = `\n\nBusiness Context:\n- Industry: ${businessInfo.industry}\n- Target Audience: ${businessInfo.targetAudience}\n- Product/Service: ${businessInfo.product}\n\nUse this context to provide highly relevant and personalized advice.`

    const anthropicMessages = messages.map((msg: Message) => ({
      role: msg.role,
      content: msg.content
    }))

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        system: systemPrompt + contextPrompt,
        messages: anthropicMessages
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Anthropic API error:', errorData)
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    const assistantMessage = data.content[0].text

    return NextResponse.json({ response: assistantMessage })
  } catch (error) {
    console.error('Error in agent route:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
