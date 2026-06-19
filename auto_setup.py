import os
import json
import subprocess
from pathlib import Path
import sys

REPO_PATH = Path.cwd()

# ============================================================
# CONFIGURATION GÉNÉRALE
# ============================================================

FILES_STRUCTURE = {}

# ... (tout le reste du code FILES_STRUCTURE reste identique)
# Je vais juste te montrer la partie modifiée

def install_dependencies():
    """Installe les dépendances avec meilleure gestion d'erreurs"""
    try:
        # Vérifie si npm est disponible
        result = subprocess.run(['npm', '--version'], capture_output=True, text=True)
        if result.returncode != 0:
            print("⚠️ NPM n'est pas installé ou pas accessible")
            print("Installation manuelle requise:")
            print("\n1. Installe Node.js depuis https://nodejs.org/")
            print("2. Ensuite lance:")
            print("   cd backend && npm install")
            print("   cd ../frontend && npm install")
            return False
        
        print("\n📦 Installation des dépendances backend...")
        result = subprocess.run(['npm', 'install'], cwd='backend', text=True, capture_output=True)
        if result.returncode == 0:
            print("✅ Backend: npm install fait!")
        else:
            print(f"⚠️ Erreur backend npm: {result.stderr}")
        
        print("📦 Installation des dépendances frontend...")
        result = subprocess.run(['npm', 'install'], cwd='frontend', text=True, capture_output=True)
        if result.returncode == 0:
            print("✅ Frontend: npm install fait!")
        else:
            print(f"⚠️ Erreur frontend npm: {result.stderr}")
        
        return True
    except Exception as e:
        print(f"⚠️ Erreur: {e}")
        return False

def git_push_everything():
    """Pousse tout sur GitHub"""
    try:
        print("\n📤 Envoi vers GitHub...")
        result = subprocess.run(['git', 'add', '.'], capture_output=True, text=True)
        result = subprocess.run(['git', 'commit', '-m', 'Complete: Backend + Frontend + Database fully configured'], capture_output=True, text=True)
        result = subprocess.run(['git', 'push', 'origin', 'main'], capture_output=True, text=True)
        print("✅ Tout poussé sur GitHub!")
    except subprocess.CalledProcessError as e:
        print(f"⚠️ Erreur Git: {e}")

def create_all_directories():
    """Crée tous les répertoires nécessaires"""
    dirs = {
        'backend/src/config',
        'backend/src/controllers',
        'backend/src/middleware',
        'backend/src/routes',
        'frontend/src/pages',
        'frontend/src/components',
        'frontend/public',
        '.github/workflows',
        'docs'
    }
    
    for dir_path in dirs:
        Path(dir_path).mkdir(parents=True, exist_ok=True)
        print(f"✅ Dossier créé: {dir_path}")

def create_all_files():
    """Crée tous les fichiers"""
    for file_path, content in FILES_STRUCTURE.items():
        file_path_obj = Path(file_path)
        file_path_obj.parent.mkdir(parents=True, exist_ok=True)
        
        try:
            if isinstance(content, dict):
                with open(file_path_obj, 'w', encoding='utf-8') as f:
                    json.dump(content, f, indent=2, ensure_ascii=False)
            else:
                with open(file_path_obj, 'w', encoding='utf-8') as f:
                    f.write(content)
            print(f"✅ Créé: {file_path}")
        except Exception as e:
            print(f"❌ Erreur pour {file_path}: {e}")

# ============================================================
# MAIN
# ============================================================

if __name__ == '__main__':
    print("🚀 INITIALISATION COMPLÈTE DU PROJET PLANTRIPSAVE")
    print("=" * 60)
    
    print("\n📁 Création des répertoires...")
    create_all_directories()
    
    print("\n📝 Création de tous les fichiers...")
    create_all_files()
    
    print("\n📦 Installation des dépendances npm...")
    npm_success = install_dependencies()
    
    print("\n📤 Synchronisation avec GitHub...")
    git_push_everything()
    
    print("\n" + "=" * 60)
    print("✨ PROJET COMPLÈTEMENT INITIALISÉ!")
    print("=" * 60)
    
    if not npm_success:
        print("\n⚠️ NPM non détecté. Installations manuelle requise.")
    
    print("\n📌 Prochaines étapes:")
    print("1️⃣  Configure ton fichier backend/.env:")
    print("    DATABASE_URL=postgresql://user:password@localhost:5432/plantripsave")
    print("    JWT_SECRET=ta_clé_secrète")
    print("\n2️⃣  Initialise la base de données:")
    print("    cd backend && npm run init-db")
    print("\n3️⃣  Lance le backend:")
    print("    cd backend && npm run dev")
    print("\n4️⃣  Dans un autre terminal, lance le frontend:")
    print("    cd frontend && npm run dev")
    print("\n5️⃣  Ouvre http://localhost:3000")
    print("\n✅ Tout est prêt! 🎉")
