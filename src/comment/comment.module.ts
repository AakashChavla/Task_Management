import { Module } from "@nestjs/common";
import { CommentService } from "./comment.service";
import { CommentController } from "./comment.controller";
import { ResponseService } from "src/common/services/response.service";
import { AuthModule } from "src/auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [CommentController],
  providers: [CommentService, ResponseService],
})
export class CommentModule {}