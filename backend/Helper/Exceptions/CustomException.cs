
namespace Common.Exceptions
{
    public enum ExceptionCode
    {
        Invalidate = 1,
        NotFound = 2,
        Duplicate = 3,
        LoginFailed = 4,
        NotAllowUpdate = 5,
        UnKnow = 999,
        Unauthorized = 401,
        NotAllowJoinRoom = 402,
        InternalServerError = 500,
        BadRequest = 400,
    }

    public class ErrorDetail
    {
        public string Key { get; }
        public dynamic Value { get; }

        public ErrorDetail(string key, dynamic value)
        {
            Key = key;
            Value = value;
        }
    }
    public class CustomException : Exception
    {
        public ExceptionCode Code { get; }

        public IEnumerable<string> Errors { get; }
        public IEnumerable<ErrorDetail> ErrorDetails { get; }

        public CustomException(ExceptionCode code, string message, IEnumerable<ErrorDetail>? errorDetails = null) : base(message)
        {
            Code = code;
            Errors = new List<string>() { message };
            ErrorDetails = errorDetails ?? new List<ErrorDetail>();
        }

        public CustomException(ExceptionCode code, IEnumerable<string>? errors = null, IEnumerable<ErrorDetail>? errorDetails = null) : base("")
        {
            Code = code;
            Errors = errors ?? new List<string>();
            ErrorDetails = errorDetails ?? new List<ErrorDetail>();
        }
        public CustomException(ExceptionCode code, ErrorDetail errorDetail) : base("")
        {
            Code = code;
            Errors = new List<string>();
            ErrorDetails = new List<ErrorDetail>() { errorDetail };
        }
        public CustomException(ExceptionCode code, string message, ErrorDetail errorDetail) : base("")
        {
            Code = code;
            Errors = new List<string>() { message };
            ErrorDetails = new List<ErrorDetail>() { errorDetail };
        }

        /// <summary>
        /// Creates a CustomException with an i18n error key for frontend translation
        /// </summary>
        /// <param name="code">Exception code</param>
        /// <param name="errorKey">Translation key (e.g., "error_user_not_logged_in")</param>
        /// <param name="fallbackMessage">Fallback message if translation not found</param>
        public static CustomException WithKey(ExceptionCode code, string errorKey, string? fallbackMessage = null)
        {
            return new CustomException(code, fallbackMessage ?? errorKey, new ErrorDetail("errorKey", errorKey));
        }
    }

    public class CustomExceptionResponse
    {
        public ExceptionCode Code { get; }

        public IEnumerable<string> Errors { get; }
        public IEnumerable<ErrorDetail> ErrorDetails { get; }

        public CustomExceptionResponse(ExceptionCode code, IEnumerable<string>? errors = null, IEnumerable<ErrorDetail>? errorDetails = null)
        {
            Code = code;
            Errors = errors ?? new List<string>();
            ErrorDetails = errorDetails ?? new List<ErrorDetail>();
        }
    }

    public class CustomExceptionDetailResponse
    {
        public ExceptionCode Code { get; }

        public IDictionary<string, string[]> Errors { get; }
        public IEnumerable<ErrorDetail> ErrorDetails { get; }

        public CustomExceptionDetailResponse(ExceptionCode code, IDictionary<string, string[]>? errors = null, IEnumerable<ErrorDetail>? errorDetails = null)
        {
            Code = code;
            Errors = errors ?? new Dictionary<string, string[]>();
            ErrorDetails = errorDetails ?? new List<ErrorDetail>();
        }
    }
}
