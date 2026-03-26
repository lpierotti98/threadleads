export interface Thread {
  id: string;
  user_id: string;
  source: 'reddit' | 'hn';
  title: string;
  url: string;
  content_preview: string;
  subreddit: string | null;
  score: number;
  urgency: 'low' | 'medium' | 'high';
  score_reason: string;
  reply_generated: boolean;
  marked_done: boolean;
  marked_contacted: boolean;
  created_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  keywords: Keyword[];
  created_at: string;
}

export interface Keyword {
  text: string;
  active: boolean;
}

export interface Usage {
  id: string;
  user_id: string;
  scans_today: number;
  replies_this_month: number;
  last_scan_at: string | null;
}

export interface ScoreResult {
  score: number;
  reason: string;
  urgency: 'low' | 'medium' | 'high';
}

export interface Subscription {
  plan: 'starter' | 'pro' | null;
  status: 'active' | 'canceled' | 'past_due' | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
}
