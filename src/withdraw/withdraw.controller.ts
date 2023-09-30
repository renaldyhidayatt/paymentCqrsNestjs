import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateWithdrawDto } from './dto/create-withdraw.dto';
import { DeleteWitdhdrawDto } from './dto/delete-withdraw.dto';
import { GetWithdrawResultsDto } from './dto/gets-withdraw.dto';
import { GetWithdrawResultDto } from './dto/get-withdraw.dto';
import { UpdateWithdrawDto } from './dto/update-withdraw.dto';

@Controller('withdraw')
export class WithdrawController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async createWithdraw(@Body() createWithdrawDto: CreateWithdrawDto) {
    try {
      const result = await this.commandBus.execute(
        new CreateWithdrawDto(
          createWithdrawDto.userId,
          createWithdrawDto.withdraw_amount,
        ),
      );
      return {
        message: 'withdraw created successfully',
        result,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to create withdraw',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async deleteWithdraw(@Param('id') withdrawId: number) {
    try {
      const deleteWithdrawDto: DeleteWitdhdrawDto = { withdrawId: withdrawId };
      await this.commandBus.execute(
        new DeleteWitdhdrawDto(deleteWithdrawDto.withdrawId),
      );
      return {
        message: 'Withdraw deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        'Failed to delete Withdraw',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':userId')
  async getWithdrawResult(@Param('userId') userId: number): Promise<any> {
    try {
      const query = new GetWithdrawResultDto(userId);
      return await this.queryBus.execute<GetWithdrawResultDto>(
        new GetWithdrawResultDto(query.userId),
      );
    } catch (error) {
      throw new HttpException(
        'Failed to get withdeaw result',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async getWithdrawData(): Promise<any> {
    try {
      const query = new GetWithdrawResultsDto();
      return await this.queryBus.execute<GetWithdrawResultsDto>(
        new GetWithdrawResultsDto(),
      );
    } catch (error) {
      throw new HttpException(
        'Failed to get withdraw data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async updateTopup(
    @Param('id') withdrawId: number,
    @Body() updateWithdrawDto: UpdateWithdrawDto,
  ): Promise<void> {
    try {
      const command = new UpdateWithdrawDto(
        withdrawId,
        updateWithdrawDto.userId,
        updateWithdrawDto.withdraw_amount,
      );
      await this.commandBus.execute(command);
    } catch (error) {
      throw new HttpException(
        'Failed to update withdraw',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
