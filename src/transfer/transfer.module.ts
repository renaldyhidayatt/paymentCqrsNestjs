import { Module } from '@nestjs/common';
import { TransferController } from './transfer.controller';
import { TransferService } from './transfer.service';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transfer } from 'src/models/transfer';
import { User } from 'src/models/user';
import { Saldo } from 'src/models/saldo';
import { CreateTransferCommand } from './events/create-transfer.command';
import { DeleteTransferQuery } from './events/delete-transfer.query';
import { UpdateTransferCommand } from './events/update-transfer.command';
import { GetsTransferQuery } from './events/gets-transfer.query';
import { GetTransferResultQuery } from './events/get-transfer.query';

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([Transfer, User, Saldo])],
  controllers: [TransferController],
  providers: [
    TransferService,
    CreateTransferCommand,
    DeleteTransferQuery,
    UpdateTransferCommand,
    GetsTransferQuery,
    GetTransferResultQuery,
  ],
})
export class TransferModule {}
