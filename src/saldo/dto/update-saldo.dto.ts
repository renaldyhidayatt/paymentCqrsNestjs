import { IsInt, Min, IsPositive } from 'class-validator';

export class UpdateSaldoDto {
  @IsInt({ message: 'saldoId must be an integer' })
  public readonly saldoId: number;

  @IsInt({ message: 'userId must be an integer' })
  public readonly userId: number;

  @IsPositive({ message: 'totalBalance must be a positive number' })
  @Min(49000, { message: 'totalBalance must be at least 49000' })
  public readonly totalBalance: number;

  constructor(saldoId: number, userId: number, totalBalance: number) {
    this.saldoId = saldoId;
    this.userId = userId;
    this.totalBalance = totalBalance;
  }
}
