import { MailerModule, MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/users/user.entity';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  public async sendUserWelcome(user: User): Promise<void> {
    await this.mailerService.sendMail({
      to: user.email,
      from: `Onboarding Team <support@nestjs-blog.com>`,
      subject: 'Welcome to the NestJS Blog',
      template: './welcome',
      context: {
        appName: 'NestJS Blog',
        name: user.firstName,
        email: user.email,
        loginUrl: 'http://localhost:5000/login',
      },
    });
  }
}
