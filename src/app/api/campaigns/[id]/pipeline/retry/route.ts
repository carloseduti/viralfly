import { z } from 'zod';

import { requireAuthenticatedUser } from '@/server/auth/require-authenticated-user';
import { PIPELINE_STEPS, PipelineOrchestratorService } from '@/server/modules/pipeline/pipeline-orchestrator.service';
import { successResponse } from '@/utils/api-response';
import { withRouteErrorHandling } from '@/utils/route-handler';

const pipelineService = new PipelineOrchestratorService();

const retryPipelineSchema = z.object({
  step: z.enum(PIPELINE_STEPS)
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  return withRouteErrorHandling(async () => {
    const payload = retryPipelineSchema.parse(await request.json().catch(() => ({})));
    const user = await requireAuthenticatedUser();
    const { id } = await context.params;
    const result = await pipelineService.retryFromStep(user.id, id, payload.step);
    return successResponse(result, 202);
  });
}
