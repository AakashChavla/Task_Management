import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from '../task.service';
import { DatabaseService } from '../../database/database.service';
import { ResponseService } from '../../common/services/response.service';

describe('TaskService', () => {
  let service: TaskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        { provide: DatabaseService, useValue: {} },
        { provide: ResponseService, useValue: { sendSuccess: jest.fn(), sendError: jest.fn() } },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});