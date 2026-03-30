import { describe, expect, it } from 'vitest';

import { isLoginPath, isPrivatePath } from '@/server/auth/route-access';

describe('route access guard', () => {
  it('deve proteger rotas privadas', () => {
    expect(isPrivatePath('/dashboard')).toBe(true);
    expect(isPrivatePath('/api/campaigns')).toBe(true);
    expect(isPrivatePath('/api/publications/123')).toBe(true);
  });

  it('não deve proteger rotas públicas', () => {
    expect(isPrivatePath('/login')).toBe(false);
    expect(isPrivatePath('/')).toBe(false);
  });

  it('deve identificar rota de login', () => {
    expect(isLoginPath('/login')).toBe(true);
    expect(isLoginPath('/dashboard')).toBe(false);
  });
});
