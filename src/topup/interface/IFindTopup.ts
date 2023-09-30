type FindSubTopupAmount = {
  readonly topup_id: number;
  readonly kode_topup: string;
  readonly nominal_topup: string | number;
  readonly metode_pembayaran: string;
  readonly tanggal_topup: any;
};

type FindTopupAmount = {
  readonly user_id: number;
  readonly email: string;
  readonly kode_transfer: number;
  readonly total_nominal_topup: string;
  readonly total_topup: FindSubTopupAmount[];
};

export interface IFindNewTopup {
  readonly topup_history: FindTopupAmount;
}
