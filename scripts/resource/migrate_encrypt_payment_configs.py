"""
One-time migration: encrypt plaintext payment channel configs at rest.

Usage:
  python scripts/resource/migrate_encrypt_payment_configs.py [--dry-run] [--limit N] [--ids alipay,wechat,stripe]

Requirements:
  - Environment variable PAYMENT_CONFIG_SECRET_KEY must be set to a base64-encoded 32-byte key.
  - cryptography library installed.
"""

import argparse
import sys
from typing import List
from datetime import datetime, timezone

from services.common.database import SessionLocal
from services.common.models.payment_channel import PaymentChannel
from services.common.utils.secure_config import is_encrypted, decrypt_config, encrypt_config


def migrate_configs(dry_run: bool = False, limit: int = 0, only_ids: List[str] | None = None) -> int:
    db = SessionLocal()
    migrated = 0
    try:
        query = db.query(PaymentChannel)
        if only_ids:
            query = query.filter(PaymentChannel.id.in_(only_ids))
        rows = query.all()
        if limit and len(rows) > limit:
            rows = rows[:limit]

        for row in rows:
            raw = row.config
            if not raw:
                continue
            if is_encrypted(raw):
                # already encrypted
                continue
            cfg = decrypt_config(raw)
            if cfg is None:
                # cannot parse plaintext json; skip but report
                print(f"[WARN] Skip {row.id}: config not JSON or decrypt failed")
                continue
            try:
                enc = encrypt_config(cfg)
            except Exception as e:
                print(f"[ERROR] Encrypt {row.id} failed: {e}")
                continue
            if dry_run:
                print(f"[DRY-RUN] Would encrypt {row.id}")
            else:
                row.config = enc
                row.updated_at = datetime.now(timezone.utc)
                db.add(row)
                migrated += 1
        if not dry_run and migrated:
            db.commit()
        print(f"Done. Migrated {migrated} rows. Dry-run={dry_run}")
        return migrated
    finally:
        db.close()


def main():
    parser = argparse.ArgumentParser(description="Encrypt legacy payment channel configs")
    parser.add_argument("--dry-run", action="store_true", help="Do not write changes, only report")
    parser.add_argument("--limit", type=int, default=0, help="Limit number of rows to process")
    parser.add_argument("--ids", type=str, default="", help="Comma-separated channel ids to process")
    args = parser.parse_args()

    only_ids = [x.strip() for x in args.ids.split(",") if x.strip()] if args.ids else None
    try:
        migrate_configs(dry_run=args.dry_run, limit=args.limit, only_ids=only_ids)
    except Exception as e:
        print(f"Migration failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()