import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projects, investorProfile } = body

    console.log('Received request:', { 
      projectsCount: projects?.length, 
      hasProfile: !!investorProfile 
    })

    if (!projects || !Array.isArray(projects) || projects.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 projects are required for comparison' },
        { status: 400 }
      )
    }

    if (!investorProfile) {
      return NextResponse.json(
        { error: 'Investor profile is required' },
        { status: 400 }
      )
    }

    // Check for OpenAI API key
    const apiKey = process.env.OPENAI_API_KEY
    const useOpenAI = !!apiKey && apiKey.trim() !== ''

    if (useOpenAI) {
      try {
        // Build the prompt for OpenAI
        const prompt = buildAnalysisPrompt(projects, investorProfile)

        // Call OpenAI API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini', // Using gpt-4o-mini for better availability and lower cost
            messages: [
              {
                role: 'system',
                content: `You are an expert maritime investment advisor with deep knowledge of shipping investments, risk assessment, and portfolio management. You provide clear, data-driven recommendations based on investor profiles and deal characteristics.`,
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.7,
            max_tokens: 1500,
            response_format: { type: 'json_object' }, // Request JSON response format
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          let errorMessage = 'Failed to analyze deals'
          try {
            const errorJson = JSON.parse(errorText)
            errorMessage = errorJson.error?.message || errorMessage
          } catch {
            errorMessage = errorText || errorMessage
          }
          console.error('OpenAI API error:', errorMessage)
          
          // If quota exceeded or access denied, fall back to rule-based analysis
          if (errorMessage.includes('quota') || errorMessage.includes('billing') || errorMessage.includes('access')) {
            console.log('Falling back to rule-based analysis due to OpenAI error')
            const recommendation = generateRuleBasedRecommendation(projects, investorProfile)
            return NextResponse.json(recommendation)
          }
          
          return NextResponse.json(
            { error: errorMessage },
            { status: response.status }
          )
        }

        const data = await response.json()
        const aiResponse = data.choices[0]?.message?.content || ''

        // Parse the AI response into structured format
        const recommendation = parseAIResponse(aiResponse, projects)
        return NextResponse.json(recommendation)
      } catch (openAIError: any) {
        console.error('OpenAI API call failed, using fallback:', openAIError)
        // Fall through to rule-based analysis
      }
    }

    // Fallback: Rule-based recommendation (works without OpenAI)
    console.log('Using rule-based analysis (OpenAI not available or failed)')
    const recommendation = generateRuleBasedRecommendation(projects, investorProfile)
    return NextResponse.json(recommendation)
  } catch (error: any) {
    console.error('Error in analyze-deals:', error)
    const errorMessage = error?.message || 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

function buildAnalysisPrompt(projects: any[], investorProfile: any): string {
  const projectsSummary = projects.map((p, index) => `
Project ${index + 1}: ${p.shipName}
- Minimum Investment: $${(p.minInvestment / 1000).toFixed(0)}K
- Base Case IRR: ${p.financials?.baseCaseIRR || p.returnPerYear}%
- MOIC: ${p.financials?.moic || 'N/A'}x
- Purchase Price: $${(p.purchasePrice / 1000000).toFixed(1)}M
- Equity Value: $${(p.equityValue / 1000000).toFixed(1)}M
- Deadweight: ${p.deadweight.toLocaleString()} dwt
- Built: ${p.built}
- Technical Rating: ${p.technicalRating}
- Cash Breakeven: $${p.financials?.cashBreakeven?.toLocaleString() || 'N/A'}/day
- OPEX Budget: $${p.financials?.opexBudget?.toLocaleString() || 'N/A'}/day
- Average Net TC Rate: $${p.market?.avgNetTCRate?.toLocaleString() || 'N/A'}/day
- Net Sales Price (Year 5): $${(p.market?.netSalesPrice / 1000000).toFixed(2) || 'N/A'}M
`).join('\n')

  return `Analyze the following shipping investment opportunities and provide a recommendation based on the investor profile.

INVESTOR PROFILE:
- Risk Tolerance: ${investorProfile.riskTolerance}
- Investment Horizon: ${investorProfile.investmentHorizon}
- Priority: ${investorProfile.priority}
- Experience Level: ${investorProfile.experience}
- Investment Amount: $${investorProfile.investmentAmount.toLocaleString()}

INVESTMENT OPPORTUNITIES:
${projectsSummary}

You MUST respond with ONLY a valid JSON object in this exact format (no markdown, no code blocks, no additional text):
{
  "recommendedDeal": "1",
  "reasoning": "2-3 sentence explanation of why this deal is recommended for this investor",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["consideration 1", "consideration 2"],
  "riskAssessment": "1-2 sentence risk assessment",
  "confidence": 85
}

The recommendedDeal must be one of the project IDs: ${projects.map(p => `"${p.id}"`).join(', ')}.

Focus on:
1. Alignment with investor's risk tolerance and priorities
2. Financial metrics (IRR, MOIC, breakeven)
3. Technical quality and vessel age
4. Market conditions and outlook
5. Investment amount suitability

Return ONLY valid JSON in this exact format, no additional text or markdown formatting.`
}

function parseAIResponse(response: string, projects: any[]): any {
  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      
      // Validate and ensure project ID exists
      const validProjectId = projects.find(p => p.id === parsed.recommendedDeal)?.id || projects[0].id
      
      return {
        recommendedDeal: validProjectId,
        reasoning: parsed.reasoning || 'Based on comprehensive analysis of financial metrics and investor profile.',
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
        riskAssessment: parsed.riskAssessment || 'Standard shipping investment risks apply.',
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 75,
      }
    }
  } catch (error) {
    console.error('Error parsing AI response:', error)
  }

  // Fallback recommendation
  const bestIRR = projects.reduce((best, current) => {
    const currentIRR = current.financials?.baseCaseIRR || current.returnPerYear
    const bestIRR = best.financials?.baseCaseIRR || best.returnPerYear
    return currentIRR > bestIRR ? current : best
  }, projects[0])

  return {
    recommendedDeal: bestIRR.id,
    reasoning: 'Based on highest base case IRR and overall financial metrics.',
    strengths: [
      `Strong base case IRR of ${bestIRR.financials?.baseCaseIRR || bestIRR.returnPerYear}%`,
      'Competitive technical rating',
      'Attractive entry point',
    ],
    weaknesses: [
      'Standard shipping market volatility',
      'Currency and fuel price risks',
    ],
    riskAssessment: 'Medium risk profile typical for shipping investments.',
    confidence: 70,
  }
}

function generateRuleBasedRecommendation(projects: any[], investorProfile: any): any {
  // Score each project based on investor profile
  const scoredProjects = projects.map(project => {
    let score = 0
    const irr = project.financials?.baseCaseIRR || project.returnPerYear
    const moic = project.financials?.moic || 0
    const techRating = parseFloat(project.technicalRating) || 0
    const minInvestment = project.minInvestment || 0
    const investmentAmount = investorProfile.investmentAmount || 200000

    // Risk tolerance scoring
    if (investorProfile.riskTolerance === 'conservative') {
      score += techRating * 10 // Higher weight on technical quality
      score += (irr > 15 && irr < 20) ? 20 : 0 // Prefer moderate returns
      score += (moic > 1.8 && moic < 2.2) ? 15 : 0 // Prefer moderate MOIC
    } else if (investorProfile.riskTolerance === 'moderate') {
      score += irr * 2 // Balanced approach
      score += techRating * 8
      score += moic * 5
    } else { // aggressive
      score += irr * 3 // Maximize returns
      score += moic * 8
      score += techRating * 5
    }

    // Priority scoring
    if (investorProfile.priority === 'returns') {
      score += irr * 4
      score += moic * 10
    } else if (investorProfile.priority === 'safety') {
      score += techRating * 15
      score += (irr > 15) ? 10 : 0
    } else { // balance
      score += irr * 2
      score += techRating * 8
      score += moic * 5
    }

    // Investment amount suitability
    if (investmentAmount >= minInvestment && investmentAmount <= minInvestment * 3) {
      score += 10 // Good fit
    } else if (investmentAmount < minInvestment) {
      score -= 20 // Below minimum
    }

    // Investment horizon
    if (investorProfile.investmentHorizon === 'long') {
      score += moic * 8 // Long-term investors value MOIC more
    }

    return { project, score }
  })

  // Find best project
  const bestProject = scoredProjects.reduce((best, current) => 
    current.score > best.score ? current : best
  ).project

  // Generate reasoning
  const irr = bestProject.financials?.baseCaseIRR || bestProject.returnPerYear
  const moic = bestProject.financials?.moic || 0
  
  let reasoning = `Based on your ${investorProfile.riskTolerance} risk tolerance and ${investorProfile.priority} priority, `
  if (investorProfile.priority === 'returns') {
    reasoning += `this deal offers the strongest return profile with ${irr}% base case IRR and ${moic}x MOIC.`
  } else if (investorProfile.priority === 'safety') {
    reasoning += `this deal provides a solid balance with a technical rating of ${bestProject.technicalRating} and competitive returns.`
  } else {
    reasoning += `this deal offers the best overall balance of returns (${irr}% IRR), risk management, and investment fit.`
  }

  // Generate strengths
  const strengths = []
  if (irr >= 18) strengths.push(`Strong base case IRR of ${irr}%`)
  if (moic >= 2.0) strengths.push(`Attractive MOIC of ${moic}x`)
  if (parseFloat(bestProject.technicalRating) >= 8.0) strengths.push(`High technical rating of ${bestProject.technicalRating}`)
  if (bestProject.built && new Date(bestProject.built).getFullYear() >= 2014) strengths.push(`Modern vessel built in ${bestProject.built}`)
  if (strengths.length === 0) strengths.push('Competitive financial metrics and vessel quality')

  // Generate weaknesses
  const weaknesses = [
    'Standard shipping market volatility and cyclical nature',
    'Currency exchange rate and fuel price risks',
  ]
  if (parseFloat(bestProject.technicalRating) < 7.5) {
    weaknesses.push('Lower technical rating compared to newer vessels')
  }

  // Risk assessment
  let riskAssessment = 'Medium risk profile typical for shipping investments. '
  if (investorProfile.riskTolerance === 'conservative') {
    riskAssessment += 'Consider diversifying across multiple investments to mitigate risk.'
  } else if (investorProfile.riskTolerance === 'aggressive') {
    riskAssessment += 'Higher return potential comes with increased market exposure.'
  }

  // Calculate confidence based on how well the deal matches the profile
  let confidence = 75
  if (investorProfile.priority === 'returns' && irr >= 18) confidence = 85
  if (investorProfile.priority === 'safety' && parseFloat(bestProject.technicalRating) >= 8.0) confidence = 85
  if (investorProfile.priority === 'balance' && irr >= 17 && parseFloat(bestProject.technicalRating) >= 7.8) confidence = 80

  return {
    recommendedDeal: bestProject.id,
    reasoning,
    strengths,
    weaknesses,
    riskAssessment,
    confidence,
  }
}
