import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetResultSaldoDto } from '../dto/get-result-saldo';
import { SaldoService } from '../saldo.service';
import { IFindNewBalance } from '../interfaces/IFindNewBalance';

@QueryHandler(GetResultSaldoDto)
export class GetResultSaldoQuery
  implements IQueryHandler<GetResultSaldoDto, IFindNewBalance>
{
  constructor(private readonly saldoService: SaldoService) {}

  async execute(dto: GetResultSaldoDto): Promise<IFindNewBalance> {
    return this.saldoService.getResultSaldo(dto.userId);
  }
}
