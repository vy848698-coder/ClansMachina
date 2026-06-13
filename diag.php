<?php
/**
 * TEMPORARY diagnostic page. Visit https://<your-railway-app>/diag.php
 * It checks: env vars present, DB connection, and whether tables exist.
 * DELETE THIS FILE once everything works (it leaks config info).
 */
header('Content-Type: text/plain; charset=utf-8');

echo "=== 1. Environment variables PHP can see ===\n";
foreach (['MYSQLHOST','MYSQLPORT','MYSQLUSER','MYSQLPASSWORD','MYSQLDATABASE',
          'MYSQL_URL','DATABASE_URL','PORT'] as $k) {
    $v = getenv($k);
    if ($v === false) {
        echo str_pad($k, 16) . ": (not set)\n";
    } elseif (stripos($k, 'PASS') !== false || stripos($k, 'URL') !== false) {
        echo str_pad($k, 16) . ": (set, " . strlen($v) . " chars, hidden)\n";
    } else {
        echo str_pad($k, 16) . ": $v\n";
    }
}

echo "\n=== 2. Values db.php will actually use ===\n";
$DB_HOST = 'localhost'; $DB_PORT = '3306'; $DB_USER = 'root'; $DB_PASS = ''; $DB_NAME = 'clansmachina';
$mysqlUrl = getenv('MYSQL_URL') ?: getenv('DATABASE_URL');
if ($mysqlUrl && strpos($mysqlUrl, 'mysql://') === 0) {
    $u = parse_url($mysqlUrl);
    $DB_HOST = $u['host'] ?? $DB_HOST;
    $DB_PORT = isset($u['port']) ? (string)$u['port'] : $DB_PORT;
    $DB_USER = isset($u['user']) ? urldecode($u['user']) : $DB_USER;
    $DB_PASS = isset($u['pass']) ? urldecode($u['pass']) : $DB_PASS;
    $DB_NAME = isset($u['path']) ? ltrim($u['path'], '/') : $DB_NAME;
} else {
    $DB_HOST = getenv('MYSQLHOST') ?: $DB_HOST;
    $DB_PORT = getenv('MYSQLPORT') ?: $DB_PORT;
    $DB_USER = getenv('MYSQLUSER') ?: $DB_USER;
    $DB_PASS = getenv('MYSQLPASSWORD') !== false ? getenv('MYSQLPASSWORD') : $DB_PASS;
    $DB_NAME = getenv('MYSQLDATABASE') ?: $DB_NAME;
}
echo "host=$DB_HOST port=$DB_PORT user=$DB_USER db=$DB_NAME pass=" . ($DB_PASS === '' ? '(empty)' : '(set)') . "\n";

echo "\n=== 3. Connection test ===\n";
try {
    $pdo = new PDO(
        "mysql:host=$DB_HOST;port=$DB_PORT;dbname=$DB_NAME;charset=utf8mb4",
        $DB_USER, $DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    echo "CONNECTED OK\n";

    echo "\n=== 4. Tables present ===\n";
    $tables = $pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN);
    echo $tables ? implode(", ", $tables) . "\n" : "(NO TABLES — you need to run setup.sql on Railway)\n";

    foreach (['leads','posts','categories'] as $t) {
        try {
            $n = $pdo->query("SELECT COUNT(*) FROM `$t`")->fetchColumn();
            echo "  $t: $n rows\n";
        } catch (Exception $e) {
            echo "  $t: MISSING\n";
        }
    }
} catch (PDOException $e) {
    echo "CONNECTION FAILED:\n" . $e->getMessage() . "\n";
}
