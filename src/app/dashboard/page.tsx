import Link from 'next/link';

import { StatusBadge } from '@/components/status-badge';
import { prisma } from '@/lib/prisma';
import { requirePageAuthenticatedUser } from '@/server/auth/require-authenticated-user';

export default async function DashboardPage() {
  const user = await requirePageAuthenticatedUser();

  const [campaignCount, scriptCount, frameCount, videoCount, publicationCount, latestCampaigns] = await Promise.all([
    prisma.campaign.count({ where: { userId: user.id } }),
    prisma.videoScript.count({ where: { campaign: { userId: user.id } } }),
    prisma.scriptFrame.count({ where: { script: { campaign: { userId: user.id } } } }),
    prisma.generatedVideo.count({ where: { script: { campaign: { userId: user.id } } } }),
    prisma.tikTokPublication.count({ where: { generatedVideo: { script: { campaign: { userId: user.id } } } } }),
    prisma.campaign.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    })
  ]);

  return (
    <div className="space-y-5">
      <section className="card bg-[linear-gradient(130deg,#dcf6f8,#fdf6ec)]">
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="badge-soft">Painel de operacao</p>
            <h1 className="mt-2 text-3xl font-semibold">Gere anuncios dinamicos com base na imagem do produto</h1>
            <p className="mt-2 text-sm text-slate-700">
              {
                'Pipeline: imagem do produto -> imagem base Nano Banana -> roteiro mestre -> 3 frames Veo -> montagem -> publicacao.'
              }
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/campaigns/new" className="btn">
                Cadastrar novo produto
              </Link>
              <Link href="/campaigns" className="btn-secondary">
                Ver todos os produtos
              </Link>
            </div>
          </div>
          <div className="card-soft space-y-2 text-sm text-slate-700">
            <p className="font-semibold text-slate-800">Ordem obrigatoria</p>
            <p>1. Upload da imagem do produto</p>
            <p>2. Gerar imagem base publicitaria</p>
            <p>3. Gerar roteiro mestre</p>
            <p>4. Gerar frames consistentes</p>
            <p>5. Montar video</p>
            <p>6. Publicar</p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Metric title="Produtos" value={campaignCount} />
        <Metric title="Roteiros" value={scriptCount} />
        <Metric title="Frames" value={frameCount} />
        <Metric title="Videos" value={videoCount} />
        <Metric title="Publicacoes" value={publicationCount} />
      </section>

      <section className="card space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Produtos recentes</h2>
          <Link href="/campaigns" className="text-sm font-semibold text-cyan-700">
            Ver lista completa
          </Link>
        </div>
        {latestCampaigns.length === 0 ? (
          <div className="card-soft text-sm text-slate-600">Nenhum produto criado ainda.</div>
        ) : (
          <div className="grid gap-2 md:grid-cols-2">
            {latestCampaigns.map((campaign) => (
              <Link key={campaign.id} href={`/campaigns/${campaign.id}`} className="pipeline-item">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="truncate font-medium">{campaign.nomeProduto}</span>
                  <span className="badge-soft">{campaign.tipoProduto}</span>
                </div>
                <StatusBadge status={campaign.status} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Metric({ title, value }: { title: string; value: number }) {
  return (
    <div className="card">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="metric-value mt-1">{value}</p>
    </div>
  );
}


