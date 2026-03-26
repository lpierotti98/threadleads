import Anthropic from '@anthropic-ai/sdk';

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  }
  return _client;
}

export interface ScoreThreadResult {
  score: number;
  reason: string;
  urgency: 'low' | 'medium' | 'high';
  _raw: string;
}

export async function scoreThread(title: string, content: string): Promise<ScoreThreadResult> {
  const message = await getClient().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 256,
    system:
      'You are an expert at identifying buying intent in forum threads. Analyze the following thread title and content. Return a JSON object with: score (0-100 integer, where 100 = extremely high buying intent), reason (one sentence explaining the score), urgency (low/medium/high). A high score means the person is actively looking for a solution to buy or try RIGHT NOW. A low score means it is informational or casual. Return only valid JSON, no markdown.',
    messages: [
      {
        role: 'user',
        content: `Thread title: ${title}\n\nThread content: ${content || '(no body text)'}`,
      },
    ],
  });

  const raw =
    message.content[0].type === 'text' ? message.content[0].text : '';
  const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const parsed = JSON.parse(clean);
  return { ...parsed, _raw: raw };
}

export async function generateReply(
  title: string,
  content: string,
  productMention?: string
): Promise<string> {
  let systemPrompt =
    "You are a practitioner who has worked in the field for years. Write a reply to this forum thread that sounds like a real person typing a message, not an AI writing a report.\n\nRules:\n- No bullet points, no bold text, no markdown formatting of any kind\n- No dashes used as list separators\n- Write in flowing paragraphs like a human comment\n- Be direct and specific, not generic\n- Show genuine expertise through one concrete insight or personal experience\n- Keep it under 150 words\n- End with one natural question that invites conversation\n- The tone should feel like a smart colleague commenting on Slack, not a consultant writing a deliverable\n- Write in the same language as the thread";

  if (productMention) {
    systemPrompt += `\n\nAt the very end of your reply, in a new paragraph, naturally mention this product as something that could help: ${productMention}`;
  }

  const message = await getClient().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Thread title: ${title}\n\nThread content: ${content || '(no body text)'}`,
      },
    ],
  });

  return message.content[0].type === 'text' ? message.content[0].text : '';
}
