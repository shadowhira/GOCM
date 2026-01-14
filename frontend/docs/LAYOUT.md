# 🎓 Hệ thống quản lý lớp học trực tuyến (PTIT-OCM)


# 📐 Layout

## 1. Header (chung cho toàn hệ thống)

**Bên trái (khi ở Dashboard):** không hiển thị gì (ẩn dropdown, ẩn toggle, ẩn nút Home).

**Bên trái (khi ở Class Detail):** từ trái sang phải:

1. **Nút toggle sidebar** — thu gọn / mở rộng sidebar (mở = icon + text, thu gọn = chỉ icon).
2. **Dropdown tên lớp** — hiển thị tên lớp hiện tại; nhấn sẽ xổ thông tin cơ bản của lớp (ảnh cover, mô tả ngắn, số thành viên, giáo viên phụ trách).
3. **Nút Home (Dashboard)** — icon nhà (🏠). Nhấn về **Dashboard** (khi về Dashboard thì Sidebar sẽ ẩn).

**Ở giữa:** thanh tìm kiếm (quick switch) với các filter tab: All / Class / Document / Assignment / Member / ...

**Bên phải:** icon thông báo (🔔), dropdown chọn ngôn ngữ, avatar user (menu account global).

---

## 2. Sidebar (chung cho toàn hệ thống)

* **Dashboard:** ẩn hoàn toàn.
* **Class Detail:** hiển thị module của lớp (mở = icon + text; thu gọn = chỉ icon):

  1. Bảng tin
  2. Bài tập trên lớp
  3. Điểm
  4. Phòng học trực tuyến
  5. Tài liệu
  6. Thành viên
  7. Cửa hàng
  8. Cài đặt

(Nút toggle trên header điều khiển trạng thái mở/thu gọn này.)

---

## 3. Main Content

* **Dashboard view:** list card các lớp (có phân trang), mỗi card bao gồm (ảnh cover, tên, môn, giáo viên, số thành viên, nút “Vào lớp”).
* **Class Detail view:** nội dung module đang chọn (hiện tại để tạm placeholder rỗng, sẽ triển khai chi tiết sau).

---


# 🖼 Wireframe Layout


### 1. Dashboard View (chưa chọn lớp)

```
+-----------------------------------------------------------------------------------+
|                               HEADER                                              |
| [       ]   [ Quick Search (All | Class | Doc | Assign | Member...) ]     [🔔][🌐][👤] |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|                          MAIN CONTENT: DASHBOARD                                  |
|                                                                                   |
|  +-------------------+   +-------------------+   +-------------------+             |
|  |   Cover Image     |   |   Cover Image     |   |   Cover Image     |             |
|  |   Class Name      |   |   Class Name      |   |   Class Name      |             |
|  |   Teacher         |   |   Teacher         |   |   Teacher         |             |
|  |   #Members        |   |   #Members        |   |   #Members        |             |
|  |   [Enter Class]   |   |   [Enter Class]   |   |   [Enter Class]   |             |
|  +-------------------+   +-------------------+   +-------------------+             |
|                                                                                   |
+-----------------------------------------------------------------------------------+
```


* **Header trái:** trống.
* **Sidebar:** ẩn.
* **Main content:** list card lớp học.

---

### 2. Class Detail View (khi đã chọn lớp)

```
+-----------------------------------------------------------------------------------+
|                               HEADER                                              |
| [≡] [▼ Class Name v] [🏠]   [ Quick Search (All | Class | Doc | Assign | Member...) ]  [🔔][🌐][👤] |
+--------------------+----------------------------------------------------------------+
|                    |                                                                |
|     SIDEBAR        |                         MAIN CONTENT                           |
|                    |                                                                |
|  [📢] Bảng tin      |   (Hiển thị nội dung module đang chọn, ví dụ: Bảng tin,        |
|  [📚] Bài tập       |    Bài tập, Điểm, Tài liệu, Thành viên...)                     |
|  [📝] Điểm          |                                                                |
|  [🎥] Lớp trực tuyến|                                                                |
|  [📂] Tài liệu      |                                                                |
|  [👥] Thành viên    |                                                                |
|  [🛒] Cửa hàng      |                                                                |
|  [⚙️] Cài đặt       |                                                                |
|                    |                                                                |
+--------------------+----------------------------------------------------------------+
```

* **Header trái:** có 3 nút → `[≡]` toggle sidebar, `[🏠]` về Dashboard, `[▼ Class Name v]` dropdown thông tin lớp.
* **Sidebar:** có 2 chế độ

  * **Expand:** icon + text.
  * **Collapse:** chỉ icon (khi nhấn nút `[≡]`).
* **Main content:** module chi tiết của lớp.

---

👉 Như vậy khi ở **Dashboard**: đơn giản, sidebar ẩn, header gọn.
👉 Khi ở **Class Detail**: sidebar hiện ra (expand/collapse), header trái đủ 3 nút điều hướng.

---

