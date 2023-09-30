import { Module } from '@nestjs/common';
import { SaldoModule } from './saldo/saldo.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from './models/user';
import { Saldo } from './models/saldo';
import { Topup } from './models/topup';
import { Transfer } from './models/transfer';
import { Withdraw } from './models/withdraw';
import { TopupModule } from './topup/topup.module';
import { TransferModule } from './transfer/transfer.module';
import { WithdrawModule } from './withdraw/withdraw.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [User, Saldo, Topup, Transfer, Withdraw],
      synchronize: true,
    }),
    SaldoModule,
    TopupModule,
    TransferModule,
    WithdrawModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
