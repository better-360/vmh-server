import { BadRequestException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PrismaService } from 'src/prisma.service';
import { validate as uuidValidate } from 'uuid';

export async function validateAndTransform<T extends object>(
  dto: new () => T,
  object: any,
): Promise<T> {
  const dtoInstance = plainToInstance(dto, object);
  const errors = await validate(dtoInstance);
  if (errors.length > 0) {
    throw new Error('Validation failed');
  }
  return dtoInstance;
}


export function isValidUUID(uuid: string): boolean {
  return uuidValidate(uuid);
}

export async function isMemberOfWorkspace(userId:string,workspaceId:string,prisma:PrismaService){
  const user= await prisma.user.findUnique({
    where: { id: userId },
    include: {
      workspaces: true,
    },
  });
  if(!user){
    throw new BadRequestException(`User with ID ${userId} not found`);
  }
  return user.workspaces.some(workspace=>workspace.id===workspaceId);
}

export async function isMemberOfMailbox(userId:string,mailboxId:string,prisma:PrismaService){
  const user= await prisma.user.findUnique({
    where: { id: userId },
    include: {
      workspaces: {
        include: {
          workspace: {
            include: {
              mailboxes: true,
            },
          },
        },
      },
    },
  });
  if(!user){
    throw new BadRequestException(`User with ID ${userId} not found`);
  }
  return user.workspaces.some(workspace=>workspace.workspace.mailboxes.some(mailbox=>mailbox.id===mailboxId));
} 