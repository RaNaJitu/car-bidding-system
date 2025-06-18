import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsNumber } from 'class-validator';

export class CreateAuctionDto {
  @ApiProperty({ example: 'CAR123', description: 'Car ID being auctioned' })
  @IsString()
  carId!: string;

  @ApiProperty({ example: '2025-06-19T10:00:00.000Z', description: 'Start time (ISO format)' })
  @IsDateString()
  startTime!: string;

  @ApiProperty({ example: '2025-06-20T10:00:00.000Z', description: 'End time (ISO format)' })
  @IsDateString()
  endTime!: string;

  @ApiProperty({ example: 1000, description: 'Starting bid amount' })
  @IsNumber()
  startingBid!: number;
}
