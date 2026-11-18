import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './entities/item.entity';
import { Player } from './entities/player.entity';

const MONSTERS = [
  { name: 'Slime', icon: '🟢' },
  { name: 'Goblin', icon: '👺' },
  { name: 'Skeleton', icon: '💀' },
  { name: 'Orc', icon: '👹' },
  { name: 'Dragon', icon: '🐉' },
] as const;

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Item) private readonly itemRepo: Repository<Item>,
    @InjectRepository(Player) private readonly playerRepo: Repository<Player>
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
  async createPlayer(name: string) {
    const trimmed = typeof name === 'string' ? name.trim() : '';
    if (trimmed.length < 2 || trimmed.length > 20) {
      throw new BadRequestException('Name is required and must be between 2 and 20 characters long.');
    }

    const player = this.playerRepo.create({
      name: trimmed,
      gold: 0,
      xp: 0,
      kills: 0,
      monsterHp: null,
    });

    const savedPlayer = await this.playerRepo.save(player);

    return this.toPlayerView(savedPlayer);
  }

  async findPlayer(id: number) {
    const player = await this.playerRepo.findOneBy({ id });
    if (!player) {
      throw new NotFoundException(`Player with id ${id} not found.`);
    }

    return this.toPlayerView(player);
  }

  toPlayerView(player: Player, attack = 1) {
    const baseMonster = MONSTERS[player.kills % MONSTERS.length];
    const maxHp = 8 + player.kills * 4;

    return {
      id: player.id,
      name: player.name,
      level: 1 + Math.floor(player.xp / 100),
      xp: player.xp,
      gold: player.gold,
      attack,
      kills: player.kills,
      monster: {
        name: baseMonster.name,
        icon: baseMonster.icon,
        hp: player.monsterHp ?? maxHp,
        maxHp,
      },
    };
  }

  // STEP 3: attack(id)
  async attack(id: number) {
    const player = await this.playerRepo.findOneBy({ id });
    if (!player) {
      throw new NotFoundException(`Player with id ${id} not found.`);
    }

    const { monster } = this.toPlayerView(player);
    const attack = 1;
    const newHp = Math.max(0, monster.hp - attack);
    const defeated = newHp <= 0;

    let reward: { gold: number; xp: number } | null = null;
    if (defeated) {
      reward = {
        gold: 5 + player.kills * 2,
        xp: 25,
      };
      player.gold += reward.gold;
      player.xp += reward.xp;
      player.kills += 1;
      player.monsterHp = null;
    } else {
      player.monsterHp = newHp;
    }

    const savedPlayer = await this.playerRepo.save(player);

    return {
      damage: attack,
      defeated,
      reward,
      player: this.toPlayerView(savedPlayer, attack),
    };
  }

  // STEP 4: inventory(id), buy(playerId, itemId), attackOf(playerId)
  // STEP 5: leaderboard({ page, limit }) without the N+1 problem
}
