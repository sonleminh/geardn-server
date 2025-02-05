import { HttpStatus } from '@nestjs/common';
import { ValidatorOptions } from '@nestjs/common/interfaces/external/validator-options.interface';

export const ValidationConfig:
  | ValidatorOptions
  | Record<string, string | number | boolean> = {
  whitelist: true,
  errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
  forbidNonWhitelisted: true,
  dismissDefaultMessages: false,
  skipMissingProperties: false,
  transform: true,
};
