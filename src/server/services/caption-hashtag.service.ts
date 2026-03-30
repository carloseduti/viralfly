export class CaptionHashtagService {
  buildCaptionAndHashtags(input: { titulo: string; falaCTA: string; hashtagsBase: string[] }) {
    const hashtags = Array.from(new Set([...input.hashtagsBase, '#compras', '#oferta']));
    const legenda = `${input.titulo}. ${input.falaCTA}`;

    return {
      legenda,
      hashtags
    };
  }
}
