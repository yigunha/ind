from supabase import create_client, Client

# --- Supabase 설정 ---
# 당신이 제공한 URL과 키를 사용합니다.
SUPABASE_URL = "https://svlqqkfkmevcjssarpng.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2bHFxa2ZrbWV2Y2pzc2FycG5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NjE5MDUsImV4cCI6MjA2NjQzNzkwNX0.bB8oanmqsBtoL3H4xwczP6khaojvnu02VWmtm0xY_yM"
SUPABASE_TABLE_NAME = "users" # 데이터를 삭제할 테이블 이름

# Supabase 클라이언트 생성
try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("✅ Supabase 클라이언트가 성공적으로 연결되었습니다.")
except Exception as e:
    print(f"🚨 Supabase 연결 중 오류 발생: {e}")
    exit()

# --- 모든 데이터 삭제 함수 ---
def delete_all_data():
    """
    지정된 테이블의 모든 데이터를 삭제합니다.
    """
    print(f"\n🗑️ '{SUPABASE_TABLE_NAME}' 테이블의 모든 데이터를 삭제합니다...")
    
    # ⚠️ 경고: 이 작업은 영구적이며 복구할 수 없습니다. 계속하려면 'yes'를 입력하세요.
    confirm = input("정말로 모든 데이터를 삭제하시겠습니까? (yes/no): ")
    if confirm.lower() != 'yes':
        print("❌ 삭제 작업이 취소되었습니다.")
        return

    try:
        # 'id'가 '0'이 아닌 모든 행을 삭제하는 명령입니다.
        response = supabase.table(SUPABASE_TABLE_NAME).delete().neq('id', '0').execute()
        
        if response.data:
            print(f"✅ '{SUPABASE_TABLE_NAME}' 테이블의 모든 데이터가 성공적으로 삭제되었습니다.")
            print(f"삭제된 데이터 수: {len(response.data)}")
        else:
            print("❌ 삭제할 데이터가 없거나 삭제에 실패했습니다. (RLS 정책을 확인하세요)")
    except Exception as e:
        print(f"🚨 데이터 삭제 중 오류 발생: {e}")

# --- 메인 실행 ---
if __name__ == "__main__":
    delete_all_data()