export class CreateTransferDto {
  constructor(
    public readonly transfer_from: string,
    public readonly transfer_to: string,
    public readonly transfer_amount: number,
  ) {}
}
