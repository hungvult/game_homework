import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './entities/item.entity';
import { Player } from './entities/player.entity';
import { InventoryItem } from './entities/inventory-item.entity';

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
    @InjectRepository(Player) private readonly playerRepo: Repository<Player>,
    @InjectRepository(InventoryItem) private readonly inventoryItemRepo: Repository<InventoryItem>
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

    const attack = await this.attackOf(player.id);
    return this.toPlayerView(player, attack);
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
    const attack = await this.attackOf(player.id);
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
  async buyItemByPlayerId(id: number, itemId: number) {
    // Check if item is a number
    if (typeof itemId !== 'number' || isNaN(itemId)) {
      throw new BadRequestException('itemId is not a number');
    }

    // Check if item and player exists
    const item = await this.itemRepo.findOneBy({ id: itemId });
    const player = await this.playerRepo.findOneBy({ id });
    if (!item || !player) {
      throw new NotFoundException(`player or item not found`);
    }

    // Check if player has enough gold
    if (player.gold < item.price) {
      throw new BadRequestException(`not enough gold (and NOTHING changes)`);
    }

    // Deduct gold, add item to inventory, and return the updated player view
    player.gold -= item.price;
    await this.playerRepo.save(player);

    // Note: Ignore duplicate item purchases for simplicity
    const inventoryItem = await this.inventoryItemRepo.findOneBy({ playerId: player.id, itemId: item.id });
    if (inventoryItem) {
      inventoryItem.quantity += 1;
      await this.inventoryItemRepo.save(inventoryItem);
    } else {
      const newInventoryItem = this.inventoryItemRepo.create({
        playerId: player.id,
        itemId: item.id,
        quantity: 1,
      });
      await this.inventoryItemRepo.save(newInventoryItem);
    }

    const attack = await this.attackOf(player.id);
    return { item, player: this.toPlayerView(player, attack) };
  }

  async getInventoriesByPlayerId(id: number) {
    const player = await this.playerRepo.findOneBy({ id });
    if (!player) {
      throw new NotFoundException(`The player does not exist`);
    }

    const rows = await this.inventoryItemRepo.find({
      where: { playerId: id },
      relations: { item: true },
      order: { id: 'ASC' },
    });

    return rows.map((row) => ({
      item: row.item,
      quantity: row.quantity,
    }));
  }

  async attackOf(playerId: number): Promise<number> {
    const rows = await this.inventoryItemRepo.find({
      where: { playerId },
      relations: { item: true },
    });

    const bonus = rows.reduce(
      (total, row) => total + row.item.attack * row.quantity,
      0,
    );

    return 1 + bonus;
  }


  // STEP 5: leaderboard({ page, limit }) without the N+1 problem
}
