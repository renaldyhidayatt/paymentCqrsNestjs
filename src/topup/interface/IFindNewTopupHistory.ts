export interface IFindNewTopupHistory {
  readonly topup_id: number;
  readonly kode_topup: string;
  readonly nominal_topup: string | number;
  readonly metode_pembayaran: string;
  readonly tanggal_topup: any;
}
