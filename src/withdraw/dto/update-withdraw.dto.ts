export class UpdateWithdrawDto {
  constructor(
    public readonly withdrawId: number,
    public readonly userId: number,
    public readonly withdraw_amount: number,
  ) {}
}
