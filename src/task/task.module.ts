import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { AuthModule } from 'src/auth/auth.module';
import { ResponseService } from 'src/common/services/response.service';

@Module({
  imports:[
    AuthModule
  ],
  controllers: [TaskController],
  providers: [TaskService, ResponseService],
})
export class TaskModule {}
