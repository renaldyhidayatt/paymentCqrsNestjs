import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetWithdrawResultDto } from '../dto/get-withdraw.dto';
import { WithdrawService } from '../withdraw.service';

@QueryHandler(GetWithdrawResultDto)
export class GetWithdrawResultCommmand
  implements IQueryHandler<GetWithdrawResultDto>
{
  constructor(private readonly withdrawService: WithdrawService) {}

  async execute(event: GetWithdrawResultDto): Promise<any> {
    return this.withdrawService.getWithdrawResult(event.userId);
  }
}
