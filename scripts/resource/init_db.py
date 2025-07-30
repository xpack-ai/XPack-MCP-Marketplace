import os
import sys
import re
from pathlib import Path
from dotenv import load_dotenv
import mysql.connector
from typing import Optional, List, Tuple, Union

# 加载环境变量
load_dotenv()

# 数据库配置
class DBConfig:
    MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
    MYSQL_PORT = int(os.getenv("MYSQL_PORT", 3306))
    MYSQL_USER = os.getenv("MYSQL_USER", "root")
    MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "123456")
    MYSQL_DB = os.getenv("MYSQL_DB", "xpack")

def get_db_connection(db_config: Optional[DBConfig] = None):
    """获取数据库连接
    
    Args:
        db_config: 数据库配置，如果为 None 则使用默认配置
        
    Returns:
        数据库连接对象
    """
    if db_config is None:
        db_config = DBConfig()
    
    return mysql.connector.connect(
        host=db_config.MYSQL_HOST,
        port=db_config.MYSQL_PORT,
        user=db_config.MYSQL_USER,
        password=db_config.MYSQL_PASSWORD,
        database=db_config.MYSQL_DB
    )

def get_current_version(db_config: Optional[DBConfig] = None) -> Optional[str]:
    """查询sys_config表中的version值
    
    Args:
        db_config: 数据库配置
        
    Returns:
        当前版本号，如果不存在则返回None
    """
    try:
        conn = get_db_connection(db_config)
        cursor = conn.cursor()
        
        # 查询version配置
        cursor.execute("SELECT value FROM sys_config WHERE `key` = 'version'")
        result = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if result and len(result) > 0:
            # 将元组的第一个元素转换为字符串并返回
            return str(result['value'] if isinstance(result, dict) else result[0])
        return None
        
    except mysql.connector.Error as err:
        # 如果表不存在或其他数据库错误，返回None
        print(f"查询版本信息失败: {err}")
        return None
    except Exception as e:
        print(f"查询版本信息出错: {e}")
        return None

def execute_sql_file(file_path: str, db_config: Optional[DBConfig] = None) -> bool:
    """执行 SQL 文件

    Args:
        file_path: SQL 文件路径
        db_config: 数据库配置，如果为 None 则使用默认配置
        
    Returns:
        执行是否成功
    """
    if db_config is None:
        db_config = DBConfig()
    
    sql = ""
    try:
        conn = get_db_connection(db_config)
        cursor = conn.cursor()
        
        # 读取 SQL 文件
        with open(file_path, 'r', encoding='utf-8') as f:
            sql_content = f.read()

        # 设置字符集
        cursor.execute('SET NAMES utf8mb4')
        # 禁用外键检查
        cursor.execute('SET FOREIGN_KEY_CHECKS = 0')

        # 执行 SQL 语句
        for statement in sql_content.split(';'):
            if statement.strip():
                sql = statement.strip()
                
                # 跳过注释行和空行
                if sql.startswith('#') or sql.startswith('--') or not sql:
                    continue
                
                # 移除行内注释
                lines = sql.split('\n')
                cleaned_lines = []
                for line in lines:
                    line = line.strip()
                    if line and not line.startswith('#') and not line.startswith('--'):
                        cleaned_lines.append(line)
                
                if not cleaned_lines:
                    continue
                    
                sql = '\n'.join(cleaned_lines)
                
                try:
                    cursor.execute(sql)
                except mysql.connector.Error as err:
                    # 检查是否是重复列错误，如果是则忽略并继续
                    if "Duplicate column name" in str(err):
                        print(f"忽略重复列错误: {err}")
                        continue
                    else:
                        print(f"执行SQL语句失败: {err}")
                        print(f"问题语句: {sql}")
                        # 回滚事务并关闭连接
                        conn.rollback()
                        cursor.close()
                        conn.close()
                        return False

        # 启用外键检查
        cursor.execute('SET FOREIGN_KEY_CHECKS = 1')
        # 提交事务
        conn.commit()
        print(f"成功执行 SQL 文件: {file_path}")
        
        cursor.close()
        conn.close()
        return True
        
    except FileNotFoundError:
        print(f"错误: SQL 文件不存在: {file_path}")
        return False
    except mysql.connector.Error as err:
        print(f"数据库错误: {err}")
        if sql:
            print(f"问题语句: {sql}")
        return False
    except Exception as e:
        print(f"执行出错: {e}")
        return False

def get_version_files(sql_dir: Path) -> List[Tuple[str, Path]]:
    """获取所有版本SQL文件并按版本号排序
    
    Args:
        sql_dir: SQL文件目录
        
    Returns:
        排序后的版本文件列表，格式为[(版本号, 文件路径), ...]
    """
    version_files = []
    
    # 查找所有version-*.sql文件
    for file_path in sql_dir.glob("version-*.sql"):
        # 提取版本号
        match = re.match(r'version-(.+)\.sql', file_path.name)
        if match:
            version_str = match.group(1)
            version_files.append((version_str, file_path))
    
    # 按版本号排序（简单的字符串排序）
    version_files.sort(key=lambda x: x[0])
    
    return version_files

def should_apply_version(current_version: Optional[str], target_version: str) -> bool:
    """判断是否需要应用指定版本的更新
    
    Args:
        current_version: 当前版本号
        target_version: 目标版本号
        
    Returns:
        是否需要应用更新
    """
    if current_version is None:
        return True
    
    # 简单的字符串比较
    return target_version > current_version

def main():
    """主函数：实现版本化数据库迁移策略"""
    print("开始数据库初始化和迁移...")
    
    # 获取项目根目录
    project_root = Path(__file__).parent
    sql_dir = project_root / 'sql'
    
    if not sql_dir.exists():
        print(f"错误: SQL目录不存在: {sql_dir}")
        sys.exit(1)
    
    # 步骤1: 查询sys_config，获取当key=version的值
    print("步骤1: 查询当前数据库版本...")
    current_version = get_current_version()
    
    # 步骤2: 当不存在该key时，执行init.sql
    if current_version is None:
        print("步骤2: 未找到版本信息，执行初始化SQL...")
        init_sql_file = sql_dir / 'init.sql'
        
        if not init_sql_file.exists():
            print(f"错误: 初始化SQL文件不存在: {init_sql_file}")
            sys.exit(1)
        
        if not execute_sql_file(str(init_sql_file)):
            print("初始化SQL执行失败")
            sys.exit(1)
        
        # 重新查询版本信息
        current_version = get_current_version()
        print(f"初始化完成，当前版本: {current_version}")
    else:
        print(f"当前数据库版本: {current_version}")
    
    # 步骤3: 获取对应的版本号
    # 步骤4: 依次读取sql下的version-*.sql文件，执行更新sql，直到所有sql执行完成
    print("步骤3-4: 检查并执行版本更新...")
    
    # 获取所有版本文件
    version_files = get_version_files(sql_dir)
    
    if not version_files:
        print("未找到版本更新文件，数据库已是最新版本")
        return
    
    print(f"找到 {len(version_files)} 个版本更新文件")
    
    # 依次执行需要的版本更新
    updated_count = 0
    for version_str, file_path in version_files:
        if should_apply_version(current_version, version_str):
            print(f"执行版本更新: {version_str} ({file_path.name})")
            
            if execute_sql_file(str(file_path)):
                print(f"版本 {version_str} 更新成功")
                current_version = version_str
                updated_count += 1
            else:
                print(f"版本 {version_str} 更新失败，停止后续更新")
                sys.exit(1)
        else:
            print(f"跳过版本 {version_str}（已应用或版本较低）")
    
    if updated_count > 0:
        print(f"数据库迁移完成，共应用了 {updated_count} 个版本更新")
        # 验证最终版本
        final_version = get_current_version()
        print(f"最终数据库版本: {final_version}")
    else:
        print("数据库已是最新版本，无需更新")
    
    print("数据库初始化和迁移流程完成！")

if __name__ == '__main__':
    main()