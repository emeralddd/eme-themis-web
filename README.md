# Eme Themis Web

Website nạp bài thông qua mạng LAN/WAN sử dụng trình chấm Themis.

## Cài đặt

1. Đảm bảo máy đã cài Node.js

2. Xóa đuôi `.example` của file `.env.example`

3. Mở file `.env` lên và gõ một dãy kí tự bất kì sau SECRET_TOKEN; nhập PORT cho ứng dụng (thường là 80, 8080, 3000)

4. Xóa đuôi `.example` của file `database/data.json`

5. Tại thư mục chính (thư mục chứa file package.json), khởi động cmd lên và nhập `npm install`

6. Chạy file run.cmd

7. Trỏ thư mục nạp bài trực tuyến vào \uploads

8. Website nạp bài ở địa chỉ `localhost:{PORT}` với PORT là cổng đã nhập trong file .env

### OBZIRALD NETWORK