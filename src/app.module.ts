import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { CommonModule } from './common/common.module';
import { MailModule } from './common/mail/mail.module';

@Module({
  imports: [
    DatabaseModule,
    UserModule,
    CommonModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
