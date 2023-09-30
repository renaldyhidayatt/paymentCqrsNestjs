import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTopupResultDto } from '../dto/get-topup.dto';
import { IFindNewTopup } from '../interface/IFindTopup';
import { TopupService } from '../topup.service';

@QueryHandler(GetTopupResultDto)
export class GetTopupResultComment
  implements IQueryHandler<GetTopupResultDto, IFindNewTopup | null>
{
  constructor(private readonly topupService: TopupService) {}

  async execute(event: GetTopupResultDto): Promise<IFindNewTopup | null> {
    return this.topupService.getTopupResult(event.userId);
  }
}
