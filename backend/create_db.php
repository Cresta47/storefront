<?php
try {
    $pdo = new PDO("mysql:host=127.0.0.1", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `storeflow_central` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
    echo "Database 'storeflow_central' created or already exists.\n";
} catch (PDOException $e) {
    echo "Database creation failed: " . $e->getMessage() . "\n";
    exit(1);
}
