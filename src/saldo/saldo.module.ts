import { Module } from '@nestjs/common';
import { SaldoService } from './saldo.service';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateSaldoCommand } from './events/createsaldo.command';
import { DeleteSaldoCommand } from './events/deletesaldo.command';
import { GetResultSaldoQuery } from './events/get-result-saldo.query';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/models/user';
import { Saldo } from 'src/models/saldo';
import { UpdateSaldoCommand } from './events/updatesaldo.command';
import { GetResultsSaldoQuery } from './events/get-results-saldo.query';
import { SaldoController } from './saldo.controller';

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([User, Saldo])],
  providers: [
    SaldoService,
    CreateSaldoCommand,
    DeleteSaldoCommand,
    UpdateSaldoCommand,
    GetResultSaldoQuery,
    GetResultsSaldoQuery,
  ],
  controllers: [SaldoController],
})
export class SaldoModule {}
