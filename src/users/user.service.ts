// import { Injectable } from '@nestjs/common';
// import { PrismaService } from '../prisma/prisma.service';

// @Injectable()
// export class UserService {
//   constructor(private readonly prisma: PrismaService) {}

//   async findAll() {
//     return this.prisma.user.findMany();
//   }

//   async findOne(id: number) {
//     return this.prisma.user.findUnique({
//       where: { id },
//     });
//   }

//   async create(data: { userName: string; email: string }) {
//     return this.prisma.user.create({
//       data,
//     });
//   }

//   async update(id: number, data: { userName?: string; email?: string }) {
//     return this.prisma.user.update({
//       where: { id },
//       data,
//     });
//   }

//   async remove(id: number) {
//     return this.prisma.user.delete({
//       where: { id },
//     });
//   }
// }


// user.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers() {
    return this.prisma.user.findMany();
  }
}
