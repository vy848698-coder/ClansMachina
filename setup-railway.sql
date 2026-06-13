-- Railway version of setup.sql.
-- Railway already gives you a database named `railway` and you usually cannot
-- CREATE DATABASE, so this script creates the TABLES only inside the current DB.
-- Run it in Railway's MySQL "Query" console, or:
--   mysql -h shuttle.proxy.rlwy.net -P 30093 -u root -p railway < setup-railway.sql

CREATE TABLE IF NOT EXISTS leads (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(120)  NOT NULL,
  phone      VARCHAR(30)   NOT NULL,
  email      VARCHAR(150)  NOT NULL,
  city       VARCHAR(120)  NOT NULL,
  service    VARCHAR(80)   DEFAULT '',
  bill       VARCHAR(80)   DEFAULT '',
  message    TEXT,
  created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS posts (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  title      VARCHAR(200)  NOT NULL,
  chip       VARCHAR(80)   DEFAULT '',
  category   VARCHAR(150)  DEFAULT '',
  excerpt    TEXT,
  body       MEDIUMTEXT,
  author     VARCHAR(120)  DEFAULT '',
  read_time  VARCHAR(40)   DEFAULT '',
  image      VARCHAR(255)  DEFAULT '',
  hidden     TINYINT(1)    NOT NULL DEFAULT 0,
  created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS categories (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  slug       VARCHAR(60)  NOT NULL UNIQUE,
  name       VARCHAR(120) NOT NULL,
  sort_order INT          NOT NULL DEFAULT 0,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO categories (slug, name, sort_order) VALUES
('residential','Residential Rooftop Solar',1),
('installation','Solar Panel Installation',2),
('subsidy','Solar Subsidy',3),
('maintenance','Solar Maintenance',4),
('societies','Rooftop for Societies',5),
('commercial','Commercial Solar',6),
('roi','Solar ROI',7),
('inverters','Inverters and Batteries',8);
