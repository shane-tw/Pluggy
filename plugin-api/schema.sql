SET autocommit=0;

DROP USER IF EXISTS 'pluginuser'@'localhost';
CREATE USER 'pluginuser'@'localhost' IDENTIFIED BY 'mari4db';
DROP DATABASE IF EXISTS plugindb;
CREATE DATABASE plugindb;
GRANT ALL PRIVILEGES ON plugindb.* TO 'pluginuser'@'localhost';
FLUSH PRIVILEGES;

COMMIT;