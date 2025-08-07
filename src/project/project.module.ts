import { Module } from "@nestjs/common";
import { ProjectService } from "./project.service";
import { ProjectController } from "./project.controller";
import { AuthModule } from "src/auth/auth.module";
import { ResponseService } from "src/common/services/response.service";

@Module({
  imports: [AuthModule],
  controllers: [ProjectController],
  providers: [ProjectService, ResponseService],
  exports: [ProjectService],
})
export class ProjectModule {}
