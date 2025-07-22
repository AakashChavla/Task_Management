import { Module, Global } from '@nestjs/common';
import { ResponseService } from './services/response.service';
import { HelperService } from './helper/otp';

@Global()
@Module({
  providers: [ResponseService, HelperService],
  exports: [ResponseService, HelperService],
})
export class CommonModule {}
