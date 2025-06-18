import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()  // makes PrismaService available everywhere without needing to import PrismaModule in each module
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
