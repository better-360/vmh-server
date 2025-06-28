import {
  Controller,
  Body,
  Post,
  Request,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  Delete,
  Get,
  HttpCode,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ChangeEmailDto,
  ChangePasswordDto,
  UpdateUserDto,
} from 'src/dtos/user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileManagerService } from '../file-manager/file-manager.service';
import { validateAndTransform } from '../../utils/validate';
import { MailService } from '../mail/mail.service';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('User Management')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly fileManagerService: FileManagerService,
  ) {}

  @ApiOperation({
    summary: 'Mevcut oturum açmış kullanıcının bilgilerini getirir',
  })
  @Post('me')
  getMe(@Request() req) {
    return req.user;
  }

  @ApiOperation({ summary: 'Kullanıcı bilgilerini günceller' })
  @Post('update-me')
  @HttpCode(HttpStatus.OK)
  async updateUser(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    const userId = req.user.id;
    const dtoInstance = await validateAndTransform(
      UpdateUserDto,
      updateUserDto,
    );
  await this.userService.updateUser(userId, dtoInstance);
    return {
      message: 'User updated successfully',
    };
  }

  @ApiOperation({ summary: 'Mevcut oturum açmış kullanıcıyı siler' })
  @Delete('delete-me')
  async deleteUser(@Request() req) {
    await this.userService.deleteUser(req.user.id);
    return {
      code: HttpStatus.OK,
      message: 'User deleted',
    };
  }

  @ApiOperation({ summary: 'Kullanıcı e-posta adresini günceller' })
  @Post('update-email')
  async updateEmail(@Request() req, @Body() data: ChangeEmailDto) {
    const dtoInstance = await validateAndTransform(ChangeEmailDto, data);
    const updatedUser = await this.userService.changeUserEmail(
      req.user.id,
      dtoInstance,
    );

    return {
      code: HttpStatus.OK,
      message: 'Email updated',
      user: updatedUser,
    };
  }

}
