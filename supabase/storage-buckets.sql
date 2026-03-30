-- Buckets sugeridos para o MVP ViralFly
insert into storage.buckets (id, name, public)
values
  ('product-images', 'product-images', true),
  ('campaigns-assets', 'campaigns-assets', true),
  ('generated-frames', 'generated-frames', true),
  ('generated-videos', 'generated-videos', true),
  ('thumbnails', 'thumbnails', true)
on conflict (id) do nothing;
