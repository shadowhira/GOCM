

namespace Common.Exceptions
{
    public class NotFoundException : Exception
    {
        public NotFoundException()
            : base("NotFoundException")
        {
        }

        public NotFoundException(string message)
            : base(message)
        {
        }

        public NotFoundException(string message, Exception innerException)
            : base(message, innerException)
        {
        }

        public IEnumerable<ErrorDetail> ErrorDetails { get; }


        public NotFoundException(string name, object key)
            : base($"Entity \"{name}\" ({key}) was not found.")
        {
            ErrorDetails = new[] { new ErrorDetail(name, key) };
        }
    }
}
