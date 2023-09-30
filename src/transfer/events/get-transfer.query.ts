import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTranserResultDto } from '../dto/get-transfer.dto';
import { TransferService } from '../transfer.service';

@QueryHandler(GetTranserResultDto)
export class GetTransferResultQuery
  implements IQueryHandler<GetTranserResultDto>
{
  constructor(private readonly transferService: TransferService) {}

  async execute(event: GetTranserResultDto): Promise<any> {
    return this.transferService.getTransferResult(event.userId);
  }
}
