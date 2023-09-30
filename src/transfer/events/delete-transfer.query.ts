import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransferService } from '../transfer.service';
import { DeleteTransferDto } from '../dto/delete-transfer.dto';

@CommandHandler(DeleteTransferDto)
export class DeleteTransferQuery implements ICommandHandler<DeleteTransferDto> {
  constructor(private readonly transferService: TransferService) {}

  async execute(dto: DeleteTransferDto): Promise<void> {
    await this.transferService.deleteTransfer(dto.transferId);
  }
}
