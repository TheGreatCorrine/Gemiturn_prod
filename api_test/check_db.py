#!/usr/bin/env python3
"""
Database integrity checking script for Gemiturn system.

This script connects to the Gemiturn database and performs various
integrity checks to ensure data quality and consistency, particularly
for return records and their associated data.
"""

import argparse
import csv
import os
import sys
from datetime import datetime

import psycopg2
from psycopg2 import sql
from tabulate import tabulate

# Database connection settings from environment variables
DB_NAME = os.environ.get('GEMITURN_DB_NAME', 'gemiturn')
DB_USER = os.environ.get('GEMITURN_DB_USER', 'postgres')
DB_PASSWORD = os.environ.get('GEMITURN_DB_PASSWORD', '')
DB_HOST = os.environ.get('GEMITURN_DB_HOST', 'localhost')
DB_PORT = os.environ.get('GEMITURN_DB_PORT', '5432')

# Tables to check
TABLES = ['returns', 'return_history', 'products', 'vendors', 'users']

def connect_to_database():
    """
    Establish connection to the database.
    
    Returns:
        connection: PostgreSQL database connection
    """
    try:
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT
        )
        return conn
    except psycopg2.Error as e:
        print(f"Error connecting to database: {e}")
        sys.exit(1)

def check_table_exists(conn, table_name):
    """
    Check if a table exists in the database.
    
    Args:
        conn: Database connection
        table_name (str): Name of the table to check
        
    Returns:
        bool: True if the table exists, False otherwise
    """
    with conn.cursor() as cur:
        cur.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = %s
            );
        """, (table_name,))
        return cur.fetchone()[0]

def check_data_integrity(conn, table, verbose=False, fix=False):
    """
    Perform data integrity checks on a table.
    
    Args:
        conn: Database connection
        table (str): Name of the table to check
        verbose (bool): Whether to print detailed information
        fix (bool): Whether to attempt fixing issues
        
    Returns:
        dict: Results of integrity checks
    """
    results = {
        'table': table,
        'total_records': 0,
        'issues_found': 0,
        'issues_fixed': 0,
        'details': []
    }
    
    with conn.cursor() as cur:
        # Get total record count
        cur.execute(sql.SQL("SELECT COUNT(*) FROM {}").format(sql.Identifier(table)))
        results['total_records'] = cur.fetchone()[0]
        
        if verbose:
            print(f"Checking {results['total_records']} records in {table}...")
        
        # Table-specific checks
        if table == 'returns':
            # Check for missing product IDs
            cur.execute("""
                SELECT id, order_id, product_id 
                FROM returns 
                WHERE product_id IS NULL OR product_id = ''
            """)
            missing_product_ids = cur.fetchall()
            
            for record in missing_product_ids:
                issue = {
                    'id': record[0],
                    'issue': 'Missing product ID',
                    'details': f"Order ID: {record[1]}"
                }
                results['issues_found'] += 1
                results['details'].append(issue)
                
                if fix:
                    # Generate a placeholder product ID
                    new_product_id = f"UNKNOWN_{record[0]}"
                    cur.execute("""
                        UPDATE returns
                        SET product_id = %s
                        WHERE id = %s
                    """, (new_product_id, record[0]))
                    issue['fixed'] = True
                    results['issues_fixed'] += 1
            
            # Check for invalid return statuses
            valid_statuses = ['pending', 'processing', 'completed', 'rejected']
            cur.execute("""
                SELECT id, status 
                FROM returns 
                WHERE status NOT IN %s
            """, (tuple(valid_statuses),))
            invalid_statuses = cur.fetchall()
            
            for record in invalid_statuses:
                issue = {
                    'id': record[0],
                    'issue': 'Invalid status',
                    'details': f"Status: {record[1]}"
                }
                results['issues_found'] += 1
                results['details'].append(issue)
                
                if fix:
                    cur.execute("""
                        UPDATE returns
                        SET status = 'pending'
                        WHERE id = %s
                    """, (record[0],))
                    issue['fixed'] = True
                    results['issues_fixed'] += 1
        
        # Common checks for all tables
        # Check for records with created_at in the future
        if 'created_at' in get_table_columns(conn, table):
            cur.execute(sql.SQL("""
                SELECT id, created_at 
                FROM {} 
                WHERE created_at > NOW()
            """).format(sql.Identifier(table)))
            future_dates = cur.fetchall()
            
            for record in future_dates:
                issue = {
                    'id': record[0],
                    'issue': 'Future creation date',
                    'details': f"Date: {record[1]}"
                }
                results['issues_found'] += 1
                results['details'].append(issue)
                
                if fix:
                    cur.execute(sql.SQL("""
                        UPDATE {}
                        SET created_at = NOW()
                        WHERE id = %s
                    """).format(sql.Identifier(table)), (record[0],))
                    issue['fixed'] = True
                    results['issues_fixed'] += 1
        
        if fix and results['issues_fixed'] > 0:
            conn.commit()
    
    return results

def get_table_columns(conn, table_name):
    """
    Get list of columns for a table.
    
    Args:
        conn: Database connection
        table_name (str): Name of the table
        
    Returns:
        list: Column names
    """
    with conn.cursor() as cur:
        cur.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = %s
        """, (table_name,))
        return [row[0] for row in cur.fetchall()]

def export_results(results, filename):
    """
    Export check results to a CSV file.
    
    Args:
        results (list): List of check results
        filename (str): Output filename
        
    Returns:
        str: Path to the created file
    """
    if not filename.endswith('.csv'):
        filename += '.csv'
        
    with open(filename, 'w', newline='') as csvfile:
        writer = csv.writer(csvfile)
        
        # Write header
        writer.writerow(['Table', 'Total Records', 'Issues Found', 'Issues Fixed', 'Issue Type', 'ID', 'Details'])
        
        # Write data
        for result in results:
            if not result['details']:
                writer.writerow([
                    result['table'], 
                    result['total_records'], 
                    result['issues_found'], 
                    result['issues_fixed'],
                    '', '', ''
                ])
            else:
                for detail in result['details']:
                    writer.writerow([
                        result['table'], 
                        result['total_records'], 
                        result['issues_found'], 
                        result['issues_fixed'],
                        detail['issue'],
                        detail['id'],
                        detail['details']
                    ])
    
    return filename

def main():
    """Main function to parse arguments and execute checks."""
    parser = argparse.ArgumentParser(description='Check Gemiturn database integrity')
    parser.add_argument('--table', type=str, help='Specific table to check')
    parser.add_argument('--verbose', action='store_true', help='Show detailed output')
    parser.add_argument('--fix', action='store_true', help='Attempt to fix issues')
    parser.add_argument('--export', type=str, help='Export results to CSV file')
    
    args = parser.parse_args()
    
    # Connect to database
    conn = connect_to_database()
    
    # Determine tables to check
    tables_to_check = []
    if args.table:
        if check_table_exists(conn, args.table):
            tables_to_check = [args.table]
        else:
            print(f"Error: Table '{args.table}' does not exist.")
            sys.exit(1)
    else:
        tables_to_check = [table for table in TABLES if check_table_exists(conn, table)]
    
    # Run checks
    all_results = []
    total_issues = 0
    total_fixed = 0
    
    for table in tables_to_check:
        results = check_data_integrity(conn, table, args.verbose, args.fix)
        all_results.append(results)
        total_issues += results['issues_found']
        total_fixed += results['issues_fixed']
        
        if args.verbose:
            print(f"Found {results['issues_found']} issues in {table}")
            if results['details']:
                for detail in results['details']:
                    status = "Fixed" if detail.get('fixed', False) else "Not fixed"
                    print(f"  - {detail['issue']} (ID: {detail['id']}) - {status}")
    
    # Summary
    summary_table = []
    for result in all_results:
        summary_table.append([
            result['table'],
            result['total_records'],
            result['issues_found'],
            result['issues_fixed']
        ])
    
    print("\nDatabase Check Summary:")
    print(tabulate(summary_table, headers=['Table', 'Records', 'Issues', 'Fixed']))
    print(f"\nTotal: {total_issues} issues found, {total_fixed} fixed")
    
    # Export results if requested
    if args.export:
        export_path = export_results(all_results, args.export)
        print(f"Results exported to {export_path}")
    
    # Close connection
    conn.close()

if __name__ == "__main__":
    main() 