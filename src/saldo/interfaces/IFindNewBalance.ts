type FindNewBalance = {
  readonly user_id: number;
  readonly email: string;
  readonly kode_transfer: number;
  readonly jumlah_uang: string;
};

export interface IFindNewBalance {
  readonly saldo_history: FindNewBalance;
}
