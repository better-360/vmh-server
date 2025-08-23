import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { RoleType } from "@prisma/client";

interface Handler{
    id:string;
    name:string;
    lastName:string;
    email:string;
    telephone:string;
}

@Injectable()
export class HandlerService {
  constructor(private prisma: PrismaService) {}

async createNewHandler(handler:Handler){
    // This method is deprecated and disabled
    throw new Error('Handler creation is deprecated. Use admin user creation instead.');
}
}