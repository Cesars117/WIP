import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `You are a precise BOM document parser. Extract structured data from Tellworks/T-Mobile Site Kit BOM documents.

CRITICAL RULES:
1. Ignore ALL handwritten annotations, checkmarks, highlighted text, and manual markings. Only extract printed/typed text.
2. Asset tags always follow the pattern TM followed by 8-10 digits (e.g. TM11243255).
3. Site Kit SKUs are typically 5-digit numbers.
4. If a field is empty or not visible, use null or empty string as appropriate.
5. Combine data from multiple pages of the same Site Kit into a single result.
6. Page footers like "SITEKIT_XXX - Page X of Y" are metadata, not data rows.

Return ONLY valid JSON, no markdown, no explanation, no code fences.`

const USER_PROMPT = `Parse the BOM document(s) in the provided image(s). Extract all printed/typed data and return this exact JSON structure:

{
  "siteKitId": "SITEKIT_XXXXX_XX",
  "bomId": "string or null",
  "siteId": "string or null",
  "projectName": "string or null",
  "pallets": number_or_null,
  "authNumber": "string or null",
  "dateCompleted": "ISO date string or null",
  "mslLocation": "string or null",
  "company": "string or null",
  "catsCode": "string or null",
  "subcontractor": "string or null",
  "items": [
    {
      "siteKitSku": "string (5-digit SKU)",
      "quantity": number,
      "description": "string",
      "assetTags": ["TM########", ...]
    }
  ]
}

Remember: IGNORE all handwritten annotations. Only extract printed text.`

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
  }

  try {
    const { images } = await request.json()

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 })
    }

    if (images.length > 20) {
      return NextResponse.json({ error: 'Maximum 20 images allowed' }, { status: 400 })
    }

    const anthropic = new Anthropic({ apiKey })

    // Build content array with all images
    const content: Anthropic.MessageCreateParams['messages'][0]['content'] = []

    for (const img of images) {
      if (typeof img !== 'string') continue
      // Expect base64 data URLs like "data:image/jpeg;base64,..."
      const match = img.match(/^data:(image\/(?:jpeg|png|gif|webp));base64,(.+)$/)
      if (!match) continue

      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: match[1] as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
          data: match[2],
        },
      })
    }

    if (content.length === 0) {
      return NextResponse.json({ error: 'No valid images found' }, { status: 400 })
    }

    content.push({ type: 'text', text: USER_PROMPT })

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content }],
    })

    const textBlock = message.content.find((b) => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'No text response from OCR' }, { status: 500 })
    }

    // Parse the JSON response
    let parsed
    try {
      // Strip potential markdown fences
      let raw = textBlock.text.trim()
      if (raw.startsWith('```')) {
        raw = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
      }
      parsed = JSON.parse(raw)
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse OCR response', raw: textBlock.text },
        { status: 422 }
      )
    }

    // Deduplicate items by siteKitSku (combine asset tags)
    if (parsed.items && Array.isArray(parsed.items)) {
      const skuMap = new Map<string, typeof parsed.items[0]>()
      for (const item of parsed.items) {
        const existing = skuMap.get(item.siteKitSku)
        if (existing) {
          existing.quantity += item.quantity
          existing.assetTags = [
            ...new Set([...(existing.assetTags || []), ...(item.assetTags || [])]),
          ]
        } else {
          skuMap.set(item.siteKitSku, { ...item })
        }
      }
      parsed.items = Array.from(skuMap.values())
    }

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('OCR error:', error)
    return NextResponse.json({ error: 'OCR processing failed' }, { status: 500 })
  }
}
