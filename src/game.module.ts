import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { Item } from './entities/item.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    // STEP 1: TypeOrmModule.forFeature([Item])
    TypeOrmModule.forFeature([Item]),

    // STEP 2: add Player to the list
    // STEP 4: add InventoryItem to the list
  ],
  controllers: [GameController],
  providers: [GameService],
})
export class GameModule { }
