namespace OnlineClassroomManagement.Models.Entities
{
    public class PostInClass
    {
        public int Id { get; set; }
        public Post Post { get; set; }
        public Class Class { get; set; }
    }
}
