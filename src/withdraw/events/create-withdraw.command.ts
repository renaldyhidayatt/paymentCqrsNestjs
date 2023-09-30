import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { WithdrawService } from '../withdraw.service';
import { CreateWithdrawDto } from '../dto/create-withdraw.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

@CommandHandler(CreateWithdrawDto)
export class CreateWithdrawCommand
  implements ICommandHandler<CreateWithdrawDto>
{
  constructor(private readonly withdrawService: WithdrawService) {}

  async execute(command: CreateWithdrawDto): Promise<any> {
    try {
      return await this.withdrawService.createWithdraw(
        command.userId,
        command.withdraw_amount,
      );
    } catch (error) {
      throw new HttpException(
        'Failed to create topup',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
