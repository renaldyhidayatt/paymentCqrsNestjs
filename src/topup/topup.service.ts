import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Saldo } from 'src/models/saldo';
import { Topup } from 'src/models/topup';
import { Repository } from 'typeorm';
import { IFindNewTopup } from './interface/IFindTopup';
import { IFindNewTopupHistory } from './interface/IFindNewTopupHistory';
import { rupiahFormatter } from 'src/utils/rupiah';
import { dateFormat } from 'src/utils/dateformat';
import { IFindParamsTopup } from './interface/IFindParamTopup';
import { IFindParamsHistoryTopup } from './interface/IFindTopupHistory';
import { User } from 'src/models/user';
import { Transfer } from 'src/models/transfer';
import { uniqueOrderNumber } from 'src/utils/uniquenumber';

@Injectable()
export class TopupService {
  constructor(
    @InjectRepository(Saldo)
    private readonly saldoRepository: Repository<Saldo>,
    @InjectRepository(Topup)
    private readonly topupRepository: Repository<Topup>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Transfer)
    private readonly transferRepository: Repository<Transfer>,
  ) {}

  async getTopupData(): Promise<IFindNewTopup[]> {
    const findTopupAmount = await this.saldoRepository
      .createQueryBuilder('saldo')
      .leftJoin('saldo.user', 'user')
      .select([
        'user.userId',
        'user.email',
        'user.noc_transfer',
        'SUM(topup.topupAmount) as total_topup_amount',
      ])
      .innerJoin('user.topup', 'topup')
      .groupBy('user.userId, user.email, user.noc_transfer')
      .orderBy('user.userId', 'ASC')
      .getRawMany();

    const findNewTopupAmountUser = await Promise.all(
      findTopupAmount.map(async (val: any) => {
        const findTopupAmountHistory = await this.topupRepository
          .createQueryBuilder('topup')
          .select([
            'topup.topupId',
            'topup.user.userId',
            'topup.topupNo',
            'topup.topupAmount',
            'topup.topupMethod',
            'topup.topupTime',
          ])
          .where('topup.user.userId = :userId', { userId: val.user_id })
          .groupBy(
            'topup.topupId, topup.userId, topup.topupNo, topup.topupAmount, topup.topupMethod, topup.topupTime',
          )
          .orderBy('topup.topup_time', 'DESC')
          .getRawMany();

        const findNewTopupAmountHistoryFormatted = findTopupAmountHistory.map(
          (history: any): IFindNewTopupHistory => ({
            topup_id: history.topup_id,
            kode_topup: history.topup_no,
            nominal_topup: rupiahFormatter(history.topup_amount.toString()),
            metode_pembayaran: history.topup_method,
            tanggal_topup: dateFormat(history.topup_time).format('llll'),
          }),
        );

        return {
          topup_history: {
            user_id: val.user_id,
            email: val.email,
            kode_transfer: val.noc_transfer,
            total_nominal_topup: rupiahFormatter(
              val.total_topup_amount.toString(),
            ),
            total_topup: findNewTopupAmountHistoryFormatted,
          },
        };
      }),
    );

    return findNewTopupAmountUser;
  }

  async getTopupResult(userId: number): Promise<IFindNewTopup | null> {
    const user = await this.userRepository.findOne({
      where: { userId },
      select: ['userId', 'email', 'nocTransfer'],
    });

    if (!user) {
      return null;
    }

    const findTopupAmount = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.topup', 'topup')
      .select([
        'user.userId',
        'user.email',
        'user.nocTransfer',
        'SUM(topup.topupAmount) as totalTopupAmount',
      ])
      .where('user.userId = :id', { id: userId })
      .groupBy('user.userId, user.email, user.nocTransfer')
      .orderBy('user.userId', 'ASC')
      .getRawMany();

    if (findTopupAmount.length < 1) {
      return {
        topup_history: {
          user_id: user.userId,
          email: user.email,
          kode_transfer: user.nocTransfer,
          total_nominal_topup: 'Rp 0',
          total_topup: [],
        },
      };
    }

    const findMergeTopupAmount = await Promise.all(
      findTopupAmount.map(async (val: IFindParamsTopup) => {
        const findTopupAmountHistory = await this.topupRepository
          .createQueryBuilder('topup')
          .select([
            'topup.topupId',
            'topup.user',
            'topup.topupNo',
            'topup.topupAmount',
            'topup.topupMethod',
            'topup.topupTime',
          ])
          .where('topup.user.userId = :userId', { userId: val.user_id })
          .groupBy(
            'topup.topupId, topup.user, topup.topupNo, topup.topupAmount, topup.topupMethod, topup.topupTime',
          )
          .orderBy('topup.topupTime', 'DESC')
          .getRawMany();

        const findNewTopupAmountHistory = findTopupAmountHistory.map(
          (val: IFindParamsHistoryTopup): IFindNewTopupHistory => ({
            topup_id: val.topup_id,
            kode_topup: val.topup_no,
            nominal_topup: rupiahFormatter(val.topup_amount.toString()),
            metode_pembayaran: val.topup_method,
            tanggal_topup: dateFormat(val.topup_time).format('llll'),
          }),
        );

        return findNewTopupAmountHistory;
      }),
    );

    const findNewTopupAmountUser = findTopupAmount.map(
      async (val: IFindParamsTopup) => ({
        topup_history: {
          user_id: val.user_id,
          email: val.email,
          kode_transfer: val.noc_transfer,
          total_nominal_topup: rupiahFormatter(
            val.total_topup_amount.toString(),
          ),
          total_topup: findMergeTopupAmount[0],
        },
      }),
    );

    return findNewTopupAmountUser[0];
  }

  async createTopup(
    user_id: number,
    topup_amount: number,
    topup_method: string,
  ): Promise<any> {
    const findUser = await this.userRepository.findOne({
      where: { userId: user_id },
    });

    if (!findUser) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }

    if (topup_amount <= 49000) {
      throw new HttpException(
        'Payment method is not supported, please try again',
        HttpStatus.FORBIDDEN,
      );
    }

    const saveTopup = this.topupRepository.create({
      user: findUser,
      topupNo: uniqueOrderNumber(),
      topupAmount: topup_amount,
      topupMethod: topup_method,
      topupTime: dateFormat(new Date()),
      createdAt: new Date(),
    });

    const savedTopup = await this.topupRepository.save(saveTopup);

    if (!savedTopup || Object.keys(savedTopup).length < 1) {
      throw new HttpException(
        'Topup balance failed, server is busy',
        HttpStatus.REQUEST_TIMEOUT,
      );
    }

    const checkSaldoUserId = await this.saldoRepository.count({
      where: { user: findUser },
    });

    if (checkSaldoUserId < 1) {
      const newSaldo = this.saldoRepository.create({
        user: findUser,
        totalBalance: topup_amount,
        createdAt: new Date(),
      });
      await this.saldoRepository.save(newSaldo);
    } else {
      const findTransferHistory = await this.transferRepository
        .createQueryBuilder('transfer')
        .select([
          'transfer.transferFrom',
          'SUM(transfer.transferAmount) AS transferAmount',
          'transfer.transferTime',
        ])
        .where('transfer.transferFrom = :userId', {
          userId: findUser.userId,
        })
        .groupBy('transfer.transferFrom, transfer.transferTime')
        .orderBy('transfer.transferTime', 'DESC')
        .limit(1)
        .getRawMany();

      if (findTransferHistory.length < 0) {
        const findBalanceHistory = await this.topupRepository
          .createQueryBuilder('topup')
          .select(
            'topup.user.userId as userId, SUM(topup.topupAmount) as topupAmount',
          )
          .where('topup.user.userId = :userId', {
            userId: findUser.userId,
          })
          .groupBy('topup.user.userId')
          .getRawOne();

        await this.saldoRepository
          .createQueryBuilder()
          .update()
          .set({
            totalBalance: findBalanceHistory.topupAmount,
            updatedAt: new Date(),
          })
          .where('user_id = :userId', { userId: findBalanceHistory.userId })
          .execute();
      } else {
        const findBalanceHistory = await this.topupRepository
          .createQueryBuilder('topup')
          .leftJoinAndSelect('topup.user', 'user')
          .select('user.userId')
          .addSelect('SUM(topup.topupAmount)', 'topupAmount')
          .addSelect('topup.topupTime')
          .where('user.userId = :userId', {
            userId: findUser.userId,
          })
          .groupBy('user.userId, topup.topupTime')
          .orderBy('topup.topupTime', 'DESC')
          .take(1)
          .getOne();

        const findSaldo = await this.saldoRepository
          .createQueryBuilder('saldo')
          .select([
            'saldo.user.userId',
            `SUM(saldo.totalBalance + ${findBalanceHistory.topupAmount}) AS totalBalance`,
          ])
          .where('saldo.user.userId = :userId', {
            userId: findBalanceHistory.user.userId,
          })
          .groupBy('saldo.user.userId')
          .getRawOne();

        await this.saldoRepository
          .createQueryBuilder()
          .update(Saldo)
          .set({
            totalBalance: findSaldo.totalBalance,
            updatedAt: new Date(),
          })
          .where('user_id = :userId', { userId: findSaldo.userId })
          .execute();
      }
    }

    return {
      message: `Topup balance successfully`,
    };
  }

  async updateTopup(
    topupId: number,
    user_id: number,
    topup_no: string,
    topup_amount: number,
    topup_method: string,
  ): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { userId: user_id },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (typeof topup_amount === 'undefined' || topup_amount <= 49000) {
      throw new HttpException(
        'Minimum topup balance is Rp 50,000',
        HttpStatus.FORBIDDEN,
      );
    }

    const topup = await this.topupRepository.findOne({
      where: { topupId: topupId },
    });

    if (!topup) {
      throw new HttpException('Topup not found', HttpStatus.NOT_FOUND);
    }

    topup.user = user;
    topup.topupNo = topup_no;
    topup.topupAmount = topup_amount;
    topup.topupMethod = topup_method;

    try {
      await this.topupRepository.save(topup);
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Update data topup failed, server is busy',
        HttpStatus.REQUEST_TIMEOUT,
      );
    }

    return {
      message: 'Update data topup successfully',
    };
  }

  async deleteTopup(topupId: number): Promise<any> {
    const topup = await this.topupRepository.findOne({
      where: { topupId: topupId },
    });

    if (!topup) {
      throw new HttpException('Topup not found', HttpStatus.NOT_FOUND);
    }

    try {
      await this.topupRepository.delete(topup.topupId);

      return {
        message: 'Delete data topup successfully',
      };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Delete data topup failed, server is busy',
        HttpStatus.REQUEST_TIMEOUT,
      );
    }
  }
}
