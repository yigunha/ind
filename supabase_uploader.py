import pandas as pd
from supabase import create_client, Client
import bcrypt
import os
import tkinter as tk
from tkinter import filedialog
import sys # 이 줄을 추가했습니다.

# --- Supabase 설정 ---
# 이제 환경 변수 대신 값을 직접 여기에 입력합니다. (주의: 보안에 민감한 정보)
# 아래 URL과 KEY는 .env.local 파일에서 가져온 실제 값입니다.
SUPABASE_URL = "https://svlqqkfkmevcjssarpng.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2bHFxa2ZrbWV2Y2pzc2FycG5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NjE5MDUsImV4cCI6MjA2NjQzNzkwNX0.bB8oanmqsBtoL3H4xwczP6khaojvnu02VWmtm0xY_yM"
SUPABASE_TABLE_NAME = "users" # Supabase에 생성한 테이블 이름

def hash_password(password):
    """bcrypt를 사용하여 비밀번호를 해싱합니다."""
    # 솔트(salt)를 생성하고 비밀번호를 해싱합니다.
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    return hashed.decode('utf-8')  # 저장하기 위해 문자열로 디코딩합니다.

def upload_data_to_supabase(excel_file_path):
    """
    Excel 파일을 읽고, 비밀번호를 해싱한 후, 데이터를 Supabase에 업로드합니다.
    """
    try:
        # 1. Excel 파일 읽기
        df = pd.read_excel(excel_file_path)

        # 필수 컬럼 확인
        required_columns = ['username', 'password', 'role']
        if not all(col in df.columns for col in required_columns):
            print("오류: Excel 파일에 'username', 'password', 'role' 컬럼이 모두 포함되어야 합니다.")
            return

        # 2. 비밀번호 해싱 및 데이터 준비
        data_to_insert = []
        for index, row in df.iterrows():
            username = row['username']
            password = str(row['password']) # 비밀번호를 문자열로 강제 변환
            role = row['role']
            hashed_password = hash_password(password) # 비밀번호 해싱

            data_to_insert.append({
                "username": username,
                "password": hashed_password,
                "role": role
            })

        # 3. Supabase에 데이터 삽입
        print(f"'{SUPABASE_TABLE_NAME}' 테이블에 {len(data_to_insert)}개의 레코드를 Supabase에 업로드 중...")
        response = supabase.table(SUPABASE_TABLE_NAME).insert(data_to_insert).execute()

        # Supabase 응답에서 오류 확인
        if response.data:
            print("데이터가 성공적으로 업로드되었습니다!")
            # print(response.data) # 삽입된 데이터 확인을 위해 주석 해제
        elif response.error:
            print(f"데이터 업로드 중 오류 발생: {response.error}")
        else:
            print("Supabase로부터 데이터나 오류 응답을 받지 못했습니다. 연결 또는 테이블을 확인하세요.")

    except FileNotFoundError:
        print(f"오류: Excel 파일이 '{excel_file_path}' 경로에 없습니다.")
    except pd.errors.EmptyDataError:
        print("오류: Excel 파일이 비어 있습니다.")
    except Exception as e:
        print(f"예상치 못한 오류가 발생했습니다: {e}")

if __name__ == "__main__":
    # Supabase 클라이언트 초기화
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Tkinter 루트 윈도우 생성 (숨김)
    root = tk.Tk()
    root.withdraw() # 메인 Tkinter 창을 숨깁니다.

    # 실행 파일의 디렉토리를 기본 경로로 설정
    if getattr(sys, 'frozen', False): # PyInstaller로 빌드된 경우
        current_dir = os.path.dirname(sys.executable)
    else: # 스크립트 상태로 실행하는 경우
        current_dir = os.path.dirname(os.path.abspath(__file__))

    print("업로드할 Excel 파일을 선택해주세요...")
    excel_file_path = filedialog.askopenfilename(
        title="업로드할 Excel 파일 선택",
        initialdir=current_dir, # 실행 파일의 위치를 기본 디렉토리로 설정
        filetypes=[("Excel files", "*.xlsx *.xls")]
    )

    if excel_file_path:
        upload_data_to_supabase(excel_file_path)
    else:
        print("파일 선택이 취소되었습니다.")

    print("Enter 키를 눌러 종료하세요...")
    input() # 사용자가 Enter 키를 누를 때까지 기다림