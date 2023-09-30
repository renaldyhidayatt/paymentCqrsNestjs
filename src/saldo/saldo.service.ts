import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Saldo } from 'src/models/saldo';
import { User } from 'src/models/user';
import { rupiahFormatter } from 'src/utils/rupiah';
import { Repository } from 'typeorm';
import { IFindNewBalance } from './interfaces/IFindNewBalance';

@Injectable()
export class SaldoService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Saldo)
    private readonly saldoRepository: Repository<Saldo>,
  ) {}

  async createSaldo(user_id: number, total_balance: number): Promise<Saldo> {
    if (total_balance <= 49000) {
      throw new Error('Minimum saldo is Rp 50,000');
    }

    const user = await this.userRepository.findOne({
      where: { userId: user_id },
    });

    if (!user) {
      throw new Error('User not found, add saldo failed');
    }

    const existingSaldo = await this.saldoRepository.findOne({
      where: { user: user },
    });

    if (existingSaldo) {
      throw new Error('Saldo for this user already exists, add saldo failed');
    }

    const newSaldo = new Saldo();
    newSaldo.user = user;
    newSaldo.totalBalance = total_balance;
    newSaldo.createdAt = new Date();

    return await this.saldoRepository.save(newSaldo);
  }

  async deleteSaldo(userId: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { userId } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const saldo = await this.saldoRepository.findOne({ where: { user } });
    if (!saldo) {
      throw new NotFoundException('Saldo not found for the specified user.');
    }

    try {
      await this.saldoRepository.remove(saldo);
    } catch (error) {
      throw new InternalServerErrorException(
        'Server error, please try again later.',
      );
    }
  }

  async getResultSaldo(userId: number): Promise<IFindNewBalance> {
    const findBalance = await this.userRepository.find({
      where: { userId: userId },
      select: ['userId', 'email', 'nocTransfer'],
      relations: ['saldo'],
      join: {
        alias: 'user',
        leftJoinAndSelect: {
          saldo: 'user.saldo',
        },
      },
    });

    if (!findBalance) {
      throw new NotFoundException('user id is not exist');
    }

    const newBalanceUsers = findBalance.map((val: any): IFindNewBalance => {
      return {
        saldo_history: {
          user_id: val.saldo_user_id,
          email: val.email,
          kode_transfer: val.noc_transfer,
          jumlah_uang: rupiahFormatter(val.total_balance.toString()),
        },
      };
    });

    return newBalanceUsers[0];
  }

  async getResultsSaldo(): Promise<IFindNewBalance[]> {
    const findBalance = await this.saldoRepository.find({
      relations: ['user'],
      select: ['user', 'totalBalance', 'createdAt'],
    });

    const newBalanceUsers = findBalance.map(
      (val: Saldo): IFindNewBalance => ({
        saldo_history: {
          user_id: val.user.userId,
          email: val.user.email,
          kode_transfer: val.user.nocTransfer,
          jumlah_uang: rupiahFormatter(val.totalBalance.toString()),
        },
      }),
    );

    return newBalanceUsers;
  }

  async updateSaldo(
    saldoId: number,
    user_id: number,
    total_balance: number,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { userId: user_id },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const saldo = await this.saldoRepository.findOne({
      where: { saldoId: saldoId },
      relations: ['user'],
    });
    if (!saldo) {
      throw new NotFoundException('Saldo not found');
    }

    saldo.user = user;
    saldo.totalBalance = total_balance;

    try {
      await this.saldoRepository.save(saldo);
    } catch (error) {
      throw new InternalServerErrorException('Update saldo failed');
    }
  }
}
