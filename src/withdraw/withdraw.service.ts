import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Saldo } from 'src/models/saldo';
import { User } from 'src/models/user';
import { Withdraw } from 'src/models/withdraw';
import { dateFormat } from 'src/utils/dateformat';
import { rupiahFormatter } from 'src/utils/rupiah';
import { Repository } from 'typeorm';

@Injectable()
export class WithdrawService {
  constructor(
    @InjectRepository(Withdraw)
    private readonly withdrawRepository: Repository<Withdraw>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Saldo)
    private readonly saldoRepository: Repository<Saldo>,
  ) {}

  async getWithdrawResults(): Promise<any> {
    const findWithdrawAmount = await this.withdrawRepository
      .createQueryBuilder('withdraw')
      .leftJoinAndSelect('withdraw.user', 'user')
      .select([
        'user.userId',
        'user.email',
        'user.nocTransfer',
        'SUM(withdraw.withdrawAmount) as totalWithdrawAmount',
      ])
      .groupBy('user.userId, user.email, user.nocTransfer')
      .orderBy('user.userId', 'ASC')
      .getRawMany();

    if (findWithdrawAmount.length < 1) {
      return {
        status: 200,
        message: 'data is not exist',
      };
    }

    const withdrawAmount = await Promise.all(
      findWithdrawAmount.map(async (val: any) => {
        const findSaldoTo = await this.withdrawRepository
          .createQueryBuilder('withdraw')
          .innerJoin('withdraw.user', 'user')
          .select([
            'user.userId',
            'user.email',
            'user.nocTransfer',
            'withdraw.withdrawId',
            'withdraw.withdrawAmount',
            'withdraw.withdrawTime',
          ])
          .where('user.userId = :userId', { userId: val.user_id })
          .groupBy(
            'user.userId, user.email, user.nocTransfer, withdraw.withdrawId, withdraw.withdrawAmount, withdraw.withdrawTime',
          )
          .orderBy('withdraw.withdrawTime', 'DESC')
          .getMany();

        const newFindWithdrawAmountHistory = findSaldoTo.map((val: any) => ({
          transfer_id: val.withdrawId,
          email: val.email,
          kode_transfer: val.noc_transfer,
          nominal_withdraw: rupiahFormatter(val.withdrawAmount.toString()),
          tanggal_withdraw: dateFormat(val.withdrawTime).format('llll'),
        }));

        return {
          withdraw_history: {
            user_id: val.userId,
            email: val.email,
            kode_transfer: val.nocTransfer,
            total_nominal_withdraw: rupiahFormatter(
              val.totalWithdrawAmount.toString(),
            ),
            total_withdraw: newFindWithdrawAmountHistory,
          },
        };
      }),
    );

    return {
      status: 200,
      message: 'data already to use',
      data: withdrawAmount,
    };
  }

  async getWithdrawResult(userId: number): Promise<any> {
    const findWithdrawAmount = await this.withdrawRepository
      .createQueryBuilder('withdraw')
      .leftJoin('withdraw.user', 'user')
      .select([
        'user.userId',
        'user.email',
        'user.noc_transfer',
        'SUM(withdraw.withdraw_amount) AS total_withdraw_amount',
      ])
      .where('user.userId = :id', { id: userId })
      .groupBy('user.userId, user.email, user.noc_transfer')
      .orderBy('user.userId', 'ASC')
      .getRawMany();

    const checkUserId = await this.userRepository
      .createQueryBuilder('user')
      .select('user.email')
      .where('user.userId = :id', { id: userId })
      .getOne();

    if (findWithdrawAmount.length < 1 && checkUserId == null) {
      throw new NotFoundException(
        `${checkUserId.email} you never withdraw money`,
      );
    }

    const findWithdrawAmountHistory = await Promise.all(
      findWithdrawAmount.map(async (val: any) => {
        const findSaldoTo = await this.withdrawRepository
          .createQueryBuilder('withdraw')
          .innerJoin('withdraw.user', 'user')
          .select([
            'user.userId',
            'user.email',
            'user.noc_transfer',
            'withdraw.withdraw_id',
            'withdraw.withdraw_amount',
            'withdraw.withdraw_time',
          ])
          .where('user.userId = :id', { id: val.user_id })
          .groupBy(
            'user.userId, user.email, user.noc_transfer, withdraw.withdraw_id, withdraw.withdraw_amount, withdraw.withdraw_time',
          )
          .orderBy('withdraw.withdraw_time', 'DESC')
          .getMany();

        const newFindWithdrawAmountHistory = findSaldoTo.map((val: any) => ({
          transfer_id: val.withdraw_id,
          email: val.email,
          kode_transfer: val.noc_transfer,
          nominal_withdraw: rupiahFormatter(val.withdraw_amount.toString()),
          tanggal_withdraw: dateFormat(val.withdraw_time).format('llll'),
        }));

        return {
          withdraw_history: {
            user_id: val.userId,
            email: val.email,
            kode_transfer: val.noc_transfer,
            total_nominal_withdraw: rupiahFormatter(
              val.total_withdraw_amount.toString(),
            ),
            total_withdraw: newFindWithdrawAmountHistory,
          },
        };
      }),
    );

    return {
      status: 200,
      message: 'data already to use',
      data: findWithdrawAmountHistory[0],
    };
  }

  async createWithdraw(user_id: number, withdraw_amount: number): Promise<any> {
    if (withdraw_amount <= 49000) {
      throw new NotFoundException('Minimum withdraw balance is Rp 50,000');
    }

    const user = await this.userRepository.findOne({
      where: { userId: user_id },
      select: ['userId', 'email'],
    });

    if (!user) {
      throw new NotFoundException('User ID not found, withdraw failed');
    }

    const saldo = await this.saldoRepository.findOne({
      where: { user: { userId: user_id } },
    });

    if (saldo && saldo.totalBalance && saldo.totalBalance <= 49000) {
      throw new NotFoundException(
        `${user.email} your balance is insufficient ${rupiahFormatter(
          saldo.totalBalance.toString(),
        )}`,
      );
    }

    const withdraw = new Withdraw();
    withdraw.user = user;
    withdraw.withdrawAmount = withdraw_amount;
    withdraw.withdrawTime = new Date();
    withdraw.createdAt = new Date();

    const savedWithdraw = await this.withdrawRepository.save(withdraw);

    if (!savedWithdraw) {
      throw new NotFoundException('Withdraw failed, server is busy');
    }

    const lastWithdrawAmount = await this.withdrawRepository.findOne({
      where: { user: { userId: user_id } },
      order: { withdrawTime: 'DESC' },
      select: ['withdrawAmount', 'withdrawTime'],
    });

    const subtractBalance = await this.saldoRepository
      .createQueryBuilder('saldo')
      .select(
        `SUM(totalBalance - ${lastWithdrawAmount.withdrawAmount})`,
        'total_balance',
      )
      .where({ user: { userId: user_id } })
      .execute();

    await this.saldoRepository.update(
      { user: { userId: user_id } },
      {
        totalBalance: subtractBalance[0].total_balance,
        updatedAt: new Date(),
      },
    );

    return {
      message: 'Withdraw successfully',
    };
  }

  async updateWithdraw(
    id: number,
    user_id: number,
    withdraw_amount: number,
  ): Promise<any> {
    if (withdraw_amount <= 49000) {
      throw new NotFoundException('Minimum withdraw balance is Rp 50,000');
    }

    const user = await this.userRepository.findOne({
      where: { userId: user_id },
      select: ['userId'],
    });

    if (!user) {
      throw new NotFoundException(
        'User ID not found, update data withdraw failed',
      );
    }

    const withdraw = await this.withdrawRepository.findOne({
      where: { withdrawId: id },
      relations: ['user'],
    });

    if (!withdraw) {
      throw new NotFoundException(
        'Withdraw ID not found, update data withdraw failed',
      );
    }

    withdraw.user = user;
    withdraw.withdrawAmount = withdraw_amount;
    withdraw.updatedAt = new Date();

    await this.withdrawRepository.save(withdraw);

    return {
      message: 'Update data withdraw successfully',
    };
  }

  async deleteWithdraw(id: number): Promise<any> {
    const withdraw = await this.withdrawRepository.findOne({
      where: { withdrawId: id },
    });

    if (!withdraw) {
      throw new NotFoundException(
        'Withdraw ID not found, delete withdraw data failed',
      );
    }

    try {
      await this.withdrawRepository.delete(id);
    } catch (error) {
      throw new NotFoundException(
        'Failed to delete withdraw data, server is busy',
      );
    }

    return {
      message: 'Withdraw data deleted successfully',
    };
  }
}
