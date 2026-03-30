import { CampaignForm } from '@/components/campaign-form';
import { requirePageAuthenticatedUser } from '@/server/auth/require-page-authenticated-user';

export default async function NewCampaignPage() {
  await requirePageAuthenticatedUser();
  return <CampaignForm mode="create" />;
}

