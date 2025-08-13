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
  getContext(@Request() req) {
    return this.userService.getContext(req.user.id);
  }

  @ApiOperation({ summary: 'Kullanıcının aktif contextini günceller' })
  @Put('context')
  async setContext(@Request() req, @Body() data: SetActiveContextDto) {
    const dtoInstance = await validateAndTransform(SetActiveContextDto, data);
    await this.userService.setContext(req.user.id, dtoInstance);
    return {
      code: HttpStatus.OK,
      message: 'Context updated',
    };
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
