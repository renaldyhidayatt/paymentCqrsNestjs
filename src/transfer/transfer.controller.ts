import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { DeleteTransferDto } from './dto/delete-transfer.dto';
import { GetTranserResultDto } from './dto/get-transfer.dto';
import { GetsTransferDataDto } from './dto/gets-transfer.dto';

@Controller('transfer')
export class TransferController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async createTransfer(@Body() createTransferDto: CreateTransferDto) {
    try {
      const result = await this.commandBus.execute(
        new CreateTransferDto(
          createTransferDto.transfer_from,
          createTransferDto.transfer_to,
          createTransferDto.transfer_amount,
        ),
      );
      return {
        message: 'Transfer created successfully',
        result,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to create transfer',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':transferId')
  async deleteTransfer(@Param('transferId') transferId: number) {
    try {
      const deleteTransferDto: DeleteTransferDto = { transferId };
      await this.commandBus.execute(
        new DeleteTransferDto(deleteTransferDto.transferId),
      );
      return {
        message: 'Transfer deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        'Failed to delete transfer',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':userId')
  async getTransferResult(@Param('userId') userId: number): Promise<any> {
    try {
      const query = new GetTranserResultDto(userId);
      return await this.queryBus.execute<GetTranserResultDto>(
        new GetTranserResultDto(query.userId),
      );
    } catch (error) {
      throw new HttpException(
        'Failed to get transfer result',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async getTransferResults(): Promise<any> {
    try {
      const query = new GetsTransferDataDto();
      return await this.queryBus.execute<GetsTransferDataDto>(query);
    } catch (error) {
      throw new HttpException(
        'Failed to transfer data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
