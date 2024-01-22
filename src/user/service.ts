import { eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { db } from "../db";
import type { ROLE } from "../enums";
import {
  users,
  NON_PASSWORD_COLUMNS,
  type User,
  type UserWithoutPassword,
} from "./schema";

export class Service {
  private readonly db: PostgresJsDatabase;

  constructor(db: PostgresJsDatabase) {
    this.db = db;
  }

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
    const rows = await db
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

export const service = new Service(db);
