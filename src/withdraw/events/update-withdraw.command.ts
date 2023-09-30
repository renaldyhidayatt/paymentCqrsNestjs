import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { UpdateWithdrawDto } from '../dto/update-withdraw.dto';
import { WithdrawService } from '../withdraw.service';

@CommandHandler(UpdateWithdrawDto)
export class UpdateWithdrawCommand
  implements ICommandHandler<UpdateWithdrawDto>
{
  constructor(private readonly withdrawService: WithdrawService) {}

  async execute(dto: UpdateWithdrawDto): Promise<void> {
    await this.withdrawService.updateWithdraw(
      dto.withdrawId,
      dto.userId,
      dto.withdraw_amount,
    );
  }
}
