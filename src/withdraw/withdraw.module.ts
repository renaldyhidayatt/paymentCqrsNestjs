import { Module } from '@nestjs/common';
import { WithdrawController } from './withdraw.controller';
import { WithdrawService } from './withdraw.service';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateWithdrawCommand } from './events/create-withdraw.command';
import { DeleteWithdrawQuery } from './events/delete-withdraw.query';
import { GetsWithdrawResultsComment } from './events/gets-withdraw.query';
import { GetWithdrawResultCommmand } from './events/get-withdraw.query';
import { UpdateWithdrawCommand } from './events/update-withdraw.command';

@Module({
  imports: [
    CqrsModule,
    CreateWithdrawCommand,
    DeleteWithdrawQuery,
    GetsWithdrawResultsComment,
    GetWithdrawResultCommmand,
    UpdateWithdrawCommand,
  ],
  controllers: [WithdrawController],
  providers: [WithdrawService],
})
export class WithdrawModule {}
