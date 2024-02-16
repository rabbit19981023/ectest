# Gallery RESTful API Service

此專案起初是為了應徵某軟體公司的後端測試題目，然而該職缺很快就關閉了。於是決定來挑戰自己，將開發好的專案進行全面重構，採用將成為ECMAScript標準的裝飾器語法(目前已進入stage 3，且從TypeScript 5開始原生支援，詳情可見[tc39](https://github.com/tc39/proposal-decorators))，並應用各種開發和設計原則，在合理範圍內確保高水準的專案架構、程式碼品質和可讀性，同時也使得程式碼更容易擴充、修改和維護。

題目大致上為：開發一個管理使用者相簿的後端API服務，題目中所有必要、加分項目皆已完成。

- 為測試自己的真實能力，100%獨立開發，且整個過程**無使用**任何AI工具，包含但不限於：ChatGPT、Github Copilot等
- 使用docker提供一致、可進版控、開箱即用的系統環境，包含：正式環境(express)、開發環境(express, postgres, redis)
- 100% 使用ES6+語法
- 100% TypeScript, 並適時運用泛型，使程式更嚴謹且靈活(可參考`src/core/utils.ts`)
- 使用幾乎最嚴格的tsconfig規則，並搭配eslint/prettier，確保程式碼品質與格式的一致性
- 適時應用各種best practice, clean code, design pattern等觀念，確保專案架構、程式碼品質、可讀性、維護性、可測試性等
- 符合物件導向SOLID原則、並實現裝飾器、依賴注入、控制反轉等設計模式，使程式碼更簡潔，更容易擴充、修改、維護(寫法範例可參考`src/album/controller.ts`, 裝飾器實作細節位於`src/core/decorators/`)
- 使用dpdm.js檢查是否存在循環引用問題(circular dependency)
- RESTful風格的API端點
- 對功能性函式撰寫單元測試(`src/core/utils.spec.ts`, `src/auth/utils.spec.ts`)
- 使用helmet.js對Response Headers做基礎安全設定
- 使用express-rate-limit保護API端點防止DDoS攻擊
- 使用Drizzle ORM，在保證type safe的前提下，以非常接近SQL語法的方式操作資料庫(可參考`src/album/service.ts`)
- 以Passport.js實作的登入註冊系統(實作細節位於`src/auth/authenticator.ts`)
- 使用Redis作為SessionStore
- 實作Albums的CRUD
- 實作Photos的CRUD，允許上傳/下載相片
- 實現串流程式設計，在最大化效能的同時，也省去須先建立暫時檔案後再將其刪除的多餘操作
  - 實現Buffer與Stream機制來上傳相片
  - 允許使用者一次下載相簿裡的所有相片，並一邊壓縮檔案一邊將結果串流給使用者下載
- 在新增相片時，允許使用者一次上傳多張相片，並使用批次寫入增進資料庫效能
- 實作簡易Logger、http-logging(`src/core/logger.ts`, `src/middlewares/http-logging.ts`)

## Usage

1. clone & get into the project

```bash
$ git clone https://github.com/rabbit19981023/gallery-rest-api
$ cd gallery-rest-api
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
} satisfies JSONString; # for example: {"1.jpg": "description 1", "2.jpg": "description 2"}
```

Update a photo in specified album (login required):

```bash
PUT /api/v1/albums/:albumId/photos/:id
Content-Type: multipart/form-data

Body
file?: File;
description?: string;
```

Delete a photo in specified album (login required):

```bash
DELETE /api/v1/albums/:albumId/photos/:id
```

### Download Photo(s)

Download all photos in specified album (login required):

```bash
GET /api/v1/download/albums/:albumId/photos
```

Download one photo in specified album (login required):

```bash
GET /api/v1/download/albums/:albumId/photos/:id
```
