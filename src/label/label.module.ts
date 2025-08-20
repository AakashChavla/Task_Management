import { Module } from "@nestjs/common";;
import { ResponseService } from "src/common/services/response.service";
import { AuthModule } from "src/auth/auth.module";
import { LabelController } from "./label.controller";
import { LabelService } from "./label.service";

@Module({
  imports: [AuthModule],
  controllers: [LabelController],
  providers: [LabelService, ResponseService],
})
export class LabelModule {}