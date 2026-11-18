import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './entities/item.entity';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Item) private readonly itemRepo: Repository<Item>,
  ) { }

  // STEP 1: items({ page, limit })
  async getItems({ page = 1, limit = 10 }: { page?: number; limit?: number }) {
    const offset = (page - 1) * limit;

    const [data, total] = await this.itemRepo.findAndCount({
      order: { id: 'ASC' },
      skip: offset,
      take: limit,
    });

    return { data, page, limit, total };
  }

  // STEP 2: createPlayer(name), findPlayer(id), toPlayerView(player, attack = 1)
  // STEP 3: attack(id)
  // STEP 4: inventory(id), buy(playerId, itemId), attackOf(playerId)
  // STEP 5: leaderboard({ page, limit }) without the N+1 problem
}
