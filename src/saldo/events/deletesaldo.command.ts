import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SaldoService } from '../saldo.service';
import { DeleteSaldoDto } from '../dto/delete-saldo';

@CommandHandler(DeleteSaldoDto)
export class DeleteSaldoCommand implements ICommandHandler<DeleteSaldoDto> {
  constructor(private readonly saldoService: SaldoService) {}

  async execute(dto: DeleteSaldoDto): Promise<void> {
    await this.saldoService.deleteSaldo(dto.userId);
  }
}
