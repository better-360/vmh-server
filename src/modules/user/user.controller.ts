import {
  Controller,
  Body,
  Post,
  Request,
  HttpStatus,
  Delete,
  Get,
  HttpCode,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ChangeEmailDto,
  SetActiveContextDto,
  UpdateUserDto,
} from 'src/dtos/user.dto';
import { validateAndTransform } from '../../utils/validate';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators';

@ApiBearerAuth()
@ApiTags('User Management')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {}

  @ApiOperation({
    summary: 'Mevcut oturum açmış kullanıcının bilgilerini getirir',
  })
  @Get('me')
  getMe(@Request() req) {
    return req.user;
  }

  @Get('context')
  getContext(@CurrentUser('id') userId: string) {
    return this.userService.getContext(userId);
  }

  @ApiOperation({ summary: 'Kullanıcının aktif contextini günceller' })
  @Put('context')
  async setContext(@CurrentUser('id') userId: string, @Body() data: SetActiveContextDto) {
    const dtoInstance = await validateAndTransform(SetActiveContextDto, data);
    await this.userService.setContext(userId, dtoInstance);
    return {
      code: HttpStatus.OK,
      message: 'Context updated',
    };
  }


  @ApiOperation({ summary: 'Kullanıcı bilgilerini günceller' })
  @Post('update-me')
  @HttpCode(HttpStatus.OK)
  async updateUser(@CurrentUser('id') userId: string, @Body() updateUserDto: UpdateUserDto) {
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
  async deleteUser(@CurrentUser('id') userId: string) {
    await this.userService.deleteUser(userId);
    return {
      code: HttpStatus.OK,
      message: 'User deleted',
    };
  }

  @ApiOperation({ summary: 'Kullanıcı e-posta adresini günceller' })
  @Post('update-email')
    async updateEmail(@CurrentUser('id') userId: string, @Body() data: ChangeEmailDto) {
    const dtoInstance = await validateAndTransform(ChangeEmailDto, data);
    const updatedUser = await this.userService.changeUserEmail(
      userId,
      dtoInstance,
    );

    return {
      code: HttpStatus.OK,
      message: 'Email updated',
      user: updatedUser,
    };
  }

}
