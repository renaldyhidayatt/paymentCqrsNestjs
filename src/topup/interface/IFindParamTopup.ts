type FindTopup = {
  readonly user_id: number;
  readonly nominal_topup: string | number;
  readonly metode_pembayaran: string;
  readonly tanggal_topup: any;
};

export interface IFindTopup {
  readonly topup_id: number;
  readonly user_id: number;
  readonly email: string;
  readonly noc_transfer: number;
  readonly total_topup_amount: number;
  readonly total_topup: FindTopup;
}

export interface IFindParamsTopup {
  readonly user_id: number;
  readonly topup_id: number;
  readonly email: string;
  readonly noc_transfer: number;
  readonly total_topup_amount: number;
}
