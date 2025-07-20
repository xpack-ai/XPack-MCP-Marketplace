import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import mysql.connector
from typing import Optional

# 加载环境变量
load_dotenv()

# 数据库配置
class DBConfig:
    MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
    MYSQL_PORT = int(os.getenv("MYSQL_PORT", 3306))
    MYSQL_USER = os.getenv("MYSQL_USER", "root")
    MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "123456")
    MYSQL_DB = os.getenv("MYSQL_DB", "xpack")

def execute_sql_file(file_path: str, db_config: Optional[DBConfig] = None) -> None:
    """执行 SQL 文件

    Args:
        file_path: SQL 文件路径
        db_config: 数据库配置，如果为 None 则使用默认配置
    """
    if db_config is None:
        db_config = DBConfig()
    print(db_config.MYSQL_HOST, db_config.MYSQL_PORT, db_config.MYSQL_USER, db_config.MYSQL_PASSWORD, db_config.MYSQL_DB)
    # 连接数据库
    conn = mysql.connector.connect(
        host=db_config.MYSQL_HOST,
        port=db_config.MYSQL_PORT,
        user=db_config.MYSQL_USER,
        password=db_config.MYSQL_PASSWORD,
        database=db_config.MYSQL_DB
    )
    cursor = conn.cursor()
    sql = ""
    try:
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
                sql = statement
                cursor.execute(statement)

        # 启用外键检查
        cursor.execute('SET FOREIGN_KEY_CHECKS = 1')
        # 提交事务
        conn.commit()
        print(f"成功执行 SQL 文件: {file_path}")
    except FileNotFoundError:
        print(f"错误: SQL 文件不存在: {file_path}")
        sys.exit(1)
    except mysql.connector.Error as err:
        # 输出语句
        print(f"数据库错误: {err}, 语句: {sql}")
        sys.exit(1)
    except Exception as e:
        print(f"执行出错: {e}")
        sys.exit(1)
    finally:
        # 关闭连接
        cursor.close()
        conn.close()

def main():
    # 获取项目根目录
    project_root = Path(__file__).parent
    
    # SQL 文件路径（优先使用 scripts/resource/db.sql，如果不存在则使用 docs/db.sql）
    sql_paths = [
        project_root / 'sql' / 'init.sql'
    ]
    print(sql_paths)
    sql_file = next((path for path in sql_paths if path.exists()), None)
    if not sql_file:
        print("错误: 未找到 init.sql 文件")
        sys.exit(1)

    execute_sql_file(str(sql_file))

if __name__ == '__main__':
    main()