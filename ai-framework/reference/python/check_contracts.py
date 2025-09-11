#!/usr/bin/env python3
"""
Contract Integrity Check - Python Reference Implementation
Based on: ai-framework/specs/contract-integrity.md
"""

import hashlib
import json
import sys
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Tuple

# Configuration
HASH_FILE = ".contract-hashes"
CONTRACT_PATTERNS = [
    "api/*.yaml",
    "api/*.yml", 
    "database/*.sql",
    "proto/*.proto",
    "graphql/*.graphql",
    "schemas/*.json"
]

class Colors:
    """ANSI color codes for terminal output"""
    RED = '\033[91m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    RESET = '\033[0m'

def print_header():
    """Print check header"""
    print(f"{Colors.BLUE}========================================={Colors.RESET}")
    print(f"{Colors.BLUE}CONTRACT INTEGRITY CHECK{Colors.RESET}")
    print(f"{Colors.BLUE}Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{Colors.RESET}")
    print(f"{Colors.BLUE}========================================={Colors.RESET}")
    print()

def calculate_file_hash(filepath: Path) -> str:
    """Calculate SHA256 hash of a file"""
    sha256_hash = hashlib.sha256()
    with open(filepath, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def find_contract_files(patterns: List[str]) -> List[Path]:
    """Find all files matching contract patterns"""
    contract_files = []
    
    for pattern in patterns:
        # Handle both relative and absolute patterns
        if '/' in pattern:
            base_dir = Path(pattern.split('/')[0])
            file_pattern = '/'.join(pattern.split('/')[1:])
        else:
            base_dir = Path('.')
            file_pattern = pattern
            
        if base_dir.exists():
            contract_files.extend(base_dir.glob(file_pattern))
    
    # Remove duplicates and sort
    contract_files = sorted(set(contract_files))
    return contract_files

def load_existing_hashes(hash_file: Path) -> Dict[str, str]:
    """Load existing contract hashes from file"""
    if not hash_file.exists():
        return {}
    
    try:
        with open(hash_file, 'r') as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        print(f"{Colors.YELLOW}Warning: Could not read hash file{Colors.RESET}")
        return {}

def save_hashes(hashes: Dict[str, str], hash_file: Path):
    """Save contract hashes to file"""
    with open(hash_file, 'w') as f:
        json.dump(hashes, f, indent=2, sort_keys=True)

def check_contracts() -> Tuple[bool, List[str]]:
    """
    Check contract integrity
    Returns: (success, list_of_violations)
    """
    hash_file = Path(HASH_FILE)
    
    # Find contract files
    contract_files = find_contract_files(CONTRACT_PATTERNS)
    
    if not contract_files:
        print(f"{Colors.YELLOW}No contract files found matching patterns:{Colors.RESET}")
        for pattern in CONTRACT_PATTERNS:
            print(f"  - {pattern}")
        print(f"{Colors.YELLOW}Define contracts to enable integrity checking.{Colors.RESET}")
        return True, []
    
    print(f"{Colors.GREEN}Found {len(contract_files)} contract files{Colors.RESET}")
    
    # Load existing hashes
    existing_hashes = load_existing_hashes(hash_file)
    
    # First run - initialize hashes
    if not existing_hashes:
        print(f"{Colors.YELLOW}WARNING: No contract hashes found. Initializing...{Colors.RESET}")
        
        new_hashes = {}
        for filepath in contract_files:
            relative_path = str(filepath)
            file_hash = calculate_file_hash(filepath)
            new_hashes[relative_path] = file_hash
            print(f"  Hashed: {relative_path}")
        
        save_hashes(new_hashes, hash_file)
        print(f"\n{Colors.GREEN}Contract hashes initialized and frozen.{Colors.RESET}")
        print(f"File: {hash_file}")
        return True, []
    
    # Check integrity
    print(f"{Colors.CYAN}Checking contract integrity...{Colors.RESET}")
    violations = []
    checked = 0
    
    # Check existing files
    for filepath in contract_files:
        relative_path = str(filepath)
        current_hash = calculate_file_hash(filepath)
        
        if relative_path not in existing_hashes:
            violations.append(f"NEW FILE: {relative_path} (not in baseline)")
        elif current_hash != existing_hashes[relative_path]:
            violations.append(f"MODIFIED: {relative_path}")
        else:
            checked += 1
    
    # Check for deleted files
    for path in existing_hashes:
        if not Path(path).exists():
            violations.append(f"DELETED: {path}")
    
    # Report results
    if violations:
        print(f"\n{Colors.RED}× CONTRACT VIOLATION DETECTED!{Colors.RESET}")
        print()
        print(f"{Colors.RED}Changed contracts:{Colors.RESET}")
        for violation in violations:
            print(f"{Colors.RED}  - {violation}{Colors.RESET}")
        print()
        print(f"{Colors.RED}STOP: Contract changes require approval{Colors.RESET}")
        print(f"{Colors.YELLOW}Run Contract Change Request (CCR) process or revert changes{Colors.RESET}")
        return False, violations
    else:
        print(f"{Colors.GREEN}✓ All contracts verified ({checked} files unchanged){Colors.RESET}")
        print(f"{Colors.GREEN}Contract integrity maintained{Colors.RESET}")
        return True, []

def main():
    """Main entry point"""
    print_header()
    
    success, violations = check_contracts()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()