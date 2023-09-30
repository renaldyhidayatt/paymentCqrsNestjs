export class CreateTopupDto {
  constructor(
    public readonly userId: number,
    public readonly topupAmount: number,
    public readonly topupMethod: string,
  ) {}
}
