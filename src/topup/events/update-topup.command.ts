import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { TopupUpdatedDto } from '../dto/update-topup.dto';
import { TopupService } from '../topup.service';

@CommandHandler(TopupUpdatedDto)
export class UpdateTopupCommand implements ICommandHandler<TopupUpdatedDto> {
  constructor(private readonly topupService: TopupService) {}

  async execute(dto: TopupUpdatedDto): Promise<void> {
    const { topupId, userId, topupNo, topupAmount, topupMethod } = dto;
    await this.topupService.updateTopup(
      topupId,
      userId,
      topupNo,
      topupAmount,
      topupMethod,
    );
  }
}
