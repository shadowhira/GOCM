# PTIT Online Classroom Management

Hướng dẫn thiết lập nhanh cho cả backend (.NET 8) và frontend (Next.js 15).

## Yêu cầu
- .NET 8 SDK
- Node.js 20+ và npm (hoặc pnpm/yarn)
- PostgreSQL (local hoặc từ dịch vụ cloud như Supabase)

## Backend (`/backend`)
1) Cấu hình
   - Sao chép `appsettings.json.example` thành `appsettings.json` rồi điều chỉnh:
     - ConnectionStrings: `DefaultConnection` → chuỗi PostgreSQL của bạn (local/cloud).
     - `JwtSettings.Key`, `Supabase.Key`, `EmailSettings.ApiKey` (Sendgrid), `Livekit.Secret` → thay bằng khóa riêng.
2) Khởi tạo DB
   - Từ thư mục `backend`: `dotnet ef database update`.
3) Chạy backend
   - `dotnet run`.

## Frontend (`/frontend`)
1) Cấu hình
   - Sao chép `env.example` thành `.env` và điền:
     - `NEXT_PUBLIC_API_BASE` → URL backend (ví dụ `http://localhost:5171`).
     - `NEXT_PUBLIC_QUIZ_API_BASE` → nếu không dùng, có thể để trống.
2) Chạy dev
   - Từ thư mục `frontend`: `npm install` → `npm run dev`.
   - Production: `npm run build` → `npm start`.

## Quiz service (`/quiz_service`) (nếu muốn test tạo câu hỏi bằng AI)
1) Cấu hình
   - Sao chép `.env.example` thành `.env`, điền các khóa: `LLAMA_PARSE_API_KEY`, `OPENROUTER_API_KEY` (hoặc `GOOGLE_API_KEY`/`OPENAI_API_KEY`), `NEO4J_*`, `REDIS_URL`.
2) Khởi chạy phụ trợ
   - Từ thư mục `quiz_service`: `docker-compose up -d` (Neo4j + Redis).
3) Chạy API
   - Cài deps: `pip install -r requirements.txt`.
   - Dev: `uvicorn app.main:app --reload` (mặc định `0.0.0.0:8000`).

## Seed dữ liệu demo
- Từ thư mục `backend`: `dotnet run -- --seed-demo` (dùng Bogus, tự dừng sau khi nạp dữ liệu).
- Nếu seed lại: drop database rồi chạy lại `dotnet ef database update` và lệnh seed.
- Tài khoản demo: `thanhoc890@gmail.com` / `123456` (đã vào mọi lớp, có điểm và vật phẩm). Frontend có nút Quick login sẵn.

## Tài nguyên chính
- Cấu hình backend: [backend/appsettings.json.example](backend/appsettings.json.example) (đổi khóa khi deploy).
- Cấu hình frontend: [frontend/env.example](frontend/env.example).

