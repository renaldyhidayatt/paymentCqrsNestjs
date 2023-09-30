import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateTopupDto } from './dto/create-topup.dto';
import { DeleteTopupDto } from './dto/delete-topup.dto';
import { IFindNewTopup } from './interface/IFindTopup';
import { GetTopupResultDto } from './dto/get-topup.dto';
import { GetTopupDataDto } from './dto/gets-topup.dto';
import { TopupUpdatedDto } from './dto/update-topup.dto';

@Controller('topup')
export class TopupController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async createTopup(@Body() createTopupDto: CreateTopupDto) {
    try {
      const result = await this.commandBus.execute(
        new CreateTopupDto(
          createTopupDto.userId,
          createTopupDto.topupAmount,
          createTopupDto.topupMethod,
        ),
      );
      return {
        message: 'Topup created successfully',
        result,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to create topup',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async deleteTopup(@Param('id') topupId: number) {
    try {
      const deleteTopupDto: DeleteTopupDto = { topupId };
      await this.commandBus.execute(new DeleteTopupDto(deleteTopupDto.topupId));
      return {
        message: 'Topup deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        'Failed to delete topup',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':userId')
  async getTopupResult(
    @Param('userId') userId: number,
  ): Promise<IFindNewTopup | null> {
    try {
      const query = new GetTopupResultDto(userId);
      return await this.queryBus.execute<
        GetTopupResultDto,
        IFindNewTopup | null
      >(new GetTopupResultDto(query.userId));
    } catch (error) {
      throw new HttpException(
        'Failed to get topup result',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async getTopupData(): Promise<IFindNewTopup[]> {
    try {
      const query = new GetTopupDataDto();
      return await this.queryBus.execute<GetTopupDataDto, IFindNewTopup[]>(
        new GetTopupDataDto(),
      );
    } catch (error) {
      throw new HttpException(
        'Failed to get top-up data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async updateTopup(
    @Param('id') topupId: number,
    @Body() updateTopupDto: TopupUpdatedDto,
  ): Promise<void> {
    try {
      const { userId, topupNo, topupAmount, topupMethod } = updateTopupDto;
      const command = new TopupUpdatedDto(
        topupId,
        userId,
        topupNo,
        topupAmount,
        topupMethod,
      );
      await this.commandBus.execute(command);
    } catch (error) {
      throw new HttpException(
        'Failed to update top-up',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
