import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import { Inject, Injectable, DrizzleOrm } from "../core";
import {
  users,
  NON_PASSWORD_COLUMNS,
  type ROLE,
  type User,
  type UserWithoutPassword,
} from "./schema";

@Injectable()
export class UserService {
  @Inject(DrizzleOrm) private readonly db!: PostgresJsDatabase;

  public async findAll(): Promise<UserWithoutPassword[]> {
    return await this.db.select(NON_PASSWORD_COLUMNS).from(users);
  }

  public async find(email: string): Promise<UserWithoutPassword | null> {
    const rows = await this.db
      .select(NON_PASSWORD_COLUMNS)
      .from(users)
      .where(eq(users.email, email));

    return rows[0] ?? null;
  }

  public async findWithPassword(email: string): Promise<User | null> {
    const rows = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email));

    return rows[0] ?? null;
  }

  public async create(createDTO: CreateDTO): Promise<UserWithoutPassword> {
    const rows = await this.db
      .insert(users)
      .values(createDTO)
      .returning(NON_PASSWORD_COLUMNS);

    return rows[0]!;
  }

  public async update(
    id: number,
    replacement: UpdateDTO
  ): Promise<UserWithoutPassword | null> {
    const rows = await this.db
      .update(users)
      .set({ ...replacement, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning(NON_PASSWORD_COLUMNS);

    return rows[0] ?? null;
  }

  public async delete(id: number): Promise<UserWithoutPassword | null> {
    const rows = await this.db
      .delete(users)
      .where(eq(users.id, id))
      .returning(NON_PASSWORD_COLUMNS);

    return rows[0] ?? null;
  }
}

type CreateDTO = {
  email: string;
  password: string;
  role?: ROLE;
};

type UpdateDTO = {
  password?: string;
  role?: ROLE;
};
