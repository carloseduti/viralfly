import { z } from 'zod';

import { requireAuthenticatedUser } from '@/server/auth/require-authenticated-user';
import { PipelineOrchestratorService } from '@/server/modules/pipeline/pipeline-orchestrator.service';
import { successResponse } from '@/utils/api-response';
import { withRouteErrorHandling } from '@/utils/route-handler';

const pipelineService = new PipelineOrchestratorService();

const startPipelineSchema = z.object({
  autoStart: z.boolean().optional().default(true)
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  return withRouteErrorHandling(async () => {
    await startPipelineSchema.parse(await request.json().catch(() => ({})));
    const user = await requireAuthenticatedUser();
    const { id } = await context.params;
    const result = await pipelineService.startOrResume(user.id, id);
    return successResponse(result, 202);
  });
}
