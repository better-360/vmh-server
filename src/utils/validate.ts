import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { validate as uuidValidate } from 'uuid';

export async function validateAndTransform<T extends object>(
  dto: new () => T,
  object: any,
): Promise<T> {
  const dtoInstance = plainToInstance(dto, object);
  const errors = await validate(dtoInstance);
  if (errors.length > 0) {
    throw new Error('Validation failed');
  }
  return dtoInstance;
}


export function isValidUUID(uuid: string): boolean {
  return uuidValidate(uuid);
}