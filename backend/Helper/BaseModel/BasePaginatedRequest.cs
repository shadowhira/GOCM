namespace OnlineClassroomManagement.Helper.BaseModel
{
    public class BasePaginatedRequest
    {
        public string Keyword { get; set; } = string.Empty;
        public int PageNumber { get; init; } = 1;
        public int PageSize { get; init; } = 20;
    }
}
