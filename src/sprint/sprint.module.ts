import { Module } from "@nestjs/common";
import { SprintService } from "./sprint.service";
import { SprintController } from "./sprint.controller";
import { ResponseService } from "src/common/services/response.service";
import { AuthModule } from "src/auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [SprintController],
  providers: [SprintService, ResponseService],
})
export class SprintModule {}