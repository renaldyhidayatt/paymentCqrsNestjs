import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TopupService } from '../topup.service';
import { CreateTopupDto } from '../dto/create-topup.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

@CommandHandler(CreateTopupDto)
export class CreateTopupCommand implements ICommandHandler<CreateTopupDto> {
  constructor(private readonly topupService: TopupService) {}

  async execute(command: CreateTopupDto): Promise<any> {
    try {
      return await this.topupService.createTopup(
        command.userId,
        command.topupAmount,
        command.topupMethod,
      );
    } catch (error) {
      throw new HttpException(
        'Failed to create topup',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
