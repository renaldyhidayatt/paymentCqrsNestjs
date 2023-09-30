import { Module } from '@nestjs/common';
import { TopupService } from './topup.service';
import { TopupController } from './topup.controller';
import { CreateTopupCommand } from './events/create-topup.command';
import { DeleteSaldoCommand } from 'src/saldo/events/deletesaldo.command';
import { UpdateTopupCommand } from './events/update-topup.command';
import { GetsTopupDataComment } from './events/gets-topup.query';
import { GetTopupResultComment } from './events/get-topup.query';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Saldo } from 'src/models/saldo';
import { Topup } from 'src/models/topup';
import { User } from 'src/models/user';
import { Transfer } from 'src/models/transfer';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([Saldo, Topup, User, Transfer]),
  ],
  providers: [
    TopupService,
    CreateTopupCommand,
    DeleteSaldoCommand,
    UpdateTopupCommand,
    GetsTopupDataComment,
    GetTopupResultComment,
  ],
  controllers: [TopupController],
})
export class TopupModule {}
