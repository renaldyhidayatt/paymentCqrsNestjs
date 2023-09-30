import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transfer } from 'src/models/transfer';
import { dateFormat } from 'src/utils/dateformat';
import { rupiahFormatter } from 'src/utils/rupiah';
import { Repository } from 'typeorm';
import { IFindNewParamsTransferTo } from './interface/IFindNewParamsTransferTo';
import { IFindParamsTransferTo } from './interface/IFindParamsTransferTo';
import { IFindparamsTransferFrom } from './interface/IFindparamsTransferFrom';
import { User } from 'src/models/user';
import { Saldo } from 'src/models/saldo';

@Injectable()
export class TransferService {
  constructor(
    @InjectRepository(Transfer)
    private readonly transferRepository: Repository<Transfer>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Saldo)
    private readonly saldoRepository: Repository<Saldo>,
  ) {}

  async getTransferResults(): Promise<any> {
    const findTransferSaldoFrom = await this.transferRepository
      .createQueryBuilder('transfer')
      .select([
        'users.userId',
        'users.email',
        'users.nocTransfer',
        'transfer.transferFrom',
        'transfer.transferTo',
        'SUM(transfer.transferAmount) as totalTransferAmount',
      ])
      .getMany();

    if (findTransferSaldoFrom.length < 1) {
      return {
        status: 200,
        message: 'data is not exist',
        data: [],
      };
    }

    const findTransferSaldoTo = await Promise.all(
      findTransferSaldoFrom.map(async (val: any) => {
        const findSaldoTo = await this.transferRepository
          .createQueryBuilder('transfer')
          .leftJoinAndSelect('transfer.transferTo', 'user')
          .select([
            'user.userId',
            'transfer.transferId',
            'user.email',
            'user.nocTransfer',
            'transfer.transferAmount',
            'transfer.transferTime',
          ])
          .where('transfer.transferFrom = :transferFrom', {
            transferFrom: val.transfer_from,
          })
          .andWhere('transfer.transferTo = :transferTo', {
            transferTo: val.transfer_to,
          })
          .groupBy(
            'user.userId, transfer.transferId, user.email, user.nocTransfer, transfer.transferAmount, transfer.transferTime',
          )
          .orderBy('transfer.transferTime', 'DESC')
          .getRawMany();

        const newfindSaldoTo = findSaldoTo.map(
          (val: IFindNewParamsTransferTo) => ({
            transfer_id: val.transfer_id,
            email: val.email,
            kode_transfer: val.noc_transfer,
            nominal_transfer: rupiahFormatter(val.transfer_amount.toString()),
            tanggal_transfer: dateFormat(val.transfer_time).format('llll'),
          }),
        );

        return newfindSaldoTo;
      }),
    );

    const newTransferSaldo = await Promise.all(
      findTransferSaldoFrom.map(async (val: any, i: number) => ({
        transfer_history: {
          user_id: val.user_id,
          email: val.email,
          kode_transfer: val.noc_transfer,
          total_nominal_transfer: rupiahFormatter(
            val.total_transfer_amount.toString(),
          ),
          total_transfer: findTransferSaldoTo[i],
        },
      })),
    );

    return {
      status: 200,
      message: 'data already to use',
      data: newTransferSaldo,
    };
  }

  async getTransferResult(userId: number): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { userId: userId },
      select: ['email'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const findTransferSaldoFrom = await this.transferRepository
      .createQueryBuilder('transfer')
      .leftJoinAndSelect('transfer.transferFrom', 'user')
      .select([
        'user.userId',
        'user.email',
        'user.nocTransfer',
        'SUM(transfer.transferAmount) AS total_transfer_amount',
        'transfer.transferFrom',
        'transfer.transferTo',
      ])
      .where('user.userId = :userId', { userId })
      .groupBy(
        'user.userId, user.email, user.nocTransfer, transfer.transferFrom, transfer.transferTo',
      )
      .orderBy('user.userId', 'ASC')
      .getRawMany();

    if (findTransferSaldoFrom.length < 1) {
      return {
        status: 200,
        message: `${user.email} you never transfer money to other people`,
        data: [],
      };
    }

    const findTransferSaldoTo = await Promise.all(
      findTransferSaldoFrom.map(async (val: IFindParamsTransferTo) => {
        const findSaldoTo = await this.transferRepository
          .createQueryBuilder('transfer')
          .leftJoinAndSelect('transfer.transferTo', 'user')
          .select([
            'transfer.transferTo',
            'transfer.transferId',
            'user.email',
            'user.nocTransfer',
            'transfer.transferAmount',
            'transfer.transferTime',
          ])
          .where('transfer.transferTo = :toUserId', {
            toUserId: val.transfer_to,
          })
          .andWhere('transfer.transferFrom = :fromUserId', {
            fromUserId: val.transfer_from,
          })
          .groupBy(
            'transfer.transferTo, transfer.transferId, user.email, user.nocTransfer, transfer.transferAmount, transfer.transferTime',
          )
          .orderBy('transfer.transferTime', 'DESC')
          .getRawMany();

        const newfindSaldoTo = findSaldoTo.map(
          (val: IFindNewParamsTransferTo) => ({
            transfer_id: val.transfer_id,
            email: val.email,
            kode_transfer: val.noc_transfer,
            nominal_transfer: rupiahFormatter(val.transfer_amount.toString()),
            tanggal_transfer: dateFormat(val.transfer_time).format('llll'),
          }),
        );

        return newfindSaldoTo;
      }),
    );

    const newTransferSaldo = await Promise.all(
      findTransferSaldoFrom.map(async (val: IFindparamsTransferFrom) => ({
        transfer_history: {
          user_id: val.user_id,
          email: val.email,
          kode_transfer: val.noc_transfer,
          total_nominal_transfer: rupiahFormatter(
            val.total_transfer_amount.toString(),
          ),
          total_transfer: findTransferSaldoTo[0],
        },
      })),
    );

    return {
      status: 200,
      message: 'data already to use',
      data: newTransferSaldo[0],
    };
  }

  async createTransfer(
    transfer_from: string,
    transfer_to: string,
    transfer_amount: number,
  ): Promise<any> {
    const checkUserIdFrom = await this.userRepository.findOne({
      select: ['userId', 'email'],
      where: {
        nocTransfer: parseInt(transfer_from),
      },
    });

    const checkUserIdTo = await this.userRepository.findOne({
      select: ['userId', 'email'],
      where: {
        nocTransfer: parseInt(transfer_to),
      },
    });

    if (!checkUserIdFrom || !checkUserIdTo) {
      throw new NotFoundException('User ID not found, transfer balance failed');
    }

    const transfer = new Transfer();
    transfer.transferFrom = checkUserIdFrom;
    transfer.transferTo = checkUserIdTo;
    transfer.transferAmount = transfer_amount;
    transfer.transferTime = new Date();
    transfer.createdAt = new Date();

    const savedTransfer = await this.transferRepository.save(transfer);

    if (!savedTransfer || Object.keys(savedTransfer).length < 1) {
      throw new InternalServerErrorException(
        'Transfer balance failed, server is busy',
      );
    }

    const checkSaldoFrom = await this.saldoRepository.findOne({
      where: { user: checkUserIdFrom },
      select: ['totalBalance'],
    });

    if (!checkSaldoFrom || checkSaldoFrom.totalBalance === undefined) {
      throw new NotFoundException(
        'No saldo record found for the specified user',
      );
    } else if (checkSaldoFrom.totalBalance <= 49000) {
      throw new ConflictException(
        `${
          checkUserIdFrom.email
        } your balance is insufficient ${rupiahFormatter(
          checkSaldoFrom.totalBalance.toString(),
        )}`,
      );
    }

    const saldoToUpdateFrom = checkSaldoFrom.totalBalance - transfer_amount;

    const saldoToUpdateTo = await this.saldoRepository
      .createQueryBuilder()
      .update(Saldo)
      .set({ totalBalance: () => `total_balance + ${transfer_amount}` })
      .where('user_id = :userId', { userId: checkUserIdTo.userId })
      .execute();

    if (!saldoToUpdateTo) {
      throw new InternalServerErrorException(
        'Transfer balance failed, server is busy',
      );
    }

    const saldoToUpdateFromResult = await this.saldoRepository
      .createQueryBuilder()
      .update(Saldo)
      .set({ totalBalance: saldoToUpdateFrom, updatedAt: new Date() })
      .where('user_id = :userId', { userId: checkUserIdFrom.userId })
      .execute();

    if (!saldoToUpdateFromResult) {
      throw new InternalServerErrorException(
        'Transfer balance failed, server is busy',
      );
    }

    return {
      message: `Transfer balance successfully, please check your email ${checkUserIdFrom.email}`,
    };
  }

  async updateTransfer(
    transferId: number,
    transfer_from: number,
    transfer_to: number,
    transfer_amount: number,
  ): Promise<any> {
    if (!transfer_amount || transfer_amount <= 49000) {
      throw new ConflictException('Minimum transfer balance is Rp 50,000');
    }

    const checkTransferFromUser = await this.userRepository.findOne({
      where: { userId: transfer_from },
    });

    const checkTransferToUser = await this.userRepository.findOne({
      where: { userId: transfer_to },
    });

    if (!checkTransferFromUser || !checkTransferToUser) {
      throw new NotFoundException(
        'User ID not found, update data transfer failed',
      );
    }

    const updateTransfer = await this.transferRepository.update(transferId, {
      transferFrom: checkTransferFromUser,
      transferTo: checkTransferToUser,
      transferAmount: transfer_amount,
      updatedAt: new Date(),
    });

    if (updateTransfer.affected < 1) {
      throw new InternalServerErrorException(
        'Update data transfer failed, server is busy',
      );
    }

    return {
      message: 'Update data transfer successfully',
    };
  }

  async deleteTransfer(transferId: number): Promise<any> {
    const transfer = await this.transferRepository.findOne({
      where: { transferId: transferId },
    });

    if (!transfer) {
      throw new NotFoundException(
        'Transfer ID not found, delete data transfer failed',
      );
    }

    try {
      await this.transferRepository.remove(transfer);
    } catch (error) {
      throw new InternalServerErrorException(
        'Delete data transfer failed, server is busy',
      );
    }

    return {
      message: 'Delete data transfer successfully',
    };
  }
}
