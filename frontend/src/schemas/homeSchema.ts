import z from "zod";

export const homeSchema = z.object({
  username: z
    .string() // 1. Phải là chuỗi (string)
    .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự."), // 2. Kiểm tra độ dài

  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự."),
});
