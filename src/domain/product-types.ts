export const PRODUCT_TYPE_OPTIONS = [
  { value: 'geral', label: 'Geral' },
  { value: 'beleza', label: 'Beleza e cuidados' },
  { value: 'moda', label: 'Moda e estilo' },
  { value: 'saude', label: 'Saude e bem-estar' },
  { value: 'fitness', label: 'Fitness e esporte' },
  { value: 'tecnologia', label: 'Tecnologia' },
  { value: 'casa', label: 'Casa e decoracao' },
  { value: 'alimentos', label: 'Alimentos e bebidas' },
  { value: 'educacao', label: 'Educacao e cursos' },
  { value: 'outro', label: 'Outro' }
] as const;

export const DEFAULT_PRODUCT_TYPE = 'geral';

export type ProductTypeOption = (typeof PRODUCT_TYPE_OPTIONS)[number];
export type ProductTypeValue = ProductTypeOption['value'];

const PRODUCT_TYPE_LABELS = Object.fromEntries(PRODUCT_TYPE_OPTIONS.map((option) => [option.value, option.label])) as Record<
  ProductTypeValue,
  string
>;

export const PRODUCT_TYPE_VALUES = PRODUCT_TYPE_OPTIONS.map((option) => option.value) as [ProductTypeValue, ...ProductTypeValue[]];

export function getProductTypeLabel(value: string | null | undefined) {
  if (!value) {
    return PRODUCT_TYPE_LABELS[DEFAULT_PRODUCT_TYPE];
  }

  return PRODUCT_TYPE_LABELS[value as ProductTypeValue] ?? value;
}

export function isValidProductType(value: string): value is ProductTypeValue {
  return PRODUCT_TYPE_VALUES.includes(value as ProductTypeValue);
}
