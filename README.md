# Insurance Claim Extractor

Một ứng dụng React.js chuyên nghiệp để trích xuất dữ liệu từ các đơn yêu cầu bồi thường bảo hiểm sử dụng AI/OCR.

## 🛠️ Cài đặt và chạy

### Yêu cầu hệ thống
- Node.js 16+ 
- npm hoặc yarn
- 2GB RAM (cho Tesseract.js)

### Cài đặt dependencies
```bash
cd insurance-claim-processor
npm install
```

### Chạy ứng dụng (Development)
```bash
npm start
```
Ứng dụng sẽ chạy tại: http://localhost:3000

### Bước 2: Upload tài liệu bảo hiểm
- Kéo thả hoặc click để chọn file
- Hỗ trợ: PDF, PNG, JPEG
- Giới hạn: 20MB, tối đa 10 trang PDF
- Preview tự động cho file được chọn

### Bước 3: Xử lý và xem kết quả
- Hệ thống tự động xử lý OCR
- Hiển thị progress bar với các bước
- Kết quả được hiển thị trong 3 tab:
  - **Summary**: Thông tin quan trọng
  - **Structured Data**: Bảng chi tiết tất cả trường
  - **Raw Text**: Text gốc được trích xuất

### Bước 4: Export dữ liệu
- Copy JSON: Sao chép dữ liệu JSON vào clipboard
- Download JSON: Tải file JSON về máy
- Export CSV: Xuất dữ liệu dạng bảng CSV

## 📋 Dữ liệu bảo hiểm được trích xuất

Hệ thống tự động nhận diện và trích xuất các loại thông tin sau từ đơn yêu cầu bồi thường:

### 🔖 Thông tin Hợp đồng bảo hiểm
- **Số hợp đồng** (Policy Number): Mã định danh hợp đồng
- **Tên công ty bảo hiểm** (Insurer Name): Nhà cung cấp bảo hiểm
- **Loại sản phẩm** (Product): Loại hình bảo hiểm

### 👤 Thông tin Người yêu cầu bồi thường
- **Họ và tên** (Full Name): Tên đầy đủ của người được bảo hiểm
- **Ngày sinh** (Date of Birth): DD/MM/YYYY hoặc MM/DD/YYYY
- **Số điện thoại** (Phone): Số liên lạc
- **Email**: Địa chỉ email
- **Địa chỉ** (Address): Địa chỉ thường trú
- **Số CMND/CCCD** (ID Number): Số định danh cá nhân

### 🚨 Thông tin Sự cố
- **Ngày xảy ra** (Incident Date): Ngày sự cố bảo hiểm
- **Thời gian** (Time): Giờ xảy ra sự cố
- **Địa điểm** (Place): Nơi xảy ra sự cố
- **Loại tổn thất** (Type of Loss): Phân loại sự cố
- **Mô tả chi tiết** (Description): Diễn biến sự việc

### 💰 Chi tiết Yêu cầu bồi thường
- **Số tiền yêu cầu** (Amount Claimed): Giá trị bồi thường
- **Đơn vị tiền tệ** (Currency): VND, USD, EUR, etc.
- **Số tiền khấu trừ** (Deductible): Phần tự chịu

### 🏦 Thông tin Thanh toán
- **Tên ngân hàng** (Bank Name): Ngân hàng nhận tiền
- **Tên tài khoản** (Account Name): Chủ tài khoản
- **Số tài khoản** (Account Number): STK nhận bồi thường
- **Mã IBAN** (IBAN): Mã quốc tế (nếu có)

### 👨‍💼 Thông tin Đại lý/Giám định
- **Tên đại lý** (Agent Name): Đại lý xử lý hồ sơ
- **Mã đại lý** (Agent Code): Mã số đại lý
- **Tên giám định viên** (Adjuster Name): Người giám định

### ✍️ Thông tin Ủy quyền
- **Chữ ký** (Signature Present): Xác nhận có chữ ký
- **Ngày ký** (Signed Date): Ngày ký đơn

### 📊 Thông tin Xử lý
- **Độ tin cậy** (Confidence): 0-100% cho mỗi trường
- **Thời gian xử lý** (Processing Time): Milliseconds
- **Engine sử dụng**: API Service hoặc Tesseract.js
- **Lỗi và cảnh báo**: Validation issues

## 📁 Định dạng file được hỗ trợ

### Hình ảnh
- **PNG**: Độ phân giải cao, trong suốt
- **JPEG/JPG**: Nén tốt, phù hợp với ảnh chụp
- **Kích thước tối đa**: 20MB
- **Chất lượng khuyến nghị**: 300 DPI trở lên

### PDF
- **Trang tối đa**: 10 trang
- **Kích thước tối đa**: 20MB
- **Hỗ trợ**: Text-based và Image-based PDF
- **Tự động convert**: PDF → Images → OCR

## 🚀 Tính năng chính

- **Xử lý tài liệu đa định dạng**: Hỗ trợ PDF, PNG, JPEG (tối đa 20MB, 10 trang PDF)
- **OCR/AI Processing**: Tích hợp Tesseract.js với khả năng fallback khi API service không khả dụng
- **Trích xuất dữ liệu có cấu trúc**: Tự động parse các trường quan trọng theo schema chuẩn
- **UI/UX hiện đại**: Thiết kế responsive với TailwindCSS và shadcn/ui
- **Xử lý lỗi thông minh**: Validation đầu vào, retry logic, và hướng dẫn khắc phục
- **Export linh hoạt**: Copy JSON, tải file JSON, export CSV

## 📋 Kiến trúc hệ thống

### Frontend Stack
- **React 18** với Hooks và Function Components
- **TailwindCSS** cho styling hiện đại
- **React Query (TanStack)** cho state management và caching
- **React Hook Form + Zod** cho form validation
- **Lucide React** cho icons
- **React Dropzone** cho file upload
- **Framer Motion** cho animations

### OCR/AI Pipeline
```
File Upload → Validation → PDF→Images → OCR (Service/Tesseract) → Text Parsing → JSON Schema → Display
```

### Luồng xử lý
1. **File Validation**: Kiểm tra định dạng, kích thước, số trang
2. **Document Conversion**: PDF → images (nếu cần)
3. **OCR Processing**: 
   - Ưu tiên API service (`/api/extract`)
   - Fallback sang Tesseract.js cục bộ
4. **Data Parsing**: Heuristics + RegEx để extract fields
5. **Result Formatting**: Theo Insurance Claim Schema chuẩn

### Yêu cầu chất lượng
- ✅ **Tốt**: Text rõ ràng, không bị mờ
- ✅ **Khuyến nghị**: Font size ≥ 10pt
- ✅ **Contrast cao**: Text đen trên nền trắng
- ❌ **Tránh**: Ảnh bị nghiêng, mờ, hoặc độ phân giải thấp

## 🔧 Cấu hình kỹ thuật

### OCR Engine Priority
1. **API Service** (Ưu tiên): `/api/extract` - Nhanh, chính xác
2. **Tesseract.js** (Fallback): Local processing - Chậm hơn nhưng offline

### Performance
- **Thời gian xử lý**: 2-15 giây tùy kích thước file
- **Memory usage**: ~100-500MB khi xử lý
- **Browser support**: Chrome, Firefox, Safari, Edge (modern versions)

### Build production
```bash
npm run build
```

## 🔧 Troubleshooting

### Các vấn đề thường gặp

**1. Ứng dụng không khởi động được**
```bash
# Xóa node_modules và cài lại
rm -rf node_modules package-lock.json
npm install
npm start
```

**2. Upload file bị lỗi**
- Kiểm tra kích thước file < 20MB
- Đảm bảo định dạng đúng (PDF/PNG/JPEG)
- Thử upload file khác để test

**3. OCR không chính xác**
- Sử dụng ảnh chất lượng cao (300+ DPI)
- Đảm bảo text rõ ràng, contrast cao
- Thử xoay ảnh nếu bị nghiêng

**4. API service không hoạt động**
- Ứng dụng tự động fallback sang Tesseract.js
- Kiểm tra network connection
- Tắt "Use API Service" trong Settings

## 🔧 Cải thiện độ chính xác OCR

### 🚀 AI Services được hỗ trợ (Recommended)

**Tier 1 - Độ chính xác cao (90-95%)**
- **OpenAI GPT-4 Vision**: Hiểu context tốt nhất, xử lý tiếng Việt
- **Google Document AI**: Chuyên dụng cho forms, tables
- **Claude 3 Vision**: Reasoning tốt, ít lỗi hallucination

**Tier 2 - Độ chính xác khá (80-90%)**
- **Azure Form Recognizer**: Pre-trained cho insurance forms
- **AWS Textract**: Tốt cho forms và signatures

**Tier 3 - Free/Local (60-80%)**
- **PaddleOCR**: Free, support tiếng Việt tốt
- **EasyOCR**: Light-weight, decent accuracy
- **Tesseract.js**: Backup hiện tại

### 🖼️ Cải thiện chất lượng ảnh

**Tự động preprocessing:**
- ✅ Upscaling resolution (target 300 DPI)
- ✅ Deskew correction (sửa ảnh bị nghiêng)
- ✅ Noise reduction (giảm nhiễu)
- ✅ Contrast normalization (cân bằng độ tương phản)
- ✅ Edge enhancement (làm rõ text)

**Khuyến nghị chụp ảnh:**
- 📱 Chụp thẳng, không nghiêng
- 💡 Ánh sáng đều, tránh bóng đổ
- 📏 Đầy đủ khung form, không bị cắt
- 🔍 Focus rõ, không bị mờ
- 📄 Nền phẳng, không bị nhăn

### 🧠 Enhanced Text Parsing

**Multi-pattern matching:**
- Regex patterns cho tiếng Việt + English
- Context-aware field extraction
- Section-based confidence scoring
- Quality validation cho từng field

**Field confidence scoring:**
- 🟢 **90-100%**: Rất chắc chắn
- 🟡 **70-89%**: Khá tin cậy
- 🔴 **< 70%**: Cần review lại

### Debug mode
```bash
# Chạy với debug logs
REACT_APP_DEBUG=true npm start
```

### Cấu trúc dự án
```
src/
├── components/           # UI Components
│   ├── UploadDropzone.js
│   ├── ProcessingStatus.js
│   └── ResultsTabs.js
├── features/extract/     # Extraction logic
│   ├── extractor.js
│   └── parsers/
│       └── insuranceClaim.js
├── hooks/                # Custom hooks
│   └── useExtraction.js
├── lib/                  # Utilities
│   ├── pdf.js           # PDF handling
│   ├── ocr.js           # Tesseract integration
│   ├── utils.js         # General utilities
│   └── validators.js    # Zod schemas
└── App.js               # Main application
```

## 📊 Schema trích xuất dữ liệu

Ứng dụng trích xuất dữ liệu theo schema chuẩn JSON:

```json
{
  "document": {
    "type": "insurance_claim_form",
    "sourceFile": "claim_form.pdf",
    "pageCount": 1,
    "extractedAt": "2025-01-01T00:00:00Z"
  },
  "claim": {
    "policy": {
      "policyNumber": {"value": "POL123456", "confidence": 0.95},
      "insurerName": {"value": "ABC Insurance", "confidence": 0.90}
    },
    "claimant": {
      "fullName": {"value": "John Doe", "confidence": 0.92},
      "dateOfBirth": {"value": "01/01/1990", "confidence": 0.88},
      "phone": {"value": "+1234567890", "confidence": 0.85},
      "email": {"value": "john@example.com", "confidence": 0.90}
    },
    "incident": {
      "date": {"value": "15/03/2024", "confidence": 0.95},
      "description": {"value": "Vehicle accident...", "confidence": 0.75}
    },
    "claimDetails": {
      "amountClaimed": {"value": "$5,000", "confidence": 0.90}
    }
  }
}
```

## 🔧 Cấu hình

### Settings Panel
Nhấn biểu tượng Settings để cấu hình:
- **Use API Service**: Bật/tắt gọi API service
- **Service Endpoint**: URL endpoint (mặc định: `/api/extract`)

### Environment Variables (tuỳ chọn)
```bash
REACT_APP_API_ENDPOINT=/api/extract
REACT_APP_MAX_FILE_SIZE=20971520  # 20MB
REACT_APP_MAX_PDF_PAGES=10
```

## 🧪 API Contract (Mock/Real Service)

### POST /api/extract
**Request:**
```
Content-Type: multipart/form-data
- file: File (PDF/PNG/JPEG)
- docType: "insurance_claim_form"
```

**Response (200):**
```json
{
  "document": {...},
  "claim": {...},
  "tables": [...],
  "rawText": "...",
  "processing": {...}
}
```

**Error Responses:**
- `400`: Invalid file format
- `413`: File too large
- `422`: Unsupported layout
- `500`: Internal processing error

## 📈 Trạng thái và Loading

### UI States
- **Empty**: Hướng dẫn sử dụng
- **Loading**: Progress bar + spinner
- **Success**: Hiển thị kết quả
- **Error**: Thông báo lỗi + retry button

### Error Handling
- File validation errors
- OCR processing errors  
- API service errors
- Network timeouts

## 🎯 Tiêu chí chấp nhận

✅ **Đã hoàn thành:**
- [x] Upload file PDF/JPG/PNG với validation
- [x] Preview thumbnail cho file đã chọn
- [x] Progress indicator trong quá trình xử lý
- [x] Fallback từ API service sang Tesseract.js
- [x] Hiển thị kết quả theo tabs (Summary/Structured/Raw)
- [x] Copy JSON và Download JSON/CSV
- [x] Error handling với hướng dẫn khắc phục
- [x] Responsive design cho mobile/tablet

## 🔮 Tính năng mở rộng (Bonus)

🚧 **Có thể phát triển thêm:**
- [ ] Highlight vùng field trên PDF (bounding boxes)
- [ ] Multi-page PDF selection
- [ ] Lưu lịch sử xử lý (localStorage)
- [ ] Real-time collaboration
- [ ] Batch processing multiple files
- [ ] Integration với Cloud AI services (Google Document AI, AWS Textract)

## 🐛 Troubleshooting

### Lỗi thường gặp

**1. OCR không chính xác**
- Đảm bảo ảnh rõ nét, độ phân giải cao
- Thử xoay ảnh nếu bị nghiêng
- Sử dụng PDF thay vì ảnh scan

**2. File upload failed**
- Kiểm tra kích thước file < 20MB
- Đảm bảo định dạng đúng (PDF/PNG/JPEG)
- Thử upload file khác để test

**3. API service không hoạt động**
- Ứng dụng tự động fallback sang Tesseract.js
- Kiểm tra network connection
- Tắt "Use API Service" trong Settings

## 📄 License

MIT License - See LICENSE file for details.

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📞 Support

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra [Troubleshooting](#-troubleshooting)
2. Mở issue trên GitHub
3. Contact: support@insuranceclaimextractor.com

---

**Phiên bản:** 1.0.0  
**Cập nhật lần cuối:** January 2025  
**Tác giả:** Insurance Claim Extractor Team
# ExtractedForm
