import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetsTransferDataDto } from '../dto/gets-transfer.dto';
import { TransferService } from '../transfer.service';

@QueryHandler(GetsTransferDataDto)
export class GetsTransferQuery implements IQueryHandler<GetsTransferDataDto> {
  constructor(private readonly transerService: TransferService) {}

  async execute(event: GetsTransferDataDto): Promise<any> {
    return this.transerService.getTransferResults();
  }
}
