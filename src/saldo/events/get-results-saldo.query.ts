import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetResultsSaldoDto } from '../dto/get-results-saldo.dto';
import { SaldoService } from '../saldo.service';
import { IFindNewBalance } from '../interfaces/IFindNewBalance';

@QueryHandler(GetResultsSaldoDto)
export class GetResultsSaldoQuery
  implements IQueryHandler<GetResultsSaldoDto, IFindNewBalance[]>
{
  constructor(private readonly saldoService: SaldoService) {}

  async execute(dto: GetResultsSaldoDto): Promise<IFindNewBalance[]> {
    return this.saldoService.getResultsSaldo();
  }
}
