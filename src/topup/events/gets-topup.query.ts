import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTopupDataDto } from '../dto/gets-topup.dto';
import { IFindNewTopup } from '../interface/IFindTopup';
import { TopupService } from '../topup.service';

@QueryHandler(GetTopupDataDto)
export class GetsTopupDataComment
  implements IQueryHandler<GetTopupDataDto, IFindNewTopup[]>
{
  constructor(private readonly topupService: TopupService) {}

  async execute(event: GetTopupDataDto): Promise<IFindNewTopup[]> {
    return this.topupService.getTopupData();
  }
}
