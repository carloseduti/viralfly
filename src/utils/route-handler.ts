import { ZodError } from 'zod';

import { errorResponse } from '@/utils/api-response';
import { AppError } from '@/utils/errors';

export async function withRouteErrorHandling(handler: () => Promise<Response>) {
  try {
    return await handler();
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode, error.details);
    }

    if (error instanceof ZodError) {
      return errorResponse('Payload inválido', 422, error.flatten());
    }

    console.error(error);
    return errorResponse('Erro interno no servidor', 500);
  }
}
