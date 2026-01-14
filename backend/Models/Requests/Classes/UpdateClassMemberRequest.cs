using System;
using OnlineClassroomManagement.Helper.Constants;

namespace OnlineClassroomManagement.Models.Requests.Classes
{
    public class UpdateClassMemberRequest
    {
        public RoleInClass RoleInClass { get; set; }
        public int Points { get; set; }
        public DateTime? EnrollDate { get; set; }
    }
}
