import { publishSubscribeScenario } from './publishSubscribe';
import type { NatsFlowScenario } from '../../../types';

export const scenarios: Record<string, NatsFlowScenario> = {
  publishSubscribe: publishSubscribeScenario,
};
