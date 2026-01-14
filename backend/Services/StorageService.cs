using Common.Exceptions;
using OnlineClassroomManagement.Models.Responses.Storage;
namespace OnlineClassroomManagement.Services
{
    public interface IStorageService
    {
        Task<StorageUploadResponse> UploadFileAsync(IFormFile file, string bucketName, string? folder = null, string? fileName = null);
        Task<bool> DeleteFileAsync(string filePath, string bucketName);
        string GetPublicUrl(string filePath, string bucketName);
        Task<byte[]> DownloadFileAsync(string filePath, string bucketName);
        string? ExtractFilePathFromUrl(string? publicUrl, string bucketName);
    }

    public class StorageService : IStorageService
    {
        private readonly Supabase.Client _supabase;

        public StorageService(Supabase.Client supabase)
        {
            _supabase = supabase;
        }

        /// <summary>
        /// Upload file lên Supabase Storage
        /// </summary>
        public async Task<StorageUploadResponse> UploadFileAsync(IFormFile file, string bucketName, string? folder = null, string? fileName = null)
        {
            try
            {
                // Chuẩn hóa tên file (loại bỏ ký tự đặc biệt)
                string fileNameToUse = string.IsNullOrEmpty(fileName) ? file.FileName : fileName;
                string sanitizedFileName = SanitizeFileName(fileNameToUse);

                // Tạo đường dẫn file
                string filePath = string.IsNullOrEmpty(folder)
                    ? sanitizedFileName
                    : $"{folder}/{sanitizedFileName}";

                // Đọc stream thành byte array
                byte[] fileBytes = GetFileBytes(file);

                // Upload file
                string response = await _supabase.Storage
                    .From(bucketName)
                    .Upload(fileBytes, filePath, new Supabase.Storage.FileOptions
                    {
                        CacheControl = "3600",
                        Upsert = true // Ghi đè file cũ
                    });

                // Lấy public URL
                string publicUrl = GetPublicUrl(filePath, bucketName);
                return new StorageUploadResponse
                {
                    FilePath = filePath,
                    PublicUrl = publicUrl,
                };
            }
            catch (Exception ex)
            {
                throw new CustomException(ExceptionCode.NotAllowUpdate, $"Upload thất bại: {ex.Message}");
            }
        }

        /// <summary>
        /// Xóa file
        /// </summary>
        public async Task<bool> DeleteFileAsync(string filePath, string bucketName)
        {
            try
            {
                await _supabase.Storage
                    .From(bucketName)
                    .Remove(filePath);

                return true;
            }
            catch
            {
                return false;
            }
        }

        /// <summary>
        /// Lấy public URL của file
        /// </summary>
        public string GetPublicUrl(string filePath, string bucketName)
        {
            string publicUrl = _supabase.Storage
                .From(bucketName)
                .GetPublicUrl(filePath);

            return publicUrl;
        }

        /// <summary>
        /// Download file
        /// </summary>
        public async Task<byte[]> DownloadFileAsync(string filePath, string bucketName)
        {
            byte[] fileBytes = await _supabase.Storage
                .From(bucketName)
                .Download(filePath, null);

            return fileBytes;
        }

        /// <summary>
        /// Chuyển file sang mảng byte
        /// </summary>
        private static byte[] GetFileBytes(IFormFile file)
        {
            // open the stream and copy file content into it
            // return array of Bytes
            using MemoryStream ms = new MemoryStream();
            file.CopyTo(ms);
            return ms.ToArray();
        }

        /// <summary>
        /// Chuẩn hóa tên file: loại bỏ ký tự đặc biệt, chuyển Unicode sang ASCII
        /// </summary>
        private string SanitizeFileName(string fileName)
        {
            if (string.IsNullOrWhiteSpace(fileName))
                return fileName;

            // Tách tên file và extension
            string extension = Path.GetExtension(fileName);
            string nameWithoutExt = Path.GetFileNameWithoutExtension(fileName);

            // Chuyển Unicode về ASCII (loại bỏ dấu tiếng Việt)
            nameWithoutExt = RemoveVietnameseDiacritics(nameWithoutExt);

            // Thay thế khoảng trắng và ký tự đặc biệt bằng dấu gạch ngang
            nameWithoutExt = System.Text.RegularExpressions.Regex.Replace(nameWithoutExt, @"[^a-zA-Z0-9_-]", "-");

            // Loại bỏ nhiều dấu gạch ngang liên tiếp
            nameWithoutExt = System.Text.RegularExpressions.Regex.Replace(nameWithoutExt, @"-+", "-");

            // Loại bỏ dấu gạch ngang ở đầu và cuối
            nameWithoutExt = nameWithoutExt.Trim('-');

            // Thêm timestamp để tránh trùng lặp (optional)
            nameWithoutExt = $"{nameWithoutExt}_{DateTime.UtcNow.Ticks}";

            return $"{nameWithoutExt}{extension}";
        }

        /// <summary>
        /// Loại bỏ dấu tiếng Việt
        /// </summary>
        private string RemoveVietnameseDiacritics(string text)
        {
            if (string.IsNullOrWhiteSpace(text))
                return text;

            var normalizedString = text.Normalize(System.Text.NormalizationForm.FormD);
            var stringBuilder = new System.Text.StringBuilder();

            foreach (var c in normalizedString)
            {
                var unicodeCategory = System.Globalization.CharUnicodeInfo.GetUnicodeCategory(c);
                if (unicodeCategory != System.Globalization.UnicodeCategory.NonSpacingMark)
                {
                    stringBuilder.Append(c);
                }
            }

            return stringBuilder.ToString().Normalize(System.Text.NormalizationForm.FormC);
        }

        /// <summary>
        /// Extract file path from public URL
        /// Example: https://xxx.supabase.co/storage/v1/object/public/bucket-name/folder/file.png -> folder/file.png
        /// </summary>
        public string? ExtractFilePathFromUrl(string? publicUrl, string bucketName)
        {
            if (string.IsNullOrWhiteSpace(publicUrl))
                return null;

            try
            {
                var uri = new Uri(publicUrl);
                var path = uri.AbsolutePath;
                
                // Path format: /storage/v1/object/public/{bucketName}/{filePath}
                var prefix = $"/storage/v1/object/public/{bucketName}/";
                
                if (path.StartsWith(prefix))
                {
                    return path.Substring(prefix.Length);
                }

                // Fallback: try to extract after bucket name
                var bucketIndex = path.IndexOf($"/{bucketName}/");
                if (bucketIndex >= 0)
                {
                    return path.Substring(bucketIndex + bucketName.Length + 2);
                }

                return null;
            }
            catch
            {
                return null;
            }
        }
    }
}