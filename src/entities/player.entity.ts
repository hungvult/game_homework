// STEP 2: Player entity -> "player" table
// Columns: id, name (20), gold, xp, kills (default 0), monsterHp (nullable int)
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('player')
export class Player {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 20 })
    name: string;

    @Column({ type: 'int', default: 0 })
    gold: number;

    @Column({ type: 'int', default: 0 })
    xp: number;

    @Column({ type: 'int', default: 0 })
    kills: number;

    @Column({ type: 'int', nullable: true })
    monsterHp: number | null;
}