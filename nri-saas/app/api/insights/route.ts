import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

// Free tier: 14,400 req/day on Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY ?? '' })

export async function POST(request: NextRequest) {
  const data = await request.json()

  const {
    monthly_income = 0,
    monthly_expenses = 0,
    savings_rate = 0,
    net_worth = 0,
    total_remitted = 0,
    top_categories = [],
    budget_usage = [],
    upcoming_bills = [],
    goal_progress = [],
    resident_country = 'Thailand',
    home_currency = 'INR',
    work_currency = 'THB',
  } = data

  const prompt = `You are a financial advisor for an NRI (Non-Resident Indian) living in ${resident_country}.

Analyse this financial data and provide 4-5 concise, actionable insights specifically relevant to their NRI situation:

Monthly Income: ${home_currency} ${monthly_income.toLocaleString()}
Monthly Expenses: ${home_currency} ${monthly_expenses.toLocaleString()}
Savings Rate: ${savings_rate.toFixed(1)}%
Net Worth: ${home_currency} ${net_worth.toLocaleString()}
Total Remitted to India (YTD): ${home_currency} ${total_remitted.toLocaleString()}
Work Currency: ${work_currency}

Top Expense Categories: ${JSON.stringify(top_categories)}
Budget Usage: ${JSON.stringify(budget_usage)}
Upcoming Bills: ${JSON.stringify(upcoming_bills)}
Goal Progress: ${JSON.stringify(goal_progress)}

Generate insights as JSON array with this schema:
{
  "insights": [
    {
      "type": "warning" | "success" | "info",
      "category": "spending" | "savings" | "remittance" | "investment" | "tax" | "bills",
      "title": "short title",
      "message": "1-2 sentence actionable insight specific to NRI situation",
      "action": "action label",
      "priority": 0-100
    }
  ]
}

Focus on: exchange rate timing, India vs ${resident_country} tax considerations, NRE/NRO optimisation, remittance efficiency. Be specific and actionable.`

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',  // Fast, free
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1200,
      response_format: { type: 'json_object' },
    })

    const content = completion.choices[0]?.message?.content ?? '{}'
    const parsed = JSON.parse(content)
    return NextResponse.json({ insights: parsed.insights ?? [], source: 'groq-llama-3.1-8b' })
  } catch (error) {
    console.error('Groq AI failed:', error)

    // Rule-based fallback
    const fallback = generateRuleBasedInsights(data)
    return NextResponse.json({ insights: fallback, source: 'rule-based' })
  }
}

function generateRuleBasedInsights(data: Record<string, number>) {
  const insights = []

  if (data.savings_rate < 20) {
    insights.push({
      type: 'warning', category: 'savings', priority: 85,
      title: 'Low savings rate',
      message: `At ${data.savings_rate?.toFixed(0)}%, you're below the recommended 20-30% savings rate. Review recurring expenses.`,
      action: 'View Expenses',
    })
  }

  if (data.savings_rate >= 40) {
    insights.push({
      type: 'success', category: 'savings', priority: 70,
      title: 'Excellent savings discipline',
      message: `Saving ${data.savings_rate?.toFixed(0)}% of income is outstanding. Consider moving surplus into ELSS for 80C benefits.`,
      action: 'Track Investments',
    })
  }

  return insights
}
