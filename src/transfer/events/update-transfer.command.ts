import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { UpdateTransferDto } from '../dto/update-transfer.dto';
import { TransferService } from '../transfer.service';

@CommandHandler(UpdateTransferDto)
export class UpdateTransferCommand
  implements ICommandHandler<UpdateTransferDto>
{
  constructor(private readonly transferService: TransferService) {}

  async execute(dto: UpdateTransferDto): Promise<void> {
    const { transferId, transfer_from, transfer_to, transfer_amount } = dto;
    await this.transferService.updateTransfer(
      transferId,
      transfer_from,
      transfer_to,
      transfer_amount,
    );
  }
}
