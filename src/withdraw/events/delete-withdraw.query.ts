import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { WithdrawService } from '../withdraw.service';
import { DeleteWitdhdrawDto } from '../dto/delete-withdraw.dto';

@CommandHandler(DeleteWitdhdrawDto)
export class DeleteWithdrawQuery
  implements ICommandHandler<DeleteWitdhdrawDto>
{
  constructor(private readonly withdrawService: WithdrawService) {}

  async execute(dto: DeleteWitdhdrawDto): Promise<void> {
    await this.withdrawService.deleteWithdraw(dto.withdrawId);
  }
}
