import subprocess
import sys

VPS_HOST = "187.124.137.134"
VPS_USER = "root"
VPS_PASS = "Beschimbiounair2026"
DB_PASS = "BescSecureRoot2026!"

def run(cmd):
    print(f"\n>>> {cmd}")
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if result.stdout:
        print(result.stdout)
    if result.stderr:
        print(result.stderr)
    return result.returncode

try:
    import paramiko
    USE_PARAMIKO = True
except ImportError:
    USE_PARAMIKO = False

if USE_PARAMIKO:
    print("Using paramiko for SSH...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(VPS_HOST, username=VPS_USER, password=VPS_PASS)
    
    commands = [
        ("Pulling latest code", "cd /opt/BESC && git pull origin main"),
        ("Running migration 016", f"cd /opt/BESC && docker compose exec -T db mysql -u root -p{DB_PASS} competition_platform < backend/database/migrations/016_alter_teams_add_ig_tiktok.sql"),
        ("Rebuilding containers", "cd /opt/BESC && docker compose --env-file .env up -d --build"),
        ("Checking status", "cd /opt/BESC && docker compose ps"),
    ]
    
    for i, (desc, cmd) in enumerate(commands, 1):
        print(f"\n[{i}/{len(commands)}] {desc}...")
        stdin, stdout, stderr = ssh.exec_command(cmd)
        out = stdout.read().decode()
        err = stderr.read().decode()
        if out:
            print(out)
        if err:
            print(err)
    
    ssh.close()
    print("\n" + "="*50)
    print("  Deploy Complete!")
    print("  Website: https://beschimbio.online")
    print("="*50)
else:
    print("paramiko not found, installing...")
    subprocess.run([sys.executable, "-m", "pip", "install", "paramiko"], capture_output=True)
    print("Please run this script again.")
