import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ResponseService } from 'src/common/services/response.service';

@Module({
  controllers: [UserController],
  providers: [UserService, ResponseService],
  exports: [UserService]
})
export class UserModule {}
