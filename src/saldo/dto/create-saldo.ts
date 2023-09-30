import { IsNumber, Min } from 'class-validator';

export class CreateSaldoDto {
  @IsNumber()
  @Min(49001, { message: 'Minimum saldo is Rp 50,000' })
  total_balance: number;

  @IsNumber()
  user_id: number;

  constructor(total_balance: number, user_id: number) {
    this.total_balance = total_balance;
    this.user_id = user_id;
  }
}
