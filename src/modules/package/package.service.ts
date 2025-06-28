import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class PackageService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}    
    

    async getPackageById(id: string) {
        return this.prisma.package.findUnique({
            where: { id },
        });
    }
}