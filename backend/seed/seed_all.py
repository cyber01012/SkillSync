"""One command to seed both databases."""
import sys
import os

seed_path = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(seed_path, '..'))

from seed.seed_sqlserver import seed_all as seed_sql
from seed.seed_mongodb import seed_all as seed_mongo


def main():
    print("\n" + "="*70)
    print("  SKILLSYNC AI — FULL DATABASE SEED")
    print("  SQL Server + MongoDB")
    print("="*70)
    
    seed_sql()
    seed_mongo()
    
    print("\n" + "🎉"*35)
    print("  ALL DATABASES SEEDED — READY FOR DEVELOPMENT")
    print("🎉"*35)


if __name__ == "__main__":
    main()