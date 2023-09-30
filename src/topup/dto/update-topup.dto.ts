export class TopupUpdatedDto {
  constructor(
    public readonly topupId: number,
    public readonly userId: number,
    public readonly topupNo: string,
    public readonly topupAmount: number,
    public readonly topupMethod: string,
  ) {}
}
