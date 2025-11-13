'''
Business: Chat API for anonymous messages with image support
Args: event with httpMethod, body, queryStringParameters; context with request_id
Returns: HTTP response with messages or status
'''

import json
import os
import psycopg2
from typing import Dict, Any

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method == 'GET':
        conn = get_db_connection()
        cur = conn.cursor()
        
        query_params = event.get('queryStringParameters', {})
        search_query = query_params.get('search', '')
        
        if search_query:
            sql = "SELECT id, username, message, image_url, created_at FROM t_p2318644_one_shot_jupiter.messages WHERE message ILIKE '%{}%' ORDER BY created_at DESC LIMIT 50".format(search_query.replace("'", "''"))
        else:
            sql = "SELECT id, username, message, image_url, created_at FROM t_p2318644_one_shot_jupiter.messages ORDER BY created_at DESC LIMIT 50"
        
        cur.execute(sql)
        rows = cur.fetchall()
        
        messages = []
        for row in rows:
            messages.append({
                'id': row[0],
                'username': row[1],
                'message': row[2],
                'image_url': row[3],
                'created_at': row[4].isoformat() if row[4] else None
            })
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'messages': messages})
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        username = body_data.get('username', 'Аноним')
        message = body_data.get('message', '')
        image_url = body_data.get('image_url')
        
        if not message:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Message is required'})
            }
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        sql = "INSERT INTO t_p2318644_one_shot_jupiter.messages (username, message, image_url) VALUES ('{}', '{}', {}) RETURNING id".format(
            username.replace("'", "''"),
            message.replace("'", "''"),
            "'{}'".format(image_url.replace("'", "''")) if image_url else 'NULL'
        )
        
        cur.execute(sql)
        message_id = cur.fetchone()[0]
        conn.commit()
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'id': message_id, 'status': 'created'})
        }
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Method not allowed'})
    }
