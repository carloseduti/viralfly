import { BaseImageService } from '@/server/modules/campaigns/base-image.service';
import { PipelineOrchestratorService } from '@/server/modules/pipeline/pipeline-orchestrator.service';
import { successResponse } from '@/utils/api-response';
import { withRouteErrorHandling } from '@/utils/route-handler';

const baseImageService = new BaseImageService();
const pipelineService = new PipelineOrchestratorService();

export async function POST(request: Request) {
  return withRouteErrorHandling(async () => {
    const payload = await request.json().catch(() => ({}));
    const result = await baseImageService.handleProviderCallback(payload);

    if (result.updated && result.campaignId && result.userId) {
      await pipelineService.startOrResume(result.userId, result.campaignId);
    }

    return successResponse(result);
  });
}
