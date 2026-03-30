import { CampaignForm } from '@/components/campaign-form';
import { requirePageAuthenticatedUser } from '@/server/auth/require-authenticated-user';

export default async function NewCampaignPage() {
  await requirePageAuthenticatedUser();
  return <CampaignForm mode="create" />;
}


