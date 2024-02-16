# ECTEST Backend Exam

本專案為應徵迅易檢測的後端項目，已完成所有必要與加分項目內容，包含：

- 整個過程**無使用**任何AI工具，包含但不限於：ChatGPT、Github Copilot等
- 使用docker提供一致、可進版控、開箱即用的系統環境，包含：正式環境(express)、開發環境(express, postgres, redis)
- 100% TypeScript, 並適時使用泛型，在保證type safe的前提下使程式更靈活(可參考`src/core/utils.ts`, `src/core/guard.ts`, `src/core/validator.ts`)
- 使用幾乎最嚴格的tsconfig規則，並搭配eslint/prettier，確保程式碼品質與一致的格式
- 適時運用各種best practice, clean code, design pattern，確保專案架構/程式碼品質、可讀性、維護性、可測試性等
- 使用dpdm.js檢查專案是否有循環引用問題(circular dependency)
- RESTful風格的API端點
- 對功能性函式撰寫單元測試
- 使用helmet.js對Response Headers做基礎安全設定
- 使用express-rate-limit保護API端點防止DDoS攻擊
- 使用Drizzle ORM，在保證type safe的前提下，以非常接近SQL語法的方式操作資料庫(可參考`core/album/service.ts`)
- 以Passport.js實作的登入註冊系統(實作細節位於`src/auth/authenticator.ts`)
- 使用Redis作為SessionStore
- 自行手刻的簡易Guard, Validator模組(實作細節位於`src/core`)，允許開發者用簡單明瞭的API界面，一次替各個不同的controller做使用者權限與資料欄位驗證(使用方式可參考`src/photo/route.ts`, `src/photo/guard.ts`, `src/photo/validator.ts`)
- 實作Albums的CRUD
- 實作Photos的CRUD，允許上傳/下載相片
- 實現串流程式設計，在最大化效能的同時，也省去須先建立暫時檔案後再將其刪除的多餘操作
  - 自行實現Buffer與Stream機制來上傳相片
  - 允許使用者一次下載相簿裡的所有相片，並一邊壓縮檔案一邊將結果串流給使用者下載
- 在新增相片時，允許使用者一次上傳多張相片，並使用批次寫入增進資料庫效能
- 簡易Logger，http-logging實作(`src/logger.ts`, `src/middlewares/http-logging.ts`)

## Usage

1. clone & get into the project

```bash
$ git clone https://github.com/rabbit19981023/ectest-express
$ cd ectest-express
```

2. generate dev SSL certificates for localhost:

```bash
# we use mkcert for simply making locally-trusted dev certificates.
$ apt-get install mkcert

# create trusted local CA
$ mkcert -install

# create certificates for localhost
$ mkcert localhost


Created a new certificate valid for the following names 📜
 - "localhost"

The certificate is at "./localhost.pem" and the key at "./localhost-key.pem" ✅
```

### [**Recommended**] Setup with Docker

Using docker to simply setup our services in just few steps:

```bash
# use default environment variables (Even no need to modify! We have setup dev postgres & redis for you!)
$ cp .env.example .env

# IMPORTANT!:
# create uploads/ before running docker services to prevent volumes permission issues
$ mkdir uploads

# build & run all docker services in background
$ docker compose up -d

# run database migrations in dev server
$ docker compose exec express-dev sh -c "npm i && npm run migration:run"
```

The API server is available at https://localhost now!

To inspect the logs of the production API server, run:

```bash
$ docker compose attach express-prod
```

To view all logs of the production API server, run:

```bash
$ docker compose logs express-prod
```

To get into express-prod container, run:

```bash
$ docker compose exec -it express-prod sh
```

To get into express-dev container, run:

```bash
$ docker compose exec -it express-dev fish
```

To shutdown all docker services, run:

```bash
$ docker compose down
```

### Setup without docker (requires Node.js v20.6.0+):

```bash
# install dependencies
$ npm i

# prepare your environment variables
$ cp .env.example .env

# run database migrations
$ npm run migration:run

# build source code
$ npm run build

# leave production-only dependencies in node_modules/
$ npm ci --omit=dev

# run server
$ node --env-file=.env dist/main.js
```

### Other useful scripts:

```bash
# build from source & run server
$ npm run start

# run dev server
$ npm run dev

# build from source
$ npm run build

# run code lint
$ npm run lint

# run type checking
$ npm run type-check

# run circular dependency checking
$ npm run circular-dep-check

# run unit tests
$ npm run test:unit
```

## API Endpoints

> NOTE: If you are
> 1. using mkcert to generate locally-trusted dev certs
> 2. using postman to test API endpoints

> Then you need to manually add CA cert file for postman:
> 1. run `$ mkcert -CAROOT` to get CA cert files location
> 2. open postman settings -> Certificates -> turn on CA Certificates and select PEM file: `<your_CAROOT>/rootCA.pem`

### Auth

Login:

```bash
POST /api/v1/auth/login
Content-Type: application/x-www-form-urlencoded

Body
email: string;
password: string;
```

Signup:

```bash
POST /api/v1/auth/signup
Content-Type: application/x-www-form-urlencoded

Body
email: string;
password: string;
role?: "user" (default) | "admin";
```

Logout:

```bash
GET /api/v1/auth/logout
```

### Albums

Find current user's all albums (login required):

```bash
GET /api/v1/albums
```

Find a current user's album (login required):

```bash
GET /api/v1/albums/:id
```

Create an album for current user (login required):

```bash
POST /api/v1/albums
Content-Type: application/x-www-form-urlencoded

Body
title: string;
```

Update a current user's album (login required):

```bash
PUT /api/v1/albums/:id
Content-Type: application/x-www-form-urlencoded

Body
title: string;
```

Delete a current user's album (login required):

```bash
DELETE /api/v1/albums/:id
```

### Photos

Find all photos in specified album (login required):

```bash
GET /api/v1/albums/:albumId/photos
```

Find a photo in specified album (login required):

```bash
GET /api/v1/albums/:albumId/photos/:id
```

Create one or multiple photos in specified album (login required):

```bash
POST /api/v1/albums/:albumId/photos
Content-Type: multipart/form-data

Body
files: File | File[];
descriptions: {
  "<filename 01>": "<description 01>",
  "<filename 02>": "<description 02>",
  ...
} satisfies JSONString;
```

Update a photo in specified album (login required):

```bash
PUT /api/v1/albums/:albumId/photos/:id
Content-Type: multipart/form-data

Body
file?: File;
description?: {
  "<filename>": "<description>"
} satisfies JSONString;
```

Delete a photo in specified album (login required):

```bash
DELETE /api/v1/albums/:albumId/photos/:id
```

### Download Photo(s)

Download all photos in specified album (login required):

```bash
GET /download/albums/:albumId/photos
```

Download one photo in specified album (login required):

```bash
GET /download/albums/:albumId/photos/:id
```
