# AI Code Review Service

Service này cung cấp interface để gọi các API của AI Code Review Agent sử dụng axios.

## Cài đặt

Service đã được cài đặt sẵn với axios. Nếu cần cài đặt lại:

```bash
npm install axios --legacy-peer-deps
```

### Cấu hình môi trường

Tạo file `.env` trong thư mục `client` với nội dung:

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

**Hoặc** tạo file `.env.local` (sẽ được git ignore):

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

**Lưu ý quan trọng**: 
- File `.env` sẽ được commit vào git
- File `.env.local` sẽ không được commit (an toàn hơn)
- Trong Next.js, chỉ các biến bắt đầu với `NEXT_PUBLIC_` mới có thể sử dụng ở client-side

## Cách sử dụng

### 1. Import service

```typescript
import { aiCodeReviewService } from './services/api-service';
// Hoặc import các function riêng lẻ
import { reviewCode, getRules, healthCheck } from './services/api-service';
```

### 2. Sử dụng service instance

```typescript
// Health check
const health = await aiCodeReviewService.healthCheck();

// Review code
const result = await aiCodeReviewService.reviewCode({
  code: 'function hello() { console.log("Hello"); }',
  language: 'javascript'
});

// Get rules
const rules = await aiCodeReviewService.getRules('python');
```

### 3. Sử dụng các function riêng lẻ

```typescript
// Health check
const health = await healthCheck();

// Review code
const result = await reviewCode({
  code: 'def hello(): print("Hello")',
  language: 'python'
});

// Get rules
const rules = await getRules('javascript');
```

## Các API endpoints

### Health Check
- **GET** `/health` - Kiểm tra trạng thái service

### Code Review
- **POST** `/review/code` - Review code snippet
- **POST** `/review/pr` - Review GitHub PR
- **POST** `/review/upload` - Review uploaded file

### Rules Management
- **GET** `/rules` - Lấy danh sách rules
- **GET** `/rules/statistics` - Lấy thống kê rules
- **POST** `/rules/upload` - Upload custom rule

### Utilities
- **GET** `/languages` - Lấy danh sách ngôn ngữ được hỗ trợ
- **POST** `/test` - Test agent
- **POST** `/evaluate` - Đánh giá code chi tiết

## Types

Service export các TypeScript interfaces:

- `CodeReviewRequest` - Request cho code review
- `CodeReviewResponse` - Response từ code review
- `GitHubPRRequest` - Request cho GitHub PR review
- `CustomRuleRequest` - Request cho custom rule
- `RuleResponse` - Response cho rules
- `HealthCheckResponse` - Response cho health check

## Cấu hình

### Environment Variables

Service sử dụng các biến môi trường sau:

| Biến | Mô tả | Mặc định |
|------|-------|----------|
| `NEXT_PUBLIC_API_BASE_URL` | Base URL cho API service | `http://localhost:8000` |

**Lưu ý**: Trong Next.js, các biến môi trường phải bắt đầu với `NEXT_PUBLIC_` để có thể sử dụng ở client-side.

### Base URL
Service sẽ tự động lấy base URL từ biến môi trường `NEXT_PUBLIC_API_BASE_URL`. Nếu không có, sẽ sử dụng `http://localhost:8000` làm mặc định.

```typescript
// Tạo service với base URL tùy chỉnh (sẽ override biến môi trường)
const customService = new AICodeReviewService('https://api.example.com');

// Hoặc thay đổi base URL động
aiCodeReviewService.updateBaseURL('https://staging-api.example.com');

// Lấy base URL hiện tại
console.log('Current base URL:', aiCodeReviewService.getBaseURL());
```

### Timeout
Mặc định timeout là 30 giây. Có thể thay đổi trong constructor:

```typescript
const service = new AICodeReviewService('http://localhost:8000');
service.api.defaults.timeout = 60000; // 60 giây
```

## Error Handling

Service sử dụng axios interceptors để log requests và responses. Xử lý lỗi:

```typescript
try {
  const result = await aiCodeReviewService.reviewCode(request);
  console.log('Success:', result);
} catch (error: any) {
  if (error.response) {
    // Server error
    console.error('Server error:', error.response.status, error.response.data);
  } else if (error.request) {
    // Network error
    console.error('Network error:', error.message);
  } else {
    // Other error
    console.error('Unexpected error:', error.message);
  }
}
```

## Examples

Xem file `example-usage.ts` để có các ví dụ chi tiết về cách sử dụng service.

## Logging

Service tự động log:
- Tất cả requests với method và URL
- Tất cả responses với status code
- Errors trong quá trình request/response

## Lưu ý

- Service sử dụng axios với interceptors để logging
- Mặc định timeout là 30 giây
- Hỗ trợ file upload với FormData
- Có thể thay đổi base URL động
- Export cả class và các function riêng lẻ để linh hoạt

## Troubleshooting

### Service không kết nối được
1. Kiểm tra file `.env` có đúng `NEXT_PUBLIC_API_BASE_URL` không
2. Kiểm tra API server có đang chạy không
3. Kiểm tra console để xem lỗi network

### Biến môi trường không được load
1. Đảm bảo file `.env` nằm trong thư mục `client`
2. Restart Next.js development server
3. Kiểm tra tên biến có bắt đầu với `NEXT_PUBLIC_` không

### CORS errors
1. Kiểm tra API server có cho phép CORS từ domain của bạn không
2. Kiểm tra base URL có đúng không
