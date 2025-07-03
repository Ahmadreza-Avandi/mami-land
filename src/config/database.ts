import mysql from 'mysql2/promise';

// تنظیمات اتصال به دیتابیس
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'mami',
  charset: 'utf8mb4',
  timezone: '+00:00',
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// ایجاد pool اتصال
export const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// تست اتصال
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ اتصال به دیتابیس MySQL برقرار شد');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ خطا در اتصال به دیتابیس:', error);
    return false;
  }
};

// اجرای کوئری
export const executeQuery = async (query: string, params: any[] = []) => {
  try {
    const [results] = await pool.execute(query, params);
    return results;
  } catch (error) {
    console.error('خطا در اجرای کوئری:', error);
    throw error;
  }
};

// بستن اتصال
export const closeConnection = async () => {
  try {
    await pool.end();
    console.log('اتصال به دیتابیس بسته شد');
  } catch (error) {
    console.error('خطا در بستن اتصال:', error);
  }
};