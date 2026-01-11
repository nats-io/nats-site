import type { NatsFlowScenario } from '../types';
import { publishSubscribeScenario } from './publishSubscribe';
import { requestReplyScenario } from './requestReply';
import { requestReplyScatterGatherScenario } from './requestReplyScatterGather';
import { requestReplyQueueGroupScenario } from './requestReplyQueueGroup';
import { queueGroupScenario } from './queueGroup';
import { fanOutScenario } from './fanOut';
import { toggleableSubscribersScenario, ToggleableSubscribersScenario } from './toggleableSubscribers';
import { QueueGroupAnimated } from './queueGroupAnimated';
import { PublishSubscribeAnimated } from './publishSubscribeAnimated';
import { SubjectsWildcardAnimated } from './subjectsWildcardAnimated';
import { WildcardComparison } from './wildcardComparison';

// Re-export individual scenarios
export {
  publishSubscribeScenario,
  requestReplyScenario,
  requestReplyScatterGatherScenario,
  requestReplyQueueGroupScenario,
  queueGroupScenario,
  fanOutScenario,
  toggleableSubscribersScenario,
  ToggleableSubscribersScenario,
  QueueGroupAnimated,
  PublishSubscribeAnimated,
  SubjectsWildcardAnimated,
  WildcardComparison,
};

// Scenarios lookup object for dynamic access
export const scenarios: Record<string, NatsFlowScenario> = {
  publishSubscribe: publishSubscribeScenario,
  requestReply: requestReplyScenario,
  requestReplyScatterGather: requestReplyScatterGatherScenario,
  requestReplyQueueGroup: requestReplyQueueGroupScenario,
  queueGroup: queueGroupScenario,
  fanOut: fanOutScenario,
  toggleableSubscribers: toggleableSubscribersScenario,
};
