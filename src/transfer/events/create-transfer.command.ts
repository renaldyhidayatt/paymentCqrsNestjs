import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransferService } from '../transfer.service';
import { CreateTransferDto } from '../dto/create-transfer.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

@CommandHandler(CreateTransferDto)
export class CreateTransferCommand
  implements ICommandHandler<CreateTransferDto>
{
  constructor(private readonly transferService: TransferService) {}

  async execute(command: CreateTransferDto): Promise<any> {
    try {
      return await this.transferService.createTransfer(
        command.transfer_from,
        command.transfer_to,
        command.transfer_amount,
      );
    } catch (error) {
      throw new HttpException(
        'Failed to create topup',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
