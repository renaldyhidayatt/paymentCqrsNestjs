import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateSaldoDto } from './dto/create-saldo';
import { DeleteSaldoDto } from './dto/delete-saldo';
import { GetResultSaldoDto } from './dto/get-result-saldo';
import { GetResultsSaldoDto } from './dto/get-results-saldo.dto';
import { UpdateSaldoDto } from './dto/update-saldo.dto';

@Controller('saldo')
export class SaldoController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async createSaldo(@Body() createSaldoDto: CreateSaldoDto): Promise<void> {
    await this.commandBus.execute(createSaldoDto);
  }

  @Delete(':userId')
  async deleteSaldo(@Param('userId') userId: number): Promise<void> {
    await this.commandBus.execute(new DeleteSaldoDto(userId));
  }

  @Get(':userId')
  async resultSaldo(@Param('userId') userId: number): Promise<void> {
    await this.queryBus.execute(new GetResultSaldoDto(userId));
  }

  @Get()
  async getResultsSaldo(): Promise<any> {
    return this.queryBus.execute(new GetResultsSaldoDto());
  }

  @Put(':saldoId/update')
  async updateSaldo(
    @Param('saldoId') saldoId: number,
    @Body() updateSaldoDto: UpdateSaldoDto,
  ): Promise<void> {
    return this.commandBus.execute(
      new UpdateSaldoDto(
        saldoId,
        updateSaldoDto.userId,
        updateSaldoDto.totalBalance,
      ),
    );
  }
}
