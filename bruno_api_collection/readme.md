# Bruno API Collection — Todo App

Open this folder in [Bruno](https://www.usebruno.com/).

## Setup

1. Start the backend: `cd backend && pnpm run dev` (port `8000`)
2. In Bruno: **Open Collection** → select `bruno_api_collection`
3. Select environment **Local**
4. Set `email` / `password` in the environment (or keep the defaults)

## Suggested test order

1. **Auth → Register** (skip if user already exists)
2. **Auth → Login** — stores `access_token` cookie
3. **Auth → Me** — confirms cookie auth
4. **Categories → List Categories** — auto-sets `categoryId` (Tasks)
5. **Todos → Create Todo** — auto-sets `todoId`
6. Try toggle / my-day / move / update
7. **Auth → Logout** — then Me should return 401

## Auth note

This API uses an HTTP-only JWT cookie (`access_token`), not Bearer tokens.
Bruno saves cookies from Login and sends them on later requests automatically.
