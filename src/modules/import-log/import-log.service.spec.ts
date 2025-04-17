import { Test, TestingModule } from '@nestjs/testing';
import { ImportLogService } from './import-log.service';

describe('ImportLogService', () => {
  let service: ImportLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImportLogService],
    }).compile();

    service = module.get<ImportLogService>(ImportLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
