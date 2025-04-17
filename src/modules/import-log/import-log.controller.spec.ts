import { Test, TestingModule } from '@nestjs/testing';
import { ImportLogController } from './import-log.controller';
import { ImportLogService } from './import-log.service';

describe('ImportLogController', () => {
  let controller: ImportLogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImportLogController],
      providers: [ImportLogService],
    }).compile();

    controller = module.get<ImportLogController>(ImportLogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
