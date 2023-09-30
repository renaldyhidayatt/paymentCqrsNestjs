import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { UpdateSaldoDto } from '../dto/update-saldo.dto';
import { SaldoService } from '../saldo.service';

@CommandHandler(UpdateSaldoDto)
export class UpdateSaldoCommand implements ICommandHandler<UpdateSaldoDto> {
  constructor(private readonly saldoService: SaldoService) {}

  async execute(dto: UpdateSaldoDto): Promise<void> {
    const { saldoId, userId, totalBalance } = dto;
    await this.saldoService.updateSaldo(saldoId, userId, totalBalance);
  }
}
