-- رفع مشکل رمز عبور ادمین
USE mami;

-- حذف ادمین قبلی
DELETE FROM admins WHERE username = 'admin';

-- اضافه کردن ادمین جدید با هش صحیح برای رمز عبور admin123
INSERT INTO admins (username, password_hash) VALUES 
('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- نمایش ادمین‌ها
SELECT * FROM admins;