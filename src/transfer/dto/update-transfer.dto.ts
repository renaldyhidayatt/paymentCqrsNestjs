export class UpdateTransferDto {
  constructor(
    public readonly transferId: number,
    public readonly transfer_from: number,
    public readonly transfer_to: number,
    public readonly transfer_amount: number,
  ) {}
}
