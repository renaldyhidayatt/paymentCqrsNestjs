import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TopupService } from '../topup.service';
import { DeleteTopupDto } from '../dto/delete-topup.dto';

@CommandHandler(DeleteTopupDto)
export class DeleteTopupQuery implements ICommandHandler<DeleteTopupDto> {
  constructor(private readonly topupService: TopupService) {}

  async execute(dto: DeleteTopupDto): Promise<void> {
    await this.topupService.deleteTopup(dto.topupId);
  }
}
