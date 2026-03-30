import { CampaignForm } from '@/components/campaign-form';
import { requireAuthenticatedUser } from '@/server/auth/require-authenticated-user';

export default async function NewCampaignPage() {
  await requireAuthenticatedUser();
  return <CampaignForm mode="create" />;
}
