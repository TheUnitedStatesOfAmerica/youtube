import json
import random
import string

from aiohttp.web import Response

def bad_req(body: str) -> Response:
    return Response(status=400, body=json.dumps(body), headers={
        'Access-Control-Allow-Origin': '*',
    })

def not_found(body: str) -> Response:
    return Response(status=404, body=json.dumps(body), headers={
        'Access-Control-Allow-Origin': '*',
    })

def random_id() -> str:
    return ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(10))

def resp(msg: any, success: bool=True) -> Response:
    return Response(status=200, body=json.dumps({
        'message': msg,
        'success': success,
    }), headers={
        'Access-Control-Allow-Origin': '*',
    })
