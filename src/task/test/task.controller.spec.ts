import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from '../task.controller';
import { TaskService } from '../task.service';
import { DatabaseService } from '../../database/database.service';
import { ResponseService } from '../../common/services/response.service';
import { AuthGuard } from '../../auth/guards/auth.guard'; // Adjust path if needed

describe('TaskController', () => {
  let controller: TaskController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        TaskService,
        { provide: DatabaseService, useValue: {} },
        { provide: ResponseService, useValue: { sendSuccess: jest.fn(), sendError: jest.fn() } },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TaskController>(TaskController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});