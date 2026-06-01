export async function updateDatabase(db) {
  console.log('开始执行数据库更新...');
  const results = [];
  
  try {
    const serversCols = await addServerColumns(db);
    results.push({ name: 'servers 表列更新', ...serversCols });
    
    const cleanupServers = await cleanupServerExtraColumns(db);
    results.push({ name: 'servers 表多余字段清理', ...cleanupServers });
    
    const historyCols = await addHistoryColumns(db);
    results.push({ name: 'metrics_history 表列更新', ...historyCols });
    
    const aggType = await modifyAggregatedLoadAvgType(db);
    results.push({ name: 'metrics_aggregated load_avg_avg 类型修改', ...aggType });
    
    const staleCleanup = await cleanupStaleSettings(db);
    results.push({ name: '废弃 settings key 清理', ...staleCleanup });
    
    console.log('✅ 数据库更新完成');
    
    return {
      success: true,
      message: '数据库更新成功',
      results
    };
  } catch (e) {
    console.error('❌ 数据库更新失败:', e);
    return {
      success: false,
      message: '数据库更新失败',
      error: e.message,
      results
    };
  }
}

async function addServerColumns(db) {
  try {
    const { results: columns } = await db.prepare(`PRAGMA table_info(servers)`).all();
    const existingCols = columns.map(c => c.name);
    
    const newCols = {
      country: "TEXT DEFAULT ''",
      is_hidden: "TEXT DEFAULT '0'",
      sort_order: "INTEGER DEFAULT 0"
    };
    
    let added = 0;
    for (const [colName, colDef] of Object.entries(newCols)) {
      if (!existingCols.includes(colName)) {
        await db.prepare(`ALTER TABLE servers ADD COLUMN ${colName} ${colDef}`).run();
        added++;
      }
    }
    
    return { success: true, added };
  } catch (e) {
    console.error('添加 servers 表列失败:', e);
    return { success: false, error: e.message };
  }
}

async function cleanupServerExtraColumns(db) {
  try {
    const { results: columns } = await db.prepare(`PRAGMA table_info(servers)`).all();
    const existingCols = columns.map(c => c.name);
    
    const extraCols = ['cpu', 'ram', 'disk', 'load_avg', 'uptime', 'last_updated', 'ram_total', 'net_rx', 'net_tx', 'net_in_speed', 'net_out_speed', 'os', 'cpu_info', 'cpu_cores' , 'arch' ,'boot_time', 'ram_used', 'swap_total', 'swap_used', 'disk_total', 'disk_used', 'processes', 'tcp_conn', 'udp_conn', 'country', 'ip_v4', 'ip_v6', 'ping_ct', 'ping_cu', 'ping_cm', 'ping_bd', 'monthly_rx', 'monthly_tx', 'last_rx', 'last_tx', 'reset_month'];
    const colsToDrop = extraCols.filter(col => existingCols.includes(col));
    
    if (colsToDrop.length === 0) {
      return { success: true, cleaned: 0, message: '无需清理（没有多余字段）' };
    }
    
    for (const col of colsToDrop) {
      await db.prepare(`ALTER TABLE servers DROP COLUMN ${col}`).run();
      console.log(`✅ 已删除 servers 表的 ${col} 字段`);
    }
    
    return { success: true, cleaned: colsToDrop.length, message: `已删除 ${colsToDrop.join(', ')} 字段` };
  } catch (e) {
    console.error('清理 servers 表多余字段失败:', e);
    return { success: false, error: e.message };
  }
}

async function addHistoryColumns(db) {
  try {
    const { results: historyColumns } = await db.prepare(`PRAGMA table_info(metrics_history)`).all();
    const existingHistoryCols = historyColumns.map(c => c.name);
    
    const newHistoryCols = {
      cpu_cores: "INTEGER DEFAULT 0",
      cpu_info: "TEXT DEFAULT ''",
      arch: "TEXT DEFAULT ''",
      os: "TEXT DEFAULT ''",
      country: "TEXT DEFAULT ''",
      ip_v4: "TEXT DEFAULT '0'",
      ip_v6: "TEXT DEFAULT '0'",
      boot_time: "TEXT DEFAULT ''"
    };
    
    let added = 0;
    for (const [colName, colDef] of Object.entries(newHistoryCols)) {
      if (!existingHistoryCols.includes(colName)) {
        await db.prepare(`ALTER TABLE metrics_history ADD COLUMN ${colName} ${colDef}`).run();
        added++;
      }
    }
    
    return { success: true, added };
  } catch (e) {
    console.error('添加 metrics_history 表列失败:', e);
    return { success: false, error: e.message };
  }
}

async function modifyAggregatedLoadAvgType(db) {
  try {
    const { results: aggColumns } = await db.prepare(`PRAGMA table_info(metrics_aggregated)`).all();
    const loadAvgAvgCol = aggColumns.find(c => c.name === 'load_avg_avg');
    
    if (!loadAvgAvgCol || loadAvgAvgCol.type === 'TEXT') {
      return { success: true, modified: false, message: '无需修改（列已为 TEXT 类型或不存在）' };
    }
    
    await db.prepare(`
      CREATE TABLE metrics_aggregated_temp (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        server_id TEXT NOT NULL,
        bucket INTEGER NOT NULL,
        bucket_size INTEGER NOT NULL,
        cpu_avg REAL DEFAULT 0,
        cpu_max REAL DEFAULT 0,
        ram_avg REAL DEFAULT 0,
        ram_max REAL DEFAULT 0,
        disk_avg REAL DEFAULT 0,
        disk_max REAL DEFAULT 0,
        load_avg_avg TEXT DEFAULT '0',
        net_in_speed_avg REAL DEFAULT 0,
        net_out_speed_avg REAL DEFAULT 0,
        net_rx_avg REAL DEFAULT 0,
        net_tx_avg REAL DEFAULT 0,
        processes_avg REAL DEFAULT 0,
        tcp_conn_avg REAL DEFAULT 0,
        udp_conn_avg REAL DEFAULT 0,
        ping_ct_avg REAL DEFAULT 0,
        ping_cu_avg REAL DEFAULT 0,
        ping_cm_avg REAL DEFAULT 0,
        ping_bd_avg REAL DEFAULT 0,
        ram_total_avg REAL DEFAULT 0,
        ram_used_avg REAL DEFAULT 0,
        swap_total_avg REAL DEFAULT 0,
        swap_used_avg REAL DEFAULT 0,
        disk_total_avg REAL DEFAULT 0,
        disk_used_avg REAL DEFAULT 0,
        FOREIGN KEY (server_id) REFERENCES servers(id),
        UNIQUE(server_id, bucket, bucket_size)
      )
    `).run();
    
    await db.prepare(`
      INSERT INTO metrics_aggregated_temp (
        id, server_id, bucket, bucket_size,
        cpu_avg, cpu_max, ram_avg, ram_max, disk_avg, disk_max,
        load_avg_avg, net_in_speed_avg, net_out_speed_avg,
        net_rx_avg, net_tx_avg, processes_avg, tcp_conn_avg, udp_conn_avg,
        ping_ct_avg, ping_cu_avg, ping_cm_avg, ping_bd_avg,
        ram_total_avg, ram_used_avg, swap_total_avg, swap_used_avg,
        disk_total_avg, disk_used_avg
      )
      SELECT 
        id, server_id, bucket, bucket_size,
        cpu_avg, cpu_max, ram_avg, ram_max, disk_avg, disk_max,
        CAST(load_avg_avg AS TEXT), net_in_speed_avg, net_out_speed_avg,
        net_rx_avg, net_tx_avg, processes_avg, tcp_conn_avg, udp_conn_avg,
        ping_ct_avg, ping_cu_avg, ping_cm_avg, ping_bd_avg,
        ram_total_avg, ram_used_avg, swap_total_avg, swap_used_avg,
        disk_total_avg, disk_used_avg
      FROM metrics_aggregated
    `).run();
    
    await db.prepare(`DROP TABLE metrics_aggregated`).run();
    await db.prepare(`ALTER TABLE metrics_aggregated_temp RENAME TO metrics_aggregated`).run();
    
    console.log('✅ 已成功修改 metrics_aggregated 表的 load_avg_avg 列为 TEXT 类型');
    return { success: true, modified: true, message: '已修改为 TEXT 类型' };
  } catch (e) {
    console.error('修改 metrics_aggregated 表失败:', e);
    return { success: false, error: e.message };
  }
}

export async function cleanupStaleSettings(db) {
  console.log('开始清理废弃的 settings key...');
  try {
    const stalePrefixes = ['last_write_%'];
    const staleExact = [
      'theme',
      'custom_css',
      'auto_reset_traffic',
      'last_aggregated_to_120',
      'last_aggregated_to_240',
      'last_aggregated_to_480',
      'last_aggregated_to_960',
      'last_aggregated_to_1920',
      'site_title',
      'admin_title',
      'custom_head',
      'custom_script',
      'custom_bg',
      'is_public',
      'show_price',
      'show_expire',
      'show_bw',
      'show_tf',
      'tg_notify',
      'tg_bot_token',
      'tg_chat_id'
    ];
    const staleKeysWhere = stalePrefixes.map(() => `key LIKE ?`).concat(staleExact.map(() => `key = ?`)).join(' OR ');
    const staleBindings = [...stalePrefixes, ...staleExact];
    const { meta: cleanupResult } = await db.prepare(
      `DELETE FROM settings WHERE ${staleKeysWhere}`
    ).bind(...staleBindings).run();
    if (cleanupResult.changes > 0) {
      console.log(`已清理 ${cleanupResult.changes} 个废弃的 settings key`);
    }
    return { success: true, cleaned: cleanupResult.changes };
  } catch (e) {
    console.error('清理废弃 settings key 失败:', e);
    return { success: false, error: e.message };
  }
}