USE smartschool_db;

DELETE FROM shift_schedules
WHERE shift_name = 'Ca Trực Hội trường'
  AND tech_name = 'Phạm Huy Hoàng (KTV)'
  AND area = 'Khu C - Hội trường';

SELECT ROW_COUNT() AS deleted_rows;
