export interface SubscriptionService {
  startTrial(userId: string, planId: string): Promise<void>;
  activateAfterTrial(userId: string): Promise<void>;
  cancelSubscription(userId: string): Promise<void>;
}
