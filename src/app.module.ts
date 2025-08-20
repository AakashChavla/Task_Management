import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { UserModule } from "./user/user.module";
import { DatabaseModule } from "./database/database.module";
import { MailModule } from "./common/mail/mail.module";
import { AuthModule } from "./auth/auth.module";
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/guards/auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from "./auth/auth.service";
import { CommonModule } from "./common/common.module";
import { ProjectModule } from './project/project.module';
import { TaskModule } from './task/task.module';
import { SprintModule } from './sprint/sprint.module';
import { LabelModule } from './label/label.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserModule,
    DatabaseModule,
    MailModule,
    AuthModule,
    CommonModule,
    ProjectModule,
    TaskModule,
    SprintModule,
    LabelModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
  ],
})
export class AppModule {}
