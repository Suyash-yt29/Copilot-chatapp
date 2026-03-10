import pool from '../config/database';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  public_key: string;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  encrypted_message: string;
  iv: string;
  media_url?: string;
  status: 'sent' | 'delivered' | 'seen';
  created_at: string;
}

export class UserModel {
  static async create(email: string, passwordHash: string, publicKey: string): Promise<User> {
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, public_key) 
       VALUES ($1, $2, $3) 
       RETURNING id, email, password_hash, public_key, created_at`,
      [email, passwordHash, publicKey]
    );
    return result.rows[0];
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT id, email, password_hash, public_key, created_at FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  static async findById(id: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT id, email, password_hash, public_key, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async updatePublicKey(userId: string, publicKey: string): Promise<void> {
    await pool.query(
      'UPDATE users SET public_key = $1 WHERE id = $2',
      [publicKey, userId]
    );
  }

  static async getPublicKey(userId: string): Promise<string | null> {
    const result = await pool.query(
      'SELECT public_key FROM users WHERE id = $1',
      [userId]
    );
    return result.rows[0]?.public_key || null;
  }
}

export class MessageModel {
  static async create(
    senderId: string,
    receiverId: string,
    encryptedMessage: string,
    iv: string,
    mediaUrl?: string
  ): Promise<Message> {
    const result = await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, encrypted_message, iv, media_url, status)
       VALUES ($1, $2, $3, $4, $5, 'sent')
       RETURNING id, sender_id, receiver_id, encrypted_message, iv, media_url, status, created_at`,
      [senderId, receiverId, encryptedMessage, iv, mediaUrl]
    );
    return result.rows[0];
  }

  static async updateStatus(messageId: string, status: 'sent' | 'delivered' | 'seen'): Promise<void> {
    await pool.query(
      'UPDATE messages SET status = $1 WHERE id = $2',
      [status, messageId]
    );
  }

  static async getConversation(
    userId1: string,
    userId2: string,
    limit: number = 50,
    cursor?: { createdAt: string; id: string }
  ): Promise<Message[]> {
    let query = `
      SELECT id, sender_id, receiver_id, encrypted_message, iv, media_url, status, created_at
      FROM messages
      WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)
    `;
    
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

  static async markAsDelivered(messageIds: string[]): Promise<void> {
    if (messageIds.length === 0) return;
    
    const placeholders = messageIds.map((_, i) => `$${i + 1}`).join(',');
    await pool.query(
      `UPDATE messages SET status = 'delivered' WHERE id IN (${placeholders})`,
      messageIds
    );
  }
}
