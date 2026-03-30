import Link from 'next/link';

import { StatusBadge } from '@/components/status-badge';
import { requireAuthenticatedUser } from '@/server/auth/require-authenticated-user';
import { CampaignService } from '@/server/modules/campaigns/campaign.service';

const campaignService = new CampaignService();

export default async function CampaignsPage() {
  const user = await requireAuthenticatedUser();
  const campaigns = await campaignService.listCampaigns(user.id);

  return (
    <div className="space-y-5">
      <div className="card flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Produtos</h1>
          <p className="text-sm text-slate-600">Cadastre produtos com imagem e gere anuncios em 3 frames.</p>
        </div>
        <Link className="btn" href="/campaigns/new">
          Novo produto
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="card-soft text-sm text-slate-600">Nenhum produto cadastrado ainda. Comece com o upload de uma imagem.</div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {campaigns.map((campaign) => (
          <Link key={campaign.id} href={`/campaigns/${campaign.id}`} className="card group transition hover:-translate-y-0.5 hover:border-cyan-400">
            <div className="flex gap-3">
              <div className="media-frame h-24 w-24 shrink-0">
                {campaign.imagePublicUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={campaign.imagePublicUrl} alt={campaign.nomeProduto} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-slate-500">Sem imagem</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate font-semibold">{campaign.nomeProduto}</p>
                  <StatusBadge status={campaign.status} />
                </div>
                <p className="mt-1 text-sm text-slate-600">{campaign.tipoProduto}</p>
                <p className="mt-1 text-xs text-slate-500">Imagem base: {campaign.baseImageStatus}</p>
                <p className="mt-2 text-xs text-slate-500">
                  Criado em {new Date(campaign.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
