import { Controller, Post, UseInterceptors, UploadedFile, Get, Query, Param, Delete, Res, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { ImagesService } from './images.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { FileValidationPipe } from '../common/pipes/file-validation.pipe';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { User } from 'src/users/interfaces/user.interface';
import { Response } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @CurrentUser() user: User,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @UploadedFile(new FileValidationPipe()) file: any,
  ) {
    if (!user || !user.userId) {
      throw new HttpException('User not authenticated.', HttpStatus.FORBIDDEN);
    }

    return this.imagesService.uploadFile(user.userId, file);
  }

  @Get()
  async listImages(
    @CurrentUser() user: User,
    @Query('name') name?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    if (!user || !user.userId) {
      throw new HttpException('User not authenticated.', HttpStatus.FORBIDDEN);
    }

    return this.imagesService.listImages(user.userId, name, page, limit);
  }

  @Delete(':name')
  async deleteImage(
    @CurrentUser() user: User,
    @Param('name') name: string,
  ) {
    if (!user || !user.userId) {
      throw new HttpException('User not authenticated.', HttpStatus.FORBIDDEN);
    }

    return this.imagesService.deleteImage(user.userId, name);
  }

  @Get('export')
  async exportImages(
    @CurrentUser() user: User,
    @Res() res: Response,
  ) {
    if (!user || !user.userId) {
      throw new HttpException('User not authenticated.', HttpStatus.FORBIDDEN);
    }

    const csvStream = await this.imagesService.exportImagesToCsv(user.userId);

    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename="images.csv"');
    res.send(csvStream);
  }
}