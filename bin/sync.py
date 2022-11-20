import os
import sys
import os.path
import subprocess

PROFILE_NAME='default'
S3_BUCKET='www.michaellabbe.com'
DISTRIBUTION_ID='E37B4W5A3UNR7B'

def fatal(msg):
    print(msg, file=sys.stderr)
    sys.exit(1)

def run(args):
    print(' '.join(args))
    cp = subprocess.run(args, shell=False)
    if cp.returncode != 0:
        fatal("got returncode %d" % cp.returncode)

def get_site_root_path():
    script_dir = os.path.dirname(os.path.realpath(__file__))
    script_dir += "/../site"
    return os.path.abspath(script_dir)

def s3_sync():
    args = [
        'aws', 's3', 'sync',
        '--profile=' + PROFILE_NAME,
        get_site_root_path(),
        's3://%s/notebook' % S3_BUCKET, 
        '--delete', 
        '--acl', 'public-read',
    ]
    run(args)

def cloudfront_invalidate():
    args = [
        'aws', 'cloudfront', 'create-invalidation',
        '--profile=' + PROFILE_NAME,
        '--distribution-id', DISTRIBUTION_ID,
        '--path', '/notebook/*',
    ]
    run(args)

if __name__ == '__main__':
    s3_sync()
    cloudfront_invalidate()
