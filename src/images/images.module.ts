import { Module } from '@nestjs/common';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';
import { ProvidersModule } from '../providers.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    ProvidersModule, 
    UsersModule,
  ],
  controllers: [ImagesController],
  providers: [ImagesService],
})
export class ImagesModule {}