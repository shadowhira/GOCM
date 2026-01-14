using System;
using OnlineClassroomManagement.Helper.Constants;

namespace OnlineClassroomManagement.Models.Entities
{
    public class ClassMember
    {
        public int Id { get; set; }
        public User User { get; set; }
        public Class Class { get; set; }
        public RoleInClass RoleInClass { get; set; } // "Student", "Teacher"
        public DateTime EnrollDate { get; set; }
        public int Points { get; set; } = 0;
        public ClassMemberCosmetic? Cosmetics { get; set; }

    }
}
