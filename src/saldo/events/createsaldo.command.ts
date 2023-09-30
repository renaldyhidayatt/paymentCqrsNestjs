// create-saldo.command.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateSaldoDto } from '../dto/create-saldo';
import { SaldoService } from '../saldo.service';

@CommandHandler(CreateSaldoDto)
export class CreateSaldoCommand implements ICommandHandler<CreateSaldoDto> {
  constructor(private readonly saldoService: SaldoService) {}

  async execute(dto: CreateSaldoDto): Promise<void> {
    await this.saldoService.createSaldo(dto.user_id, dto.total_balance);
  }
}
