import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetWithdrawResultsDto } from '../dto/gets-withdraw.dto';
import { WithdrawService } from '../withdraw.service';

@QueryHandler(GetWithdrawResultsDto)
export class GetsWithdrawResultsComment
  implements IQueryHandler<GetWithdrawResultsDto>
{
  constructor(private readonly withdrawService: WithdrawService) {}

  async execute(event: GetWithdrawResultsDto): Promise<any> {
    return this.withdrawService.getWithdrawResults();
  }
}
