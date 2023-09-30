export class CreateWithdrawDto {
  constructor(
    public readonly userId: number,
    public readonly withdraw_amount: number,
  ) {}
}
