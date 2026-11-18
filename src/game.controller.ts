import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from "@nestjs/common";
import { GameService } from "./game.service";
import { DataSource } from "typeorm";
import { PageQueryDto } from "./common/dto/page-query.dto";

@Controller()
export class GameController {
  constructor(
    private readonly game: GameService,
    private readonly dataSource: DataSource,
  ) { }

  // STEP 0: @Get('health')
  @Get("health")
  async get() {
    await this.dataSource.query("SELECT 1");

    return {
      db: "up",
    };
  }

  // STEP 1: @Get('items')
  @Get("items")
  async getItems(@Query() query: PageQueryDto) {
    return await this.game.getItems({ page: query.page, limit: query.limit });
  }

  // STEP 2: @Post('players'), @Get('players/:id')
  @Post("players")
  async createPlayer(@Body("name") name: string) {
    return await this.game.createPlayer(name);
  }

  @Get("players/:id")
  async findPlayer(@Param("id", ParseIntPipe) id: number) {
    return await this.game.findPlayer(id);
  }

  // STEP 3: @Post('players/:id/attack')
  @Post("players/:id/attack")
  async attack(@Param("id", ParseIntPipe) id: number) {
    return await this.game.attack(id);
  }

  // STEP 4: @Get('players/:id/inventory'), @Post('players/:id/buy')
  // STEP 5: @Get('leaderboard')
}
