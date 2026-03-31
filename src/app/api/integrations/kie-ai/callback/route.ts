import { FrameGenerationService } from '@/server/modules/frames/frame-generation.service';
import { PipelineOrchestratorService } from '@/server/modules/pipeline/pipeline-orchestrator.service';
import { successResponse } from '@/utils/api-response';
import { withRouteErrorHandling } from '@/utils/route-handler';

const frameService = new FrameGenerationService();
const pipelineService = new PipelineOrchestratorService();

export async function POST(request: Request) {
  return withRouteErrorHandling(async () => {
    const payload = await request.json().catch(() => ({}));
    const result = await frameService.handleProviderCallback(payload);

    if (result.updated && result.campaignId && result.userId) {
      await pipelineService.startOrResume(result.userId, result.campaignId);
    }

    return successResponse(result);
  });
}
