import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { DatabaseModule } from './database/database.module';
import { MailModule } from './common/mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserModule,
    DatabaseModule,
    MailModule,
    
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
