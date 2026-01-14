
namespace Common.Exceptions
{
    public class DuplicateException : Exception
    {
        public DuplicateException()
            : base("DuplicateException")
        {
        }

        public DuplicateException(string message)
            : base(message)
        {
        }

        public DuplicateException(string message, Exception innerException)
            : base(message, innerException)
        {
        }

        public IEnumerable<ErrorDetail> ErrorDetails { get; set; }


        public DuplicateException(string name, object key)
            : base($"Field \"{name}\" ({key}) existed.")
        {
            ErrorDetails = new[] { new ErrorDetail(name, key) };
        }
    }
}
