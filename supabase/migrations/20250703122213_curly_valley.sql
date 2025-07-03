-- اسکریپت نصب دیتابیس مامی‌لند
-- این فایل را در MySQL اجرا کنید

-- ایجاد دیتابیس
CREATE DATABASE IF NOT EXISTS mami CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mami;

-- ایجاد کاربر مخصوص (اختیاری)
-- CREATE USER IF NOT EXISTS 'mami_user'@'localhost' IDENTIFIED BY 'mami_password';
-- GRANT ALL PRIVILEGES ON mami.* TO 'mami_user'@'localhost';
-- FLUSH PRIVILEGES;

-- اجرای اسکریپت اصلی
SOURCE schema.sql;

-- نمایش جداول ایجاد شده
SHOW TABLES;

-- نمایش تعداد رکوردهای اولیه
SELECT 'access_codes' as table_name, COUNT(*) as count FROM access_codes
UNION ALL
SELECT 'admins' as table_name, COUNT(*) as count FROM admins;

SELECT 'نصب دیتابیس مامی‌لند با موفقیت انجام شد!' as status;