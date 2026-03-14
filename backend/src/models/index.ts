// Status (Stories)
export interface Status {
  id: string;
  user_id: string;
  media_url?: string;
  text?: string;
  created_at: string;
  expires_at: string;
}

export class StatusModel {
  static async create(userId: string, mediaUrl: string | null, text: string | null, expiresAt: string): Promise<Status> {
    const result = await pool.query(
      `INSERT INTO status (user_id, media_url, text, expires_at) VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, mediaUrl, text, expiresAt]
    );
    return result.rows[0];
  }

  static async getAllActive(): Promise<Status[]> {
    const result = await pool.query(
      `SELECT * FROM status WHERE expires_at > NOW() ORDER BY created_at DESC`
    );
    return result.rows;
  }

  static async getByUser(userId: string): Promise<Status[]> {
    const result = await pool.query(
      `SELECT * FROM status WHERE user_id = $1 AND expires_at > NOW() ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  static async deleteExpired(): Promise<void> {
    await pool.query(`DELETE FROM status WHERE expires_at <= NOW()`);
  }
}


import pool from '../config/database.js';

// User
export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  public_key: string;
  country: string;
  language: string;
  trust_score: number;
  created_at: string;
}

// Friend
export interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  status: string;
  created_at: string;
}

// Group
export interface Group {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  created_at: string;
}

// Group Member
export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: string;
  joined_at: string;
}

// Message
export interface Message {
  id: string;
  sender_id: string;
  receiver_id?: string;
  group_id?: string;
  content: string;
  iv?: string;
  media_url?: string;
  status: string;
  created_at: string;
}


export class UserModel {
  static async create(username: string, email: string, passwordHash: string, publicKey: string, country: string, language: string): Promise<User> {
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, public_key, country, language) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [username, email, passwordHash, publicKey, country, language]
    );
    return result.rows[0];
  }
  static async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  }
  static async findByUsername(username: string): Promise<User | null> {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0] || null;
  }
  static async findById(id: string): Promise<User | null> {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }
  static async updatePublicKey(userId: string, publicKey: string): Promise<void> {
    await pool.query('UPDATE users SET public_key = $1 WHERE id = $2', [publicKey, userId]);
  }
  static async getPublicKey(userId: string): Promise<string | null> {
    const result = await pool.query('SELECT public_key FROM users WHERE id = $1', [userId]);
    return result.rows[0]?.public_key || null;
  }
  static async search(query: string): Promise<User[]> {
    if (!query) return [];
    const result = await pool.query(
      `SELECT * FROM users WHERE username ILIKE $1 OR email ILIKE $1 LIMIT 20`,
      [`%${query}%`]
    );
    return result.rows;
  }
}

export class FriendModel {
  static async addFriend(userId: string, friendId: string): Promise<Friend> {
    const result = await pool.query(
      `INSERT INTO friends (user_id, friend_id, status) VALUES ($1, $2, 'pending') RETURNING *`,
      [userId, friendId]
    );
    return result.rows[0];
  }
  static async acceptFriendRequest(id: string): Promise<void> {
    await pool.query('UPDATE friends SET status = $1 WHERE id = $2', ['accepted', id]);
  }
  static async getFriends(userId: string): Promise<Friend[]> {
    const result = await pool.query(
      `SELECT * FROM friends WHERE (user_id = $1 OR friend_id = $1) AND status = 'accepted'`,
      [userId]
    );
    return result.rows;
  }
  static async getPendingRequests(userId: string): Promise<Friend[]> {
    const result = await pool.query(
      `SELECT * FROM friends WHERE friend_id = $1 AND status = 'pending'`,
      [userId]
    );
    return result.rows;
  }
}

export class GroupModel {
  static async create(name: string, description: string, ownerId: string): Promise<Group> {
    const result = await pool.query(
      `INSERT INTO groups (name, description, owner_id) VALUES ($1, $2, $3) RETURNING *`,
      [name, description, ownerId]
    );
    return result.rows[0];
  }
  static async getById(groupId: string): Promise<Group | null> {
    const result = await pool.query('SELECT * FROM groups WHERE id = $1', [groupId]);
    return result.rows[0] || null;
  }
  static async getGroupsForUser(userId: string): Promise<Group[]> {
    const result = await pool.query(
      `SELECT g.* FROM groups g JOIN group_members gm ON g.id = gm.group_id WHERE gm.user_id = $1`,
      [userId]
    );
    return result.rows;
  }
}

export class GroupMemberModel {
  static async addMember(groupId: string, userId: string, role: string): Promise<GroupMember> {
    const result = await pool.query(
      `INSERT INTO group_members (group_id, user_id, role) VALUES ($1, $2, $3) RETURNING *`,
      [groupId, userId, role]
    );
    return result.rows[0];
  }
  static async removeMember(groupId: string, userId: string): Promise<void> {
    await pool.query(
      `DELETE FROM group_members WHERE group_id = $1 AND user_id = $2`,
      [groupId, userId]
    );
  }
  static async getMembers(groupId: string): Promise<GroupMember[]> {
    const result = await pool.query(
      `SELECT * FROM group_members WHERE group_id = $1`,
      [groupId]
    );
    return result.rows;
  }
}

export class MessageModel {
  static async create(
    senderId: string,
    receiverId: string,
    encrypted_message: string,
    iv: string,
    media_url?: string
  ): Promise<Message> {
    const result = await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, content, iv, media_url, status) VALUES ($1, $2, $3, $4, $5, 'sent') RETURNING *`,
      [senderId, receiverId, encrypted_message, iv, media_url]
    );
    return result.rows[0];
  }

  static async createDirect(
    senderId: string,
    receiverId: string,
    content: string,
    iv?: string,
    media_url?: string
  ): Promise<Message> {
    const result = await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, content, iv, media_url, status) VALUES ($1, $2, $3, $4, $5, 'sent') RETURNING *`,
      [senderId, receiverId, content, iv, media_url]
    );
    return result.rows[0];
  }

  static async createGroup(
    senderId: string,
    groupId: string,
    content: string,
    iv?: string,
    media_url?: string
  ): Promise<Message> {
    const result = await pool.query(
      `INSERT INTO messages (sender_id, group_id, content, iv, media_url, status) VALUES ($1, $2, $3, $4, $5, 'sent') RETURNING *`,
      [senderId, groupId, content, iv, media_url]
    );
    return result.rows[0];
  }

  static async getDirectConversation(
    userId1: string,
    userId2: string,
    limit: number = 50,
    cursor?: { createdAt: string; id: string }
  ): Promise<Message[]> {
    let query = `SELECT * FROM messages WHERE ((sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1))`;
    const params: any[] = [userId1, userId2];
    if (cursor) {
      query += ` AND (created_at, id) < ($3, $4)`;
      params.push(cursor.createdAt, cursor.id);
    }
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);
    const result = await pool.query(query, params);
    return result.rows.reverse();
  }

  static async getGroupConversation(
    groupId: string,
    limit: number = 50,
    cursor?: { createdAt: string; id: string }
  ): Promise<Message[]> {
    let query = `SELECT * FROM messages WHERE group_id = $1`;
    const params: any[] = [groupId];
    if (cursor) {
      query += ` AND (created_at, id) < ($2, $3)`;
      params.push(cursor.createdAt, cursor.id);
    }
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);
    const result = await pool.query(query, params);
    return result.rows.reverse();
  }

  static async updateStatus(messageId: string, status: string): Promise<void> {
    await pool.query('UPDATE messages SET status = $1 WHERE id = $2', [status, messageId]);
  }

  static async getConversation(
    userId1: string,
    userId2: string,
    limit: number = 50,
    cursor?: { createdAt: string; id: string }
  ): Promise<Message[]> {
    // Alias for getDirectConversation
    return this.getDirectConversation(userId1, userId2, limit, cursor);
  }
}

